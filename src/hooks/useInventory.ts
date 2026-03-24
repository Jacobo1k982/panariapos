import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'

export function useInventory(params?: { category?: string; alerts?: boolean }) {
    return useQuery({
        queryKey: ['inventory', params],
        queryFn: () => api.get('/inventory', { params }).then(r => r.data),
    })
}

export function useInventoryAlerts() {
    return useQuery({
        queryKey: ['inventory-alerts'],
        queryFn: () => api.get('/inventory/alerts').then(r => r.data),
        refetchInterval: 1000 * 60 * 5, // refresca cada 5 minutos
    })
}

export function useAdjustInventory() {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: ({ id, ...data }: any) => api.post(`/inventory/${id}/adjust`, data).then(r => r.data),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['inventory'] }),
    })
}

export function useCreateInventoryItem() {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: (data: any) => api.post('/inventory', data).then(r => r.data),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['inventory'] }),
    })
}