import { useAuthStore } from './authStore'

// Hook for components that only need to read auth state
export const useAuthState = () => {
    const { username, sessionId, sessionExpiresAt, checkAuth } = useAuthStore()
    const isAuthenticated = checkAuth()
    return { username, sessionId, sessionExpiresAt, isAuthenticated }
}

export const useAuthActions = () => {
    const { login, logout, checkAuth } = useAuthStore()
    return { login, logout, checkAuth }
}
