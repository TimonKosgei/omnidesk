import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { RecipeModal } from '../components/RecipeModal'
import { DAYS, MEAL_SECTIONS } from '../data/kitchen'
import { useKitchen } from '../context/KitchenContext'
import type { MealDialogState, Recipe } from '../types'
import { IconGlyph } from '../components/IconGlyph'

export function PlannerPage() {
  const { mealPlan, recipes, setMealSlot, toggleMealLock, openCookingRecipe } = useKitchen()
  const [dialog, setDialog] = useState<MealDialogState | null>(null)

  const todayName = useMemo(() => {
    const index = new Date().getDay()
    return DAYS[index === 0 ? 6 : index - 1] ?? 'Monday'
  }, [])

  function handlePick(recipe: Recipe) {
    if (!dialog) return
    void setMealSlot(dialog.day, dialog.section, {
      recipeId: recipe._id,
      recipeName: recipe.name,
      locked: false,
    })
    setDialog(null)
  }

  function handleOpenRecipe(recipe: Recipe) {
    openCookingRecipe(recipe)
  }

  return (
    <section className="grid gap-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-[#1A3C34]/65">7-day plan</p>
          <h1 className="mt-2 font-serif text-4xl tracking-tight text-[#1A3C34] sm:text-5xl">Meal Planner</h1>
        </div>
        <Link to="/" className="inline-flex items-center gap-2 rounded-2xl border border-[#1A3C34]/10 bg-white/80 px-4 py-3 font-semibold text-[#1A3C34] shadow-sm transition hover:bg-white">
          <IconGlyph symbol="→" /> Review today
        </Link>
      </div>

      <div className="grid gap-4 xl:grid-cols-7">
        {DAYS.map((day) => (
          <article key={day} className={`rounded-[1.75rem] border p-4 shadow-xl ${day === todayName ? 'border-[#FFBF00]/50 bg-[#FFBF00]/5' : 'border-[#1A3C34]/10 bg-white/80'}`}>
            <header className="mb-4 flex items-center justify-between gap-3">
              <div>
                <div className="text-xs uppercase tracking-[0.18em] text-[#1A3C34]/60">{day === todayName ? 'Today' : 'Day'}</div>
                <h2 className="mt-1 text-lg font-semibold text-[#1A3C34]">{day}</h2>
              </div>
            </header>
            <div className="grid gap-3">
              {MEAL_SECTIONS.map((section) => {
                const slot = mealPlan[day]?.[section] ?? {}
                const locked = Boolean(slot.locked)
                return (
                  <button
                    key={section}
                    type="button"
                    onClick={() => !locked && setDialog({ day, section })}
                    className={`rounded-[1.5rem] border p-4 text-left transition ${locked ? 'border-[#1A3C34]/8 bg-[#1A3C34]/6' : 'border-[#1A3C34]/10 bg-[#FBF8F3] hover:border-[#FFBF00]/50 hover:bg-white'}`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-xs uppercase tracking-[0.18em] text-[#1A3C34]/60">{section}</span>
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation()
                          void toggleMealLock(day, section)
                        }}
                        className="grid h-8 w-8 place-items-center rounded-full border border-[#1A3C34]/10 bg-white text-[#1A3C34] transition hover:bg-[#1A3C34]/5"
                      >
                        <IconGlyph symbol={locked ? '🔒' : '🔓'} />
                      </button>
                    </div>
                    <div className="mt-3 font-semibold text-[#1A3C34]">{slot.recipeName ?? 'Choose recipe'}</div>
                    <div className="mt-2 text-sm text-[#1A3C34]/60">{locked ? 'Locked for the week' : 'Tap to assign a recipe'}</div>
                  </button>
                )
              })}
            </div>
          </article>
        ))}
      </div>

      {dialog && (
        <RecipeModal
          recipes={recipes}
          currentSlot={dialog}
          onClose={() => setDialog(null)}
          onPick={handlePick}
          onCooking={handleOpenRecipe}
        />
      )}
    </section>
  )
}
