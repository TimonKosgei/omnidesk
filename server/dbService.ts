import fs from "fs/promises";
import path from "path";
import crypto from "crypto";
import { 
  InventoryItem, 
  Recipe, 
  WeeklyMealPlan, 
  ShoppingItem, 
  MealType, 
  DAYS_OF_WEEK,
  MEAL_TYPES
} from "../src/types.js";

const DB_PATH = path.join(process.cwd(), "data", "db.json");

// Default inventory pool
const defaultInventory: InventoryItem[] = [
  { id: "1", name: "unga", displayName: "Unga", category: "Grains & Cereals", dateAdded: new Date().toISOString(), isAlwaysInStock: false },
  { id: "2", name: "sukuma wiki", displayName: "Sukuma Wiki", category: "Vegetables & Herbs", dateAdded: new Date().toISOString(), isAlwaysInStock: false },
  { id: "3", name: "nyanya", displayName: "Nyanya", category: "Vegetables & Herbs", dateAdded: new Date().toISOString(), isAlwaysInStock: false },
  { id: "4", name: "kitunguu", displayName: "Kitunguu", category: "Vegetables & Herbs", dateAdded: new Date().toISOString(), isAlwaysInStock: false },
  { id: "5", name: "beef", displayName: "Beef", category: "Proteins", dateAdded: new Date().toISOString(), isAlwaysInStock: false },
  { id: "6", name: "rice", displayName: "Rice", category: "Grains & Cereals", dateAdded: new Date().toISOString(), isAlwaysInStock: false },
  { id: "7", name: "dhania", displayName: "Dhania", category: "Vegetables & Herbs", dateAdded: new Date().toISOString(), isAlwaysInStock: false },
  { id: "8", name: "potatoes", displayName: "Potatoes", category: "Vegetables & Herbs", dateAdded: new Date().toISOString(), isAlwaysInStock: false },
  { id: "9", name: "eggs", displayName: "Eggs", category: "Proteins", dateAdded: new Date().toISOString(), isAlwaysInStock: false },
  
  // Pantry Staples toggled always in stock initially
  { id: "s1", name: "salt", displayName: "Salt", category: "Others", dateAdded: new Date().toISOString(), isAlwaysInStock: true },
  { id: "s2", name: "cooking oil", displayName: "Cooking Oil", category: "Oils & Sauces", dateAdded: new Date().toISOString(), isAlwaysInStock: true },
  { id: "s3", name: "water", displayName: "Water", category: "Others", dateAdded: new Date().toISOString(), isAlwaysInStock: true },
  { id: "s4", name: "pepper", displayName: "Pepper", category: "Spices", dateAdded: new Date().toISOString(), isAlwaysInStock: true },
  { id: "s5", name: "royco", displayName: "Royco", category: "Spices", dateAdded: new Date().toISOString(), isAlwaysInStock: true },
];

