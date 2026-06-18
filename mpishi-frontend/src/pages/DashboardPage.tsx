import { useMemo } from 'react'
import { DAYS, MEAL_SECTIONS } from '../data/kitchen'
import { useKitchen } from '../context/KitchenContext'
import { isWithinHours, prettyDate } from '../lib/date'
import { IconGlyph } from '../components/IconGlyph'

function pageTitleFromToday() {
  const index = new Date().getDay()
  return DAYS[index === 0 ? 6 : index - 1] ?? 'Monday'
}

export function DashboardPage() {
  const { inventory, mealPlan, shoppingList, recipes, openCookingRecipe } = useKitchen()
  const currentDay = pageTitleFromToday()
  const todaySlot = mealPlan[currentDay] ?? mealPlan.Monday

  const expiringItems = useMemo(() => inventory.filter((item) => isWithinHours(item.expirationDate, 48)), [inventory])
  const completedCount = shoppingList.filter((item) => item.completed).length
  const progress = shoppingList.length === 0 ? 0 : Math.round((completedCount / shoppingList.length) * 100)

  function resolveRecipeName(recipeId?: string, recipeName?: string) {
    return recipes.find((recipe) => recipe._id === recipeId || recipe.name === recipeName)
  }

  return (
    <section className="grid gap-6">
      <header className="flex flex-col gap-2">
        <p className="text-xs uppercase tracking-[0.22em] text-[#1A3C34]/65">Swahili smart kitchen</p>
        <h1 className="font-serif text-4xl tracking-tight text-[#1A3C34] sm:text-5xl">Dashboard Home</h1>
      </header>

      <div className="grid gap-5 xl:grid-cols-3">
        <article className="rounded-[2rem] border border-[#BC4749]/15 bg-white/80 p-6 shadow-xl ring-1 ring-black/5 xl:col-span-1">
          <div className="flex items-center gap-3 text-[#BC4749]"><IconGlyph symbol="✦" /> <h2 className="text-lg font-semibold text-[#1A3C34]">Expiring soon</h2></div>
          <div className="mt-5 grid gap-3">
            {expiringItems.length === 0 ? (
              <p className="text-sm leading-7 text-[#1A3C34]/70">No pantry items are expiring in the next 48 hours.</p>
            ) : (
              expiringItems.map((item) => (
                <div key={item._id} className="rounded-2xl border border-[#BC4749]/12 bg-[#BC4749]/5 px-4 py-3">
                  <div className="font-semibold text-[#1A3C34]">{item.displayName}</div>
                  <div className="mt-1 text-sm text-[#1A3C34]/65">Expires {prettyDate(item.expirationDate)}</div>
                </div>
              ))
            )}
          </div>
        </article>

        <article className="rounded-[2rem] border border-[#1A3C34]/10 bg-white/80 p-6 shadow-xl ring-1 ring-black/5 xl:col-span-1">
          <div className="flex items-center gap-3 text-[#1A3C34]"><IconGlyph symbol="◫" /> <h2 className="text-lg font-semibold">Today’s menu</h2></div>
          <div className="mt-5 grid gap-3">
            {MEAL_SECTIONS.map((section) => {
              const slot = todaySlot?.[section]
              const recipe = resolveRecipeName(slot?.recipeId, slot?.recipeName)
              return (
                <button key={section} type="button" onClick={() => recipe && openCookingRecipe(recipe)} className="flex items-center justify-between rounded-2xl border border-[#1A3C34]/10 bg-[#FBF8F3] px-4 py-4 text-left transition hover:border-[#FFBF00]/50 hover:bg-white">
                  <div>
                    <div className="text-xs uppercase tracking-[0.18em] text-[#1A3C34]/60">{section}</div>
                    <div className="mt-1 font-semibold text-[#1A3C34]">{slot?.recipeName ?? 'Not planned yet'}</div>
                  </div>
                  <span className="text-sm text-[#1A3C34]/55">{recipe ? 'Open guide' : 'Empty slot'}</span>
                </button>
              )
            })}
          </div>
        </article>

        <article className="rounded-[2rem] border border-[#1A3C34]/10 bg-white/80 p-6 shadow-xl ring-1 ring-black/5 xl:col-span-1">
          <div className="flex items-center gap-3 text-[#1A3C34]"><IconGlyph symbol="☰" /> <h2 className="text-lg font-semibold">Shopping progress</h2></div>
          <div className="mt-6 flex justify-center">
            <div className="flex h-44 w-44 items-center justify-center rounded-full bg-[conic-gradient(#FFBF00_0_var(--progress),rgba(26,60,52,0.08)_0_100%)] p-3" style={{ ['--progress' as string]: `${progress}%` }}>
              <div className="grid h-full w-full place-items-center rounded-full bg-[#FBF8F3] text-center">
                <div>
                  <div className="font-mono text-4xl font-bold text-[#1A3C34]">{progress}%</div>
                  <div className="mt-2 text-sm text-[#1A3C34]/60">{completedCount}/{shoppingList.length} done</div>
                </div>
              </div>
            </div>
          </div>
        </article>
      </div>
    </section>
  )
}
