import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'

export function useAdminMetrics() {
  return useQuery({
    queryKey: ['admin-metrics'],
    queryFn: () => api.get('/admin/metrics').then(r => r.data),
    refetchInterval: 1000 * 60,
  })
}

export function useAdminTenants(active?: boolean, plan?: string) {
  return useQuery({
    queryKey: ['admin-tenants', active, plan],
    queryFn: () => api.get('/admin/tenants', {
      params: {
        active: active !== undefined ? String(active) : undefined,
        plan,
      },
    }).then(r => r.data),
    staleTime: 0,
  })
}

export function useAdminTenant(id: string) {
  return useQuery({
    queryKey: ['admin-tenant', id],
    queryFn: () => api.get(`/admin/tenants/${id}`).then(r => r.data),
    enabled: !!id,
  })
}

export function useUpdatePlan() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, plan }: { id: string; plan: string }) =>
      api.patch(`/admin/tenants/${id}/plan`, { plan }).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-tenants'] })
      qc.invalidateQueries({ queryKey: ['admin-metrics'] })
    },
  })
}

export function useToggleTenant() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) =>
      api.patch(`/admin/tenants/${id}/toggle`, { active }).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-tenants'] })
      qc.invalidateQueries({ queryKey: ['admin-metrics'] })
    },
  })
}
