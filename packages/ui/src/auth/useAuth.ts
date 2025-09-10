import { useAuthStore } from './authStore'

// Hook for components that only need to read auth state
export const useAuthState = () => {
    const { username, sessionId, sessionExpiresAt, checkAuth } = useAuthStore()

    // Check if session is valid and auto-logout if expired
    const isAuthenticated = checkAuth()

    return { username, sessionId, sessionExpiresAt, isAuthenticated }
}

// Hook for components that need to perform auth actions
export const useAuthActions = () => {
    const { login, logout, checkAuth } = useAuthStore()
    return { login, logout, checkAuth }
}
