import React from "react";
import { ShoppingItem } from "../types.js";
import { 
  ShoppingBag, 
  CheckSquare, 
  Square, 
  Layers, 
  Sparkles,
  ArrowRight
} from "lucide-react";

interface ShoppingListTabProps {
  shoppingList: ShoppingItem[];
  onToggleItem: (id: string, completed: boolean) => void;
}

export default function ShoppingListTab({
  shoppingList,
  onToggleItem
}: ShoppingListTabProps) {
  
  // Categorize items
  const categoriesMap = shoppingList.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, ShoppingItem[]>);

  const pendingCount = shoppingList.filter((item) => !item.completed).length;
  const completedCount = shoppingList.filter((item) => item.completed).length;

  return (
    <div className="space-y-6">
      {/* Hero Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#FBF8F3] rounded-[2rem] p-6 border border-dashed border-[#BC4749]/30 flex flex-col justify-between card-shadow">
          <div>
            <p className="text-xs text-[#BC4749] font-sans tracking-widest uppercase font-bold">Shopping List Status</p>
            <div className="flex items-baseline gap-2 mt-1.5">
              <span className={`text-3xl font-display italic font-bold ${pendingCount > 0 ? "text-terracotta" : "text-deep-green"}`}>
                {pendingCount}
              </span>
              <span className="text-xs font-bold text-earth/60">missing ingredients to buy</span>
            </div>
          </div>
          <p className="text-xs text-earth/70 font-sans mt-3">
            Checking off an ingredient from this list simulates your market purchase and instantly transfers it back into your active stock.
          </p>
        </div>

        <div className="bg-white rounded-[2rem] p-6 border border-[#1A3C34]/10 flex flex-col justify-between card-shadow">
          <div>
            <p className="text-xs text-earth/50 uppercase font-sans tracking-widest font-bold">Completed Purchases</p>
            <div className="flex items-baseline gap-2 mt-1.5">
              <span className="text-3xl font-display italic font-bold text-deep-green">
                {completedCount}
              </span>
              <span className="text-xs font-bold text-earth/60">items transferred back</span>
            </div>
          </div>
          <p className="text-xs text-earth/50 font-sans mt-3">
            Your shopping basket tracks ingredients acquired this week automatically.
          </p>
        </div>
      </div>

      {/* Main List Table */}
      {shoppingList.length === 0 ? (
        <div className="bg-white rounded-[2rem] border border-[#1A3C34]/10 p-12 text-center shadow-xs card-shadow">
          <div className="bg-emerald-50 text-[#2D6A4F] w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-100">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold font-display italic text-deep-green">Swafi! Kitchen Fully Configured</h3>
          <p className="text-sm text-earth/60 mt-1 max-w-sm mx-auto font-sans leading-relaxed">
            Your current scheduled meal plans require no missing items! All ingredients are available in active stock.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Active Shopping (col-span 2) */}
          <div className="md:col-span-2 space-y-6">
            <h3 className="text-base font-bold text-deep-green uppercase tracking-wider flex items-center gap-2 font-display italic text-xl">
              <ShoppingBag className="w-5 h-5 text-terracotta" />
              Soko / Market Basket Checklist
            </h3>

            <div className="space-y-6">
              {Object.keys(categoriesMap).map((category) => {
                const categoryItems = categoriesMap[category].filter(i => !i.completed);
                if (categoryItems.length === 0) return null;

                return (
                  <div key={category} className="bg-white rounded-[2rem] border border-[#1A3C34]/10 p-6 card-shadow space-y-4">
                    <h4 className="text-xs font-bold text-[#1A3C34] border-b border-[#1A3C34]/5 pb-2.5 flex items-center justify-between">
                      <span className="bg-[#1A3C34]/5 border border-[#1A3C34]/10 text-deep-green px-3.5 py-1 rounded-full text-[11px] font-bold">
                        {category}
                      </span>
                      <span className="text-[10px] text-earth/40 font-sans font-bold">
                        {categoryItems.length} missing
                      </span>
                    </h4>

                    <div className="divide-y divide-[#1A3C34]/5">
                      {categoryItems.map((item) => (
                        <div 
                          key={item.id}
                          className="flex items-center justify-between py-3.5 transition-all text-sm group"
                        >
                          <button
                            id={`toggle-shop-item-${item.id}`}
                            onClick={() => onToggleItem(item.id, true)}
                            className="flex items-center gap-3 text-left font-sans font-bold text-earth hover:text-terracotta shrink-0 cursor-pointer"
                          >
                            <Square className="w-4.5 h-4.5 text-[#1A3C34]/20 group-hover:text-terracotta shrink-0 transition-colors" />
                            <span className="capitalize">{item.name}</span>
                          </button>

                          <div className="flex items-center gap-2">
                            <span className="text-[10px] bg-red-50 text-terracotta border border-red-100 font-bold px-2 py-0.5 rounded-full">
                              Required
                            </span>
                            <button
                              id={`buy-trans-${item.id}`}
                              onClick={() => onToggleItem(item.id, true)}
                              className="text-[10px] font-bold text-deep-green hover:text-forest flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                            >
                              Transferred <ArrowRight className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}

              {/* Show empty state specifically for pending items if they are all completed */}
              {pendingCount === 0 && (
                <div className="bg-white rounded-[2rem] border border-dashed border-emerald-300 bg-emerald-50/10 p-8 text-center">
                  <p className="text-sm font-bold text-emerald-800">All Purchases Complete for This Plan!</p>
                  <p className="text-xs text-neutral-500 mt-1 font-sans">
                    All missing items have been bought and added into active stock. Check out your recipe match scores now!
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Recently Purchased sidebar (col-span 1) */}
          <div className="bg-[#FBF8F3] rounded-[2rem] p-6 border border-[#1A3C34]/10 self-start space-y-4 card-shadow">
            <div>
              <h3 className="text-sm font-bold text-deep-green uppercase tracking-wider font-display italic">
                Purchased (Kuhamishwa)
              </h3>
              <p className="text-[10px] text-earth/50 font-sans mt-0.5">
                These items have been bought and transferred cleanly to active pantry stock.
              </p>
            </div>

            <div className="space-y-2 max-h-[350px] overflow-y-auto">
              {shoppingList.filter((i) => i.completed).map((item) => (
                <div 
                  key={item.id}
                  className="bg-white p-3.5 rounded-xl border border-[#1A3C34]/5 flex items-center justify-between font-sans text-xs"
                >
                  <button
                    id={`uncheck-shop-item-${item.id}`}
                    onClick={() => onToggleItem(item.id, false)}
                    className="flex items-center gap-2 text-earth/40 hover:text-earth/60 line-through cursor-pointer"
                  >
                    <CheckSquare className="w-4 h-4 text-deep-green shrink-0" />
                    <span className="capitalize font-bold">{item.name}</span>
                  </button>
                  
                  <span className="text-[10px] bg-emerald-50 text-[#2D6A4F] font-bold px-2 py-0.5 rounded-full">
                    In Stock
                  </span>
                </div>
              ))}

              {completedCount === 0 && (
                <div className="p-6 text-center text-earth/40 text-xs italic font-sans font-medium">
                  No purchased items listed yet. Buy items on the left basket checklist to view them here.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
