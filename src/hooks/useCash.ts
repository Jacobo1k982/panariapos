import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'

export function useCurrentRegister() {
    return useQuery({
        queryKey: ['cash-register'],
        queryFn: () => api.get('/cash-register/current').then(r => r.data),
        refetchInterval: 1000 * 30,
    })
}

export function useOpenRegister() {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: (data: { openingAmount: number }) =>
            api.post('/cash-register/open', data).then(r => r.data),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['cash-register'] }),
    })
}

export function useCloseRegister() {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: ({ id, ...data }: any) =>
            api.post(`/cash-register/${id}/close`, data).then(r => r.data),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['cash-register'] }),
    })
}

export function useRegisterSummary(id: string) {
    return useQuery({
        queryKey: ['cash-register-summary', id],
        queryFn: () => api.get(`/cash-register/${id}/summary`).then(r => r.data),
        enabled: !!id,
    })
}