import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { DbService } from "./dbService.js";
import { DAYS_OF_WEEK, MealType } from "../src/types.js";

const isProd = process.env.NODE_ENV === "production";
const PORT = 3000;

async function startServer() {
  const app = express();
  app.use(express.json());

  // Initialize DB
  await DbService.initDb();
  console.log("Mpishi Database service ready.");

  // Auth Helper / Middleware
  const getUserId = async (req: express.Request): Promise<string> => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7);
      const userId = await DbService.getUserIdFromSession(token);
      if (userId) {
        return userId;
      }
    }
    return "guest";
  };

  // --- Auth API ---
  
  // Register
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { username, password, displayName } = req.body;
      if (!username || !password) {
        return res.status(400).json({ error: "Username and password are required." });
      }
      if (username.trim().length < 3 || password.length < 4) {
        return res.status(400).json({ error: "Username must be at least 3 chars; password at least 4 chars." });
      }
      
      const existingUser = await DbService.findUserByUsername(username);
      if (existingUser) {
        return res.status(400).json({ error: "Username is already taken." });
      }

      const user = await DbService.createUser(username, password, displayName || username);
      const token = await DbService.createSession(user.id);

      res.status(201).json({
        token,
        user: {
          id: user.id,
          username: user.username,
          displayName: user.displayName
        }
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Login
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      if (!username || !password) {
        return res.status(400).json({ error: "Username and password are required." });
      }

      const user = await DbService.findUserByUsername(username);
      if (!user) {
        return res.status(401).json({ error: "Invalid username or password." });
      }

      const crypto = await import("crypto");
      const computedHash = crypto.pbkdf2Sync(password, user.salt, 1000, 64, "sha512").toString("hex");
      if (computedHash !== user.passwordHash) {
        return res.status(401).json({ error: "Invalid username or password." });
      }

      const token = await DbService.createSession(user.id);
      res.json({
        token,
        user: {
          id: user.id,
          username: user.username,
          displayName: user.displayName
        }
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Logout
  app.post("/api/auth/logout", async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith("Bearer ")) {
        const token = authHeader.substring(7);
        await DbService.deleteSession(token);
      }
      res.json({ success: true, message: "Logged out successfully." });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Get current user profile from token
  app.get("/api/auth/me", async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith("Bearer ")) {
        const token = authHeader.substring(7);
        const userId = await DbService.getUserIdFromSession(token);
        if (userId) {
          const user = await DbService.getUserById(userId);
          if (user) {
            return res.json({ user });
          }
        }
      }
      res.json({ user: null });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });


  // API Kitchen Routes
  
  // 1. GET current stock (including toggles)
  app.get("/api/inventory", async (req, res) => {
    try {
      const userId = await getUserId(req);
      const items = await DbService.getInventory(userId);
      res.json(items);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 2. ADD stock item
  app.post("/api/inventory", async (req, res) => {
    try {
      const userId = await getUserId(req);
      const { name, displayName, category, expirationDate, isAlwaysInStock } = req.body;
      if (!name || !displayName || !category) {
        return res.status(400).json({ error: "Missing required fields: name, displayName, category" });
      }
      const newItem = await DbService.addInventoryItem({
        name,
        displayName,
        category,
        expirationDate,
        isAlwaysInStock: !!isAlwaysInStock
      }, userId);
      res.status(201).json(newItem);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 3. EDIT stock item
  app.put("/api/inventory/:id", async (req, res) => {
    try {
      const userId = await getUserId(req);
      const { id } = req.params;
      const updates = req.body;
      const updated = await DbService.updateInventoryItem(id, updates, userId);
      if (!updated) {
        return res.status(404).json({ error: "Inventory item not found" });
      }
      res.json(updated);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 4. DELETE stock item
  app.delete("/api/inventory/:id", async (req, res) => {
    try {
      const userId = await getUserId(req);
      const { id } = req.params;
      const deleted = await DbService.deleteInventoryItem(id, userId);
      if (!deleted) {
        return res.status(404).json({ error: "Inventory item not found" });
      }
      res.json({ success: true, message: "Item deleted successfully" });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 5. TOGGLE pantry staples Always in stock
  app.post("/api/pantry/toggle", async (req, res) => {
    try {
      const userId = await getUserId(req);
      const { name, alwaysInStock } = req.body;
      if (!name) {
        return res.status(400).json({ error: "Missing name" });
      }
      const item = await DbService.togglePantryStaple(name, alwaysInStock, userId);
      res.json(item);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 6. RESET testing pool
  app.post("/api/inventory/reset", async (req, res) => {
    try {
      const userId = await getUserId(req);
      const items = await DbService.resetInventory(userId);
      res.json({ success: true, message: "Inventory pools reset to Kenyan kitchen default test values.", inventory: items });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 7. GET all recipes
  app.get("/api/recipes", async (req, res) => {
    try {
      const recipes = await DbService.getRecipes();
      res.json(recipes);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 8. POST match available inventory against recipes database
  app.post("/api/recipes/match", async (req, res) => {
    try {
      const userId = await getUserId(req);
      const { inventory } = req.body;
      const currentInv = inventory || await DbService.getInventory(userId);
      const matches = DbService.matchRecipes(currentInv);
      res.json(matches);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 9. GET weekly plan
  app.get("/api/mealplan", async (req, res) => {
    try {
      const userId = await getUserId(req);
      const plan = await DbService.getWeeklyPlan(userId);
      const shopping = await DbService.getShoppingList(userId);
      res.json({ plan, shoppingList: shopping });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 10. GENERATE 7-day meal plan
  app.post("/api/mealplan/generate", async (req, res) => {
    try {
      const userId = await getUserId(req);
      const { preserveLocked } = req.body;
      const result = DbService.generateWeeklyPlan(preserveLocked !== false, userId);
      res.json({ 
        success: true, 
        plan: result.plan, 
        shoppingList: result.shopping 
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 11. SWAP a slot
  app.post("/api/mealplan/swap", async (req, res) => {
    try {
      const userId = await getUserId(req);
      const { day, meal, recipeId } = req.body as { day: typeof DAYS_OF_WEEK[number]; meal: MealType; recipeId: string | null };
      if (!day || !meal) {
        return res.status(400).json({ error: "Missing day or meal type" });
      }
      const updatedPlan = await DbService.swapMealSlot(day, meal, recipeId, userId);
      const shoppingList = await DbService.getShoppingList(userId);
      res.json({ success: true, plan: updatedPlan, shoppingList });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 12. GET dynamic shopping list
  app.get("/api/shopping", async (req, res) => {
    try {
      const userId = await getUserId(req);
      const shopping = await DbService.getShoppingList(userId);
      res.json(shopping);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 13. TOGGLE shopping list item purchased (completed)
  app.post("/api/shopping/toggle", async (req, res) => {
    try {
      const userId = await getUserId(req);
      const { id, completed } = req.body;
      if (!id) {
        return res.status(400).json({ error: "Missing shopping list item id" });
      }
      const result = await DbService.toggleShoppingItem(id, !!completed, userId);
      res.json({ success: true, shoppingList: result.shopping, inventory: result.inventory });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Vite Integration
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite development server linked to Express middleware.");
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("Serving compiled static assets from dist/");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Mpishi (Express + Vite + Node) listening on http://localhost:${PORT}`);
  });
}

startServer();