const defaultRecipes: Recipe[] = [
  {
    id: "r1",
    name: "Ugali & Sukuma Wiki",
    description: "The classic, beloved Kenyan staple meal. Highly budget-friendly and fully satisfying.",
    ingredients: ["unga", "sukuma wiki", "nyanya", "kitunguu"],
    pantryStaplesNeeded: ["cooking oil", "salt", "water"],
    instructions: [
      "Boil 2 cups of water in a pot for Ugali.",
      "Gradually add maize meal (Unga) while stirring vigorously with a wooden spoon (mwiko) to prevent lumps.",
      "Thicken to desired consistency, cover, and let steam on low heat for about 10 minutes.",
      "In a separate pan, heat cooking oil and sauté kitunguu (onions) until translucent.",
      "Add nyanya (tomatoes) and cook down until they form a soft paste.",
      "Add shredded sukuma wiki, season with a pinch of salt, and stir-fry for 5 minutes until vibrant green and tender.",
      "Serve the hot Ugali alongside sukuma wiki."
    ],
    category: "Traditional",
    cookingTime: 25,
    servings: 4
  },
  {
    id: "r2",
    name: "Classic Beef Stew & Rice",
    description: "Succulent beef stew simmered with potatoes and carrots, perfect with steaming hot rice.",
    ingredients: ["beef", "rice", "nyanya", "kitunguu", "potatoes", "dhania"],
    pantryStaplesNeeded: ["cooking oil", "salt", "royco", "water"],
    instructions: [
      "Boil rice in water with a pinch of salt and a spoonful of cooking oil until dry and fluffy.",
      "In another pot, boil beef until cooked and tender.",
      "Heat cooking oil in a pan, fry kitunguu until fragrant, then add beef to brown it nicely.",
      "Add tomatoes (nyanya) and potato chunks, stirring until tomatoes soften and blend into the meat.",
      "Dissolve a tablespoon of Royco in a cup of cold water, stir, and pour into the beef. Cover and cook on low heat.",
      "Simmer for 15 minutes until potato chunks are fork-tender. Garnish with chopped dhania and serve with rice."
    ],
    category: "Stew",
    cookingTime: 45,
    servings: 3
  },
  {
    id: "r3",
    name: "Chapati & Dengu Stew",
    description: "Soft layered Kenyan chapatis served with a creamy and flavorful mung bean (dengu) stew.",
    ingredients: ["wheat flour", "eggs", "dengu", "kitunguu", "nyanya", "dhania"],
    pantryStaplesNeeded: ["cooking oil", "salt", "water"],
    instructions: [
      "Boil dengu (mung beans) in water until tender, then drain.",
      "For Chapatis: Mix wheat flour, 1 beaten egg, a tablespoon of cooking oil, a pinch of salt, and warm water. Knead into a soft dough, divide into balls, roll out, and fold to create layers. Roll flat and shallow-fry on a tawa (pan) until golden brown spots appear.",
      "In a fresh pot, fry kitunguu in cooking oil, add chopped tomatoes (nyanya) and cook until soft and pulpy.",
      "Fold in boiled dengu and a cup of broth or water. Let it cook for 10-12 minutes on medium heat.",
      "Garnish with fresh dhania and serve with warm, flaky chapatis."
    ],
    category: "Traditional",
    cookingTime: 50,
    servings: 4
  },
  {
    id: "r4",
    name: "Hearty Githeri Special",
    description: "A traditional single-pot boiled dry maize and bean stew, elevated with potatoes and fresh dhania.",
    ingredients: ["maize", "beans", "nyanya", "kitunguu", "potatoes", "dhania"],
    pantryStaplesNeeded: ["cooking oil", "salt", "royco", "water"],
    instructions: [
      "Combine boiled maize and beans in a mixing bowl.",
      "Sauté kitunguu in cooking oil until light brown. Add tomatoes (nyanya) and cook until mushy.",
      "Add potato cubes and the maize-beans mixture into the pot, stirring to combine.",
      "Pour in dissolved Royco water, cover, and let it simmer for 20 minutes until the potatoes are cooked.",
      "Stir in dhania, remove from heat, and serve hot."
    ],
    category: "Traditional",
    cookingTime: 35,
    servings: 4
  },
  {
    id: "r5",
    name: "Swahili-Style Egg Curry with Rice",
    description: "Boiled eggs cooked in a delicious, spiced onion-tomato gravy, served with fluffy white rice.",
    ingredients: ["eggs", "rice", "kitunguu", "nyanya", "dhania"],
    pantryStaplesNeeded: ["cooking oil", "salt", "royco", "pepper", "water"],
    instructions: [
      "Boil eggs for 9 minutes, cool in cold water, peel, and gently prick with a toothpick.",
      "Prepare white rice by boiling in salted water until dry.",
      "In a saucepan, heat cooking oil and fry kitunguu. Add tomatoes (nyanya) and pepper, mashing to form a thick sauce.",
      "Mix Royco with water and pour into the sauce, simmer until thick.",
      "Place boiled eggs in the stew and let them simmer for 7 minutes. Garnish with dhania and serve with the rice."
    ],
    category: "Stew",
    cookingTime: 25,
    servings: 2
  },
  {
    id: "r6",
    name: "Chapo-Egg Rolex",
    description: "Kenyan street style egg-rolled chapati wrap with crunchy cabbage, tomatoes, and onions.",
    ingredients: ["wheat flour", "eggs", "kitunguu", "nyanya", "sukuma wiki"],
    pantryStaplesNeeded: ["cooking oil", "salt"],
    instructions: [
      "Prepare a chapati or warm up an existing chapati.",
      "Whisk 2 eggs in a cup with finely chopped kitunguu, small tomato bits, and a tiny bit of shredded greens (sukuma wiki).",
      "Pour eggs onto a oiled hot pan. Place chapati directly on top of the wet egg mixture, pressing down lightly.",
      "Flip after 2 minutes so chapati gets warm and toast. Roll up tightly while hot and enjoy!"
    ],
    category: "Traditional",
    cookingTime: 12,
    servings: 1
  },
  {
    id: "r7",
    name: "Traditional Beef Pilau",
    description: "Highly aromatic spiced Swahili rice dish served with fresh Kachumbari salad.",
    ingredients: ["beef", "rice", "kitunguu", "nyanya"],
    pantryStaplesNeeded: ["cooking oil", "salt", "royco", "water"],
    instructions: [
      "Boil beef with ginger/garlic until completely tender. Retain the broth.",
      "Heat cooking oil in a large pot. Add plenty of kitunguu (onions) and fry until dark brown (this provides the golden color of the Pilau).",
      "Add Pilau spices or Royco, followed by tomatoes and boiled beef. Stir fry for 5 minutes.",
      "Add washed rice and pour in the warm beef broth (and water to make a 1:2 ratio).",
      "Bring to a boil, then reduce heat, seal the lid tightly, and cook for 15-20 minutes until water is absorbed and rice is dry. Serves with tomato-onion slices (Kachumbari)."
    ],
    category: "Rice Dishes",
    cookingTime: 40,
    servings: 4
  },
  {
    id: "r8",
    name: "Classic Mukimo",
    description: "Flavor-rich mash of soft potatoes, maize, and greens, sautéed with plenty of onions.",
    ingredients: ["potatoes", "maize", "sukuma wiki", "kitunguu"],
    pantryStaplesNeeded: ["cooking oil", "salt", "water"],
    instructions: [
      "Boil potatoes, maize kernels, and finely shredded sukuma wiki in a pot of water until everything is fully cooked.",
      "Drain excess water but keep a small cup of it on the side.",
      "Mash hot using a wooden stick until uniform, smooth, and beautiful green.",
      "In a small pan, fry kitunguu in cooking oil until brown and highly sweet. Pour the onion oil mix over the Mukimo, fold in thoroughly, and serve as a main or side dish."
    ],
    category: "Traditional",
    cookingTime: 35,
    servings: 5
  }
];

