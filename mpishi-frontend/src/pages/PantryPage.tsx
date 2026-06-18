import { useMemo, useState } from 'react'
import { PantryDrawer } from '../components/PantryDrawer'
import { PANTRY_CATEGORIES } from '../data/kitchen'
import { useKitchen } from '../context/KitchenContext'
import { prettyDate } from '../lib/date'
import { IconGlyph } from '../components/IconGlyph'

export function PantryPage() {
  const { inventory, deleteInventoryItem, updateInventoryItem } = useKitchen()
  const [drawerOpen, setDrawerOpen] = useState(false)

  const groupedInventory = useMemo(() => {
    return PANTRY_CATEGORIES.map((category) => ({
      category,
      items: inventory.filter((item) => item.category === category),
    }))
  }, [inventory])

  return (
    <section className="grid gap-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-[#1A3C34]/65">Stoo inventory</p>
          <h1 className="mt-2 font-serif text-4xl tracking-tight text-[#1A3C34] sm:text-5xl">Pantry Room</h1>
        </div>
        <button type="button" onClick={() => setDrawerOpen(true)} className="inline-flex items-center gap-2 rounded-2xl bg-[#1A3C34] px-4 py-3 font-semibold text-white shadow-lg transition hover:bg-[#21493f]">
          <IconGlyph symbol="＋" /> Add item
        </button>
      </div>

      <div className="grid gap-4">
        {groupedInventory.map(({ category, items }) => (
          <details key={category} open className="rounded-[1.75rem] border border-[#1A3C34]/10 bg-white/80 p-5 shadow-xl">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-lg font-semibold text-[#1A3C34] [&::-webkit-details-marker]:hidden">
              <span>{category}</span>
              <IconGlyph symbol="⌄" className="text-[#1A3C34]/60" />
            </summary>
            <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {items.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-[#1A3C34]/15 bg-[#FBF8F3] px-4 py-6 text-sm text-[#1A3C34]/65">No items in this category.</div>
              ) : (
                items.map((item) => (
                  <article key={item._id} className="rounded-[1.5rem] border border-[#1A3C34]/10 bg-[#FBF8F3] p-4 shadow-sm">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-semibold text-[#1A3C34]">{item.displayName}</h3>
                        <p className="mt-1 text-sm text-[#1A3C34]/65">{item.name}</p>
                      </div>
                      <button type="button" onClick={() => void deleteInventoryItem(item._id)} className="rounded-full border border-[#BC4749]/15 p-2 text-[#BC4749] transition hover:bg-[#BC4749]/10">
                        <IconGlyph symbol="⌫" />
                      </button>
                    </div>
                    <div className="mt-4 text-sm text-[#1A3C34]/70">Expires {prettyDate(item.expirationDate)}</div>
                    <button type="button" onClick={() => void updateInventoryItem(item._id, { isAlwaysInStock: !item.isAlwaysInStock })} className={`mt-4 flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-sm font-semibold transition ${item.isAlwaysInStock ? 'border-[#FFBF00]/50 bg-[#FFBF00]/10 text-[#1A3C34]' : 'border-[#1A3C34]/10 bg-white text-[#1A3C34]'}`}>
                      <span>{item.isAlwaysInStock ? 'Staple' : 'Seasonal'}</span>
                      <span className={`flex h-7 w-12 items-center rounded-full p-1 transition ${item.isAlwaysInStock ? 'bg-[#1A3C34]' : 'bg-[#1A3C34]/10'}`}>
                        <span className={`h-5 w-5 rounded-full bg-white transition ${item.isAlwaysInStock ? 'translate-x-5' : 'translate-x-0'}`} />
                      </span>
                    </button>
                  </article>
                ))
              )}
            </div>
          </details>
        ))}
      </div>

      <PantryDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </section>
  )
}
