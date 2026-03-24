import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'

export function useProducts(params?: { categoryId?: string; search?: string }) {
    return useQuery({
        queryKey: ['products', params],
        queryFn: () => api.get('/products', { params }).then(r => r.data),
    })
}

export function useCategories() {
    return useQuery({
        queryKey: ['categories'],
        queryFn: () => api.get('/products/categories').then(r => r.data),
        staleTime: 1000 * 60 * 10, // 10 minutos
    })
}

export function useCreateProduct() {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: (data: any) => api.post('/products', data).then(r => r.data),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['products'] }),
    })
}

export function useUpdateProduct() {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: ({ id, ...data }: any) => api.patch(`/products/${id}`, data).then(r => r.data),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['products'] }),
    })
}