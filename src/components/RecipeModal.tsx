import React from "react";
import { Recipe, InventoryItem } from "../types.js";
import { X, Clock, Users, BookOpen, Check, AlertCircle } from "lucide-react";

interface RecipeModalProps {
  recipe: Recipe;
  inventory: InventoryItem[];
  onClose: () => void;
}

export default function RecipeModal({ recipe, inventory, onClose }: RecipeModalProps) {
  // Normalize inventory names for easy lookup
  const ownedIngredients = new Set(inventory.map((item) => item.name.toLowerCase().trim()));

  return (
    <div className="fixed inset-0 bg-[#432818]/65 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
      <div 
        id="recipe-modal-card"
        className="bg-white rounded-[2.5rem] max-w-2xl w-full max-h-[85vh] overflow-hidden shadow-2xl border border-deep-green/10 flex flex-col card-shadow"
      >
        {/* Header Visual */}
        <div className="bg-[#1A3C34] p-8 text-[#FBF8F3] relative border-b border-white/10">
          <button 
            id="close-recipe-modal"
            onClick={onClose}
            className="absolute top-6 right-6 bg-white/10 hover:bg-white/20 text-[#FBF8F3] rounded-full p-2.5 transition-all cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
          
          <span className="text-[10px] font-bold tracking-widest uppercase bg-white/10 text-cream py-1 px-3.5 rounded-full">
            {recipe.category}
          </span>
          <h2 className="text-3xl font-bold mt-3 font-display italic text-cream leading-tight">{recipe.name}</h2>
          <p className="text-cream/80 text-sm mt-1.5 font-sans leading-relaxed">{recipe.description}</p>
        </div>

        {/* Scrollable Content */}
        <div className="p-8 overflow-y-auto space-y-6 flex-1">
          {/* Metadata Grid */}
          <div className="grid grid-cols-2 gap-4 bg-[#FBF8F3] p-4.5 rounded-[1.5rem] border border-[#1A3C34]/10">
            <div className="flex items-center gap-3">
              <div className="bg-[#1A3C34]/10 p-2.5 rounded-full text-deep-green">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-earth/50 font-semibold uppercase tracking-wider">Cooking Time</p>
                <p className="text-sm font-bold text-earth">{recipe.cookingTime} Mins</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="bg-[#BC4749]/15 p-2.5 rounded-full text-terracotta">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-earth/50 font-semibold uppercase tracking-wider">Servings</p>
                <p className="text-sm font-bold text-earth">{recipe.servings} People</p>
              </div>
            </div>
          </div>

          {/* Ingredient Match Analyzer */}
          <div>
            <h3 className="text-sm font-bold text-deep-green uppercase tracking-wider mb-4.5 flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-terracotta rounded-full inline-block"></span>
              Ingredients Check (Kiungo)
            </h3>
            <div className="grid sm:grid-cols-2 gap-2 text-sm">
              {/* Core ingredients */}
              {recipe.ingredients.map((ing) => {
                const isOwned = ownedIngredients.has(ing.toLowerCase().trim());
                return (
                  <div 
                    key={ing}
                    className={`flex items-center justify-between p-3 rounded-xl border ${
                      isOwned 
                        ? "bg-emerald-50/50 border-emerald-100 text-emerald-950" 
                        : "bg-red-50/50 border-red-100 text-terracotta"
                    }`}
                  >
                    <span className="capitalize font-bold text-xs">{ing}</span>
                    <span className="flex items-center gap-1 text-xs">
                      {isOwned ? (
                        <>
                          <Check className="w-4 h-4 text-[#2D6A4F]" />
                          <span className="font-bold text-[#2D6A4F] text-[11px]">In Stock</span>
                        </>
                      ) : (
                        <>
                          <AlertCircle className="w-4 h-4 text-terracotta" />
                          <span className="font-bold text-terracotta text-[11px]">Missing</span>
                        </>
                      )}
                    </span>
                  </div>
                );
              })}

              {/* Pantry Staples needed */}
              {recipe.pantryStaplesNeeded.map((staple) => {
                const isOwned = ownedIngredients.has(staple.toLowerCase().trim());
                return (
                  <div 
                    key={staple}
                    className={`flex items-center justify-between p-3 rounded-xl border ${
                      isOwned 
                        ? "bg-[#1A3C34]/5 border-[#1A3C34]/10 text-deep-green" 
                        : "bg-[#FBF8F3] border-[#1A3C34]/5 text-earth/70"
                    }`}
                  >
                    <span className="capitalize font-bold text-xs">{staple} <span className="text-[9px] text-[#1A3C34]/50 font-sans font-medium">(Staple)</span></span>
                    <span className="flex items-center gap-1 text-xs">
                      {isOwned ? (
                        <>
                          <Check className="w-4 h-4 text-deep-green" />
                          <span className="font-bold text-deep-green text-[11px]">Available</span>
                        </>
                      ) : (
                        <>
                          <AlertCircle className="w-4 h-4 text-earth/40" />
                          <span className="font-bold text-earth/50 text-[11px]">Not Toggled</span>
                        </>
                      )}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Cooking Instructions */}
          <div>
            <h3 className="text-sm font-bold text-deep-green uppercase tracking-wider mb-4.5 flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-deep-green rounded-full inline-block"></span>
              Step-by-Step Guide (Maelekezo)
            </h3>
            <div className="space-y-4">
              {recipe.instructions.map((step, idx) => (
                <div key={idx} className="flex gap-3.5 bg-[#FBF8F3]/50 p-3.5 rounded-2xl border border-[#1A3C34]/5">
                  <span className="bg-[#BC4749] text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center shrink-0 border border-[#BC4749]/10">
                    {idx + 1}
                  </span>
                  <p className="text-sm text-earth/80 leading-relaxed font-sans font-medium mt-0.5">{step}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 bg-[#FBF8F3] border-t border-[#1A3C34]/10 flex justify-end">
          <button 
            id="close-recipe-modal-footer"
            onClick={onClose}
            className="bg-[#1A3C34] hover:bg-[#1A3C34]/95 text-white font-bold text-xs py-2.5 px-6 rounded-full transition-all cursor-pointer shadow-xs"
          >
            Funga (Close Guide)
          </button>
        </div>
      </div>
    </div>
  );
}
