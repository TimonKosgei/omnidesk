import { useMemo, useState } from 'react'
import type { MealDialogState, Recipe } from '../types'
import { IconGlyph } from './IconGlyph'

export function RecipeModal({
  recipes,
  currentSlot,
  onClose,
  onPick,
  onCooking,
}: {
  recipes: Recipe[]
  currentSlot: MealDialogState
  onClose: () => void
  onPick: (recipe: Recipe) => void
  onCooking: (recipe: Recipe) => void
}) {
  const [search, setSearch] = useState('')
  const filteredRecipes = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return recipes
    return recipes.filter((recipe) => [recipe.name, recipe.description, recipe.category].some((value) => value.toLowerCase().includes(query)))
  }, [recipes, search])

  return (
    <div className="fixed inset-0 z-40 bg-black/50 px-4 py-6 backdrop-blur-sm">
      <div className="mx-auto max-h-[calc(100vh-3rem)] w-full max-w-6xl overflow-hidden rounded-[2rem] border border-black/10 bg-[#FBF8F3] p-4 shadow-2xl lg:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-[#1A3C34]/70">{currentSlot.day} / {currentSlot.section}</p>
            <h3 className="mt-2 font-serif text-3xl text-[#1A3C34]">Select a recipe</h3>
          </div>
          <button type="button" onClick={onClose} className="grid h-10 w-10 place-items-center rounded-full border border-[#1A3C34]/10 bg-white text-[#1A3C34] transition hover:bg-[#1A3C34]/5">
            <IconGlyph symbol="×" />
          </button>
        </div>

        <label className="mt-4 flex items-center gap-3 rounded-2xl border border-[#1A3C34]/10 bg-white px-4 py-3 text-sm text-[#1A3C34]/60">
          <IconGlyph symbol="⌕" />
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search recipes by name, description, or category" className="w-full bg-transparent outline-none" />
        </label>

        <div className="mt-4 grid max-h-[calc(100vh-12rem)] gap-4 overflow-y-auto pr-1 md:grid-cols-2 xl:grid-cols-3">
          {filteredRecipes.map((recipe) => (
            <article key={recipe._id} className="rounded-[1.5rem] border border-[#1A3C34]/10 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h4 className="text-lg font-semibold text-[#1A3C34]">{recipe.name}</h4>
                  <p className="mt-2 text-sm leading-6 text-[#1A3C34]/70">{recipe.description}</p>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold text-[#1A3C34]/75">
                <span className="rounded-full bg-[#1A3C34]/6 px-3 py-1">{recipe.category}</span>
                <span className="rounded-full bg-[#1A3C34]/6 px-3 py-1">{recipe.cookingTime} min</span>
                <span className="rounded-full bg-[#1A3C34]/6 px-3 py-1">{recipe.servings} servings</span>
              </div>
              <div className="mt-5 flex flex-wrap gap-3">
                <button type="button" onClick={() => onCooking(recipe)} className="rounded-2xl border border-[#1A3C34]/10 px-4 py-2.5 text-sm font-semibold text-[#1A3C34] transition hover:bg-[#1A3C34]/5">View full recipe guide</button>
                <button type="button" onClick={() => onPick(recipe)} className="rounded-2xl bg-[#1A3C34] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#21493f]">Use this recipe</button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  )
}
