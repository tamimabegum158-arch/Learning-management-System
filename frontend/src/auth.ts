import { api } from './api'

const AUTH_TOKEN_KEY = 'ai-lms-auth-token'
const AUTH_USER_KEY = 'ai-lms-auth-user'

export interface AuthUser {
  email: string
  role: string
  accessToken: string
}

export function setAuthToken(token: string | null) {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`
  } else {
    delete api.defaults.headers.common.Authorization
  }
}

export function saveAuth(user: AuthUser) {
  localStorage.setItem(AUTH_TOKEN_KEY, user.accessToken)
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify({ email: user.email, role: user.role }))
  setAuthToken(user.accessToken)
}

export function clearAuth() {
  localStorage.removeItem(AUTH_TOKEN_KEY)
  localStorage.removeItem(AUTH_USER_KEY)
  setAuthToken(null)
}

export function loadAuth(): AuthUser | null {
  const accessToken = localStorage.getItem(AUTH_TOKEN_KEY)
  const rawUser = localStorage.getItem(AUTH_USER_KEY)

  if (!accessToken || !rawUser) {
    return null
  }

  try {
    const parsed = JSON.parse(rawUser) as { email: string; role: string }
    setAuthToken(accessToken)
    return {
      email: parsed.email,
      role: parsed.role,
      accessToken
    }
  } catch {
    clearAuth()
    return null
  }
}
