// FRONTEND — src/hooks/useTenant.ts
import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'

export function useTenant() {
    return useQuery({
        queryKey: ['tenant'],
        queryFn: () => api.get('/tenants/me').then(r => r.data),
        staleTime: 1000 * 60 * 10,
    })
}