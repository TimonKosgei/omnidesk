import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { STORAGE_KEY } from '../data/omidesk'

const AuthContext = createContext(null)

// 💡 Helper function to safely decode a JWT payload in vanilla JS
function decodeTokenPayload(token) {
  try {
    const base64Url = token.split('.')[1] // Grab the payload segment
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      window.atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    )
    return JSON.parse(jsonPayload)
  } catch (error) {
    console.error('Failed to parse token payload claims:', error)
    return null
  }
}

function loadAuthState() {
  if (typeof window === 'undefined') {
    return { token: null, displayName: null, role: null, userId: null }
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return { token: null, displayName: null, role: null, userId: null }
    
    const parsed = JSON.parse(raw)
    
    // If a token exists but parameters are missing from storage, restore them on page refresh
    if (parsed.token && (!parsed.role || !parsed.userId)) {
      const payload = decodeTokenPayload(parsed.token)
      return {
        token: parsed.token,
        displayName: parsed.displayName,
        role: payload?.role ?? 'staff',
        userId: payload?.id ?? null
      }
    }

    return {
      token: parsed.token ?? null,
      displayName: parsed.displayName ?? null,
      role: parsed.role ?? null,
      userId: parsed.userId ?? null,
    }
  } catch {
    return { token: null, displayName: null, role: null, userId: null }
  }
}

function saveAuthState(state) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(() => loadAuthState())

  useEffect(() => {
    saveAuthState(auth)
  }, [auth])

  const value = useMemo(() => ({
    token: auth.token,
    displayName: auth.displayName,
    role: auth.role,
    userId: auth.userId,
    
    // The login hook automatically breaks open the string to harvest variables
    login: (token, displayName) => {
      const payload = decodeTokenPayload(token)
      const role = payload?.role ?? 'staff'
      const userId = payload?.id ?? null
      
      setAuth({ token, displayName, role, userId })
    },
    
    logout: () => setAuth({ token: null, displayName: null, role: null, userId: null }),
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