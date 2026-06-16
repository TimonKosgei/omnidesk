import React, { useState } from "react";
import { InventoryItem } from "../types.js";
import { 
  Plus, 
  Trash2, 
  RotateCw, 
  Coffee, 
  Layers, 
  Check, 
  Search, 
  Calendar,
  AlertCircle,
  TrendingDown,
  ChevronRight
} from "lucide-react";

interface InventoryTabProps {
  inventory: InventoryItem[];
  onAddItem: (item: { name: string; displayName: string; category: string; expirationDate?: string; isAlwaysInStock: boolean }) => void;
  onUpdateItem: (id: string, updates: Partial<InventoryItem>) => void;
  onDeleteItem: (id: string) => void;
  onToggleStaple: (name: string, alwaysInStock: boolean) => void;
  onReset: () => void;
}

const CATEGORIES = [
  "Vegetables & Herbs",
  "Grains & Cereals",
  "Proteins",
  "Spices",
  "Oils & Sauces",
  "Others"
];

// Pre-configured common staples for Kenyan kitchens
const COMMON_DRY_STAPLES = [
  { name: "Salt", keyword: "salt" },
  { name: "Cooking Oil", keyword: "cooking oil" },
  { name: "Water", keyword: "water" },
  { name: "Pepper", keyword: "pepper" },
  { name: "Royco", keyword: "royco" }
];

