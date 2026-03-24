import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

export interface Product {
    id: string
    sku: string
    name: string
    price: number
    taxRate: number      // 0 para régimen simplificado → sin desglose IVA
    unit: 'unit' | 'kg' | 'g' | 'pack'
    category: string
    stock: number
    image?: string
}

export interface CartItem {
    product: Product
    quantity: number
    unitPrice: number
    discount: number     // porcentaje 0–100
    subtotal: number
}

export interface CashRegister {
    id: string
    branchId: string
    openedAt: string
    openingAmount: number
    cashierId: string
    cashierName: string
}

export type PaymentMethod = 'cash' | 'card' | 'sinpe' | 'transfer' | 'credit'

interface POSState {
    // Carrito
    cart: CartItem[]
    globalDiscount: number
    note: string

    // Caja activa
    register: CashRegister | null

    // UI
    searchQuery: string
    selectedCategory: string

    // Acciones carrito
    addItem: (product: Product, qty?: number) => void
    removeItem: (productId: string) => void
    updateQty: (productId: string, qty: number) => void
    updateDiscount: (productId: string, discount: number) => void
    setGlobalDiscount: (d: number) => void
    setNote: (note: string) => void
    clearCart: () => void

    // Totales
    getSubtotal: () => number
    getTotal: () => number

    // Caja
    setRegister: (r: CashRegister | null) => void

    // UI
    setSearch: (q: string) => void
    setCategory: (c: string) => void
}

export const usePOSStore = create<POSState>()(
    devtools((set, get) => ({
        cart: [],
        globalDiscount: 0,
        note: '',
        register: null,
        searchQuery: '',
        selectedCategory: 'all',

        addItem: (product, qty = 1) => set(state => {
            const existing = state.cart.find(i => i.product.id === product.id)
            if (existing) {
                return {
                    cart: state.cart.map(i =>
                        i.product.id === product.id
                            ? { ...i, quantity: i.quantity + qty, subtotal: (i.quantity + qty) * i.unitPrice * (1 - i.discount / 100) }
                            : i
                    )
                }
            }
            const newItem: CartItem = {
                product,
                quantity: qty,
                unitPrice: product.price,
                discount: 0,
                subtotal: product.price * qty
            }
            return { cart: [...state.cart, newItem] }
        }),

        removeItem: (productId) => set(state => ({
            cart: state.cart.filter(i => i.product.id !== productId)
        })),

        updateQty: (productId, qty) => set(state => ({
            cart: qty <= 0
                ? state.cart.filter(i => i.product.id !== productId)
                : state.cart.map(i =>
                    i.product.id === productId
                        ? { ...i, quantity: qty, subtotal: qty * i.unitPrice * (1 - i.discount / 100) }
                        : i
                )
        })),

        updateDiscount: (productId, discount) => set(state => ({
            cart: state.cart.map(i =>
                i.product.id === productId
                    ? { ...i, discount, subtotal: i.quantity * i.unitPrice * (1 - discount / 100) }
                    : i
            )
        })),

        setGlobalDiscount: (d) => set({ globalDiscount: d }),
        setNote: (note) => set({ note }),
        clearCart: () => set({ cart: [], globalDiscount: 0, note: '' }),

        getSubtotal: () => {
            const { cart, globalDiscount } = get()
            const base = cart.reduce((acc, i) => acc + i.subtotal, 0)
            return base * (1 - globalDiscount / 100)
        },

        getTotal: () => get().getSubtotal(),

        setRegister: (r) => set({ register: r }),
        setSearch: (q) => set({ searchQuery: q }),
        setCategory: (c) => set({ selectedCategory: c }),
    }), { name: 'POS' })
)