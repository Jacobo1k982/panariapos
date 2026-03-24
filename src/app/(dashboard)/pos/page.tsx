'use client'
import { useState, useRef, useEffect } from 'react'
import {
    Search, X, Plus, Minus, Trash2,
    CreditCard, Banknote, Smartphone,
    ChevronRight, Tag, Loader
} from 'lucide-react'
import { usePOSStore } from '@/store/pos.store'
import { useProducts, useCategories } from '@/hooks/useProducts'
import { useCreateSale } from '@/hooks/useSales'
import { useCurrentRegister } from '@/hooks/useCash'
import PaymentModal from '@/components/pos/PaymentModal'
import CashRegisterModal from '@/components/pos/CashRegisterModal'
import { formatCRC } from '@/lib/utils'
import toast from 'react-hot-toast'

// ─── Componente principal ─────────────────────────────────────────────────────
export default function POSPage() {
    const {
        cart, searchQuery, selectedCategory,
        addItem, removeItem, updateQty,
        globalDiscount, setGlobalDiscount,
        getTotal, clearCart,
        setSearch, setCategory,
    } = usePOSStore()

    const [showPayment, setShowPayment] = useState(false)
    const [showRegister, setShowRegister] = useState(false)
    const [showDiscountInput, setShowDiscountInput] = useState(false)
    const searchRef = useRef<HTMLInputElement>(null)

    // ── API hooks ──────────────────────────────────────────────────────────────
    const { data: categories = [], isLoading: loadingCats } = useCategories()
    const { data: products = [], isLoading: loadingProds } = useProducts({
        categoryId: selectedCategory !== 'all' ? selectedCategory : undefined,
        search: searchQuery || undefined,
    })
    const { data: register } = useCurrentRegister()
    const createSale = useCreateSale()

    // Foco automático en búsqueda (compatible con lector de código de barras)
    useEffect(() => { searchRef.current?.focus() }, [])

    const itemCount = cart.reduce((a, i) => a + i.quantity, 0)
    const total = getTotal()

    // ── Confirmar venta ────────────────────────────────────────────────────────
    const handleConfirmSale = async (paymentMethod: string, paymentRef?: string) => {
        if (!register) {
            toast.error('Debés abrir la caja primero')
            return
        }

        try {
            const sale = await createSale.mutateAsync({
                cashRegisterId: register.id,
                paymentMethod: paymentMethod.toUpperCase(),
                paymentRef,
                discount: globalDiscount,
                lines: cart.map(item => ({
                    productId: item.product.id,
                    quantity: item.quantity,
                    unitPrice: item.unitPrice,
                    discount: item.discount,
                })),
            })
            toast.success('¡Venta registrada!')
            clearCart()
            return sale  // retornamos la venta para el PDF
        } catch (err: any) {
            toast.error(err.response?.data?.message ?? 'Error al registrar la venta')
            throw err
        }
    }

    // ── Categorías con "Todos" al inicio ───────────────────────────────────────
    const allCategories = [
        { id: 'all', name: 'Todos', emoji: '🏪' },
        ...categories,
    ]

    // ── Pantalla de caja cerrada ───────────────────────────────────────────────
    if (!register) {
        return (
            <div style={{
                flex: 1, display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                gap: '16px', height: '100%', background: 'var(--bg-base)',
            }}>
                <div style={{ fontSize: '56px' }}>🏪</div>
                <h2 style={{ fontSize: '20px', fontWeight: 700 }}>Caja no abierta</h2>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', textAlign: 'center', maxWidth: '280px' }}>
                    Debés abrir la caja para comenzar a registrar ventas
                </p>
                <button
                    className="btn-accent"
                    onClick={() => setShowRegister(true)}
                    style={{ padding: '12px 32px', fontSize: '14px', marginTop: '8px' }}
                >
                    Abrir caja
                </button>
                {showRegister && (
                    <CashRegisterModal onClose={() => setShowRegister(false)} />
                )}
            </div>
        )
    }

    return (
        <div style={{ display: 'flex', height: '100%', overflow: 'hidden' }}>

            {/* ══════════════════════════════════════════════════════════════════════
          Panel izquierdo — Catálogo de productos
      ══════════════════════════════════════════════════════════════════════ */}
            <div style={{
                flex: 1, display: 'flex', flexDirection: 'column',
                borderRight: '1px solid var(--border)', overflow: 'hidden',
            }}>

                {/* ── Barra de búsqueda ── */}
                <div style={{ padding: '14px 18px 10px', borderBottom: '1px solid var(--border)' }}>
                    <div style={{ position: 'relative' }}>
                        <Search
                            size={15}
                            color="var(--text-muted)"
                            style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }}
                        />
                        <input
                            ref={searchRef}
                            className="input-base"
                            value={searchQuery}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Buscar producto o escanear código de barras..."
                            style={{ width: '100%', padding: '10px 36px 10px 38px', fontSize: '14px' }}
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearch('')}
                                style={{
                                    position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                                    background: 'none', border: 'none', cursor: 'pointer', padding: '2px',
                                }}
                            >
                                <X size={14} color="var(--text-muted)" />
                            </button>
                        )}
                    </div>
                </div>

                {/* ── Categorías ── */}
                <div style={{
                    display: 'flex', gap: '6px', padding: '10px 18px',
                    borderBottom: '1px solid var(--border)', overflowX: 'auto', flexShrink: 0,
                }}>
                    {loadingCats ? (
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)', padding: '4px 0' }}>
                            Cargando...
                        </div>
                    ) : allCategories.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => setCategory(cat.id)}
                            style={{
                                padding: '5px 14px', borderRadius: '20px',
                                fontSize: '12px', fontWeight: 500, flexShrink: 0,
                                cursor: 'pointer', transition: 'all 0.15s',
                                background: selectedCategory === cat.id ? 'var(--accent)' : 'var(--bg-overlay)',
                                color: selectedCategory === cat.id ? '#0f1117' : 'var(--text-secondary)',
                                border: selectedCategory === cat.id ? 'none' : '1px solid var(--border)',
                            }}
                        >
                            {cat.emoji} {cat.name}
                        </button>
                    ))}
                </div>

                {/* ── Grid de productos ── */}
                <div style={{
                    flex: 1, overflowY: 'auto', padding: '14px 18px',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
                    gap: '10px', alignContent: 'start',
                }}>
                    {loadingProds ? (
                        <div style={{
                            gridColumn: '1/-1', display: 'flex',
                            justifyContent: 'center', alignItems: 'center', padding: '48px',
                        }}>
                            <Loader
                                size={24}
                                color="var(--text-muted)"
                                style={{ animation: 'spin 1s linear infinite' }}
                            />
                        </div>
                    ) : products.length === 0 ? (
                        <div style={{
                            gridColumn: '1/-1', textAlign: 'center',
                            padding: '48px 0', color: 'var(--text-muted)', fontSize: '14px',
                        }}>
                            {searchQuery
                                ? `Sin resultados para "${searchQuery}"`
                                : 'Sin productos en esta categoría'
                            }
                        </div>
                    ) : (
                        (products as any[]).map((product, i) => {
                            const inCart = cart.find(c => c.product.id === product.id)
                            return (
                                <div
                                    key={product.id}
                                    className="card animate-fade"
                                    onClick={() => addItem({
                                        ...product,
                                        price: Number(product.price),
                                        taxRate: 0,
                                        stock: 99,
                                    })}
                                    style={{
                                        padding: '13px 11px', cursor: 'pointer',
                                        transition: 'all 0.15s', userSelect: 'none',
                                        animationDelay: `${i * 0.02}s`, position: 'relative',
                                        background: inCart ? 'var(--accent-bg)' : 'var(--bg-surface)',
                                        border: `1px solid ${inCart ? 'var(--accent-border)' : 'var(--border)'}`,
                                    }}
                                    onMouseEnter={e => {
                                        const el = e.currentTarget as HTMLDivElement
                                        el.style.transform = 'translateY(-2px)'
                                        el.style.borderColor = inCart ? 'var(--accent)' : 'var(--border-hover)'
                                    }}
                                    onMouseLeave={e => {
                                        const el = e.currentTarget as HTMLDivElement
                                        el.style.transform = 'translateY(0)'
                                        el.style.borderColor = inCart ? 'var(--accent-border)' : 'var(--border)'
                                    }}
                                >
                                    {/* Badge cantidad en carrito */}
                                    {inCart && (
                                        <span style={{
                                            position: 'absolute', top: 7, right: 7,
                                            background: 'var(--accent)', color: '#0f1117',
                                            fontSize: '10px', fontWeight: 700,
                                            borderRadius: '10px', padding: '1px 6px',
                                        }}>
                                            ×{inCart.quantity}
                                        </span>
                                    )}

                                    {/* Emoji categoría */}
                                    <div style={{ fontSize: '22px', marginBottom: '8px' }}>
                                        {product.category?.emoji ?? '🍞'}
                                    </div>

                                    {/* Nombre */}
                                    <div style={{
                                        fontSize: '13px', fontWeight: 500,
                                        lineHeight: '1.3', marginBottom: '6px',
                                    }}>
                                        {product.name}
                                    </div>

                                    {/* SKU */}
                                    <div style={{
                                        fontSize: '10px', color: 'var(--text-muted)',
                                        fontFamily: 'var(--font-mono)', marginBottom: '5px',
                                    }}>
                                        {product.sku}
                                    </div>

                                    {/* Precio */}
                                    <div style={{
                                        fontSize: '15px', fontWeight: 700,
                                        color: 'var(--accent)', fontFamily: 'var(--font-mono)',
                                    }}>
                                        {formatCRC(Number(product.price))}
                                    </div>
                                </div>
                            )
                        })
                    )}
                </div>
            </div>

            {/* ══════════════════════════════════════════════════════════════════════
          Panel derecho — Carrito
      ══════════════════════════════════════════════════════════════════════ */}
            <div style={{
                width: '360px', flexShrink: 0,
                display: 'flex', flexDirection: 'column',
                background: 'var(--bg-surface)',
            }}>

                {/* ── Info de caja ── */}
                <div style={{
                    padding: '10px 16px', borderBottom: '1px solid var(--border)',
                    background: 'var(--bg-elevated)',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }}>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        🏪 <span>{register.user?.name ?? 'Cajero'}</span>
                        <span style={{ color: 'var(--border-hover)' }}>·</span>
                        <span>Caja abierta</span>
                    </div>
                    <span style={{
                        fontSize: '10px', fontWeight: 600,
                        background: 'var(--success-bg)', color: 'var(--success)',
                        padding: '2px 8px', borderRadius: '20px',
                    }}>
                        En línea
                    </span>
                </div>

                {/* ── Header carrito ── */}
                <div style={{
                    padding: '12px 16px', borderBottom: '1px solid var(--border)',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontWeight: 600, fontSize: '15px' }}>Orden actual</span>
                        <span style={{
                            background: 'var(--accent-bg)', color: 'var(--accent)',
                            border: '1px solid var(--accent-border)',
                            fontSize: '10px', fontWeight: 700,
                            padding: '1px 7px', borderRadius: '20px',
                        }}>
                            {itemCount} ítem{itemCount !== 1 ? 's' : ''}
                        </span>
                    </div>
                    {cart.length > 0 && (
                        <button
                            onClick={clearCart}
                            title="Vaciar carrito"
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '3px' }}
                        >
                            <X size={15} />
                        </button>
                    )}
                </div>

                {/* ── Lista de ítems ── */}
                <div style={{
                    flex: 1, overflowY: 'auto', padding: '10px 12px',
                    display: 'flex', flexDirection: 'column', gap: '6px',
                }}>
                    {cart.length === 0 ? (
                        <div style={{
                            flex: 1, display: 'flex', flexDirection: 'column',
                            alignItems: 'center', justifyContent: 'center',
                            gap: '10px', color: 'var(--text-muted)',
                        }}>
                            <span style={{ fontSize: '40px' }}>🛒</span>
                            <span style={{ fontSize: '13px' }}>El carrito está vacío</span>
                            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                                Tocá un producto para agregar
                            </span>
                        </div>
                    ) : (
                        cart.map(item => (
                            <CartItemRow
                                key={item.product.id}
                                item={item}
                                onQty={updateQty}
                                onRemove={removeItem}
                            />
                        ))
                    )}
                </div>

                {/* ── Footer con totales y cobrar ── */}
                <div style={{ borderTop: '1px solid var(--border)', padding: '14px 16px' }}>

                    {/* Descuento global */}
                    <div style={{ marginBottom: '10px' }}>
                        {showDiscountInput ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Tag size={12} color="var(--accent)" />
                                <span style={{ fontSize: '11px', color: 'var(--text-secondary)', flex: 1 }}>
                                    Descuento global
                                </span>
                                <input
                                    type="number" min="0" max="100"
                                    value={globalDiscount}
                                    onChange={e => setGlobalDiscount(Number(e.target.value))}
                                    className="input-base"
                                    style={{ width: '60px', padding: '4px 8px', fontSize: '13px', textAlign: 'center' }}
                                />
                                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>%</span>
                                <button
                                    onClick={() => setShowDiscountInput(false)}
                                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px' }}
                                >
                                    <X size={12} color="var(--text-muted)" />
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={() => setShowDiscountInput(true)}
                                style={{
                                    background: 'none',
                                    border: '1px dashed var(--border)',
                                    borderRadius: 'var(--radius-sm)',
                                    color: 'var(--text-muted)', fontSize: '11px', cursor: 'pointer',
                                    padding: '5px 10px', width: '100%',
                                    display: 'flex', alignItems: 'center', gap: '5px',
                                    transition: 'border-color 0.15s',
                                }}
                            >
                                <Tag size={11} />
                                Agregar descuento global
                                {globalDiscount > 0 && (
                                    <span style={{ color: 'var(--accent)', fontWeight: 600, marginLeft: 'auto' }}>
                                        {globalDiscount}%
                                    </span>
                                )}
                            </button>
                        )}
                    </div>

                    {/* Total */}
                    <div style={{
                        background: 'var(--bg-overlay)', borderRadius: 'var(--radius-md)',
                        padding: '10px 14px', marginBottom: '10px',
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                            <span style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>Total a cobrar</span>
                            <span style={{
                                fontSize: '24px', fontWeight: 700,
                                fontFamily: 'var(--font-mono)', letterSpacing: '-0.5px',
                                color: total > 0 ? 'var(--accent)' : 'var(--text-muted)',
                            }}>
                                {formatCRC(total)}
                            </span>
                        </div>
                        {globalDiscount > 0 && (
                            <div style={{ fontSize: '11px', color: 'var(--accent)', marginTop: '2px', textAlign: 'right' }}>
                                Descuento {globalDiscount}% aplicado
                            </div>
                        )}
                    </div>

                    {/* Botón cobrar */}
                    <button
                        className="btn-accent"
                        disabled={cart.length === 0 || createSale.isPending}
                        onClick={() => setShowPayment(true)}
                        style={{
                            width: '100%', padding: '13px', fontSize: '14px', fontWeight: 600,
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px',
                            opacity: cart.length === 0 ? 0.4 : 1,
                        }}
                    >
                        {createSale.isPending ? (
                            <Loader size={16} style={{ animation: 'spin 1s linear infinite' }} />
                        ) : null}
                        Cobrar
                        {total > 0 && (
                            <span style={{ fontFamily: 'var(--font-mono)' }}>
                                {formatCRC(total)}
                            </span>
                        )}
                        <ChevronRight size={16} />
                    </button>

                    {/* Accesos rápidos por método */}
                    <div style={{ display: 'flex', gap: '5px', marginTop: '7px' }}>
                        {[
                            { icon: Banknote, label: 'Efectivo' },
                            { icon: CreditCard, label: 'Tarjeta' },
                            { icon: Smartphone, label: 'SINPE' },
                        ].map(({ icon: Icon, label }) => (
                            <button
                                key={label}
                                className="btn-ghost"
                                disabled={cart.length === 0}
                                onClick={() => setShowPayment(true)}
                                style={{
                                    flex: 1, padding: '7px 4px', fontSize: '10px', fontWeight: 500,
                                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px',
                                    opacity: cart.length === 0 ? 0.3 : 1,
                                }}
                            >
                                <Icon size={14} />
                                {label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── Modal de pago ── */}
            {showPayment && (
                <PaymentModal
                    total={total}
                    onClose={() => setShowPayment(false)}
                    onConfirm={handleConfirmSale}
                    isLoading={createSale.isPending}
                />
            )}

            <style>{`
        @keyframes spin { to { transform: rotate(360deg) } }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(5px) }
          to   { opacity: 1; transform: translateY(0)   }
        }
      `}</style>
        </div>
    )
}

// ─── CartItemRow ──────────────────────────────────────────────────────────────
function CartItemRow({
    item, onQty, onRemove
}: {
    item: import('@/store/pos.store').CartItem
    onQty: (id: string, qty: number) => void
    onRemove: (id: string) => void
}) {
    return (
        <div
            className="animate-slide"
            style={{
                background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)', padding: '10px 12px',
            }}
        >
            {/* Nombre y precio */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '8px' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                        fontSize: '13px', fontWeight: 500,
                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                    }}>
                        {item.product.name}
                    </div>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '1px' }}>
                        {formatCRC(item.unitPrice)} c/u
                        {item.discount > 0 && (
                            <span style={{ color: 'var(--accent)', marginLeft: 5 }}>
                                −{item.discount}%
                            </span>
                        )}
                    </div>
                </div>
                <span style={{
                    fontFamily: 'var(--font-mono)', fontWeight: 600,
                    fontSize: '14px', flexShrink: 0,
                }}>
                    {formatCRC(item.subtotal)}
                </span>
            </div>

            {/* Controles de cantidad */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>

                    {/* Disminuir */}
                    <button
                        onClick={() => onQty(item.product.id, item.quantity - 1)}
                        style={{
                            width: 26, height: 26, borderRadius: '6px', cursor: 'pointer',
                            background: 'var(--bg-overlay)', border: '1px solid var(--border)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: 'var(--text-secondary)', transition: 'all 0.1s',
                        }}
                        onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border-hover)'}
                        onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border)'}
                    >
                        <Minus size={11} />
                    </button>

                    {/* Cantidad */}
                    <span style={{
                        fontFamily: 'var(--font-mono)', fontWeight: 600,
                        fontSize: '14px', minWidth: '22px', textAlign: 'center',
                    }}>
                        {item.quantity}
                    </span>

                    {/* Aumentar */}
                    <button
                        onClick={() => onQty(item.product.id, item.quantity + 1)}
                        style={{
                            width: 26, height: 26, borderRadius: '6px', cursor: 'pointer',
                            background: 'var(--bg-overlay)', border: '1px solid var(--border)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: 'var(--text-secondary)', transition: 'all 0.1s',
                        }}
                        onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border-hover)'}
                        onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border)'}
                    >
                        <Plus size={11} />
                    </button>
                </div>

                {/* Eliminar */}
                <button
                    onClick={() => onRemove(item.product.id)}
                    style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        color: 'var(--text-muted)', padding: '4px',
                        transition: 'color 0.15s',
                    }}
                    onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.color = 'var(--danger)'}
                    onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-muted)'}
                >
                    <Trash2 size={13} />
                </button>
            </div>
        </div>
    )
}