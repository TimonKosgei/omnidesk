import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { AuthState } from '../types'
import { STORAGE_KEY } from '../data/kitchen'

export type AuthContextValue = AuthState & {
  login: (token: string, displayName: string) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

function loadAuthState(): AuthState {
  if (typeof window === 'undefined') {
    return { token: null, displayName: null }
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      return { token: null, displayName: null }
    }
    const parsed = JSON.parse(raw) as AuthState
    return {
      token: parsed.token ?? null,
      displayName: parsed.displayName ?? null,
    }
  } catch {
    return { token: null, displayName: null }
  }
}

function saveAuthState(state: AuthState) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [auth, setAuth] = useState<AuthState>(() => loadAuthState())

  useEffect(() => {
    saveAuthState(auth)
  }, [auth])

  const value = useMemo<AuthContextValue>(() => ({
    token: auth.token,
    displayName: auth.displayName,
    login: (token, displayName) => setAuth({ token, displayName }),
    logout: () => setAuth({ token: null, displayName: null }),
  }), [auth])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('AuthContext is missing')
  }
  return context
}
