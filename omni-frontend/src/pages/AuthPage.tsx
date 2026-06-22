import { useEffect, useState } from 'react'
import { apiFetch } from '../lib/api'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

export function AuthPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [displayName, setDisplayName] = useState('')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    localStorage.removeItem('mpishi-auth')
  }, [])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setError('')

    try {
      const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register'
      const body = mode === 'login' ? { username, password } : { username, email, password, displayName }
      const payload = await apiFetch<never>(endpoint, null, { method: 'POST', body: JSON.stringify(body) })

      if (!payload.token) {
        throw new Error('Authentication token missing from response')
      }

      login(payload.token, payload.displayName ?? displayName ?? username)
      navigate('/', { replace: true })
    } catch (authError) {
      setError(authError instanceof Error ? authError.message : 'Authentication failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden bg-[#FBF8F3] px-4 py-10 text-[#1A3C34]">
      <div className="absolute -left-24 -top-20 h-[28rem] w-[28rem] rounded-full bg-[#FFBF00]/15 blur-3xl" />
      <div className="absolute -bottom-24 -right-24 h-[30rem] w-[30rem] rounded-full bg-[#1A3C34]/10 blur-3xl" />

      <section className="relative z-10 w-full max-w-xl rounded-[2rem] border border-[#1A3C34]/10 bg-white/80 p-6 shadow-2xl backdrop-blur-md sm:p-10">
        <div className="inline-flex rounded-full bg-[#1A3C34] px-4 py-2 text-sm font-semibold tracking-[0.16em] text-white">Mpishi</div>
        <h1 className="mt-5 font-serif text-4xl tracking-tight sm:text-6xl">Smart pantry control for Kenyan kitchens</h1>
        <p className="mt-4 max-w-lg text-sm leading-7 text-[#1A3C34]/70 sm:text-base">Track stock, plan meals, and keep the shopping list in sync with your pantry.</p>

        <div className="mt-6 flex rounded-3xl bg-[#1A3C34]/6 p-1">
          <button type="button" onClick={() => setMode('login')} className={`flex-1 rounded-2xl px-4 py-3 text-sm font-semibold transition ${mode === 'login' ? 'bg-[#1A3C34] text-white shadow' : 'text-[#1A3C34]/75 hover:text-[#1A3C34]'}`}>Login</button>
          <button type="button" onClick={() => setMode('register')} className={`flex-1 rounded-2xl px-4 py-3 text-sm font-semibold transition ${mode === 'register' ? 'bg-[#1A3C34] text-white shadow' : 'text-[#1A3C34]/75 hover:text-[#1A3C34]'}`}>Register</button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 grid gap-4">
          {mode === 'register' && (
            <label className="grid gap-2 text-sm font-medium text-[#1A3C34]">
              Display name
              <input value={displayName} onChange={(event) => setDisplayName(event.target.value)} placeholder="Mama Njeri" className="rounded-2xl border border-[#1A3C34]/10 bg-white px-4 py-3 outline-none focus:border-[#FFBF00]" />
            </label>
          )}
          <label className="grid gap-2 text-sm font-medium text-[#1A3C34]">
            Username
            <input value={username} onChange={(event) => setUsername(event.target.value)} placeholder="username" required className="rounded-2xl border border-[#1A3C34]/10 bg-white px-4 py-3 outline-none focus:border-[#FFBF00]" />
          </label>
          {mode === 'register' && (
            <label className="grid gap-2 text-sm font-medium text-[#1A3C34]">
              Email
              <input value={email} onChange={(event) => setEmail(event.target.value)} placeholder="name@example.com" type="email" required className="rounded-2xl border border-[#1A3C34]/10 bg-white px-4 py-3 outline-none focus:border-[#FFBF00]" />
            </label>
          )}
          <label className="grid gap-2 text-sm font-medium text-[#1A3C34]">
            Password
            <input value={password} onChange={(event) => setPassword(event.target.value)} placeholder="••••••••" type="password" required className="rounded-2xl border border-[#1A3C34]/10 bg-white px-4 py-3 outline-none focus:border-[#FFBF00]" />
          </label>
          {error && <p className="text-sm font-semibold text-[#BC4749]">{error}</p>}
          <button type="submit" disabled={loading} className="mt-1 rounded-2xl bg-[#1A3C34] px-4 py-3 font-semibold text-white shadow-lg transition hover:bg-[#21493f] disabled:cursor-not-allowed disabled:opacity-70">
            {loading ? 'Processing...' : mode === 'login' ? 'Enter kitchen' : 'Create account'}
          </button>
        </form>
      </section>
    </main>
  )
}
