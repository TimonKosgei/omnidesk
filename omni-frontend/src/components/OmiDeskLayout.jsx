import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export function OmiDeskLayout({ children }) {
  const navigate = useNavigate()
  const { displayName, logout } = useAuth()

  const handleLogout = () => {
    logout()
    navigate('/auth', { replace: true })
  }

  return (
    <div className="min-h-screen bg-omidesk-bg">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-omidesk-navy text-sm font-bold text-white">
              O
            </div>
            <div>
              <p className="text-lg font-semibold text-omidesk-navy">OmiDesk</p>
              <p className="text-xs text-slate-500">Ministry of ICT Helpdesk</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {displayName && (
              <div className="hidden text-right sm:block">
                <p className="text-sm font-medium text-slate-800">{displayName}</p>
                <p className="text-xs text-slate-500">Staff Portal</p>
              </div>
            )}
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-omidesk-navy focus:ring-offset-2"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        {children}
      </main>
    </div>
  )
}
