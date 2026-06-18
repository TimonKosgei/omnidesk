import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { CookingMode } from './CookingMode'
import { useKitchen } from '../context/KitchenContext'

export function AppLayout() {
  const [collapsed, setCollapsed] = useState(false)
  const { loading, error } = useKitchen()

  if (loading) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#FBF8F3] px-6 text-center text-[#1A3C34]">
        <div>
          <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-full bg-[#1A3C34] text-white shadow-lg">M</div>
          <p className="text-lg font-semibold">Preparing your kitchen dashboard...</p>
          <p className="mt-2 text-sm text-[#1A3C34]/70">Loading pantry, meal plans, recipes, and shopping list.</p>
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#FBF8F3] px-6 text-center text-[#BC4749]">
        <div className="max-w-md rounded-3xl border border-[#BC4749]/20 bg-white/80 p-8 shadow-xl">
          <p className="text-xl font-semibold">Kitchen data could not load</p>
          <p className="mt-3 text-sm text-[#1A3C34]/70">{error}</p>
        </div>
      </main>
    )
  }

  return (
    <div className="min-h-screen bg-[#FBF8F3] lg:flex">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((value) => !value)} />
      <main className="min-w-0 flex-1 px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
        <Outlet />
      </main>
      <CookingMode />
    </div>
  )
}
