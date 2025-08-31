import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type AuthState = {
    username: string | null
    sessionId: string | null
    sessionExpiresAt: number | null
}

export type AuthActions = {
    login: (username: string, sessionId: string, sessionExpiresAt: Date) => void
    logout: () => void
    checkAuth: () => boolean
}

export type AuthStore = AuthState & AuthActions

export const useAuthStore = create<AuthStore>()(
    persist(
        (set, get) => ({
            // Initial state
            username: null,
            sessionId: null,
            sessionExpiresAt: null,

            // Actions
            login: (
                username: string,
                sessionId: string,
                sessionExpiresAt: Date
            ) => {
                set({
                    username,
                    sessionId,
                    sessionExpiresAt: sessionExpiresAt.getTime(),
                })
            },

            logout: () => {
                set({
                    username: null,
                    sessionId: null,
                    sessionExpiresAt: null,
                })
            },

            checkAuth: () => {
                const { sessionExpiresAt } = get()
                if (!sessionExpiresAt) {
                    return false
                }

                const now = Date.now()
                const isExpired = now > sessionExpiresAt

                if (isExpired) {
                    // Auto-logout if session expired
                    get().logout()
                    return false
                }

                return true
            },
        }),
        {
            name: 'auth-storage',
        }
    )
)