export default function InventoryTab({
  inventory,
  onAddItem,
  onUpdateItem,
  onDeleteItem,
  onToggleStaple,
  onReset
}: InventoryTabProps) {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  
  // Add item form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [itemName, setItemName] = useState("");
  const [itemCategory, setItemCategory] = useState(CATEGORIES[0]);
  const [itemExpiry, setItemExpiry] = useState("");
  const [isStaple, setIsStaple] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!itemName.trim()) {
      setErrorMsg("Ingredient name is required.");
      return;
    }

    const displayName = itemName.trim();
    const normalized = displayName.toLowerCase();

    if (isEditing) {
      onUpdateItem(isEditing, {
        displayName,
        name: normalized,
        category: itemCategory,
        expirationDate: itemExpiry || undefined,
        isAlwaysInStock: isStaple
      });
      setIsEditing(null);
    } else {
      onAddItem({
        name: normalized,
        displayName,
        category: itemCategory,
        expirationDate: itemExpiry || undefined,
        isAlwaysInStock: isStaple
      });
    }

    // Reset Form
    setItemName("");
    setItemExpiry("");
    setIsStaple(false);
    setShowAddForm(false);
  };

  const handleStartEdit = (item: InventoryItem) => {
    setIsEditing(item.id);
    setItemName(item.displayName);
    setItemCategory(item.category);
    setItemExpiry(item.expirationDate ? item.expirationDate.split("T")[0] : "");
    setIsStaple(item.isAlwaysInStock);
    setShowAddForm(true);
  };

  // Filtered inventory (excluding always-in-stock staples if they aren't part of active stock lists)
  const filteredItems = inventory.filter((item) => {
    const matchesSearch = item.displayName.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === "All" || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Calculate stats
  const totalStock = inventory.filter(i => !i.isAlwaysInStock).length;
  const expiredCount = inventory.filter((item) => {
    if (!item.expirationDate) return false;
    return new Date(item.expirationDate) < new Date();
  }).length;

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#1A3C34] rounded-[2rem] p-6 text-white shadow-xs card-shadow border border-[#1A3C34]/15">
          <p className="text-xs uppercase tracking-widest text-cream/70 font-semibold font-sans">Standard Ingredients</p>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-bold font-display italic text-cream">{totalStock}</span>
            <span className="text-xs text-cream/85">recorded items</span>
          </div>
        </div>

        <div className="bg-white rounded-[2rem] p-6 border border-[#1A3C34]/10 card-shadow flex flex-col justify-between">
          <div>
            <p className="text-xs font-bold text-earth/60 font-sans uppercase tracking-widest">Pantry Staples</p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-bold font-display italic text-deep-green">
                {inventory.filter((i) => i.isAlwaysInStock).length} <span className="text-xs text-earth/50">/ {COMMON_DRY_STAPLES.length}</span>
              </span>
              <span className="text-xs text-forest font-semibold">Always Available</span>
            </div>
          </div>
          <p className="text-xs text-[#BC4749] font-medium mt-2 font-sans">Assumed in stock by Swafi Planner</p>
        </div>

        <div className="bg-white rounded-[2rem] p-6 border border-[#1A3C34]/10 card-shadow flex flex-col justify-between">
          <div>
            <p className="text-xs font-bold text-earth/60 font-sans uppercase tracking-widest font-sans">Freshness Monitor</p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className={`text-3xl font-bold font-display italic ${expiredCount > 0 ? "text-terracotta" : "text-deep-green"}`}>
                {expiredCount}
              </span>
              <span className="text-xs text-earth/65 font-medium">expired stocks</span>
            </div>
          </div>
          <p className="text-xs text-earth/60 mt-2 font-sans">
            {expiredCount > 0 ? "⚠️ Recommended to replace soon!" : "✅ All items fresh and safe."}
          </p>
        </div>
      </div>

      {/* Staple Toggle Bar */}
      <div className="bg-[#FBF8F3] p-6 rounded-[2rem] border border-[#1A3C34]/10 card-shadow">
        <h3 className="text-sm font-bold text-[#1A3C34] flex items-center gap-2 mb-2">
          <Coffee className="w-4 h-4 text-terracotta" />
          Pantry Staples (Always In Stock)
        </h3>
        <p className="text-xs text-earth/70 mb-4 font-sans">
          Toggle ingredients that you keep in infinite supply (such as salt, water, cooking oil). 
          Mpishi assumes these are always available when matching recipes.
        </p>
        <div className="flex flex-wrap gap-2.5">
          {COMMON_DRY_STAPLES.map((staple) => {
            const isInstalled = inventory.some(
              (item) => item.name === staple.keyword && item.isAlwaysInStock
            );
            return (
              <button
                key={staple.keyword}
                id={`toggle-staple-${staple.keyword}`}
                onClick={() => onToggleStaple(staple.name, !isInstalled)}
                className={`flex items-center gap-1.5 px-4 py-2.5 rounded-full text-xs font-bold transition-all border cursor-pointer ${
                  isInstalled
                    ? "bg-[#1A3C34] hover:bg-[#1A3C34]/90 text-white border-[#1A3C34]"
                    : "bg-white hover:bg-[#FBF8F3] text-earth border-deep-green/15"
                }`}
              >
                {isInstalled && <Check className="w-3.5 h-3.5 shrink-0" />}
                {staple.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Grid Filters & Stock */}
      <div className="bg-white rounded-[2rem] border border-[#1A3C34]/10 card-shadow overflow-hidden">
        {/* Table Header Filter controls */}
        <div className="p-5 border-b border-deep-green/5 flex flex-col sm:flex-row gap-3 justify-between items-center bg-[#FBF8F3]/50">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-earth/40 absolute left-3 w-4 h-4 top-3" />
            <input
              id="inventory-search"
              type="text"
              placeholder="Search stock..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white border border-[#1A3C34]/15 rounded-full pl-9 pr-4 py-2 text-sm focus:outline-hidden focus:ring-1 focus:ring-deep-green focus:border-deep-green"
            />
          </div>

          <div className="flex flex-wrap gap-2 w-full sm:w-auto items-center justify-end">
            <select
              id="category-filter-select"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-white border border-[#1A3C34]/15 rounded-full px-4 py-2 text-sm text-earth focus:outline-hidden focus:ring-1 focus:ring-deep-green focus:border-deep-green cursor-pointer"
            >
              <option value="All">All Categories</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            <button
              id="add-custom-item-btn"
              onClick={() => {
                setIsEditing(null);
                setItemName("");
                setItemExpiry("");
                setIsStaple(false);
                setShowAddForm(!showAddForm);
              }}
              className="bg-[#BC4749] hover:bg-[#BC4749]/90 text-white text-xs font-bold px-5 py-2.5 rounded-full transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4 text-white" />
              Add Stock
            </button>

            <button
              id="reset-inventory-btn"
              onClick={() => {
                if(confirm("Are you sure you want to reset your kitchen? This clears custom items and restores default testing ingredients (Unga, Beef, Eggs, SukumaWiki).")) {
                  onReset();
                }
              }}
              className="border border-[#1A3C34]/15 hover:bg-[#FBF8F3] text-earth p-2.5 rounded-full transition-all cursor-pointer"
              title="Reset Stock Pools"
            >
              <RotateCw className="w-4 h-4 text-[#1A3C34]" />
            </button>
          </div>
        </div>

        {/* Add/Edit Form Overlay Drawer-ish Row */}
        {showAddForm && (
          <div className="bg-[#FBF8F3] p-6 border-b border-dashed border-[#1A3C34]/10 animate-slide-down">
            <h4 className="text-sm font-bold text-deep-green hover:text-deep-green mb-3 font-display italic text-lg">
              {isEditing ? "Edit Stock Item" : "Add New Ingredient to Kitchen"}
            </h4>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
              <div className="space-y-1.5 col-span-1 sm:col-span-1">
                <label className="text-xs font-bold text-earth/70">Ingredient Name</label>
                <input
                  id="form-item-name"
                  type="text"
                  placeholder="e.g. Unga, Sukuma Wiki"
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  className="w-full bg-white border border-[#1A3C34]/20 rounded-full px-4 py-2.5 text-sm focus:outline-hidden focus:ring-1 focus:ring-[#1A3C34]"
                />
              </div>

              <div className="space-y-1.5 col-span-1">
                <label className="text-xs font-bold text-earth/70">Category</label>
                <select
                  id="form-item-category"
                  value={itemCategory}
                  onChange={(e) => setItemCategory(e.target.value)}
                  className="w-full bg-white border border-[#1A3C34]/20 rounded-full px-4 py-2.5 text-sm focus:outline-hidden focus:ring-1 focus:ring-[#1A3C34]"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5 col-span-1">
                <label className="text-xs font-bold text-earth/70 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-earth/40" />
                  Expiration (Optional)
                </label>
                <input
                  id="form-item-expiry"
                  type="date"
                  value={itemExpiry}
                  onChange={(e) => setItemExpiry(e.target.value)}
                  className="w-full bg-white border border-[#1A3C34]/20 rounded-full px-4 py-2 text-sm font-sans focus:outline-hidden focus:ring-1 focus:ring-[#1A3C34]"
                />
              </div>

              <div className="flex gap-2 justify-end">
                <button
                  id="form-cancel-btn"
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="border border-[#1A3C34]/15 hover:bg-cream text-earth font-bold text-xs py-2.5 px-4 rounded-full cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  id="form-submit-btn"
                  type="submit"
                  className="bg-[#1A3C34] hover:bg-[#1A3C34]/95 text-white font-bold text-xs py-2.5 px-4 rounded-full shadow-xs cursor-pointer"
                >
                  {isEditing ? "Save Edits" : "Add Item"}
                </button>
              </div>
            </form>
            {errorMsg && (
              <p className="text-xs text-terracotta font-bold mt-2 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {errorMsg}
              </p>
            )}
          </div>
        )}

        {/* Stock List Display */}
        {filteredItems.length === 0 ? (
          <div className="p-12 text-center text-earth/50 font-sans">
            <Layers className="w-10 h-10 mx-auto text-earth/20 mb-3" />
            <p className="text-sm font-medium">No ingredients found matching your search.</p>
            <p className="text-xs text-earth/40 mt-1">Try toggling staples or adding a custom item to stock!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#FBF8F3] border-b border-[#1A3C34]/10 text-[11px] text-[#1A3C34]/60 uppercase tracking-wider font-bold">
                  <th className="px-6 py-4">Ingredient</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Date Added</th>
                  <th className="px-6 py-4">Best Before</th>
                  <th className="px-6 py-4">Pantry State</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1A3C34]/5 text-sm">
                {filteredItems.map((item) => {
                  const isExpired = item.expirationDate && new Date(item.expirationDate) < new Date();
                  
                  return (
                    <tr 
                      key={item.id} 
                      className="hover:bg-[#FBF8F3]/40 transition-all font-sans"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-earth capitalize">
                            {item.displayName}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs font-semibold">
                        <span className="text-[#1A3C34] bg-[#1A3C34]/5 px-2.5 py-1 rounded-md">
                          {item.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs text-earth/50">
                        {new Date(item.dateAdded).toLocaleDateString("en-KE", {
                          year: "numeric",
                          month: "short",
                          day: "numeric"
                        })}
                      </td>
                      <td className="px-6 py-4 text-xs">
                        {item.expirationDate ? (
                          <span className={`font-semibold px-2.5 py-1 rounded-full ${isExpired ? "bg-red-50 text-terracotta border border-red-100" : "bg-neutral-50 text-earth/70 border border-neutral-100"}`}>
                            {new Date(item.expirationDate).toLocaleDateString("en-KE", {
                              year: "numeric",
                              month: "short",
                              day: "numeric"
                            })}
                            {isExpired && " (Expired)"}
                          </span>
                        ) : (
                          <span className="text-earth/30 font-semibold">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {item.isAlwaysInStock ? (
                          <span className="text-[10px] uppercase tracking-wider bg-emerald-50 text-[#2D6A4F] border border-emerald-100 font-bold px-2 py-0.5 rounded-md">
                            Always Stocked
                          </span>
                        ) : (
                          <span className="text-[10px] uppercase tracking-wider bg-neutral-105 text-earth/60 font-semibold px-2 py-0.5 rounded-md">
                            Active Stock
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex gap-2 justify-end">
                          <button
                            id={`edit-item-${item.id}`}
                            onClick={() => handleStartEdit(item)}
                            className="bg-white hover:bg-[#FBF8F3] text-earth font-bold text-xs py-1.5 px-3 rounded-lg border border-[#1A3C34]/15 transition-colors cursor-pointer"
                          >
                            Edit
                          </button>
                          <button
                            id={`delete-item-${item.id}`}
                            onClick={() => onDeleteItem(item.id)}
                            className="bg-[#BC4749]/10 hover:bg-[#BC4749]/20 border border-[#BC4749]/10 text-[#BC4749] p-1.5 rounded-lg transition-colors cursor-pointer"
                            title="Delete Item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
