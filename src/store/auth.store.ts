import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import api from '@/lib/api'

export interface AuthUser {
    id: string
    name: string
    email: string
    role: string
    tenantId: string
    tenantName: string
    branchId: string | null
    branchName: string | null
    plan: string
    trialEndsAt: string | null
}

interface AuthState {
    user: AuthUser | null
    accessToken: string | null
    refreshToken: string | null
    isLoading: boolean
    error: string | null

    login: (email: string, password: string) => Promise<void>
    logout: () => Promise<void>
    setUser: (user: AuthUser) => void
    clear: () => void
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            user: null,
            accessToken: null,
            refreshToken: null,
            isLoading: false,
            error: null,

            login: async (email, password) => {
                set({ isLoading: true, error: null })
                try {
                    const { data } = await api.post('/auth/login', { email, password })

                    // Guardar tokens en localStorage para el interceptor
                    localStorage.setItem('access_token', data.accessToken)
                    localStorage.setItem('refresh_token', data.refreshToken)

                    set({
                        user: data.user,
                        accessToken: data.accessToken,
                        refreshToken: data.refreshToken,
                        isLoading: false,
                    })
                } catch (err: any) {
                    const msg = err.response?.data?.message ?? 'Credenciales inválidas'
                    set({ error: msg, isLoading: false })
                    throw new Error(msg)
                }
            },

            logout: async () => {
                try {
                    const { refreshToken } = get()
                    if (refreshToken) await api.post('/auth/logout', { refreshToken })
                } finally {
                    localStorage.removeItem('access_token')
                    localStorage.removeItem('refresh_token')
                    set({ user: null, accessToken: null, refreshToken: null })
                }
            },

            setUser: (user) => set({ user }),
            clear: () => set({ user: null, accessToken: null, refreshToken: null }),
        }),
        {
            name: 'panariapos-auth',
            partialize: (s) => ({
                user: s.user,
                accessToken: s.accessToken,
                refreshToken: s.refreshToken,
            }),
        }
    )
)