export interface DbUser {
  id: string;
  username: string;
  passwordHash: string;
  salt: string;
  displayName: string;
}

interface DbSchema {
  users: DbUser[];
  sessions: Record<string, string>; // sessionToken -> userId
  userInventories: Record<string, InventoryItem[]>;
  userWeeklyPlans: Record<string, WeeklyMealPlan>;
  userShoppingLists: Record<string, ShoppingItem[]>;
  
  // Backward compatibility legacy schemas
  inventory?: InventoryItem[];
  weeklyPlan?: WeeklyMealPlan;
  shoppingList?: ShoppingItem[];
}

const emptyWeeklyPlan = (): WeeklyMealPlan => {
  const plan: any = {};
  for (const day of DAYS_OF_WEEK) {
    plan[day] = {
      Breakfast: { recipeId: null, recipeName: null, locked: false },
      Lunch: { recipeId: null, recipeName: null, locked: false },
      Dinner: { recipeId: null, recipeName: null, locked: false }
    };
  }
  return plan as WeeklyMealPlan;
};

export class DbService {
  private static cachedData: DbSchema | null = null;

  static async initDb(): Promise<void> {
    try {
      const dataDir = path.dirname(DB_PATH);
      await fs.mkdir(dataDir, { recursive: true });

      try {
        const fileContent = await fs.readFile(DB_PATH, "utf-8");
        this.cachedData = JSON.parse(fileContent);

        // Migrate legacy single-user scheme
        if (this.cachedData && !this.cachedData.users) {
          const oldInv = this.cachedData.inventory || defaultInventory;
          const oldPlan = this.cachedData.weeklyPlan || emptyWeeklyPlan();
          const oldShop = this.cachedData.shoppingList || [];

          this.cachedData = {
            users: [],
            sessions: {},
            userInventories: {
              "guest": oldInv
            },
            userWeeklyPlans: {
              "guest": oldPlan
            },
            userShoppingLists: {
              "guest": oldShop
            }
          };
          await this.saveData();
        }
      } catch (err) {
        console.log("Database file doesn't exist. Bootstrapping with default Kenyan data.");
        const initialDb: DbSchema = {
          users: [],
          sessions: {},
          userInventories: {
            "guest": JSON.parse(JSON.stringify(defaultInventory))
          },
          userWeeklyPlans: {
            "guest": emptyWeeklyPlan()
          },
          userShoppingLists: {
            "guest": []
          }
        };
        await fs.writeFile(DB_PATH, JSON.stringify(initialDb, null, 2));
        this.cachedData = initialDb;
      }
    } catch (e) {
      console.error("Failed to initialize JSON database: ", e);
      this.cachedData = {
        users: [],
        sessions: {},
        userInventories: {
          "guest": JSON.parse(JSON.stringify(defaultInventory))
        },
        userWeeklyPlans: {
          "guest": emptyWeeklyPlan()
        },
        userShoppingLists: {
          "guest": []
        }
      };
    }
  }

