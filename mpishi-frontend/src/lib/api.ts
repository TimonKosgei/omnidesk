import { API_BASE } from '../data/kitchen'

function getHeaders(token: string | null) {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }
  return headers
}

export async function apiFetch<T>(path: string, token: string | null, init?: RequestInit) {
  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      ...getHeaders(token),
      ...(init?.headers ?? {}),
    },
  })

  const payload = (await response.json().catch(() => ({}))) as { success?: boolean; data?: T; message?: string; token?: string; displayName?: string }

  if (!response.ok) {
    throw new Error(payload.message ?? 'Request failed')
  }

  return payload
}
