import React, { useState } from "react";
import { WeeklyMealPlan, Recipe, DAYS_OF_WEEK, MEAL_TYPES, MealType, InventoryItem } from "../types.js";
import { 
  Sparkles, 
  Lock, 
  Unlock, 
  Utensils, 
  HelpCircle, 
  Shuffle, 
  Eye, 
  CalendarDays,
  CheckCircle,
  AlertCircle
} from "lucide-react";

interface MealPlannerTabProps {
  plan: WeeklyMealPlan;
  recipes: Recipe[];
  inventory: InventoryItem[];
  onGeneratePlan: (preserveLocked: boolean) => void;
  onSwapSlot: (day: keyof WeeklyMealPlan, meal: MealType, recipeId: string | null) => void;
  onViewRecipe: (recipe: Recipe) => void;
}

export default function MealPlannerTab({
  plan,
  recipes,
  inventory,
  onGeneratePlan,
  onSwapSlot,
  onViewRecipe
}: MealPlannerTabProps) {
  const [activeDay, setActiveDay] = useState<keyof WeeklyMealPlan>("Monday");
  const [swappingSlot, setSwappingSlot] = useState<{ day: keyof WeeklyMealPlan; meal: MealType } | null>(null);

  // Helper to format days beautifully
  const getDayLabel = (d: string) => {
    return d.substring(0, 3); // Mon, Tue, Wed, etc.
  };

  // Helper to get matching scores for all recipes based on current inventory
  // This informs the user BEFORE swapping which recipe matches their pantry best
  const getRecipeMatches = () => {
    const ownedIngredients = new Set(inventory.map(item => item.name.toLowerCase().trim()));

    return recipes.map((recipe) => {
      const allReqs = [...recipe.ingredients, ...recipe.pantryStaplesNeeded];
      const matched = allReqs.filter(ing => ownedIngredients.has(ing.toLowerCase().trim()));
      
      const matchPercentage = allReqs.length > 0 
        ? Math.round((matched.length / allReqs.length) * 100)
        : 0;

      return {
        recipe,
        matchPercentage,
        matchedCount: matched.length,
        totalCount: allReqs.length,
        missing: allReqs.filter(ing => !ownedIngredients.has(ing.toLowerCase().trim()))
      };
    }).sort((a, b) => b.matchPercentage - a.matchPercentage);
  };

  const recipeScores = getRecipeMatches();

  return (
    <div className="space-y-6">
      {/* Quick Setup Bar */}
      <div className="bg-[#1A3C34] p-6 rounded-[2rem] text-cream card-shadow border border-[#1A3C34]/10 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="space-y-1">
          <h3 className="text-xl font-bold font-display italic flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-mustard" />
            Sequential Deduction Planner
          </h3>
          <p className="text-cream/80 text-xs leading-relaxed max-w-xl font-sans">
            Mpishi creates your 7-day schedule sequentially. Assigning a meal to Monday simulates 
            the consumption of those ingredients before recommending Tuesday's meals, and so on. 
            Any slots you manually lock (🔒) are preserved during planning.
          </p>
        </div>

        <div className="flex gap-2 shrink-0">
          <button
            id="generate-meal-plan-btn"
            onClick={() => onGeneratePlan(true)}
            className="bg-[#BC4749] hover:bg-[#BC4749]/90 text-white text-xs font-extrabold px-6 py-3 rounded-full shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-white" />
            Generate Plan
          </button>
          
          <button
            id="regenerate-fresh-plan-btn"
            onClick={() => {
              if(confirm("Regenerating a completely fresh plan will ignore your locked slots. Proceed?")) {
                onGeneratePlan(false);
              }
            }}
            className="bg-white/10 hover:bg-white/20 text-white text-xs font-semibold px-4 py-3 rounded-full border border-white/20 transition-all cursor-pointer"
          >
            Reset & Generate
          </button>
        </div>
      </div>

      {/* Horizontal Week Calendar bar */}
      <div className="flex bg-cream border border-[#1A3C34]/10 p-1.5 rounded-2xl gap-1 overflow-x-auto card-shadow">
        {DAYS_OF_WEEK.map((day) => {
          const isActive = activeDay === day;
          
          // Count recipes scheduled for this day
          const dayMeals = plan[day];
          const scheduledCount = Object.values(dayMeals).filter(slot => slot.recipeId).length;

          return (
            <button
              key={day}
              id={`day-selector-${day}`}
              onClick={() => {
                setActiveDay(day);
                setSwappingSlot(null); // Clear swap drawer
              }}
              className={`flex-1 min-w-[70px] text-center py-2.5 px-2 rounded-xl transition-all cursor-pointer ${
                isActive
                  ? "bg-[#1A3C34] text-cream font-bold shadow-xs"
                  : "hover:bg-[#1A3C34]/5 text-earth/70"
              }`}
            >
              <span className="block text-xs font-semibold uppercase tracking-wider">
                {getDayLabel(day)}
              </span>
              <span className={`inline-block text-[10px] mt-0.5 px-1.5 py-0.5 rounded-full font-bold leading-none ${
                isActive 
                  ? "bg-white/20 text-cream" 
                  : scheduledCount > 0 ? "bg-forest/15 text-forest" : "bg-earth/10 text-earth/50"
              }`}>
                {scheduledCount} meals
              </span>
            </button>
          );
        })}
      </div>

      {/* Main Grid: Active Day Meal List & Swipe Drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Meals display (col span 2) */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-xl font-bold text-deep-green flex items-center gap-2 font-display italic">
            <CalendarDays className="w-5 h-5 text-terracotta" />
            Scheduled Meals for {activeDay}
          </h3>

          <div className="space-y-4">
            {MEAL_TYPES.map((mealType) => {
              const slot = plan[activeDay]?.[mealType];
              const recipe = slot?.recipeId ? recipes.find(r => r.id === slot.recipeId) : null;

              return (
                <div 
                  key={mealType}
                  className="bg-white rounded-[2rem] border border-[#1A3C34]/10 p-5 shadow-xs card-shadow flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-all hover:border-[#BC4749]/30"
                >
                  <div className="flex gap-4 items-start">
                    <span className="bg-[#1A3C34]/5 text-deep-green text-xs font-bold px-3 py-1.5 rounded-full border border-deep-green/10 inline-block font-sans shrink-0 uppercase tracking-widest mt-0.5">
                      {mealType}
                    </span>

                    {recipe ? (
                      <div className="space-y-1">
                        <h4 className="text-base font-bold text-earth leading-tight">
                          {recipe.name}
                        </h4>
                        <p className="text-xs text-earth/60 line-clamp-1 max-w-lg font-sans">
                          {recipe.description}
                        </p>
                        <div className="flex items-center gap-3 mt-1.5 text-[11px] font-semibold text-[#1A3C34]/60">
                          <span>⏱️ {recipe.cookingTime} mins</span>
                          <span>•</span>
                          <span>👥 {recipe.servings} people</span>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-0.5 py-1">
                        <h4 className="text-sm font-bold text-earth/40 italic">
                          No Meal Selected
                        </h4>
                        <p className="text-xs text-earth/50 font-sans">
                          Touch Swap Meal below to add a matching Kenyan recipe.
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 w-full md:w-auto justify-end border-t border-[#1A3C34]/5 md:border-none pt-3 md:pt-0 shrink-0">
                    {recipe && (
                      <button
                        id={`view-recipe-${activeDay}-${mealType}`}
                        onClick={() => onViewRecipe(recipe)}
                        className="bg-white hover:bg-cream text-earth font-bold text-xs py-2 px-3 rounded-full border border-[#1A3C34]/15 transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        View Guide
                      </button>
                    )}

                    <button
                      id={`swap-slot-${activeDay}-${mealType}`}
                      onClick={() => setSwappingSlot({ day: activeDay, meal: mealType })}
                      className="bg-[#BC4749] hover:bg-[#BC4749]/90 text-white font-bold text-xs py-2 px-4 rounded-full transition-all flex items-center gap-1.5 shrink-0 cursor-pointer shadow-xs"
                    >
                      <Shuffle className="w-3.5 h-3.5" />
                      {recipe ? "Change" : "Add Meal"}
                    </button>

                    {recipe && (
                      <button
                        id={`lock-slot-${activeDay}-${mealType}`}
                        className={`p-2 rounded-full border transition-all cursor-pointer ${
                          slot.locked
                            ? "bg-[#1A3C34] border-[#1A3C34] text-white"
                            : "bg-white hover:bg-[#FBF8F3] border-[#1A3C34]/15 text-earth/40"
                        }`}
                        onClick={() => {
                          // Directly re-run with swapped locks on backend
                          onSwapSlot(activeDay, mealType, slot.recipeId);
                        }}
                        title={slot.locked ? "Slot Locked (Preserved)" : "Lock Slot"}
                      >
                        {slot.locked ? (
                          <Lock className="w-4 h-4 shrink-0" />
                        ) : (
                          <Unlock className="w-4 h-4 shrink-0" />
                        )}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recipe matching swap drawer (col span 1) */}
        <div className="bg-white rounded-[2rem] border border-[#1A3C34]/10 card-shadow p-6 self-start space-y-4">
          <div className="border-b border-[#1A3C34]/10 pb-3">
            <h3 className="text-lg font-bold text-deep-green flex items-center gap-1.5 font-display italic">
              <Utensils className="w-4.5 h-4.5 text-terracotta" />
              {swappingSlot ? `Recipes for ${swappingSlot.meal}` : "Smart Suggestions"}
            </h3>
            <p className="text-earth/60 text-xs mt-1 font-sans">
              {swappingSlot 
                ? `Choose a Kenyan kitchen recipe to swap into ${swappingSlot.day}'s ${swappingSlot.meal}.`
                : "A ranked list of recipes based on current availability score."
              }
            </p>
          </div>

          <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
            {recipeScores.map(({ recipe, matchPercentage, missing }) => {
              const isSelected = swappingSlot 
                ? plan[swappingSlot.day]?.[swappingSlot.meal]?.recipeId === recipe.id 
                : false;

              return (
                <div
                  key={recipe.id}
                  className={`p-4 rounded-2xl border transition-all flex flex-col justify-between gap-3 ${
                    isSelected 
                      ? "bg-[#FBF8F3] border-[#1A3C34] ring-1 ring-[#1A3C34]/50" 
                      : "border-deep-green/10 hover:border-deep-green/30"
                  }`}
                >
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <h4 className="text-xs font-bold text-earth">{recipe.name}</h4>
                      <p className="text-[10px] text-earth/50 capitalize font-medium">{recipe.category} • {recipe.cookingTime} Mins</p>
                    </div>
                    
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                      matchPercentage >= 75 
                        ? "bg-[#1A3C34]/10 text-deep-green border border-[#1A3C34]/10" 
                        : matchPercentage >= 40 
                          ? "bg-[#E9C46A]/20 text-[#432818] border border-[#E9C46A]/40" 
                          : "bg-[#BC4749]/10 text-[#BC4749] border border-[#BC4749]/20"
                    }`}>
                      {matchPercentage}% Match
                    </span>
                  </div>

                  {/* Highlights of stocked / missing */}
                  <div className="space-y-1">
                    <p className="text-[9px] uppercase font-bold tracking-widest text-[#1A3C34]/50">Ingredient Highlights</p>
                    <div className="flex flex-wrap gap-1">
                      {recipe.ingredients.map((ing) => {
                        const inStock = !missing.includes(ing);
                        return (
                          <span
                            key={ing}
                            className={`text-[9.5px] font-bold px-2 py-0.5 rounded-md capitalize ${
                              inStock 
                                ? "bg-emerald-50 text-[#2D6A4F]" 
                                : "bg-red-50 text-terracotta"
                            }`}
                          >
                            {ing}
                          </span>
                        );
                      })}
                    </div>
                  </div>

                  {/* Interaction Button */}
                  {swappingSlot ? (
                    <div className="flex gap-1.5 border-t border-[#1A3C34]/5 pt-2.5 mt-1">
                      <button
                        id={`swap-confirm-${recipe.id}`}
                        onClick={() => {
                          onSwapSlot(swappingSlot.day, swappingSlot.meal, recipe.id);
                          setSwappingSlot(null); // dismiss
                        }}
                        className="flex-1 bg-deep-green hover:bg-[#1A3C34]/90 text-white font-bold text-[11px] py-2 px-3 rounded-full text-center transition-all cursor-pointer"
                      >
                        {isSelected ? "Selected (Locked)" : "Choose This Meal"}
                      </button>
                      
                      <button
                        id={`quick-guide-${recipe.id}`}
                        onClick={() => onViewRecipe(recipe)}
                        className="border border-[#1A3C34]/15 hover:bg-[#FBF8F3] text-earth p-1.5 rounded-full cursor-pointer"
                        title="View recipe guide"
                      >
                        <Eye className="w-3.5 h-3.5 text-[#1A3C34]" />
                      </button>
                    </div>
                  ) : (
                    <button
                      id={`overall-suggest-recipe-view-${recipe.id}`}
                      onClick={() => onViewRecipe(recipe)}
                      className="text-left text-[11px] font-bold text-[#BC4749] hover:text-[#BC4749]/90 flex items-center gap-0.5 border-t border-[#1A3C34]/5 pt-2.5 mt-1 cursor-pointer"
                    >
                      View Full Recipe Guide →
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {swappingSlot && (
            <button
              id="clear-meal-slot-btn"
              onClick={() => {
                onSwapSlot(swappingSlot.day, swappingSlot.meal, null);
                setSwappingSlot(null);
              }}
              className="w-full text-center text-xs font-bold py-2.5 hover:bg-red-50 text-terracotta rounded-full border border-[#BC4749]/20 border-dashed transition-all cursor-pointer"
            >
              Clear This Meal Slot
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
