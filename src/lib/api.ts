import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosError } from 'axios'

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1'

const api: AxiosInstance = axios.create({
    baseURL: BASE_URL,
    timeout: 10000,
    headers: { 'Content-Type': 'application/json' },
})

// ─── Request interceptor — adjunta access token ───────────────────────────────
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    if (typeof window !== 'undefined') {
        const token = localStorage.getItem('access_token')
        if (token) config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

// ─── Response interceptor — refresca token si expira ─────────────────────────
let isRefreshing = false
let failedQueue: { resolve: (v: string) => void; reject: (e: unknown) => void }[] = []

function processQueue(error: unknown, token: string | null = null) {
    failedQueue.forEach(p => {
        if (error) p.reject(error)
        else if (token) p.resolve(token)
        else p.reject(new Error('No token after refresh'))
    })
    failedQueue = []
}

api.interceptors.response.use(
    res => res,
    async (error: AxiosError) => {
        const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

        if (error.response?.status !== 401 || original._retry) {
            return Promise.reject(error)
        }

        if (isRefreshing) {
            return new Promise((resolve, reject) => {
                failedQueue.push({ resolve, reject })
            }).then(token => {
                original.headers.Authorization = `Bearer ${token}`
                return api(original)
            })
        }

        original._retry = true
        isRefreshing = true

        try {
            const refreshToken = localStorage.getItem('refresh_token')
            if (!refreshToken) throw new Error('No refresh token')

            const { data } = await axios.post(`${BASE_URL}/auth/refresh`, { refreshToken })
            localStorage.setItem('access_token', data.accessToken)
            api.defaults.headers.common.Authorization = `Bearer ${data.accessToken}`
            processQueue(null, data.accessToken)
            return api(original)
        } catch (err) {
            processQueue(err, null)
            localStorage.removeItem('access_token')
            localStorage.removeItem('refresh_token')
            if (typeof window !== 'undefined') window.location.href = '/login'
            return Promise.reject(err)
        } finally {
            isRefreshing = false
        }
    }
)

export default api
