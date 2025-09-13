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
                console.log('AuthStore: login called', {
                    username,
                    sessionId,
                    sessionExpiresAt,
                })
                set({
                    username,
                    sessionId,
                    sessionExpiresAt: sessionExpiresAt.getTime(),
                })
            },

            logout: () => {
                console.log('AuthStore: logout called')
                set({
                    username: null,
                    sessionId: null,
                    sessionExpiresAt: null,
                })
            },

            checkAuth: () => {
                const { sessionExpiresAt, sessionId } = get()
                console.log('AuthStore: checkAuth called', {
                    sessionExpiresAt,
                    sessionId,
                })

                if (!sessionExpiresAt || !sessionId) {
                    console.log('AuthStore: No session data available')
                    return false
                }

                const now = Date.now()
                const isExpired = now > sessionExpiresAt

                if (isExpired) {
                    console.log('AuthStore: Session expired, auto-logout')
                    // Auto-logout if session expired
                    get().logout()
                    return false
                }

                console.log('AuthStore: Session is valid')
                return true
            },
        }),
        {
            name: 'auth-storage',
            onRehydrateStorage: () => {
                console.log('AuthStore: Starting rehydration')
                return (state) => {
                    console.log('AuthStore: Rehydration completed', state)
                }
            },
        }
    )
)
