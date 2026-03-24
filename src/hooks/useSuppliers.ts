// FRONTEND — src/hooks/useSuppliers.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'

export function useSuppliers(search?: string) {
    return useQuery({
        queryKey: ['suppliers', search],
        queryFn: () => api.get('/suppliers', { params: { search } }).then(r => r.data),
    })
}

export function useSupplierOrders(supplierId?: string, status?: string) {
    return useQuery({
        queryKey: ['supplier-orders', supplierId, status],
        queryFn: () => api.get('/suppliers/orders/all', { params: { supplierId, status } }).then(r => r.data),
    })
}

export function usePayablesSummary() {
    return useQuery({
        queryKey: ['payables'],
        queryFn: () => api.get('/suppliers/payables').then(r => r.data),
    })
}

export function useCreateSupplier() {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: (data: any) => api.post('/suppliers', data).then(r => r.data),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['suppliers'] }),
    })
}

export function useCreatePurchaseOrder() {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: (data: any) => api.post('/suppliers/orders', data).then(r => r.data),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['supplier-orders'] })
            qc.invalidateQueries({ queryKey: ['payables'] })
        },
    })
}

export function useReceiveOrder() {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: (id: string) => api.patch(`/suppliers/orders/${id}/receive`).then(r => r.data),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['supplier-orders'] })
            qc.invalidateQueries({ queryKey: ['payables'] })
            qc.invalidateQueries({ queryKey: ['inventory'] })
        },
    })
}