import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { IconGlyph } from './IconGlyph'

const navItems: Array<{ to: string; label: string; symbol: string }> = [
  { to: '/', label: 'Dashboard', symbol: '⌂' },
  { to: '/pantry', label: 'Pantry (Stoo)', symbol: '▣' },
  { to: '/planner', label: 'Meal Planner', symbol: '7' },
  { to: '/shopping', label: 'Shopping List', symbol: '☰' },
]

export function Sidebar({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  const { displayName, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    localStorage.removeItem('mpishi-auth')
    navigate('/auth', { replace: true })
  }

  return (
    <aside className={`w-full border-b border-white/10 bg-[#1A3C34] text-white lg:sticky lg:top-0 lg:min-h-screen lg:border-b-0 lg:border-r ${collapsed ? 'lg:w-24' : 'lg:w-72'}`}>
      <div className="flex h-full flex-col gap-6 px-4 py-5 lg:px-5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-[#FFBF00] font-black text-[#1A3C34]">M</div>
            {!collapsed && (
              <div>
                <div className="font-semibold tracking-wide">Mpishi</div>
                <div className="text-xs text-white/65">Kitchen command centre</div>
              </div>
            )}
          </div>
          <button type="button" onClick={onToggle} className="hidden rounded-full border border-white/10 p-2 text-white/80 transition hover:bg-white/10 lg:grid">
            <IconGlyph symbol={collapsed ? '⟶' : '⟵'} />
          </button>
        </div>

        <nav className="grid gap-2">
          {navItems.map(({ to, label, symbol }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition ${isActive ? 'bg-white/12 text-white shadow-sm' : 'text-white/78 hover:bg-white/8 hover:text-white'} ${collapsed ? 'lg:justify-center lg:px-3' : ''}`
              }
            >
              <IconGlyph symbol={symbol} />
              {!collapsed && <span>{label}</span>}
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto rounded-3xl bg-white/8 p-4 shadow-sm ring-1 ring-white/10">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-full bg-[#FFBF00] font-bold text-[#1A3C34]">
              {displayName?.slice(0, 1).toUpperCase() ?? 'J'}
            </div>
            {!collapsed && (
              <div className="min-w-0">
                <div className="truncate font-semibold">{displayName ?? 'Jiko Owner'}</div>
                <div className="text-xs text-white/65">Jiko Owner</div>
              </div>
            )}
          </div>
          <button type="button" onClick={handleLogout} className="mt-4 inline-flex items-center gap-2 rounded-2xl border border-white/10 px-4 py-2 text-sm text-white/85 transition hover:bg-white/10">
            <IconGlyph symbol="↩" />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>

        {!collapsed && (
          <div className="rounded-3xl border border-white/10 bg-white/5 p-4 text-sm text-white/70">
            <div className="mb-2 flex items-center gap-2 text-white">
              <IconGlyph symbol="◔" />
              Jiko Owner
            </div>
            Track pantry, planner, and shopping list in one place.
          </div>
        )}
      </div>
    </aside>
  )
}
