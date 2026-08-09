import { computed, reactive } from 'vue'

const state = reactive({ user: null, csrfToken: null, ready: false })
let pendingSession = null

async function readJson(response) {
  const text = await response.text()
  if (!text) return null
  try { return JSON.parse(text) } catch { return { error: text } }
}

export async function loadSession(force = false) {
  if (state.ready && !force) return state.user
  if (pendingSession && !force) return pendingSession
  pendingSession = (async () => {
    try {
      const response = await fetch('/auth/me', { credentials: 'same-origin', cache: 'no-store' })
      if (!response.ok) {
        state.user = null
        state.csrfToken = null
        return null
      }
      const data = await response.json()
      state.user = data.user
      state.csrfToken = data.csrfToken
      return state.user
    } finally {
      state.ready = true
      pendingSession = null
    }
  })()
  return pendingSession
}

export async function login(email, password) {
  const response = await fetch('/auth/login', {
    method: 'POST',
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  })
  const data = await readJson(response)
  if (!response.ok) throw new Error(data?.error || 'Connexion impossible')
  state.user = data.user
  state.csrfToken = data.csrfToken
  state.ready = true
  return state.user
}

export async function apiFetch(url, options = {}) {
  const method = String(options.method || 'GET').toUpperCase()
  const headers = new Headers(options.headers || {})
  if (!['GET', 'HEAD', 'OPTIONS'].includes(method)) {
    if (!state.csrfToken) await loadSession(true)
    if (state.csrfToken) headers.set('X-CSRF-Token', state.csrfToken)
  }
  const response = await fetch(url, { ...options, method, headers, credentials: 'same-origin' })
  if (response.status === 401) {
    state.user = null
    state.csrfToken = null
    state.ready = true
    window.dispatchEvent(new CustomEvent('auth:unauthorized'))
  }
  return response
}

export async function logout() {
  try {
    await apiFetch('/auth/logout', { method: 'POST' })
  } finally {
    state.user = null
    state.csrfToken = null
    state.ready = true
  }
}

export function useAuth() {
  return {
    state,
    user: computed(() => state.user),
    isAdmin: computed(() => state.user?.role === 'ADMIN'),
    isAuthenticated: computed(() => Boolean(state.user)),
    loadSession,
    login,
    logout,
    apiFetch
  }
}
