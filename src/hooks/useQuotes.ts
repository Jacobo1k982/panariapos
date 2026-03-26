import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'

export interface QuoteLine {
    id?:         string
    productId:   string
    productName: string
    quantity:    number
    unitPrice:   number
    discount?:   number
    subtotal?:   number
}

export interface Quote {
    id:             string
    quoteNumber:    string
    status:         'PENDING' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED' | 'CONVERTED'
    customerId?:    string
    customer?:      { id: string; name: string; phone: string; email?: string }
    discount:       number
    subtotal:       number
    total:          number
    notes?:         string
    validUntil?:    string
    convertedSaleId?: string
    createdAt:      string
    lines:          QuoteLine[]
}

export interface CreateQuoteInput {
    customerId?:  string
    discount?:    number
    notes?:       string
    validUntil?:  string
    lines:        QuoteLine[]
}

// ── Queries ──────────────────────────────────────────────────────────────────
export function useQuotes(params?: { status?: string; customerId?: string; search?: string }) {
    return useQuery({
        queryKey: ['quotes', params],
        queryFn:  () => api.get('/quotes', { params }).then(r => r.data as Quote[]),
    })
}

export function useQuote(id: string) {
    return useQuery({
        queryKey: ['quotes', id],
        queryFn:  () => api.get(`/quotes/${id}`).then(r => r.data as Quote),
        enabled:  !!id,
    })
}

// ── Mutations ────────────────────────────────────────────────────────────────
export function useCreateQuote() {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: (dto: CreateQuoteInput) => api.post('/quotes', dto).then(r => r.data),
        onSuccess:  () => qc.invalidateQueries({ queryKey: ['quotes'] }),
    })
}

export function useUpdateQuote() {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: ({ id, ...dto }: { id: string; status?: string; notes?: string; validUntil?: string }) =>
            api.patch(`/quotes/${id}`, dto).then(r => r.data),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['quotes'] }),
    })
}

export function useConvertQuote() {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: ({ id, cashRegisterId, paymentMethod }: { id: string; cashRegisterId: string; paymentMethod: string }) =>
            api.post(`/quotes/${id}/convert`, { cashRegisterId, paymentMethod }).then(r => r.data),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['quotes'] })
            qc.invalidateQueries({ queryKey: ['sales'] })
        },
    })
}