  private static async saveData(): Promise<void> {
    if (!this.cachedData) return;
    try {
      await fs.writeFile(DB_PATH, JSON.stringify(this.cachedData, null, 2));
    } catch (e) {
      console.error("Failed to save JSON database: ", e);
    }
  }

  // --- User & Authentication Operations ---
  static async findUserByUsername(username: string): Promise<DbUser | null> {
    if (!this.cachedData) await this.initDb();
    const normalized = username.toLowerCase().trim();
    return this.cachedData!.users.find(u => u.username.toLowerCase().trim() === normalized) || null;
  }

  static async createUser(username: string, passwordPlain: string, displayName: string): Promise<DbUser> {
    if (!this.cachedData) await this.initDb();
    const salt = crypto.randomBytes(16).toString("hex");
    const passwordHash = crypto.pbkdf2Sync(passwordPlain, salt, 1000, 64, "sha512").toString("hex");
    
    const newUser: DbUser = {
      id: Math.random().toString(36).substr(2, 9),
      username: username.trim(),
      passwordHash,
      salt,
      displayName: displayName.trim() || username.trim()
    };

    if (!this.cachedData!.users) this.cachedData!.users = [];
    this.cachedData!.users.push(newUser);
    
    // Bootstrap brand new user lists
    if (!this.cachedData!.userInventories) this.cachedData!.userInventories = {};
    if (!this.cachedData!.userWeeklyPlans) this.cachedData!.userWeeklyPlans = {};
    if (!this.cachedData!.userShoppingLists) this.cachedData!.userShoppingLists = {};

    this.cachedData!.userInventories[newUser.id] = JSON.parse(JSON.stringify(defaultInventory));
    this.cachedData!.userWeeklyPlans[newUser.id] = emptyWeeklyPlan();
    this.cachedData!.userShoppingLists[newUser.id] = [];

    await this.saveData();
    return newUser;
  }

  static async createSession(userId: string): Promise<string> {
    if (!this.cachedData) await this.initDb();
    if (!this.cachedData!.sessions) this.cachedData!.sessions = {};
    const token = crypto.randomBytes(32).toString("hex");
    this.cachedData!.sessions[token] = userId;
    await this.saveData();
    return token;
  }

  static async getUserIdFromSession(token: string): Promise<string | null> {
    if (!this.cachedData) await this.initDb();
    if (!this.cachedData!.sessions) return null;
    return this.cachedData!.sessions[token] || null;
  }

  static async deleteSession(token: string): Promise<boolean> {
    if (!this.cachedData) await this.initDb();
    if (!this.cachedData!.sessions) return false;
    if (this.cachedData!.sessions[token]) {
      delete this.cachedData!.sessions[token];
      await this.saveData();
      return true;
    }
    return false;
  }

  static async getUserById(userId: string): Promise<{ id: string; username: string; displayName: string } | null> {
    if (!this.cachedData) await this.initDb();
    const user = this.cachedData!.users.find(u => u.id === userId);
    if (!user) return null;
    return { id: user.id, username: user.username, displayName: user.displayName };
  }

