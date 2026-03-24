import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'

export function useSales(params?: { from?: string; to?: string; limit?: number }) {
    return useQuery({
        queryKey: ['sales', params],
        queryFn: async () => {
            const res = await api.get('/sales', {
                params: {
                    from: params?.from,
                    to: params?.to,
                    limit: params?.limit ?? 100,
                },
            })
            return res.data
        },
        // Sin filtro de fechas por defecto — trae todas
        staleTime: 0,
    })
}

export function useDailySummary(date?: string) {
    return useQuery({
        queryKey: ['sales-summary', date],
        queryFn: () => api.get('/sales/summary/daily', { params: { date } }).then(r => r.data),
        refetchInterval: 1000 * 60,
    })
}

export function useCreateSale() {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: (data: any) => api.post('/sales', data).then(r => r.data),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['sales'] })
            qc.invalidateQueries({ queryKey: ['sales-summary'] })
            qc.invalidateQueries({ queryKey: ['cash-register'] })
        },
    })
}