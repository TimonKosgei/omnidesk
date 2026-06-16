import React, { useState, useEffect } from "react";
import { 
  InventoryItem, 
  Recipe, 
  WeeklyMealPlan, 
  ShoppingItem, 
  DAYS_OF_WEEK, 
  MealType 
} from "./types.js";
import InventoryTab from "./components/InventoryTab.tsx";
import MealPlannerTab from "./components/MealPlannerTab.tsx";
import ShoppingListTab from "./components/ShoppingListTab.tsx";
import RecipeModal from "./components/RecipeModal.tsx";
import { 
  ChefHat, 
  Layers, 
  CalendarDays, 
  ShoppingBag, 
  Loader2, 
  Leaf, 
  HelpCircle,
  RefreshCw,
  Home
} from "lucide-react";

export default function App() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [weeklyPlan, setWeeklyPlan] = useState<WeeklyMealPlan | null>(null);
  const [shoppingList, setShoppingList] = useState<ShoppingItem[]>([]);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  
  const [activeTab, setActiveTab] = useState<"inventory" | "mealplan" | "shopping">("inventory");
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Load initial data
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setErrorMsg(null);

        // Fetch active stock
        const resInv = await fetch("/api/inventory");
        if (!resInv.ok) throw new Error("Failed to load inventory stock");
        const dataInv = await resInv.json();
        setInventory(dataInv);

        // Fetch recipes
        const resRec = await fetch("/api/recipes");
        if (!resRec.ok) throw new Error("Failed to load kitchen recipes");
        const dataRec = await resRec.json();
        setRecipes(dataRec);

        // Fetch weekly plan & shopping checklist
        const resPlan = await fetch("/api/mealplan");
        if (!resPlan.ok) throw new Error("Failed to load meal calendar");
        const dataPlan = await resPlan.json();
        setWeeklyPlan(dataPlan.plan);
        setShoppingList(dataPlan.shoppingList);

      } catch (err: any) {
        console.error(err);
        setErrorMsg(err.message || "An unexpected error occurred while loading kitchen parameters.");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // API Callbacks for Inventory CRUD
  const handleAddItem = async (item: { name: string; displayName: string; category: string; expirationDate?: string; isAlwaysInStock: boolean }) => {
    try {
      setErrorMsg(null);
      const tempRes = await fetch("/api/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(item)
      });
      if (!tempRes.ok) throw new Error("Server rejected inventory upload");
      const newItem = await tempRes.json();

      // We append or update state instantly
      setInventory((prev) => {
        const idx = prev.findIndex(i => i.name === newItem.name && i.isAlwaysInStock === newItem.isAlwaysInStock);
        if (idx > -1) {
          const c = [...prev];
          c[idx] = newItem;
          return c;
        }
        return [...prev, newItem];
      });

      // Since inventory changed, let's re-sync the shopping checklist & matching scores silently in backend
      const syncRes = await fetch("/api/mealplan");
      if (syncRes.ok) {
        const syncData = await syncRes.json();
        setWeeklyPlan(syncData.plan);
        setShoppingList(syncData.shoppingList);
      }
    } catch (e: any) {
      setErrorMsg(e.message);
    }
  };

  const handleUpdateItem = async (id: string, updates: Partial<InventoryItem>) => {
    try {
      setErrorMsg(null);
      const res = await fetch(`/api/inventory/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates)
      });
      if (!res.ok) throw new Error("Failed to sync item update");
      const updatedItem = await res.json();

      setInventory((prev) => prev.map((item) => (item.id === id ? updatedItem : item)));

      // Re-trigger background plan details to ensure scores align
      const syncRes = await fetch("/api/mealplan");
      if (syncRes.ok) {
        const syncData = await syncRes.json();
        setWeeklyPlan(syncData.plan);
        setShoppingList(syncData.shoppingList);
      }
    } catch (e: any) {
      setErrorMsg(e.message);
    }
  };

  const handleDeleteItem = async (id: string) => {
    try {
      setErrorMsg(null);
      const res = await fetch(`/api/inventory/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete stock element");

      setInventory((prev) => prev.filter((item) => item.id !== id));

      const syncRes = await fetch("/api/mealplan");
      if (syncRes.ok) {
        const syncData = await syncRes.json();
        setWeeklyPlan(syncData.plan);
        setShoppingList(syncData.shoppingList);
      }
    } catch (e: any) {
      setErrorMsg(e.message);
    }
  };

  const handleToggleStaple = async (name: string, alwaysInStock: boolean) => {
    try {
      setErrorMsg(null);
      const res = await fetch("/api/pantry/toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, alwaysInStock })
      });
      if (!res.ok) throw new Error("Failed to toggle pantry availability");
      const updatedItem = await res.json();

      setInventory((prev) => {
        const filtered = prev.filter(item => item.id !== updatedItem.id);
        return [...filtered, updatedItem];
      });

      // Refetch plan details to adjust deduction outputs
      const syncRes = await fetch("/api/mealplan");
      if (syncRes.ok) {
        const syncData = await syncRes.json();
        setWeeklyPlan(syncData.plan);
        setShoppingList(syncData.shoppingList);
      }
    } catch (e: any) {
      setErrorMsg(e.message);
    }
  };

  const handleResetInventory = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      const res = await fetch("/api/inventory/reset", { method: "POST" });
      if (!res.ok) throw new Error("Failed to execute reset process");
      const data = await res.json();
      
      setInventory(data.inventory);
      
      // Load empty calendar & cleared lists
      const resPlan = await fetch("/api/mealplan");
      if (resPlan.ok) {
        const d = await resPlan.json();
        setWeeklyPlan(d.plan);
        setShoppingList(d.shoppingList);
      }
    } catch (e: any) {
      setErrorMsg(e.message);
    } finally {
      setLoading(false);
    }
  };

  // API Callbacks for Meal Planner Weekly Logic
  const handleGeneratePlan = async (preserveLocked: boolean) => {
    try {
      setLoading(true);
      setErrorMsg(null);
      const res = await fetch("/api/mealplan/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ preserveLocked })
      });
      if (!res.ok) throw new Error("Failed to compile weekly plan simulation");
      const data = await res.json();
      
      if (data.success) {
        setWeeklyPlan(data.plan);
        setShoppingList(data.shoppingList);
        setActiveTab("mealplan"); // go to meal plan tab to show it off!
      }
    } catch (e: any) {
      setErrorMsg(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSwapSlot = async (day: keyof WeeklyMealPlan, meal: MealType, recipeId: string | null) => {
    try {
      setErrorMsg(null);
      const res = await fetch("/api/mealplan/swap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ day, meal, recipeId })
      });
      if (!res.ok) throw new Error("Failed to swap meal slot");
      const data = await res.json();
      
      if (data.success) {
        setWeeklyPlan(data.plan);
        setShoppingList(data.shoppingList);
      }
    } catch (e: any) {
      setErrorMsg(e.message);
    }
  };

  // Check off a missing shopping ingredient, transferring it seamlessly to active stock
  const handleToggleShoppingItem = async (id: string, completed: boolean) => {
    try {
      setErrorMsg(null);
      const res = await fetch("/api/shopping/toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, completed })
      });
      if (!res.ok) throw new Error("Failed to cross off item");
      const data = await res.json();
      
      if (data.success) {
        setShoppingList(data.shoppingList);
        setInventory(data.inventory);
      }
    } catch (e: any) {
      setErrorMsg(e.message);
    }
  };

  const pendingShoppingCount = shoppingList.filter(item => !item.completed).length;

  return (
    <div className="bg-cream text-earth min-h-screen flex flex-col font-sans selection:bg-mustard/20 antialiased">
      
      {/* Banner Notice of Errors */}
      {errorMsg && (
        <div className="bg-terracotta text-white px-6 py-3 flex justify-between items-center text-xs font-bold font-sans animate-slide-down shadow-md">
          <div className="flex items-center gap-2">
            <span>⚠ Error: {errorMsg}</span>
          </div>
          <button 
            id="clear-error-banner-btn"
            onClick={() => setErrorMsg(null)}
            className="underline hover:text-white/80 cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Modern Vibrant Kenyan Branding Toolbar */}
      <header className="bg-white border-b border-deep-green/10 sticky top-0 z-20 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo Group */}
            <div className="flex items-center gap-3">
              <div className="bg-deep-green p-2.5 rounded-2xl text-white shadow-xs">
                <ChefHat className="w-5 h-5 text-cream" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h1 className="text-2xl font-bold text-deep-green tracking-tight font-display">Mpishi.</h1>
                  <span className="bg-terracotta/10 text-terracotta text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider font-sans flex items-center gap-0.5">
                    <Leaf className="w-2.5 h-2.5" /> Swafi
                  </span>
                </div>
                <p className="text-earth/60 text-[10px] uppercase tracking-[0.15em] font-bold font-sans">Smart Kenyan Kitchen</p>
              </div>
            </div>

            {/* Navigation Tabs */}
            <nav className="flex bg-cream border border-deep-green/5 p-1 rounded-xl font-sans text-xs font-bold gap-0.5">
              <button
                id="tab-inventory-btn"
                onClick={() => {
                  setActiveTab("inventory");
                  setErrorMsg(null);
                }}
                className={`flex items-center gap-1.5 py-2 px-4 rounded-lg transition-all border border-transparent cursor-pointer ${
                  activeTab === "inventory"
                    ? "bg-deep-green text-white shadow-xs"
                    : "text-deep-green/60 hover:text-deep-green hover:bg-white/50"
                }`}
              >
                <Layers className="w-4 h-4" />
                <span>Pantry (Stoo)</span>
              </button>

              <button
                id="tab-mealplan-btn"
                onClick={() => {
                  setActiveTab("mealplan");
                  setErrorMsg(null);
                }}
                className={`flex items-center gap-1.5 py-2 px-4 rounded-lg transition-all border border-transparent cursor-pointer ${
                  activeTab === "mealplan"
                    ? "bg-deep-green text-white shadow-xs"
                    : "text-deep-green/60 hover:text-deep-green hover:bg-white/50"
                }`}
              >
                <CalendarDays className="w-4 h-4" />
                <span>Meal Planner</span>
              </button>

              <button
                id="tab-shopping-btn"
                onClick={() => {
                  setActiveTab("shopping");
                  setErrorMsg(null);
                }}
                className={`flex items-center gap-1.5 py-2 px-4 rounded-lg transition-all border border-transparent cursor-pointer relative ${
                  activeTab === "shopping"
                    ? "bg-deep-green text-white shadow-xs"
                    : "text-deep-green/60 hover:text-deep-green hover:bg-white/50"
                }`}
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Shopping List</span>
                {pendingShoppingCount > 0 && (
                  <span className="absolute -top-1.5 -right-1 text-[9px] bg-terracotta text-white rounded-full w-4.5 h-4.5 flex items-center justify-center font-bold font-sans ring-1 ring-white shadow-xs">
                    {pendingShoppingCount}
                  </span>
                )}
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow w-full">
        {loading && (
          <div className="fixed inset-0 bg-neutral-900/10 backdrop-blur-xs flex items-center justify-center z-50">
            <div className="bg-white px-6 py-5 rounded-2xl shadow-xl flex items-center gap-3 border border-neutral-100">
              <Loader2 className="w-5 h-5 text-amber-600 animate-spin" />
              <span className="text-sm font-bold text-neutral-800 font-sans">Updating kitchen inventory...</span>
            </div>
          </div>
        )}

        {/* Dynamic Tab Rendering */}
        <div className="animate-fade-in">
          {activeTab === "inventory" && (
            <InventoryTab
              inventory={inventory}
              onAddItem={handleAddItem}
              onUpdateItem={handleUpdateItem}
              onDeleteItem={handleDeleteItem}
              onToggleStaple={handleToggleStaple}
              onReset={handleResetInventory}
            />
          )}

          {activeTab === "mealplan" && weeklyPlan && (
            <MealPlannerTab
              plan={weeklyPlan}
              recipes={recipes}
              inventory={inventory}
              onGeneratePlan={handleGeneratePlan}
              onSwapSlot={handleSwapSlot}
              onViewRecipe={setSelectedRecipe}
            />
          )}

          {activeTab === "shopping" && (
            <ShoppingListTab
              shoppingList={shoppingList}
              onToggleItem={handleToggleShoppingItem}
            />
          )}
        </div>
      </main>

      {/* Floating Decorative Swahili Footer */}
      <footer className="bg-white border-t border-neutral-100 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-xs text-neutral-400 font-sans space-y-1">
          <p>© 254 Mpishi Assistant. Karibu jikoni — Crafting healthy meal plans sequentially.</p>
          <p className="text-[10px] text-neutral-300">Made organically with rich earth clay tones & vibrant greens.</p>
        </div>
      </footer>

      {/* Recipe Modal Overlay */}
      {selectedRecipe && (
        <RecipeModal
          recipe={selectedRecipe}
          inventory={inventory}
          onClose={() => setSelectedRecipe(null)}
        />
      )}
    </div>
  );
}