  // --- Kitchen Domain Operations ---
  static async getInventory(userId: string = "guest"): Promise<InventoryItem[]> {
    if (!this.cachedData) await this.initDb();
    if (!this.cachedData!.userInventories[userId]) {
      this.cachedData!.userInventories[userId] = JSON.parse(JSON.stringify(defaultInventory));
      await this.saveData();
    }
    return this.cachedData!.userInventories[userId];
  }

  static async getRecipes(): Promise<Recipe[]> {
    return defaultRecipes;
  }

  static async getWeeklyPlan(userId: string = "guest"): Promise<WeeklyMealPlan> {
    if (!this.cachedData) await this.initDb();
    if (!this.cachedData!.userWeeklyPlans[userId]) {
      this.cachedData!.userWeeklyPlans[userId] = emptyWeeklyPlan();
      await this.saveData();
    }
    return this.cachedData!.userWeeklyPlans[userId];
  }

  static async getShoppingList(userId: string = "guest"): Promise<ShoppingItem[]> {
    if (!this.cachedData) await this.initDb();
    if (!this.cachedData!.userShoppingLists[userId]) {
      this.cachedData!.userShoppingLists[userId] = [];
      await this.saveData();
    }
    return this.cachedData!.userShoppingLists[userId];
  }

  static async addInventoryItem(item: Omit<InventoryItem, "id" | "dateAdded">, userId: string = "guest"): Promise<InventoryItem> {
    if (!this.cachedData) await this.initDb();
    
    if (!this.cachedData!.userInventories[userId]) {
      this.cachedData!.userInventories[userId] = JSON.parse(JSON.stringify(defaultInventory));
    }

    const newItem: InventoryItem = {
      ...item,
      id: Math.random().toString(36).substr(2, 9),
      name: item.name.toLowerCase().trim(),
      dateAdded: new Date().toISOString()
    };
    
    const existsIndex = this.cachedData!.userInventories[userId].findIndex(
      (p) => p.name === newItem.name && p.isAlwaysInStock === newItem.isAlwaysInStock
    );
    if (existsIndex > -1) {
      this.cachedData!.userInventories[userId][existsIndex] = {
        ...this.cachedData!.userInventories[userId][existsIndex],
        displayName: item.displayName,
        category: item.category,
        expirationDate: item.expirationDate
      };
      await this.saveData();
      return this.cachedData!.userInventories[userId][existsIndex];
    }

    this.cachedData!.userInventories[userId].push(newItem);
    await this.saveData();
    return newItem;
  }

  static async updateInventoryItem(id: string, updates: Partial<InventoryItem>, userId: string = "guest"): Promise<InventoryItem | null> {
    if (!this.cachedData) await this.initDb();
    if (!this.cachedData!.userInventories[userId]) return null;

    const idx = this.cachedData!.userInventories[userId].findIndex((item) => item.id === id);
    if (idx === -1) return null;

    if (updates.name) {
      updates.name = updates.name.toLowerCase().trim();
    }

    this.cachedData!.userInventories[userId][idx] = {
      ...this.cachedData!.userInventories[userId][idx],
      ...updates
    };

    await this.saveData();
    return this.cachedData!.userInventories[userId][idx];
  }

  static async deleteInventoryItem(id: string, userId: string = "guest"): Promise<boolean> {
    if (!this.cachedData) await this.initDb();
    if (!this.cachedData!.userInventories[userId]) return false;

    const initialLen = this.cachedData!.userInventories[userId].length;
    this.cachedData!.userInventories[userId] = this.cachedData!.userInventories[userId].filter((item) => item.id !== id);
    if (this.cachedData!.userInventories[userId].length !== initialLen) {
      await this.saveData();
      return true;
    }
    return false;
  }

  static async togglePantryStaple(name: string, alwaysInStock: boolean, userId: string = "guest"): Promise<InventoryItem> {
    if (!this.cachedData) await this.initDb();
    if (!this.cachedData!.userInventories[userId]) {
      this.cachedData!.userInventories[userId] = JSON.parse(JSON.stringify(defaultInventory));
    }

    const normalized = name.toLowerCase().trim();
    const idx = this.cachedData!.userInventories[userId].findIndex((item) => item.name === normalized);

    if (idx > -1) {
      this.cachedData!.userInventories[userId][idx].isAlwaysInStock = alwaysInStock;
      await this.saveData();
      return this.cachedData!.userInventories[userId][idx];
    } else {
      const newItem: InventoryItem = {
        id: Math.random().toString(36).substr(2, 9),
        name: normalized,
        displayName: name,
        category: "Others",
        dateAdded: new Date().toISOString(),
        isAlwaysInStock: alwaysInStock
      };
      this.cachedData!.userInventories[userId].push(newItem);
      await this.saveData();
      return newItem;
    }
  }

