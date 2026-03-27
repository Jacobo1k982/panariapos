'use client'
import { useState, useRef, useEffect } from 'react'
import {
    Search, X, Plus, Minus, Trash2,
    CreditCard, Banknote, Smartphone,
    ChevronRight, Tag, Loader, ShoppingCart, Grid3X3
} from 'lucide-react'
import { usePOSStore }        from '@/store/pos.store'
import { useProducts, useCategories } from '@/hooks/useProducts'
import { useCreateSale }      from '@/hooks/useSales'
import { useCurrentRegister } from '@/hooks/useCash'
import PaymentModal           from '@/components/pos/PaymentModal'
import CashRegisterModal      from '@/components/pos/CashRegisterModal'
import { useCurrency }        from '@/hooks/useCurrency'
import toast from 'react-hot-toast'

export default function POSPage() {
    const { format } = useCurrency()

    const {
        cart, searchQuery, selectedCategory,
        addItem, removeItem, updateQty,
        globalDiscount, setGlobalDiscount,
        getTotal, clearCart, setSearch, setCategory,
    } = usePOSStore()

    const [showPayment,       setShowPayment]       = useState(false)
    const [showRegister,      setShowRegister]      = useState(false)
    const [showDiscountInput, setShowDiscountInput] = useState(false)
    const [mobileTab,         setMobileTab]         = useState<'catalog' | 'cart'>('catalog')
    const searchRef = useRef<HTMLInputElement>(null)

    const { data: categories = [], isLoading: loadingCats } = useCategories()
    const { data: products   = [], isLoading: loadingProds } = useProducts({
        categoryId: selectedCategory !== 'all' ? selectedCategory : undefined,
        search:     searchQuery || undefined,
    })
    const { data: register } = useCurrentRegister()
    const createSale = useCreateSale()

    useEffect(() => {
        if (mobileTab === 'catalog') searchRef.current?.focus()
    }, [mobileTab])

    const itemCount = cart.reduce((a, i) => a + i.quantity, 0)
    const total     = getTotal()

    const handleConfirmSale = async (paymentMethod: string, paymentRef?: string) => {
        if (!register) { toast.error('Debés abrir la caja primero'); return }
        try {
            const sale = await createSale.mutateAsync({
                cashRegisterId: register.id,
                paymentMethod:  paymentMethod.toUpperCase(),
                paymentRef,
                discount: globalDiscount,
                lines: cart.map(item => ({
                    productId: item.product.id,
                    quantity:  item.quantity,
                    unitPrice: item.unitPrice,
                    discount:  item.discount,
                })),
            })
            toast.success('Venta registrada!')
            clearCart()
            setMobileTab('catalog')
            return sale
        } catch (err: any) {
            toast.error(err.response?.data?.message ?? 'Error al registrar la venta')
            throw err
        }
    }

    const allCategories = [{ id: 'all', name: 'Todos', emoji: '🏪' }, ...categories]

    if (!register) {
        return (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px', height: '100%', background: 'var(--bg-base)' }}>
                <div style={{ fontSize: '56px' }}>🏪</div>
                <h2 style={{ fontSize: '20px', fontWeight: 700 }}>Caja no abierta</h2>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', textAlign: 'center', maxWidth: '280px' }}>
                    Debés abrir la caja para comenzar a registrar ventas
                </p>
                <button className="btn-accent" onClick={() => setShowRegister(true)} style={{ padding: '12px 32px', fontSize: '14px', marginTop: '8px' }}>
                    Abrir caja
                </button>
                {showRegister && <CashRegisterModal onClose={() => setShowRegister(false)} />}
            </div>
        )
    }

    const ProductCard = ({ product, onAdd }: { product: any; onAdd: () => void }) => {
        const inCart = cart.find(c => c.product.id === product.id)
        return (
            <div className="card animate-fade" onClick={onAdd}
                style={{ padding: '13px 11px', cursor: 'pointer', transition: 'all 0.15s', userSelect: 'none', position: 'relative', background: inCart ? 'var(--accent-bg)' : 'var(--bg-surface)', border: `1px solid ${inCart ? 'var(--accent-border)' : 'var(--border)'}` }}
                onMouseEnter={e => { const el = e.currentTarget as HTMLDivElement; el.style.transform = 'translateY(-2px)'; el.style.borderColor = inCart ? 'var(--accent)' : 'var(--border-hover)' }}
                onMouseLeave={e => { const el = e.currentTarget as HTMLDivElement; el.style.transform = 'translateY(0)'; el.style.borderColor = inCart ? 'var(--accent-border)' : 'var(--border)' }}
            >
                {inCart && <span style={{ position: 'absolute', top: 7, right: 7, background: 'var(--accent)', color: '#0f1117', fontSize: '10px', fontWeight: 700, borderRadius: '10px', padding: '1px 6px' }}>x{inCart.quantity}</span>}
                <div style={{ fontSize: '22px', marginBottom: '8px' }}>{product.category?.emoji ?? '🍞'}</div>
                <div style={{ fontSize: '13px', fontWeight: 500, lineHeight: '1.3', marginBottom: '6px' }}>{product.name}</div>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: '5px' }}>{product.sku}</div>
                <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--accent)', fontFamily: 'var(--font-mono)' }}>{format(Number(product.price))}</div>
            </div>
        )
    }

    const CategoryBar = ({ onAdd }: { onAdd: (cat: any) => void }) => (
        <div style={{ display: 'flex', gap: '6px', padding: '10px 18px', borderBottom: '1px solid var(--border)', overflowX: 'auto', flexShrink: 0 }}>
            {allCategories.map(cat => (
                <button key={cat.id} onClick={() => setCategory(cat.id)} style={{ padding: '5px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: 500, flexShrink: 0, cursor: 'pointer', background: selectedCategory === cat.id ? 'var(--accent)' : 'var(--bg-overlay)', color: selectedCategory === cat.id ? '#0f1117' : 'var(--text-secondary)', border: selectedCategory === cat.id ? 'none' : '1px solid var(--border)', fontFamily: 'var(--font-sans)' }}>
                    {cat.emoji} {cat.name}
                </button>
            ))}
        </div>
    )

    const CatalogPanel = (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', borderRight: '1px solid var(--border)', overflow: 'hidden', minWidth: 0 }}>
            <div style={{ padding: '14px 18px 10px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
                <div style={{ position: 'relative' }}>
                    <Search size={15} color="var(--text-muted)" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
                    <input ref={searchRef} className="input-base" value={searchQuery} onChange={e => setSearch(e.target.value)} placeholder="Buscar producto o escanear código..." style={{ width: '100%', padding: '10px 36px 10px 38px', fontSize: '14px' }} />
                    {searchQuery && <button onClick={() => setSearch('')} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: '2px' }}><X size={14} color="var(--text-muted)" /></button>}
                </div>
            </div>
            <CategoryBar onAdd={() => {}} />
            <div style={{ flex: 1, overflowY: 'auto', padding: '14px 18px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '10px', alignContent: 'start' }}>
                {loadingProds ? (
                    <div style={{ gridColumn: '1/-1', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '48px' }}><Loader size={24} color="var(--text-muted)" style={{ animation: 'spin 1s linear infinite' }} /></div>
                ) : products.length === 0 ? (
                    <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '48px 0', color: 'var(--text-muted)', fontSize: '14px' }}>
                        {searchQuery ? `Sin resultados para "${searchQuery}"` : 'Sin productos en esta categoría'}
                    </div>
                ) : (products as any[]).map(product => (
                    <ProductCard key={product.id} product={product} onAdd={() => addItem({ ...product, price: Number(product.price), taxRate: 0, stock: 99 })} />
                ))}
            </div>
        </div>
    )

    const CartFooter = ({ mobile = false }: { mobile?: boolean }) => (
        <div style={{ borderTop: '1px solid var(--border)', padding: '14px 16px', flexShrink: 0 }}>
            {showDiscountInput ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                    <Tag size={12} color="var(--accent)" />
                    <span style={{ fontSize: '11px', color: 'var(--text-secondary)', flex: 1 }}>Descuento global</span>
                    <input type="number" min="0" max="100" value={globalDiscount} onChange={e => setGlobalDiscount(Number(e.target.value))} className="input-base" style={{ width: '60px', padding: '4px 8px', fontSize: '13px', textAlign: 'center' }} />
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>%</span>
                    <button onClick={() => setShowDiscountInput(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px' }}><X size={12} color="var(--text-muted)" /></button>
                </div>
            ) : (
                <button onClick={() => setShowDiscountInput(true)} style={{ background: 'none', border: '1px dashed var(--border)', borderRadius: 'var(--radius-sm)', color: 'var(--text-muted)', fontSize: '11px', cursor: 'pointer', padding: '5px 10px', width: '100%', display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '10px', fontFamily: 'var(--font-sans)' }}>
                    <Tag size={11} /> Agregar descuento global
                    {globalDiscount > 0 && <span style={{ color: 'var(--accent)', fontWeight: 600, marginLeft: 'auto' }}>{globalDiscount}%</span>}
                </button>
            )}
            <div style={{ background: 'var(--bg-overlay)', borderRadius: 'var(--radius-md)', padding: '10px 14px', marginBottom: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>Total a cobrar</span>
                    <span style={{ fontSize: '24px', fontWeight: 700, fontFamily: 'var(--font-mono)', letterSpacing: '-0.5px', color: total > 0 ? 'var(--accent)' : 'var(--text-muted)' }}>{format(total)}</span>
                </div>
                {globalDiscount > 0 && <div style={{ fontSize: '11px', color: 'var(--accent)', marginTop: '2px', textAlign: 'right' }}>Descuento {globalDiscount}% aplicado</div>}
            </div>
            <button className="btn-accent" disabled={cart.length === 0 || createSale.isPending} onClick={() => setShowPayment(true)} style={{ width: '100%', padding: mobile ? '14px' : '13px', fontSize: mobile ? '15px' : '14px', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px', opacity: cart.length === 0 ? 0.4 : 1 }}>
                {createSale.isPending ? <Loader size={16} style={{ animation: 'spin 1s linear infinite' }} /> : null}
                Cobrar {total > 0 && <span style={{ fontFamily: 'var(--font-mono)' }}>{format(total)}</span>}
                <ChevronRight size={16} />
            </button>
            <div style={{ display: 'flex', gap: '5px', marginTop: '7px' }}>
                {[{ icon: Banknote, label: 'Efectivo' }, { icon: CreditCard, label: 'Tarjeta' }, { icon: Smartphone, label: 'SINPE' }].map(({ icon: Icon, label }) => (
                    <button key={label} className="btn-ghost" disabled={cart.length === 0} onClick={() => setShowPayment(true)} style={{ flex: 1, padding: '7px 4px', fontSize: '10px', fontWeight: 500, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px', opacity: cart.length === 0 ? 0.3 : 1 }}>
                        <Icon size={14} /> {label}
                    </button>
                ))}
            </div>
        </div>
    )

    const CartPanel = (
        <div style={{ width: '360px', flexShrink: 0, display: 'flex', flexDirection: 'column', background: 'var(--bg-surface)' }}>
            <div style={{ padding: '10px 16px', borderBottom: '1px solid var(--border)', background: 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>🏪 <span>{register.user?.name ?? 'Cajero'}</span></div>
                <span style={{ fontSize: '10px', fontWeight: 600, background: 'var(--success-bg)', color: 'var(--success)', padding: '2px 8px', borderRadius: '20px' }}>En línea</span>
            </div>
            <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontWeight: 600, fontSize: '15px' }}>Orden actual</span>
                    <span style={{ background: 'var(--accent-bg)', color: 'var(--accent)', border: '1px solid var(--accent-border)', fontSize: '10px', fontWeight: 700, padding: '1px 7px', borderRadius: '20px' }}>{itemCount} ítem{itemCount !== 1 ? 's' : ''}</span>
                </div>
                {cart.length > 0 && <button onClick={clearCart} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '3px' }}><X size={15} /></button>}
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {cart.length === 0 ? (
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '10px', color: 'var(--text-muted)' }}>
                        <span style={{ fontSize: '40px' }}>🛒</span>
                        <span style={{ fontSize: '13px' }}>El carrito está vacío</span>
                    </div>
                ) : cart.map(item => <CartItemRow key={item.product.id} item={item} format={format} onQty={updateQty} onRemove={removeItem} />)}
            </div>
            <CartFooter />
        </div>
    )

    return (
        <>
            <div className="hide-mobile" style={{ display: 'flex', height: '100%', overflow: 'hidden' }}>
                {CatalogPanel}
                {CartPanel}
            </div>

            <div className="hide-desktop" style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
                <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', background: 'var(--bg-surface)', flexShrink: 0 }}>
                    {(['catalog', 'cart'] as const).map(t => (
                        <button key={t} onClick={() => setMobileTab(t)} style={{ flex: 1, padding: '12px 8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 600, fontFamily: 'var(--font-sans)', color: mobileTab === t ? 'var(--accent)' : 'var(--text-muted)', borderBottom: mobileTab === t ? '2px solid var(--accent)' : '2px solid transparent', transition: 'all 0.15s' }}>
                            {t === 'catalog' ? <><Grid3X3 size={15} /> Productos</> : (
                                <><ShoppingCart size={15} /> Carrito {itemCount > 0 && <span style={{ background: 'var(--accent)', color: '#0f1117', fontSize: '10px', fontWeight: 700, borderRadius: '10px', padding: '1px 6px' }}>{itemCount}</span>}</>
                            )}
                        </button>
                    ))}
                </div>
                <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                    {mobileTab === 'catalog' ? (
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                            <div style={{ padding: '14px 18px 10px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
                                <div style={{ position: 'relative' }}>
                                    <Search size={15} color="var(--text-muted)" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
                                    <input ref={searchRef} className="input-base" value={searchQuery} onChange={e => setSearch(e.target.value)} placeholder="Buscar producto..." style={{ width: '100%', padding: '10px 36px 10px 38px', fontSize: '14px' }} />
                                    {searchQuery && <button onClick={() => setSearch('')} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: '2px' }}><X size={14} color="var(--text-muted)" /></button>}
                                </div>
                            </div>
                            <CategoryBar onAdd={() => {}} />
                            <div style={{ flex: 1, overflowY: 'auto', padding: '14px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '10px', alignContent: 'start' }}>
                                {loadingProds ? (
                                    <div style={{ gridColumn: '1/-1', display: 'flex', justifyContent: 'center', padding: '48px' }}><Loader size={24} color="var(--text-muted)" style={{ animation: 'spin 1s linear infinite' }} /></div>
                                ) : products.length === 0 ? (
                                    <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '48px 0', color: 'var(--text-muted)', fontSize: '14px' }}>{searchQuery ? `Sin resultados para "${searchQuery}"` : 'Sin productos'}</div>
                                ) : (products as any[]).map(product => (
                                    <ProductCard key={product.id} product={product} onAdd={() => { addItem({ ...product, price: Number(product.price), taxRate: 0, stock: 99 }); setMobileTab('cart') }} />
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', width: '100%' }}>
                            <div style={{ padding: '10px 16px', borderBottom: '1px solid var(--border)', background: 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
                                <div style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>🏪 <span>{register.user?.name ?? 'Cajero'}</span></div>
                                <span style={{ fontSize: '10px', fontWeight: 600, background: 'var(--success-bg)', color: 'var(--success)', padding: '2px 8px', borderRadius: '20px' }}>En línea</span>
                            </div>
                            <div style={{ flex: 1, overflowY: 'auto', padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                {cart.length === 0 ? (
                                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '10px', color: 'var(--text-muted)', paddingTop: '60px' }}>
                                        <span style={{ fontSize: '40px' }}>🛒</span>
                                        <span style={{ fontSize: '13px' }}>El carrito está vacío</span>
                                        <button onClick={() => setMobileTab('catalog')} className="btn-ghost" style={{ padding: '8px 20px', fontSize: '13px', marginTop: '8px' }}>Ir a productos</button>
                                    </div>
                                ) : cart.map(item => <CartItemRow key={item.product.id} item={item} format={format} onQty={updateQty} onRemove={removeItem} />)}
                            </div>
                            <CartFooter mobile />
                        </div>
                    )}
                </div>
            </div>

            {showPayment && <PaymentModal total={total} onClose={() => setShowPayment(false)} onConfirm={handleConfirmSale} isLoading={createSale.isPending} />}
            <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
        </>
    )
}

function CartItemRow({ item, onQty, onRemove, format }: {
    item: import('@/store/pos.store').CartItem
    onQty: (id: string, qty: number) => void
    onRemove: (id: string) => void
    format: (n: number) => string
}) {
    return (
        <div className="animate-slide" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '10px 12px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '8px' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '13px', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.product.name}</div>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '1px' }}>
                        {format(item.unitPrice)} c/u
                        {item.discount > 0 && <span style={{ color: 'var(--accent)', marginLeft: 5 }}>-{item.discount}%</span>}
                    </div>
                </div>
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, fontSize: '14px', flexShrink: 0 }}>{format(item.subtotal)}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <button onClick={() => onQty(item.product.id, item.quantity - 1)} style={{ width: 26, height: 26, borderRadius: '6px', cursor: 'pointer', background: 'var(--bg-overlay)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}><Minus size={11} /></button>
                    <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, fontSize: '14px', minWidth: '22px', textAlign: 'center' }}>{item.quantity}</span>
                    <button onClick={() => onQty(item.product.id, item.quantity + 1)} style={{ width: 26, height: 26, borderRadius: '6px', cursor: 'pointer', background: 'var(--bg-overlay)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}><Plus size={11} /></button>
                </div>
                <button onClick={() => onRemove(item.product.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '4px' }}
                    onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.color = 'var(--danger)'}
                    onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-muted)'}>
                    <Trash2 size={13} />
                </button>
            </div>
        </div>
    )
}
