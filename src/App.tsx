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
import RecipePage from "./components/RecipePage.tsx";
import { 
  ChefHat, 
  Layers, 
  CalendarDays, 
  ShoppingBag, 
  Loader2, 
  Leaf, 
  HelpCircle,
  RefreshCw,
  Home,
  LogOut
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

  // Authentication states
  const [token, setToken] = useState<string | null>(localStorage.getItem("mpishi_token"));
  const [user, setUser] = useState<{ id: string; username: string; displayName: string } | null>(null);

  // Auth form states
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authType, setAuthType] = useState<"login" | "register">("login");
  const [authUsername, setAuthUsername] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authDisplayName, setAuthDisplayName] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);

  // Authenticated fetch helper
  const authFetch = async (url: string, options: RequestInit = {}) => {
    const headers = {
      ...(options.headers || {}),
      "Content-Type": "application/json"
    } as any;
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    return fetch(url, { ...options, headers });
  };

  // Dedicated data loader to support dynamically switching users/guest token
  const loadData = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);

      // 1. Fetch / verify active user identity if token exists
      if (token) {
        try {
          const resMe = await fetch("/api/auth/me", {
            headers: { "Authorization": `Bearer ${token}` }
          });
          if (resMe.ok) {
            const dataMe = await resMe.json();
            if (dataMe.user) {
              setUser(dataMe.user);
            } else {
              // Token has expired
              setToken(null);
              localStorage.removeItem("mpishi_token");
              setUser(null);
            }
          } else {
            setToken(null);
            localStorage.removeItem("mpishi_token");
            setUser(null);
          }
        } catch (e) {
          console.error("Me API verify failed: ", e);
        }
      } else {
        setUser(null);
      }

      // 2. Fetch inventory stock
      const resInv = await fetch("/api/inventory", {
        headers: token ? { "Authorization": `Bearer ${token}` } : {}
      });
      if (!resInv.ok) throw new Error("Failed to load inventory stock");
      const dataInv = await resInv.json();
      setInventory(dataInv);

      // 3. Fetch recipes
      const resRec = await fetch("/api/recipes");
      if (!resRec.ok) throw new Error("Failed to load kitchen recipes");
      const dataRec = await resRec.json();
      setRecipes(dataRec);

      // 4. Fetch weekly plan & shopping checklist
      const resPlan = await fetch("/api/mealplan", {
        headers: token ? { "Authorization": `Bearer ${token}` } : {}
      });
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
  };

  // Core Sync Effect
  useEffect(() => {
    loadData();
  }, [token]);

  // Auth Handlers
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setAuthError(null);
      const url = authType === "login" ? "/api/auth/login" : "/api/auth/register";
      const payload = authType === "login"
        ? { username: authUsername, password: authPassword }
        : { username: authUsername, password: authPassword, displayName: authDisplayName };

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Authentication failed. Tafadhali jaribu tena.");
      }

      localStorage.setItem("mpishi_token", data.token);
      setToken(data.token);
      setUser(data.user);
      setShowAuthModal(false);

      // Reset forms
      setAuthUsername("");
      setAuthPassword("");
      setAuthDisplayName("");
    } catch (err: any) {
      setAuthError(err.message);
    }
  };

  const handleLogout = async () => {
    try {
      setLoading(true);
      await fetch("/api/auth/logout", {
        method: "POST",
        headers: token ? { "Authorization": `Bearer ${token}` } : {}
      });
    } catch (e) {
      console.error("Logout request failed silently: ", e);
    } finally {
      localStorage.removeItem("mpishi_token");
      setToken(null);
      setUser(null);
      setLoading(false);
    }
  };

  // API Callbacks for Inventory CRUD
  const handleAddItem = async (item: { name: string; displayName: string; category: string; expirationDate?: string; isAlwaysInStock: boolean }) => {
    try {
      setErrorMsg(null);
      const tempRes = await authFetch("/api/inventory", {
        method: "POST",
        body: JSON.stringify(item)
      });
      if (!tempRes.ok) throw new Error("Server rejected inventory upload");
      const newItem = await tempRes.json();

      setInventory((prev) => {
        const idx = prev.findIndex(i => i.name === newItem.name && i.isAlwaysInStock === newItem.isAlwaysInStock);
        if (idx > -1) {
          const c = [...prev];
          c[idx] = newItem;
          return c;
        }
        return [...prev, newItem];
      });

      const syncRes = await authFetch("/api/mealplan");
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
      const res = await authFetch(`/api/inventory/${id}`, {
        method: "PUT",
        body: JSON.stringify(updates)
      });
      if (!res.ok) throw new Error("Failed to sync item update");
      const updatedItem = await res.json();

      setInventory((prev) => prev.map((item) => (item.id === id ? updatedItem : item)));

      const syncRes = await authFetch("/api/mealplan");
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
      const res = await authFetch(`/api/inventory/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete stock element");

      setInventory((prev) => prev.filter((item) => item.id !== id));

      const syncRes = await authFetch("/api/mealplan");
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
      const res = await authFetch("/api/pantry/toggle", {
        method: "POST",
        body: JSON.stringify({ name, alwaysInStock })
      });
      if (!res.ok) throw new Error("Failed to toggle pantry availability");
      const updatedItem = await res.json();

      setInventory((prev) => {
        const filtered = prev.filter(item => item.id !== updatedItem.id);
        return [...filtered, updatedItem];
      });

      const syncRes = await authFetch("/api/mealplan");
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
      const res = await authFetch("/api/inventory/reset", { method: "POST" });
      if (!res.ok) throw new Error("Failed to execute reset process");
      const data = await res.json();
      
      setInventory(data.inventory);
      
      const resPlan = await authFetch("/api/mealplan");
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
      const res = await authFetch("/api/mealplan/generate", {
        method: "POST",
        body: JSON.stringify({ preserveLocked })
      });
      if (!res.ok) throw new Error("Failed to compile weekly plan simulation");
      const data = await res.json();
      
      if (data.success) {
        setWeeklyPlan(data.plan);
        setShoppingList(data.shoppingList);
        setActiveTab("mealplan");
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
      const res = await authFetch("/api/mealplan/swap", {
        method: "POST",
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
      const res = await authFetch("/api/shopping/toggle", {
        method: "POST",
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

  if (selectedRecipe) {
    return (
      <RecipePage
        recipe={selectedRecipe}
        inventory={inventory}
        onClose={() => setSelectedRecipe(null)}
      />
    );
  }

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

      {/* Guest Mode Notice banner */}
      {!user && (
        <div className="bg-mustard/15 border-b border-mustard/30 px-6 py-3 flex flex-wrap justify-between items-center gap-3 text-xs text-deep-green font-bold font-sans">
          <div className="flex items-center gap-2">
            <span className="bg-mustard text-deep-green px-2 py-0.5 rounded-md text-[10px] tracking-wide uppercase font-extrabold shadow-sm">Guest Mode</span>
            <span>You are currently managing the default trial kitchen. Sign up to secure your personalized stock, pantry staples, and shopping list!</span>
          </div>
          <div className="flex gap-2">
            <button
              id="header-login-btn"
              onClick={() => {
                setAuthType("login");
                setAuthError(null);
                setShowAuthModal(true);
              }}
              className="bg-deep-green hover:bg-deep-green/90 text-white px-3.5 py-1.5 rounded-lg transition-all cursor-pointer shadow-xs active:scale-95 text-[11px]"
            >
              Log In
            </button>
            <button
              id="header-signup-btn"
              onClick={() => {
                setAuthType("register");
                setAuthError(null);
                setShowAuthModal(true);
              }}
              className="bg-mustard hover:bg-mustard/90 text-deep-green px-3.5 py-1.5 rounded-lg transition-all cursor-pointer shadow-xs active:scale-95 text-[11px]"
            >
              Sign Up
            </button>
          </div>
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

            {/* Profile Block (For logged-in users) */}
            {user && (
              <div className="hidden sm:flex items-center gap-3 bg-cream/60 border border-deep-green/5 px-4 py-2 rounded-2xl">
                <div className="w-8 h-8 rounded-full bg-deep-green text-cream flex items-center justify-center font-bold text-sm border-2 border-mustard">
                  {user.displayName.charAt(0).toUpperCase()}
                </div>
                <div className="text-left">
                  <p className="text-[10px] uppercase tracking-wider text-earth/60 font-bold font-sans">Jiko Owner</p>
                  <p className="text-xs font-bold text-deep-green font-sans">{user.displayName}</p>
                </div>
                <button
                  id="avatar-logout-btn"
                  onClick={handleLogout}
                  className="ml-2 text-[10px] uppercase tracking-wider text-terracotta hover:text-terracotta/80 font-bold underline transition-all cursor-pointer"
                >
                  Logout
                </button>
              </div>
            )}

            {/* Navigation Tabs */}
            <nav className="flex bg-cream border border-deep-green/5 p-1 rounded-xl font-sans text-xs font-bold gap-0.5">
              <button
                id="tab-inventory-btn"
                onClick={() => {
                  setActiveTab("inventory");
                  setErrorMsg(null);
                }}
                className={`flex items-center gap-1.5 py-2 px-3 sm:px-4 rounded-lg transition-all border border-transparent cursor-pointer ${
                  activeTab === "inventory"
                    ? "bg-deep-green text-white shadow-xs"
                    : "text-deep-green/60 hover:text-deep-green hover:bg-white/50"
                }`}
              >
                <Layers className="w-4 h-4" />
                <span className="hidden sm:inline">Pantry (Stoo)</span>
                <span className="sm:hidden">Pantry</span>
              </button>

              <button
                id="tab-mealplan-btn"
                onClick={() => {
                  setActiveTab("mealplan");
                  setErrorMsg(null);
                }}
                className={`flex items-center gap-1.5 py-2 px-3 sm:px-4 rounded-lg transition-all border border-transparent cursor-pointer ${
                  activeTab === "mealplan"
                    ? "bg-deep-green text-white shadow-xs"
                    : "text-deep-green/60 hover:text-deep-green hover:bg-white/50"
                }`}
              >
                <CalendarDays className="w-4 h-4" />
                <span>Planner</span>
              </button>

              <button
                id="tab-shopping-btn"
                onClick={() => {
                  setActiveTab("shopping");
                  setErrorMsg(null);
                }}
                className={`flex items-center gap-1.5 py-2 px-3 sm:px-4 rounded-lg transition-all border border-transparent cursor-pointer relative ${
                  activeTab === "shopping"
                    ? "bg-deep-green text-white shadow-xs"
                    : "text-deep-green/60 hover:text-deep-green hover:bg-white/50"
                }`}
              >
                <ShoppingBag className="w-4 h-4" />
                <span className="hidden sm:inline">Shopping List</span>
                <span className="sm:hidden">Shopping</span>
                {pendingShoppingCount > 0 && (
                  <span className="absolute -top-1.5 -right-1 text-[9px] bg-terracotta text-white rounded-full w-4.5 h-4.5 flex items-center justify-center font-bold font-sans ring-1 ring-white shadow-xs">
                    {pendingShoppingCount}
                  </span>
                )}
              </button>

              {user && (
                <button
                  id="tab-logout-btn"
                  onClick={handleLogout}
                  className="sm:hidden flex items-center justify-center p-2 text-terracotta hover:bg-terracotta/10 rounded-lg cursor-pointer transition-all"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              )}
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



      {/* Authentic, Beautiful Login/Register Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-neutral-900/60 backdrop-blur-md flex items-center justify-center z-50 animate-fade-in p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full overflow-hidden border border-deep-green/10 transform scale-100 transition-all duration-300">
            {/* Modal Header */}
            <div className="bg-deep-green p-6 text-white text-center relative">
              <button 
                id="close-auth-modal-btn"
                onClick={() => {
                  setShowAuthModal(false);
                  setAuthError(null);
                }}
                className="absolute top-4 right-4 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-1 rounded-full transition-all cursor-pointer text-xs"
              >
                ✕
              </button>
              <ChefHat className="w-8 h-8 mx-auto text-mustard mb-2" />
              <h2 className="text-xl font-bold font-display tracking-tight">
                {authType === "login" ? "Karibu Jikoni" : "Jisajili Mpishi"}
              </h2>
              <p className="text-cream/80 text-[11px] mt-1 font-sans">
                {authType === "login" 
                  ? "Access your custom Kenya kitchen inventory & planners" 
                  : "Join Mpishi to save custom stock, pantry staples, and recipes!"}
              </p>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleAuthSubmit} className="p-6 space-y-4">
              {authError && (
                <div className="bg-terracotta/10 text-terracotta p-3 rounded-xl text-xs font-bold font-sans border border-terracotta/20 animate-shake">
                  ⚠ {authError}
                </div>
              )}

              {authType === "register" && (
                <div className="space-y-1">
                  <label className="block text-[10px] uppercase tracking-wider font-bold text-earth/60 font-sans" htmlFor="reg-displayName">
                    Display Name
                  </label>
                  <input
                    id="reg-displayName"
                    type="text"
                    required
                    value={authDisplayName}
                    onChange={(e) => setAuthDisplayName(e.target.value)}
                    placeholder="e.g. Mama Ken"
                    className="w-full bg-cream border border-deep-green/10 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-mustard/30 text-earth font-sans"
                  />
                </div>
              )}

              <div className="space-y-1">
                <label className="block text-[10px] uppercase tracking-wider font-bold text-earth/60 font-sans" htmlFor="auth-username">
                  Username
                </label>
                <input
                  id="auth-username"
                  type="text"
                  required
                  value={authUsername}
                  onChange={(e) => setAuthUsername(e.target.value)}
                  placeholder="e.g. mamaken77"
                  className="w-full bg-cream border border-deep-green/10 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-mustard/30 text-earth font-sans lowercase"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] uppercase tracking-wider font-bold text-earth/60 font-sans" htmlFor="auth-password">
                  Password
                </label>
                <input
                  id="auth-password"
                  type="password"
                  required
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-cream border border-deep-green/10 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-mustard/30 text-earth font-sans"
                />
              </div>

              <button
                id="submit-auth-btn"
                type="submit"
                className="w-full bg-mustard hover:bg-mustard/90 text-deep-green font-extrabold py-3 px-4 rounded-xl shadow-xs transition-all text-xs tracking-wide flex items-center justify-center gap-2 cursor-pointer font-sans"
              >
                <span>{authType === "login" ? "Ingia (Log In)" : "Jisajili (Sign Up)"}</span>
              </button>

              <div className="text-center text-[11px] text-earth/60 pt-2 font-sans">
                {authType === "login" ? (
                  <p>
                    New to Mpishi?{" "}
                    <button
                      id="toggle-auth-reg-btn"
                      type="button"
                      onClick={() => {
                        setAuthType("register");
                        setAuthError(null);
                      }}
                      className="text-deep-green font-bold underline hover:text-deep-green/80 cursor-pointer"
                    >
                      Create an account
                    </button>
                  </p>
                ) : (
                  <p>
                    Already have an account?{" "}
                    <button
                      id="toggle-auth-login-btn"
                      type="button"
                      onClick={() => {
                        setAuthType("login");
                        setAuthError(null);
                      }}
                      className="text-deep-green font-bold underline hover:text-deep-green/80 cursor-pointer"
                    >
                      Sign In
                    </button>
                  </p>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
