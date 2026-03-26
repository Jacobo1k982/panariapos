import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'

export function useAdminMetrics() {
    return useQuery({
        queryKey: ['admin', 'metrics'],
        queryFn:  () => api.get('/admin/metrics').then(r => r.data),
        refetchInterval: 60_000,
    })
}

export function useAdminTenants() {
    return useQuery({
        queryKey: ['admin', 'tenants'],
        queryFn:  () => api.get('/admin/tenants').then(r => r.data),
    })
}

export function useAdminActivity() {
    return useQuery({
        queryKey: ['admin', 'activity'],
        queryFn:  () => api.get('/admin/activity').then(r => r.data),
        refetchInterval: 30_000,
    })
}

export function useUpdateTenantPlan() {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: ({ id, plan }: { id: string; plan: string }) =>
            api.patch(`/admin/tenants/${id}/plan`, { plan }).then(r => r.data),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['admin'] }),
    })
}

export function useToggleTenant() {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: (id: string) =>
            api.patch(`/admin/tenants/${id}/toggle`).then(r => r.data),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['admin'] }),
    })
}
