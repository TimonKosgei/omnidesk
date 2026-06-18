import { useState } from 'react'
import { PANTRY_CATEGORIES } from '../data/kitchen'
import { useKitchen } from '../context/KitchenContext'
import { IconGlyph } from './IconGlyph'

export function PantryDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { addInventoryItem } = useKitchen()
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    name: '',
    displayName: '',
    category: PANTRY_CATEGORIES[0],
    expirationDate: '',
    isAlwaysInStock: false,
  })

  if (!open) {
    return null
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSaving(true)
    try {
      await addInventoryItem(form)
      setForm({ name: '', displayName: '', category: PANTRY_CATEGORIES[0], expirationDate: '', isAlwaysInStock: false })
      onClose()
    } finally {
      setSaving(false)
    }
  }

  return (
    <aside className="fixed inset-0 z-40 bg-black/45 backdrop-blur-sm">
      <div className="absolute right-0 top-0 h-full w-full max-w-md overflow-y-auto border-l border-black/10 bg-[#FBF8F3] p-5 shadow-2xl">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-[#1A3C34]/70">Add to stoo</p>
            <h3 className="mt-2 font-serif text-3xl text-[#1A3C34]">New pantry item</h3>
          </div>
          <button type="button" onClick={onClose} className="grid h-10 w-10 place-items-center rounded-full border border-[#1A3C34]/10 bg-white text-[#1A3C34] transition hover:bg-[#1A3C34]/5">
            <IconGlyph symbol="×" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 grid gap-4">
          <label className="grid gap-2 text-sm font-medium text-[#1A3C34]">
            Name
            <input value={form.name} onChange={(event) => setForm((value) => ({ ...value, name: event.target.value }))} required className="rounded-2xl border border-[#1A3C34]/10 bg-white px-4 py-3 outline-none ring-0 focus:border-[#FFBF00]" />
          </label>
          <label className="grid gap-2 text-sm font-medium text-[#1A3C34]">
            Display name
            <input value={form.displayName} onChange={(event) => setForm((value) => ({ ...value, displayName: event.target.value }))} required className="rounded-2xl border border-[#1A3C34]/10 bg-white px-4 py-3 outline-none focus:border-[#FFBF00]" />
          </label>
          <label className="grid gap-2 text-sm font-medium text-[#1A3C34]">
            Category
            <select value={form.category} onChange={(event) => setForm((value) => ({ ...value, category: event.target.value }))} className="rounded-2xl border border-[#1A3C34]/10 bg-white px-4 py-3 outline-none focus:border-[#FFBF00]">
              {PANTRY_CATEGORIES.map((category) => <option key={category} value={category}>{category}</option>)}
            </select>
          </label>
          <label className="grid gap-2 text-sm font-medium text-[#1A3C34]">
            Expiration date
            <input type="date" value={form.expirationDate} onChange={(event) => setForm((value) => ({ ...value, expirationDate: event.target.value }))} required className="rounded-2xl border border-[#1A3C34]/10 bg-white px-4 py-3 outline-none focus:border-[#FFBF00]" />
          </label>
          <button type="button" onClick={() => setForm((value) => ({ ...value, isAlwaysInStock: !value.isAlwaysInStock }))} className={`flex items-center justify-between rounded-2xl border px-4 py-3 text-sm font-semibold transition ${form.isAlwaysInStock ? 'border-[#FFBF00]/50 bg-[#FFBF00]/10 text-[#1A3C34]' : 'border-[#1A3C34]/10 bg-white text-[#1A3C34]'}`}>
            <span>Always in stock</span>
            <span className={`flex h-7 w-12 items-center rounded-full p-1 transition ${form.isAlwaysInStock ? 'bg-[#1A3C34]' : 'bg-[#1A3C34]/10'}`}>
              <span className={`h-5 w-5 rounded-full bg-white transition ${form.isAlwaysInStock ? 'translate-x-5' : 'translate-x-0'}`} />
            </span>
          </button>
          <button type="submit" disabled={saving} className="mt-2 rounded-2xl bg-[#1A3C34] px-4 py-3 font-semibold text-white shadow-lg transition hover:bg-[#21493f] disabled:cursor-not-allowed disabled:opacity-70">
            {saving ? 'Saving...' : 'Save pantry item'}
          </button>
        </form>
      </div>
    </aside>
  )
}
