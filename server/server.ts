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

  // API Routes
  
  // 1. GET current stock (including toggles)
  app.get("/api/inventory", async (req, res) => {
    try {
      const items = await DbService.getInventory();
      res.json(items);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 2. ADD stock item
  app.post("/api/inventory", async (req, res) => {
    try {
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
      });
      res.status(201).json(newItem);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 3. EDIT stock item
  app.put("/api/inventory/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      const updated = await DbService.updateInventoryItem(id, updates);
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
      const { id } = req.params;
      const deleted = await DbService.deleteInventoryItem(id);
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
      const { name, alwaysInStock } = req.body;
      if (!name) {
        return res.status(400).json({ error: "Missing name" });
      }
      const item = await DbService.togglePantryStaple(name, alwaysInStock);
      res.json(item);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 6. RESET testing pool
  app.post("/api/inventory/reset", async (req, res) => {
    try {
      const items = await DbService.resetInventory();
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
      const { inventory } = req.body;
      // If client sends specific inventory, use it; otherwise read database inventory
      const currentInv = inventory || await DbService.getInventory();
      const matches = DbService.matchRecipes(currentInv);
      res.json(matches);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 9. GET weekly plan
  app.get("/api/mealplan", async (req, res) => {
    try {
      const plan = await DbService.getWeeklyPlan();
      const shopping = await DbService.getShoppingList();
      res.json({ plan, shoppingList: shopping });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 10. GENERATE 7-day meal plan
  app.post("/api/mealplan/generate", async (req, res) => {
    try {
      const { preserveLocked } = req.body;
      const result = DbService.generateWeeklyPlan(preserveLocked !== false);
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
      const { day, meal, recipeId } = req.body as { day: typeof DAYS_OF_WEEK[number]; meal: MealType; recipeId: string | null };
      if (!day || !meal) {
        return res.status(400).json({ error: "Missing day or meal type" });
      }
      const updatedPlan = await DbService.swapMealSlot(day, meal, recipeId);
      const shoppingList = await DbService.getShoppingList();
      res.json({ success: true, plan: updatedPlan, shoppingList });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 12. GET dynamic shopping list
  app.get("/api/shopping", async (req, res) => {
    try {
      const shopping = await DbService.getShoppingList();
      res.json(shopping);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 13. TOGGLE shopping list item purchased (completed)
  app.post("/api/shopping/toggle", async (req, res) => {
    try {
      const { id, completed } = req.body;
      if (!id) {
        return res.status(400).json({ error: "Missing shopping list item id" });
      }
      const result = await DbService.toggleShoppingItem(id, !!completed);
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