  static async resetInventory(userId: string = "guest"): Promise<InventoryItem[]> {
    if (!this.cachedData) await this.initDb();
    this.cachedData!.userInventories[userId] = JSON.parse(JSON.stringify(defaultInventory));
    this.cachedData!.userWeeklyPlans[userId] = emptyWeeklyPlan();
    this.cachedData!.userShoppingLists[userId] = [];
    await this.saveData();
    return this.cachedData!.userInventories[userId];
  }

  static matchRecipes(inventory: InventoryItem[]): any[] {
    return defaultRecipes.map((recipe) => {
      const neededIngs = recipe.ingredients;
      const neededStaples = recipe.pantryStaplesNeeded;
      
      const totalIngredients = [...neededIngs, ...neededStaples];

      const matching = totalIngredients.filter(ing => {
        return inventory.some(i => i.name === ing);
      });

      const missing = totalIngredients.filter(ing => {
        return !inventory.some(i => i.name === ing);
      });

      const matchPercentage = totalIngredients.length > 0 
        ? parseFloat(((matching.length / totalIngredients.length) * 100).toFixed(1))
        : 0;

      return {
        recipe,
        matchPercentage,
        matchingIngredients: matching,
        missingIngredients: missing
      };
    }).sort((a, b) => b.matchPercentage - a.matchPercentage);
  }

  static generateWeeklyPlan(preserveLocked: boolean = true, userId: string = "guest"): { plan: WeeklyMealPlan; shopping: ShoppingItem[] } {
    if (!this.cachedData) {
      throw new Error("DB not loaded");
    }

    if (!this.cachedData.userInventories[userId]) {
      this.cachedData.userInventories[userId] = JSON.parse(JSON.stringify(defaultInventory));
    }
    if (!this.cachedData.userWeeklyPlans[userId]) {
      this.cachedData.userWeeklyPlans[userId] = emptyWeeklyPlan();
    }

    const currentInventory = this.cachedData.userInventories[userId];
    let simulatedPool = [...currentInventory];

    const newPlan: any = {};
    const fullMissingSet = new Set<string>();

    for (const day of DAYS_OF_WEEK) {
      newPlan[day] = { Breakfast: null, Lunch: null, Dinner: null };
      
      for (const meal of MEAL_TYPES) {
        const existingSlot = this.cachedData.userWeeklyPlans[userId][day]?.[meal];
        
        if (preserveLocked && existingSlot && existingSlot.locked && existingSlot.recipeId) {
          const recipe = defaultRecipes.find(r => r.id === existingSlot.recipeId);
          if (recipe) {
            newPlan[day][meal] = {
              recipeId: recipe.id,
              recipeName: recipe.name,
              locked: true
            };
            
            for (const ing of recipe.ingredients) {
              const matchedItem = simulatedPool.find(item => item.name === ing);
              if (matchedItem) {
                if (!matchedItem.isAlwaysInStock) {
                  simulatedPool = simulatedPool.filter(item => item.id !== matchedItem.id);
                }
              } else {
                fullMissingSet.add(ing);
              }
            }
            continue;
          }
        }

        const matches = this.matchRecipes(simulatedPool);
        
        const dayAssignedRecipeIds = Object.values(newPlan[day])
          .filter((slot: any) => slot && slot.recipeId)
          .map((slot: any) => slot.recipeId);

        let chosenMatch = matches.find(m => !dayAssignedRecipeIds.includes(m.recipe.id));
        
        if (!chosenMatch && matches.length > 0) {
          chosenMatch = matches[0];
        }

        if (chosenMatch) {
          const recipe = chosenMatch.recipe;
          newPlan[day][meal] = {
            recipeId: recipe.id,
            recipeName: recipe.name,
            locked: false
          };

          const totalReqs = [...recipe.ingredients, ...recipe.pantryStaplesNeeded];
          
          for (const ing of totalReqs) {
            const matchedIndex = simulatedPool.findIndex(item => item.name === ing);
            if (matchedIndex > -1) {
              const matchedItem = simulatedPool[matchedIndex];
              if (!matchedItem.isAlwaysInStock) {
                simulatedPool.splice(matchedIndex, 1);
              }
            } else {
              fullMissingSet.add(ing);
            }
          }
        } else {
          newPlan[day][meal] = {
            recipeId: null,
            recipeName: null,
            locked: false
          };
        }
      }
    }

    const shoppingList: ShoppingItem[] = Array.from(fullMissingSet).map((ingName, idx) => {
      const matchedModelItem = defaultInventory.find(item => item.name === ingName);
      const displayName = matchedModelItem ? matchedModelItem.displayName : (ingName.charAt(0).toUpperCase() + ingName.slice(1));
      const category = matchedModelItem ? matchedModelItem.category : "Vegetables & Herbs";

      return {
        id: `shop_${idx}_${Math.random().toString(36).substring(2, 6)}`,
        name: displayName,
        category,
        completed: false
      };
    });

    this.cachedData.userWeeklyPlans[userId] = newPlan as WeeklyMealPlan;
    this.cachedData.userShoppingLists[userId] = shoppingList;
    this.saveData();

    return { plan: newPlan, shopping: shoppingList };
  }

