import { useState } from 'react'
import { useKitchen } from '../context/KitchenContext'
import { IconGlyph } from '../components/IconGlyph'

export function ShoppingPage() {
  const { shoppingList, addShoppingItem, toggleShoppingItem } = useKitchen()
  const [draft, setDraft] = useState('')

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!draft.trim()) return
    await addShoppingItem(draft.trim())
    setDraft('')
  }

  return (
    <section className="grid gap-6">
      <div>
        <p className="text-xs uppercase tracking-[0.22em] text-[#1A3C34]/65">Deductive list</p>
        <h1 className="mt-2 font-serif text-4xl tracking-tight text-[#1A3C34] sm:text-5xl">Shopping List</h1>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3 rounded-[1.75rem] border border-[#1A3C34]/10 bg-white/80 p-4 shadow-xl sm:flex-row">
        <input value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Add a missing item..." className="min-w-0 flex-1 rounded-2xl border border-[#1A3C34]/10 bg-[#FBF8F3] px-4 py-3 outline-none focus:border-[#FFBF00]" />
        <button type="submit" className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#1A3C34] px-4 py-3 font-semibold text-white shadow-lg transition hover:bg-[#21493f]">
          <IconGlyph symbol="＋" /> Add item
        </button>
      </form>

      <div className="grid gap-3">
        {shoppingList.map((item) => (
          <button key={item._id} type="button" onClick={() => void toggleShoppingItem(item._id)} className={`flex items-center gap-4 rounded-[1.5rem] border px-4 py-4 text-left transition ${item.completed ? 'border-[#1A3C34]/8 bg-white/55 opacity-65' : 'border-[#1A3C34]/10 bg-white/80 shadow-sm hover:border-[#FFBF00]/50 hover:bg-white'}`}>
            <span className="grid h-10 w-10 place-items-center rounded-full bg-[#1A3C34]/8 text-[#1A3C34]"><IconGlyph symbol={item.completed ? '✓' : '○'} /></span>
            <span className="min-w-0 flex-1">
              <span className={`block text-base font-semibold ${item.completed ? 'line-through' : ''}`}>{item.displayName}</span>
              <span className="mt-1 block text-sm text-[#1A3C34]/60">{item.category}</span>
            </span>
          </button>
        ))}
      </div>
    </section>
  )
}
