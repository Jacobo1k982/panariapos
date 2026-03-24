import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'

export function useSalesReport(from: string, to: string) {
    return useQuery({
        queryKey: ['report-sales', from, to],
        queryFn: () => api.get('/reports/sales', { params: { from, to } }).then(r => r.data),
        enabled: !!from && !!to,
    })
}

export function useTopProducts(from: string, to: string) {
    return useQuery({
        queryKey: ['report-top-products', from, to],
        queryFn: () => api.get('/reports/top-products', { params: { from, to } }).then(r => r.data),
        enabled: !!from && !!to,
    })
}

export function useInventoryValuation() {
    return useQuery({
        queryKey: ['report-inventory'],
        queryFn: () => api.get('/reports/inventory-valuation').then(r => r.data),
    })
}