  static async swapMealSlot(day: keyof WeeklyMealPlan, meal: MealType, recipeId: string | null, userId: string = "guest"): Promise<WeeklyMealPlan> {
    if (!this.cachedData) await this.initDb();
    
    if (!this.cachedData!.userWeeklyPlans[userId]) {
      this.cachedData!.userWeeklyPlans[userId] = emptyWeeklyPlan();
    }

    const existingSlot = this.cachedData!.userWeeklyPlans[userId][day][meal];
    
    if (recipeId === null) {
      this.cachedData!.userWeeklyPlans[userId][day][meal] = {
        recipeId: null,
        recipeName: null,
        locked: false
      };
    } else {
      if (existingSlot && existingSlot.recipeId === recipeId) {
        this.cachedData!.userWeeklyPlans[userId][day][meal] = {
          ...existingSlot,
          locked: !existingSlot.locked
        };
      } else {
        const recipe = defaultRecipes.find(r => r.id === recipeId);
        if (recipe) {
          this.cachedData!.userWeeklyPlans[userId][day][meal] = {
            recipeId: recipe.id,
            recipeName: recipe.name,
            locked: true
          };
        }
      }
    }

    this.generateWeeklyPlan(true, userId);

    return this.cachedData!.userWeeklyPlans[userId];
  }

  static async toggleShoppingItem(id: string, completed: boolean, userId: string = "guest"): Promise<{ shopping: ShoppingItem[]; inventory: InventoryItem[] }> {
    if (!this.cachedData) await this.initDb();
    
    if (!this.cachedData!.userShoppingLists[userId]) {
      this.cachedData!.userShoppingLists[userId] = [];
    }
    if (!this.cachedData!.userInventories[userId]) {
      this.cachedData!.userInventories[userId] = JSON.parse(JSON.stringify(defaultInventory));
    }

    const shopItemIdx = this.cachedData!.userShoppingLists[userId].findIndex(item => item.id === id);
    if (shopItemIdx > -1) {
      const item = this.cachedData!.userShoppingLists[userId][shopItemIdx];
      item.completed = completed;

      if (completed) {
        const normName = item.name.toLowerCase().trim();
        
        const exists = this.cachedData!.userInventories[userId].some(i => i.name === normName);
        if (!exists) {
          const newInvItem: InventoryItem = {
            id: Math.random().toString(36).substr(2, 9),
            name: normName,
            displayName: item.name,
            category: item.category,
            dateAdded: new Date().toISOString(),
            isAlwaysInStock: false
          };
          this.cachedData!.userInventories[userId].push(newInvItem);
        }
      }

      await this.saveData();
    }

    return {
      shopping: this.cachedData!.userShoppingLists[userId],
      inventory: this.cachedData!.userInventories[userId]
    };
  }
}
