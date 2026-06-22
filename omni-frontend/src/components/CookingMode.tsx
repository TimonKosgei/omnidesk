import { useEffect, useMemo, useState } from 'react'
import { useKitchen } from '../context/KitchenContext'
import { IconGlyph } from './IconGlyph'

function formatTimer(seconds: number) {
  const minutes = String(Math.floor(seconds / 60)).padStart(2, '0')
  const secs = String(seconds % 60).padStart(2, '0')
  return `${minutes}:${secs}`
}

export function CookingMode() {
  const { cookingRecipe, closeCookingRecipe } = useKitchen()
  const [secondsLeft, setSecondsLeft] = useState(0)
  const [running, setRunning] = useState(false)
  const [focusIndex, setFocusIndex] = useState(0)
  const [checked, setChecked] = useState<Record<string, boolean>>({})

  useEffect(() => {
    if (!cookingRecipe) {
      return
    }
    setSecondsLeft(Math.max(60, cookingRecipe.cookingTime * 60))
    setRunning(false)
    setFocusIndex(0)
    setChecked({})
  }, [cookingRecipe])

  useEffect(() => {
    if (!running || !cookingRecipe) return
    const timer = window.setInterval(() => {
      setSecondsLeft((value) => Math.max(0, value - 1))
    }, 1000)
    return () => window.clearInterval(timer)
  }, [running, cookingRecipe])

  const completion = useMemo(() => {
    if (!cookingRecipe) return 0
    const checklist = [...cookingRecipe.ingredients, ...cookingRecipe.pantryStaplesNeeded]
    const completed = checklist.filter((item) => checked[item]).length
    return checklist.length === 0 ? 0 : Math.round((completed / checklist.length) * 100)
  }, [checked, cookingRecipe])

  if (!cookingRecipe) {
    return null
  }

  const checklist = [...cookingRecipe.ingredients, ...cookingRecipe.pantryStaplesNeeded]

  function toggleItem(label: string) {
    setChecked((value) => ({ ...value, [label]: !value[label] }))
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/55 px-4 py-6 backdrop-blur-md">
      <div className="mx-auto grid h-full max-h-[calc(100vh-3rem)] w-full max-w-7xl gap-4 overflow-hidden rounded-[2rem] bg-[#FBF8F3] p-4 shadow-2xl ring-1 ring-black/10 lg:grid-cols-[0.95fr_1.05fr] lg:p-6">
        <section className="flex min-h-0 flex-col gap-4 overflow-hidden">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-[#1A3C34]/70">Cooking mode</p>
              <h2 className="mt-2 font-serif text-3xl tracking-tight text-[#1A3C34]">{cookingRecipe.name}</h2>
            </div>
            <button type="button" onClick={closeCookingRecipe} className="rounded-2xl bg-[#1A3C34] px-4 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-[#21493f]">
              Done Cooking! Exit Recipe
            </button>
          </div>

          <div className="rounded-[1.75rem] border border-[#1A3C34]/10 bg-white/80 p-5 shadow-sm">
            <div className="font-mono text-center text-6xl font-bold tracking-[0.08em] text-[#1A3C34]">
              {formatTimer(secondsLeft)}
            </div>
            <div className="mt-4 flex flex-wrap justify-center gap-3">
              <button type="button" onClick={() => setRunning((value) => !value)} className="rounded-2xl border border-[#1A3C34]/15 bg-[#1A3C34] px-4 py-2 text-sm font-semibold text-white transition hover:brightness-110">
                {running ? 'Pause' : 'Play'}
              </button>
              <button type="button" onClick={() => setSecondsLeft(Math.max(0, cookingRecipe.cookingTime * 60))} className="rounded-2xl border border-[#1A3C34]/15 px-4 py-2 text-sm font-semibold text-[#1A3C34] transition hover:bg-[#1A3C34]/5">
                Reset
              </button>
              <button type="button" onClick={() => setSecondsLeft((value) => value + 60)} className="rounded-2xl border border-[#FFBF00]/40 bg-[#FFBF00]/15 px-4 py-2 text-sm font-semibold text-[#1A3C34] transition hover:bg-[#FFBF00]/25">
                +1 minute
              </button>
            </div>
          </div>

          <div className="rounded-[1.75rem] border border-[#1A3C34]/10 bg-white/80 p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm font-semibold uppercase tracking-[0.18em] text-[#1A3C34]/70">Prep table progress</span>
              <span className="text-lg font-bold text-[#1A3C34]">{completion}%</span>
            </div>
            <div className="mt-3 h-3 overflow-hidden rounded-full bg-[#1A3C34]/10">
              <div className="h-full rounded-full bg-[#FFBF00] transition-all" style={{ width: `${completion}%` }} />
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {checklist.map((item) => (
                <button key={item} type="button" onClick={() => toggleItem(item)} className={`flex items-start gap-3 rounded-2xl border px-4 py-3 text-left transition ${checked[item] ? 'border-[#FFBF00]/50 bg-[#FFBF00]/10' : 'border-[#1A3C34]/10 bg-white'}`}>
                  <IconGlyph symbol={checked[item] ? '✓' : '○'} className="mt-0.5 text-[#1A3C34]" />
                  <span className="text-sm text-[#1A3C34]">{item}</span>
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="flex min-h-0 flex-col gap-4 overflow-hidden">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs uppercase tracking-[0.22em] text-[#1A3C34]/70">Step-by-step guide</p>
            <span className="inline-flex items-center gap-2 rounded-full bg-[#BC4749]/10 px-3 py-1 text-xs font-semibold text-[#BC4749]"><IconGlyph symbol="✦" /> Focus active step</span>
          </div>
          <div className="grid min-h-0 gap-3 overflow-y-auto pr-1">
            {cookingRecipe.instructions.map((step, index) => (
              <button
                key={step}
                type="button"
                onClick={() => setFocusIndex(index)}
                className={`rounded-[1.5rem] border p-5 text-left transition ${index === focusIndex ? 'border-[#FFBF00] bg-white shadow-md' : 'border-[#1A3C34]/10 bg-white/70 opacity-65 hover:opacity-100'}`}
              >
                <div className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#1A3C34]/60">Step {index + 1}</div>
                <p className="text-base leading-7 text-[#1A3C34]">{step}</p>
              </button>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
