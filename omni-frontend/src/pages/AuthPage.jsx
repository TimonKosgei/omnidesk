import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const INITIAL_FORM = {
  name: '',
  email: '',
  password: '',
  phone: '',
  department: '',
  location: '',
}

export function AuthPage() {
  const navigate = useNavigate()
  const { login } = useAuth()

  const [authMode, setAuthMode] = useState('login')
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [departments, setDepartments] = useState([])
  const [locations, setLocations] = useState([])
  const [formData, setFormData] = useState(INITIAL_FORM)

  useEffect(() => {
    fetch('/api/setup-data')
      .then((res) => res.json())
      .then((result) => {
        if (result.success) {
          setDepartments(result.departments ?? [])
          setLocations(result.locations ?? [])
        }
      })
      .catch(() => {})
  }, [])

  const handleChange = (event) => {
    setFormData({ ...formData, [event.target.name]: event.target.value })
    setErrorMessage('')
  }

  const completeLogin = (token, name) => {
    login(token, name)
    navigate('/', { replace: true })
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setErrorMessage('')
    setSuccessMessage('')
    setLoading(true)

    if (authMode === 'register' && (!formData.department || !formData.location)) {
      setErrorMessage('Please select both your Department and Location.')
      setLoading(false)
      return
    }

    const endpoint = authMode === 'login' ? '/api/auth/login' : '/api/auth/register'

    const payload =
      authMode === 'login'
        ? { email: formData.email, password: formData.password }
        : {
            name: formData.name,
            email: formData.email,
            password: formData.password,
            phone: formData.phone,
            department: formData.department,
            role: 'staff',
          }

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.message ?? 'Authentication failed')
      }

      const displayName = result.name ?? result.data?.name ?? formData.name

      if (authMode === 'register') {
        setSuccessMessage('Account created successfully. Redirecting…')
        setTimeout(() => completeLogin(result.token, displayName), 1200)
      } else {
        completeLogin(result.token, displayName)
      }
    } catch (error) {
      setErrorMessage(error.message)
    } finally {
      setLoading(false)
    }
  }

  const switchMode = () => {
    setAuthMode(authMode === 'login' ? 'register' : 'login')
    setErrorMessage('')
    setSuccessMessage('')
  }

  const fieldClass =
    'w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-800 shadow-sm placeholder:text-slate-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-omidesk-navy'

  return (
    <div className="min-h-screen bg-omidesk-bg px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-6rem)] max-w-md items-center">
        <div className="w-full space-y-8 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-omidesk-navy text-lg font-bold text-white">
              O
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-omidesk-navy">OmiDesk</h1>
            <p className="mt-2 text-sm text-slate-500">
              {authMode === 'login'
                ? 'Ministry of ICT — Internal Helpdesk Portal'
                : 'Register your ministry staff account'}
            </p>
          </div>

          {errorMessage && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
              {errorMessage}
            </div>
          )}
          {successMessage && (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700" role="status">
              {successMessage}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            {authMode === 'register' && (
              <div>
                <label htmlFor="name" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600">
                  Full Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className={fieldClass}
                  placeholder="e.g. Jane Moraa"
                />
              </div>
            )}

            <div>
              <label htmlFor="email" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600">
                Ministry Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                value={formData.email}
                onChange={handleChange}
                className={fieldClass}
                placeholder="username@ict.go.ke"
              />
            </div>

            <div>
              <label htmlFor="password" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                autoComplete={authMode === 'login' ? 'current-password' : 'new-password'}
                value={formData.password}
                onChange={handleChange}
                className={fieldClass}
                placeholder="••••••••"
              />
            </div>

            {authMode === 'register' && (
              <>
                <div>
                  <label htmlFor="phone" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600">
                    Phone Number
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                    className={fieldClass}
                    placeholder="e.g. +254700112233"
                  />
                </div>

                <div>
                  <label htmlFor="department" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600">
                    Department
                  </label>
                  <select
                    id="department"
                    name="department"
                    required
                    value={formData.department}
                    onChange={handleChange}
                    className={fieldClass}
                  >
                    <option value="">Select department</option>
                    {departments.map((dept) => (
                      <option key={dept._id} value={dept._id}>{dept.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="location" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600">
                    Office Location
                  </label>
                  <select
                    id="location"
                    name="location"
                    required
                    value={formData.location}
                    onChange={handleChange}
                    className={fieldClass}
                  >
                    <option value="">Select room / floor</option>
                    {locations.map((loc) => (
                      <option key={loc._id} value={loc._id}>
                        {loc.building} — {loc.floor}, {loc.room}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-omidesk-navy py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-omidesk-navy focus:ring-offset-2 disabled:opacity-60"
            >
              {loading ? 'Please wait…' : authMode === 'login' ? 'Sign In' : 'Register Account'}
            </button>
          </form>

          <p className="text-center text-sm text-slate-600">
            {authMode === 'login' ? "Don't have an account?" : 'Already registered?'}{' '}
            <button
              type="button"
              onClick={switchMode}
              className="font-semibold text-omidesk-navy underline underline-offset-4 hover:text-slate-700"
            >
              {authMode === 'login' ? 'Register here' : 'Sign in instead'}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
