import { useEffect } from 'react'
import { useAuthStore } from './authStore'

export const useAuth = () => {
    const { checkAuth, ...authState } = useAuthStore()

    // Check authentication status on mount and when dependencies change
    useEffect(() => {
        checkAuth()
    }, [checkAuth])

    return authState
}

// Hook for components that only need to read auth state
export const useAuthState = () => {
    const { username, sessionId, sessionExpiresAt } = useAuthStore()

    // Compute authentication status
    const isAuthenticated =
        sessionId && sessionExpiresAt && Date.now() < sessionExpiresAt

    return { username, sessionId, sessionExpiresAt, isAuthenticated }
}

// Hook for components that need to perform auth actions
export const useAuthActions = () => {
    const { login, logout, checkAuth } = useAuthStore()
    return { login, logout, checkAuth }
}
