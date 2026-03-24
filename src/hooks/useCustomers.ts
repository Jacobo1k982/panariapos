import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'

export function useCustomers(params?: { search?: string; status?: string }) {
    return useQuery({
        queryKey: ['customers', params],
        queryFn: () => api.get('/customers', { params }).then(r => r.data),
    })
}

export function useCustomer(id: string) {
    return useQuery({
        queryKey: ['customers', id],
        queryFn: () => api.get(`/customers/${id}`).then(r => r.data),
        enabled: !!id,
    })
}

export function useCreateCustomer() {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: (data: any) => api.post('/customers', data).then(r => r.data),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['customers'] }),
    })
}

export function useCustomerCredit() {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: ({ id, type, amount, note }: any) =>
            api.post(`/customers/${id}/${type}`, { amount, note }).then(r => r.data),
        onSuccess: (_data, vars) => {
            qc.invalidateQueries({ queryKey: ['customers', vars.id] })
            qc.invalidateQueries({ queryKey: ['customers'] })
        },
    })
}