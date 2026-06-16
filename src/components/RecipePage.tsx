import React, { useState, useEffect } from "react";
import { Recipe, InventoryItem } from "../types.js";
import { 
  ArrowLeft, 
  Clock, 
  Users, 
  Check, 
  AlertCircle, 
  Play, 
  Pause, 
  RotateCcw, 
  Sparkles, 
  ChefHat, 
  CheckCircle2, 
  UtensilsCrossed 
} from "lucide-react";

interface RecipePageProps {
  recipe: Recipe;
  inventory: InventoryItem[];
  onClose: () => void;
}

export default function RecipePage({ recipe, inventory, onClose }: RecipePageProps) {
  // Normalize inventory names for easy lookup
  const ownedIngredients = new Set(inventory.map((item) => item.name.toLowerCase().trim()));

  // Interactive Prep state to check off items before starting
  const [preppedIngredients, setPreppedIngredients] = useState<Record<string, boolean>>({});
  
  // Interactive Step Tracker
  const [activeStep, setActiveStep] = useState<number>(0);
  const [completedSteps, setCompletedSteps] = useState<Record<number, boolean>>({});

  // Countdown Kitchen Timer
  const [timeLeft, setTimeLeft] = useState<number>(recipe.cookingTime * 60);
  const [timerRunning, setTimerRunning] = useState<boolean>(false);

  // Timer Effect
  useEffect(() => {
    let interval: any = null;
    if (timerRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setTimerRunning(false);
    }
    return () => clearInterval(interval);
  }, [timerRunning, timeLeft]);

  // Format seconds into MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const togglePrepIngredient = (ing: string) => {
    setPreppedIngredients((prev) => ({
      ...prev,
      [ing]: !prev[ing]
    }));
  };

  const toggleStepCompleted = (idx: number) => {
    setCompletedSteps((prev) => ({
      ...prev,
      [idx]: !prev[idx]
    }));
  };

  const handleResetTimer = () => {
    setTimerRunning(false);
    setTimeLeft(recipe.cookingTime * 60);
  };

  // Calculate missing stock highlight for summary banner
  const missingCoreIngredientsCount = recipe.ingredients.filter(
    (ing) => !ownedIngredients.has(ing.toLowerCase().trim())
  ).length;

  return (
    <div className="bg-cream min-h-screen text-earth pb-24 font-sans animate-fade-in">
      {/* Top sticky navigation bar */}
      <div className="bg-white border-b border-deep-green/10 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <button
            id="back-to-planner-btn"
            onClick={onClose}
            className="flex items-center gap-2 text-deep-green font-bold text-sm hover:text-deep-green/80 transition-all cursor-pointer group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>Back to Kitchen Planner</span>
          </button>
          <div className="flex items-center gap-2 text-xs text-earth/60 font-semibold font-sans">
            <ChefHat className="w-4 h-4 text-mustard" />
            <span>Cooking Mode Active</span>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Giant Gorgeous recipe Hero banner with traditional Swahili/Clay accents */}
        <div className="bg-[#1A3C34] rounded-[2.5rem] text-[#FBF8F3] p-8 sm:p-12 relative overflow-hidden card-shadow border border-[#1A3C34]/20">
          <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none p-6">
            <UtensilsCrossed className="w-72 h-72 text-cream" />
          </div>
          <div className="relative z-10 space-y-4">
            <span className="text-[10px] font-bold tracking-widest uppercase bg-white/10 text-cream py-1.5 px-4 rounded-full inline-block">
              {recipe.category} Selection
            </span>
            <h1 className="text-3xl sm:text-5xl font-extrabold font-display italic text-cream tracking-tight max-w-3xl">
              {recipe.name}
            </h1>
            <p className="text-cream/80 text-sm sm:text-base max-w-2xl font-sans leading-relaxed">
              {recipe.description}
            </p>

            <div className="flex flex-wrap gap-3 pt-4 sm:pt-6">
              <span className="bg-white/10 text-cream text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-2">
                <Clock className="w-4 h-4 text-mustard" />
                <span>{recipe.cookingTime} Mins Cooking</span>
              </span>
              <span className="bg-[#BC4749]/25 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-2 border border-[#BC4749]/30">
                <Users className="w-4 h-4 text-cream" />
                <span>Serves {recipe.servings} People</span>
              </span>
              {missingCoreIngredientsCount > 0 ? (
                <span className="bg-terracotta/20 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-2 border border-terracotta/30">
                  <AlertCircle className="w-4 h-4 text-white" />
                  <span>{missingCoreIngredientsCount} Ingredients Missing in Pantry</span>
                </span>
              ) : (
                <span className="bg-emerald-800/40 text-[#A7F3D0] text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-2 border border-emerald-700/50">
                  <CheckCircle2 className="w-4 h-4 text-[#34D399]" />
                  <span>All Ingredients Stocked!</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* 2-Column Desktop Grid / Stacked Mobile Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left / Sidebar Section: Ingredients checklist & Active Kitchen Timer */}
          <div className="space-y-6 lg:col-span-1">
            
            {/* Live Kitchen Countdown Timer Widget */}
            <div className="bg-[#1A3C34] text-cream p-6 rounded-[2rem] border border-[#1A3C34]/15 card-shadow space-y-4">
              <div className="flex justify-between items-center border-b border-white/10 pb-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-cream/70 flex items-center gap-1.5 font-sans">
                  <Clock className="w-4.5 h-4.5 text-mustard" />
                  Stove Timer (Saa)
                </h4>
                {timeLeft === 0 && (
                  <span className="text-[10px] bg-terracotta text-white font-bold px-2 py-0.5 rounded-full animate-pulse uppercase">
                    Finished!
                  </span>
                )}
              </div>

              <div className="text-center py-2">
                <p className="text-4xl sm:text-5xl font-mono font-bold tracking-tight text-cream">
                  {formatTime(timeLeft)}
                </p>
                <p className="text-[10px] text-cream/60 uppercase tracking-widest mt-1 font-sans">
                  Total cook helper countdown
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <button
                  id="recipe-timer-toggle-btn"
                  onClick={() => setTimerRunning(!timerRunning)}
                  className={`py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    timerRunning 
                      ? "bg-amber-600 hover:bg-amber-700 text-white" 
                      : "bg-mustard hover:bg-mustard/90 text-[#1A3C34]"
                  }`}
                >
                  {timerRunning ? (
                    <>
                      <Pause className="w-3.5 h-3.5" />
                      <span>Pause</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5" />
                      <span>Start</span>
                    </>
                  )}
                </button>

                <button
                  id="recipe-timer-reset-btn"
                  onClick={handleResetTimer}
                  className="bg-white/10 hover:bg-white/15 text-white/90 border border-white/10 py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1 cursor-pointer transition-all"
                  title="Reset timer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset</span>
                </button>

                <button
                  id="recipe-timer-addmins-btn"
                  onClick={() => setTimeLeft((prev) => prev + 60)}
                  className="bg-white/5 hover:bg-white/10 text-white/70 py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center cursor-pointer transition-all text-center"
                >
                  +1 min
                </button>
              </div>
            </div>

            {/* Preparation Board Checklist (Ingredients prep list) */}
            <div className="bg-white p-6 rounded-[2rem] border border-deep-green/10 card-shadow space-y-4">
              <div className="border-b border-deep-green/10 pb-3">
                <h3 className="text-lg font-bold text-[#1A3C34] flex items-center gap-2 font-display italic">
                  <Sparkles className="w-5 h-5 text-terracotta" />
                  Prep Table
                </h3>
                <p className="text-earth/60 text-[11px] font-sans mt-0.5">
                  Tap elements once prepped to keep track of ingredients at your stove!
                </p>
              </div>

              {/* Prep percentage */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-[10px] font-bold text-earth/60 font-sans uppercase">
                  <span>Prep Progress</span>
                  <span>
                    {Object.values(preppedIngredients).filter(Boolean).length} of{" "}
                    {recipe.ingredients.length + recipe.pantryStaplesNeeded.length} done
                  </span>
                </div>
                <div className="w-full bg-[#1A3C34]/15 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-[#BC4749] h-full rounded-full transition-all duration-300" 
                    style={{ 
                      width: `${
                        ((Object.values(preppedIngredients).filter(Boolean).length) / 
                        (recipe.ingredients.length + recipe.pantryStaplesNeeded.length)) * 100 || 0
                      }%` 
                    }}
                  />
                </div>
              </div>

              {/* Core ingredients list */}
              <div className="space-y-4.5 pt-2">
                <div className="space-y-2">
                  <p className="text-[10px] uppercase tracking-widest font-extrabold text-earth/50">Core Ingredients</p>
                  <div className="space-y-1.5">
                    {recipe.ingredients.map((ing) => {
                      const isOwned = ownedIngredients.has(ing.toLowerCase().trim());
                      const isPrepped = !!preppedIngredients[ing];
                      return (
                        <button
                          key={ing}
                          id={`prep-core-${ing}`}
                          onClick={() => togglePrepIngredient(ing)}
                          className={`w-full text-left p-3 rounded-xl border flex items-center justify-between transition-all cursor-pointer ${
                            isPrepped
                              ? "bg-emerald-50 border-emerald-200/60 text-[#2D6A4F] line-through decoration-[#2D6A4F]/40"
                              : "bg-[#FBF8F3] hover:bg-[#F5EFE6] border-[#1A3C34]/10 text-earth"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <div className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 ${
                              isPrepped ? "bg-emerald-600 border-emerald-600 text-white" : "border-neutral-300 bg-white"
                            }`}>
                              {isPrepped && <Check className="w-3 h-3 stroke-[3]" />}
                            </div>
                            <span className="capitalize text-xs font-bold leading-none">{ing}</span>
                          </div>

                          <div className="flex items-center gap-1 text-[10px] uppercase tracking-wider font-extrabold shrink-0">
                            {isOwned ? (
                              <span className="text-emerald-700">Stocked</span>
                            ) : (
                              <span className="text-terracotta">Missing</span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Staple items list */}
                <div className="space-y-2">
                  <p className="text-[10px] uppercase tracking-widest font-extrabold text-earth/50">Pantry Staples Needed</p>
                  <div className="space-y-1.5">
                    {recipe.pantryStaplesNeeded.map((staple) => {
                      const isOwned = ownedIngredients.has(staple.toLowerCase().trim());
                      const isPrepped = !!preppedIngredients[staple];
                      return (
                        <button
                          key={staple}
                          id={`prep-staple-${staple}`}
                          onClick={() => togglePrepIngredient(staple)}
                          className={`w-full text-left p-2.5 rounded-xl border flex items-center justify-between transition-all cursor-pointer ${
                            isPrepped
                              ? "bg-emerald-50 border-emerald-200/60 text-[#2D6A4F] line-through decoration-[#2D6A4F]/30"
                              : "bg-[#FBF8F3]/50 hover:bg-[#F5EFE6] border-[#1A3C34]/5 text-earth/80"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <div className={`w-3.5 h-3.5 rounded-md border flex items-center justify-center shrink-0 ${
                              isPrepped ? "bg-emerald-600 border-emerald-600 text-white" : "border-neutral-300 bg-white"
                            }`}>
                              {isPrepped && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                            </div>
                            <span className="capitalize text-xs font-semibold leading-none">{staple}</span>
                          </div>

                          <span className="text-[8px] uppercase tracking-wider bg-earth/5 text-earth/50 px-1.5 py-0.5 rounded-sm font-bold font-sans">
                            {isOwned ? "Stored" : "Unset"}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column (Col span 2): Big legibility step list and instructional highlights */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Guide Steps Body */}
            <div className="bg-white p-6 sm:p-8 rounded-[2rem] border border-[#1A3C34]/10 card-shadow space-y-5">
              <div className="flex flex-wrap justify-between items-center gap-2 border-b border-deep-green/10 pb-4">
                <div>
                  <h3 className="text-xl font-bold text-deep-green font-display italic flex items-center gap-1.5">
                    Step-by-Step Cooking Guide (Maelekezo)
                  </h3>
                  <p className="text-earth/60 text-xs mt-0.5 font-sans">
                    Read, follow, and mark each step complete as you cook. We've optimized step-by-step sizing for visibility.
                  </p>
                </div>
                <div className="bg-[#1A3C34]/5 px-3 py-1 rounded-full text-deep-green text-xs font-bold">
                  {recipe.instructions.length} Steps
                </div>
              </div>

              {/* Highlight active step description inside a big beautiful banner */}
              <div className="bg-[#1D3557]/5 border border-[#1D3557]/10 p-5 rounded-2xl flex gap-4 items-center">
                <span className="text-3xl">🔥</span>
                <div>
                  <p className="text-[10px] uppercase tracking-wider font-extrabold text-[#1D3557]/70 font-sans">Current Focus Step</p>
                  <p className="text-xs text-[#1D3557]/80 font-medium leading-relaxed font-sans mt-0.5">
                    Step {activeStep + 1}: {recipe.instructions[activeStep]}
                  </p>
                </div>
              </div>

              {/* Complete Step Stack */}
              <div className="space-y-4 pt-2">
                {recipe.instructions.map((step, idx) => {
                  const isActive = activeStep === idx;
                  const isCompleted = !!completedSteps[idx];
                  return (
                    <div 
                      key={idx}
                      onClick={() => setActiveStep(idx)}
                      className={`p-5 rounded-2xl border transition-all cursor-pointer relative flex flex-col sm:flex-row gap-4 items-start ${
                        isActive
                          ? "bg-[#1A3C34]/5 border-[#1A3C34] ring-1 ring-[#1A3C34]"
                          : isCompleted
                            ? "bg-cream/40 border-deep-green/5 text-earth/50"
                            : "bg-[#FBF8F3]/40 border-[#F5EFE6] text-earth hover:border-deep-green/20"
                      }`}
                    >
                      {/* Step Number Badge */}
                      <button
                        id={`step-complete-check-${idx}`}
                        onClick={(e) => {
                          e.stopPropagation(); // prevent setting as active focus on check tap
                          toggleStepCompleted(idx);
                        }}
                        className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0 transition-all cursor-pointer ${
                          isCompleted
                            ? "bg-[#2D6A4F] text-white"
                            : "bg-[#BC4749] text-white hover:scale-105"
                        }`}
                        title={isCompleted ? "Mark incomplete" : "Mark step complete"}
                      >
                        {isCompleted ? (
                          <Check className="w-4 h-4 stroke-[3]" />
                        ) : (
                          <span>{idx + 1}</span>
                        )}
                      </button>

                      <div className="space-y-1.5 flex-1">
                        <p className={`text-base font-bold tracking-tight ${isCompleted ? "line-through opacity-60" : "text-earth"}`}>
                          Step {idx + 1}
                        </p>
                        
                        <p className={`text-[14px] leading-relaxed font-sans font-medium ${
                          isActive 
                            ? "text-earth font-semibold" 
                            : isCompleted ? "opacity-60 text-earth/80" : "text-earth/80"
                        }`}>
                          {step}
                        </p>
                      </div>

                      {/* Right action button inside step item */}
                      <div className="flex gap-1 self-stretch sm:self-center justify-end">
                        <button
                          id={`step-focus-btn-${idx}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveStep(idx);
                          }}
                          className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                            isActive
                              ? "bg-deep-green text-[#FBF8F3]"
                              : "bg-[#1A3C34]/5 text-[#1A3C34] hover:bg-[#1A3C34]/10"
                          }`}
                        >
                          {isActive ? "Active Focus" : "Focus"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Final Steps Accomplishment Panel */}
              <div className="border-t border-[#1A3C34]/10 pt-5 flex flex-wrap gap-3 justify-between items-center bg-cream/30 p-4 rounded-xl">
                <div>
                  <p className="text-xs font-bold text-deep-green">Chef Progress Checklist</p>
                  <p className="text-[10px] text-earth/60 font-sans">
                    {Object.values(completedSteps).filter(Boolean).length} of {recipe.instructions.length} steps completed
                  </p>
                </div>
                
                <button
                  id="recipe-conclude-btn"
                  onClick={onClose}
                  className="bg-deep-green hover:bg-deep-green/90 text-white font-extrabold text-xs py-3 px-6 rounded-full inline-flex items-center gap-2 transition-all cursor-pointer card-shadow active:scale-95"
                >
                  <CheckCircle2 className="w-4.5 h-4.5 text-mustard" />
                  <span>Done Cooking! Exit Recipe</span>
                </button>
              </div>

            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
