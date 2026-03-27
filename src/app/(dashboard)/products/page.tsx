'use client'
import { useState, useEffect, FormEvent } from 'react'
import {
    Package, Plus, Search, Tag, Pencil,
    Trash2, X, ChevronDown, AlertCircle, Loader2
} from 'lucide-react'
import { useCurrency } from '@/hooks/useCurrency'

// ── Types ────────────────────────────────────────────────────────────────────
type Unit = 'UNIT' | 'KG' | 'G' | 'L' | 'ML' | 'DOZEN'

interface Category {
    id: string
    name: string
    emoji?: string
    _count?: { products: number }
}

interface Product {
    id: string
    name: string
    sku: string
    description?: string
    price: number
    unit: Unit
    active: boolean
    isProduced: boolean
    categoryId?: string
    category?: Category
}

const UNITS: { value: Unit; label: string }[] = [
    { value: 'UNIT', label: 'Unidad' },
    { value: 'KG', label: 'Kilogramo' },
    { value: 'G', label: 'Gramo' },
    { value: 'L', label: 'Litro' },
    { value: 'ML', label: 'Mililitro' },
    { value: 'DOZEN', label: 'Docena' },
]

const EMPTY_PRODUCT = {
    name: '', sku: '', description: '',
    price: '', unit: 'UNIT' as Unit,
    categoryId: '', isProduced: false,
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function ProductsPage() {
    const { format } = useCurrency()

    const [products, setProducts] = useState<Product[]>([])
    const [categories, setCategories] = useState<Category[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [filterCat, setFilterCat] = useState('')
    const [showProduct, setShowProduct] = useState(false)
    const [showCategory, setShowCategory] = useState(false)
    const [editing, setEditing] = useState<Product | null>(null)

    const load = async () => {
        setLoading(true)
        try {
            const [p, c] = await Promise.all([
                api.get('/products'),
                api.get('/products/categories'),
            ])
            setProducts(p.data)
            setCategories(c.data)
        } catch { }
        setLoading(false)
    }

    useEffect(() => { load() }, [])

    const filtered = products.filter(p => {
        const matchSearch = !search ||
            p.name.toLowerCase().includes(search.toLowerCase()) ||
            p.sku.toLowerCase().includes(search.toLowerCase())
        const matchCat = !filterCat || p.categoryId === filterCat
        return matchSearch && matchCat
    })

    const openEdit = (p: Product) => { setEditing(p); setShowProduct(true) }
    const openNew = () => { setEditing(null); setShowProduct(true) }

    const handleDeactivate = async (id: string) => {
        if (!confirm('¿Desactivar este producto?')) return
        try {
            await api.patch(`/products/${id}`, { active: false })
            load()
        } catch { }
    }

    return (
        <div style={{ padding: '24px', maxWidth: '1100px', margin: '0 auto' }}>

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                        width: 38, height: 38, borderRadius: '10px',
                        background: 'var(--accent-bg)', border: '1px solid var(--accent-border)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        <Package size={18} color="var(--accent)" />
                    </div>
                    <div>
                        <h1 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>Productos</h1>
                        <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>
                            {products.length} productos registrados
                        </p>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                        onClick={() => setShowCategory(true)}
                        className="btn-ghost"
                        style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', fontSize: '13px' }}
                    >
                        <Tag size={14} />
                        Categoría
                    </button>
                    <button
                        onClick={openNew}
                        className="btn-accent"
                        style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', fontSize: '13px' }}
                    >
                        <Plus size={14} />
                        Nuevo producto
                    </button>
                </div>
            </div>

            {/* Filtros */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                <div style={{ position: 'relative', flex: 1 }}>
                    <Search size={14} color="var(--text-muted)" style={{
                        position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)',
                    }} />
                    <input
                        className="input-base"
                        placeholder="Buscar por nombre o SKU..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        style={{ width: '100%', padding: '9px 12px 9px 32px', fontSize: '13px' }}
                    />
                </div>
                <div style={{ position: 'relative' }}>
                    <select
                        className="input-base"
                        value={filterCat}
                        onChange={e => setFilterCat(e.target.value)}
                        style={{ padding: '9px 32px 9px 12px', fontSize: '13px', appearance: 'none', minWidth: '160px' }}
                    >
                        <option value="">Todas las categorías</option>
                        {categories.map(c => (
                            <option key={c.id} value={c.id}>{c.emoji} {c.name}</option>
                        ))}
                    </select>
                    <ChevronDown size={13} color="var(--text-muted)" style={{
                        position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none',
                    }} />
                </div>
            </div>

            {/* Tabla */}
            {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '60px', color: 'var(--text-muted)' }}>
                    <Loader2 size={24} style={{ animation: 'spin 0.8s linear infinite' }} />
                </div>
            ) : filtered.length === 0 ? (
                <div style={{
                    textAlign: 'center', padding: '60px 20px',
                    background: 'var(--bg-surface)', borderRadius: 'var(--radius-lg)',
                    border: '1px solid var(--border)',
                }}>
                    <Package size={36} color="var(--text-muted)" style={{ marginBottom: '12px', opacity: 0.4 }} />
                    <p style={{ color: 'var(--text-muted)', fontSize: '14px', margin: 0 }}>
                        {search || filterCat ? 'No se encontraron productos' : 'No hay productos registrados aún'}
                    </p>
                    {!search && !filterCat && (
                        <button onClick={openNew} className="btn-accent" style={{ marginTop: '16px', padding: '8px 20px', fontSize: '13px' }}>
                            Crear primer producto
                        </button>
                    )}
                </div>
            ) : (
                <div style={{
                    background: 'var(--bg-surface)', border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-lg)', overflow: 'hidden',
                }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--border)' }}>
                                {['Producto', 'SKU', 'Categoría', 'Precio', 'Unidad', 'Tipo', ''].map(h => (
                                    <th key={h} style={{
                                        padding: '10px 16px', textAlign: 'left',
                                        fontSize: '11px', fontWeight: 600,
                                        color: 'var(--text-muted)', letterSpacing: '0.5px',
                                        textTransform: 'uppercase',
                                    }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((p, i) => (
                                <tr key={p.id} style={{
                                    borderBottom: i < filtered.length - 1 ? '1px solid var(--border)' : 'none',
                                    transition: 'background 0.15s',
                                }}
                                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-overlay)')}
                                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                                >
                                    <td style={{ padding: '12px 16px' }}>
                                        <div style={{ fontWeight: 600, fontSize: '13px' }}>{p.name}</div>
                                        {p.description && (
                                            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                                                {p.description}
                                            </div>
                                        )}
                                    </td>
                                    <td style={{ padding: '12px 16px' }}>
                                        <span style={{
                                            fontSize: '11px', fontFamily: 'var(--font-mono)',
                                            background: 'var(--bg-overlay)', padding: '2px 7px',
                                            borderRadius: '4px', color: 'var(--text-secondary)',
                                        }}>{p.sku}</span>
                                    </td>
                                    <td style={{ padding: '12px 16px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                                        {p.category ? `${p.category.emoji ?? ''} ${p.category.name}` : '—'}
                                    </td>
                                    <td style={{ padding: '12px 16px', fontSize: '13px', fontWeight: 600 }}>
                                        ₡{p.price.toLocaleString()}
                                    </td>
                                    <td style={{ padding: '12px 16px', fontSize: '12px', color: 'var(--text-muted)' }}>
                                        {UNITS.find(u => u.value === p.unit)?.label ?? p.unit}
                                    </td>
                                    <td style={{ padding: '12px 16px' }}>
                                        <span style={{
                                            fontSize: '11px', fontWeight: 600, padding: '3px 8px',
                                            borderRadius: '20px',
                                            background: p.isProduced ? 'var(--accent-bg)' : 'var(--bg-overlay)',
                                            color: p.isProduced ? 'var(--accent)' : 'var(--text-muted)',
                                            border: `1px solid ${p.isProduced ? 'var(--accent-border)' : 'var(--border)'}`,
                                        }}>
                                            {p.isProduced ? '🧁 Producido' : '📦 Comprado'}
                                        </span>
                                    </td>
                                    <td style={{ padding: '12px 16px' }}>
                                        <div style={{ display: 'flex', gap: '4px', justifyContent: 'flex-end' }}>
                                            <button
                                                onClick={() => openEdit(p)}
                                                title="Editar"
                                                style={{
                                                    background: 'none', border: 'none', cursor: 'pointer',
                                                    padding: '5px', borderRadius: '6px', color: 'var(--text-muted)',
                                                    display: 'flex', alignItems: 'center',
                                                }}
                                                onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-overlay)')}
                                                onMouseLeave={e => (e.currentTarget.style.background = 'none')}
                                            >
                                                <Pencil size={14} />
                                            </button>
                                            <button
                                                onClick={() => handleDeactivate(p.id)}
                                                title="Desactivar"
                                                style={{
                                                    background: 'none', border: 'none', cursor: 'pointer',
                                                    padding: '5px', borderRadius: '6px', color: 'var(--text-muted)',
                                                    display: 'flex', alignItems: 'center',
                                                }}
                                                onMouseEnter={e => (e.currentTarget.style.color = 'var(--danger)')}
                                                onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modal Producto */}
            {showProduct && (
                <ProductModal
                    product={editing}
                    categories={categories}
                    onClose={() => setShowProduct(false)}
                    onSaved={() => { setShowProduct(false); load() }}
                />
            )}

            {/* Modal Categoría */}
            {showCategory && (
                <CategoryModal
                    onClose={() => setShowCategory(false)}
                    onSaved={() => { setShowCategory(false); load() }}
                />
            )}

            <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
        </div>
    )
}

// ── Modal Producto ────────────────────────────────────────────────────────────
function ProductModal({
    product, categories, onClose, onSaved
}: {
    product: Product | null
    categories: Category[]
    onClose: () => void
    onSaved: () => void
}) {
    const [form, setForm] = useState({
        name: product?.name ?? '',
        sku: product?.sku ?? '',
        description: product?.description ?? '',
        price: product?.price?.toString() ?? '',
        unit: product?.unit ?? 'UNIT' as Unit,
        categoryId: product?.categoryId ?? '',
        isProduced: product?.isProduced ?? false,
    })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }))

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault()
        setError('')
        setLoading(true)
        try {
            const payload = {
                ...form,
                price: parseFloat(form.price),
                categoryId: form.categoryId || undefined,
            }
            if (product) {
                await api.patch(`/products/${product.id}`, payload)
            } else {
                await api.post('/products', payload)
            }
            onSaved()
        } catch (err: any) {
            setError(err.response?.data?.message ?? 'Error al guardar el producto')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 100,
            background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px',
        }}>
            <div style={{
                background: 'var(--bg-surface)', border: '1px solid var(--border)',
                borderRadius: 'var(--radius-xl)', width: '100%', maxWidth: '480px',
                padding: '24px', animation: 'fadeIn 0.2s ease',
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h2 style={{ fontSize: '16px', fontWeight: 700, margin: 0 }}>
                        {product ? 'Editar producto' : 'Nuevo producto'}
                    </h2>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}>
                        <X size={18} />
                    </button>
                </div>

                {error && (
                    <div style={{
                        background: 'var(--danger-bg)', border: '1px solid rgba(248,113,113,0.25)',
                        borderRadius: 'var(--radius-md)', padding: '10px 14px',
                        display: 'flex', gap: '8px', alignItems: 'center',
                        marginBottom: '16px', fontSize: '13px', color: 'var(--danger)',
                    }}>
                        <AlertCircle size={14} />
                        {Array.isArray(error) ? error[0] : error}
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    {/* Nombre */}
                    <div>
                        <label style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                            Nombre *
                        </label>
                        <input
                            required className="input-base"
                            value={form.name} onChange={e => set('name', e.target.value)}
                            placeholder="Pan de yema"
                            style={{ width: '100%', padding: '9px 12px', fontSize: '13px' }}
                        />
                    </div>

                    {/* SKU y Precio */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                        <div>
                            <label style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                                SKU *
                            </label>
                            <input
                                required className="input-base"
                                value={form.sku} onChange={e => set('sku', e.target.value)}
                                placeholder="PAN-001"
                                style={{ width: '100%', padding: '9px 12px', fontSize: '13px' }}
                            />
                        </div>
                        <div>
                            <label style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                                Precio (₡) *
                            </label>
                            <input
                                required type="number" min="0" step="0.01" className="input-base"
                                value={form.price} onChange={e => set('price', e.target.value)}
                                placeholder="500"
                                style={{ width: '100%', padding: '9px 12px', fontSize: '13px' }}
                            />
                        </div>
                    </div>

                    {/* Unidad y Categoría */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                        <div>
                            <label style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                                Unidad *
                            </label>
                            <div style={{ position: 'relative' }}>
                                <select
                                    required className="input-base"
                                    value={form.unit} onChange={e => set('unit', e.target.value)}
                                    style={{ width: '100%', padding: '9px 28px 9px 12px', fontSize: '13px', appearance: 'none' }}
                                >
                                    {UNITS.map(u => <option key={u.value} value={u.value}>{u.label}</option>)}
                                </select>
                                <ChevronDown size={13} color="var(--text-muted)" style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                            </div>
                        </div>
                        <div>
                            <label style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                                Categoría
                            </label>
                            <div style={{ position: 'relative' }}>
                                <select
                                    className="input-base"
                                    value={form.categoryId} onChange={e => set('categoryId', e.target.value)}
                                    style={{ width: '100%', padding: '9px 28px 9px 12px', fontSize: '13px', appearance: 'none' }}
                                >
                                    <option value="">Sin categoría</option>
                                    {categories.map(c => <option key={c.id} value={c.id}>{c.emoji} {c.name}</option>)}
                                </select>
                                <ChevronDown size={13} color="var(--text-muted)" style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                            </div>
                        </div>
                    </div>

                    {/* Descripción */}
                    <div>
                        <label style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                            Descripción
                        </label>
                        <textarea
                            className="input-base"
                            value={form.description} onChange={e => set('description', e.target.value)}
                            placeholder="Descripción opcional..."
                            rows={2}
                            style={{ width: '100%', padding: '9px 12px', fontSize: '13px', resize: 'none' }}
                        />
                    </div>

                    {/* Tipo */}
                    <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                        <input
                            type="checkbox"
                            checked={form.isProduced}
                            onChange={e => set('isProduced', e.target.checked)}
                            style={{ width: 16, height: 16, accentColor: 'var(--accent)' }}
                        />
                        <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                            Producto de producción propia 🧁
                        </span>
                    </label>

                    {/* Botones */}
                    <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                        <button type="button" onClick={onClose} className="btn-ghost" style={{ flex: 1, padding: '10px' }}>
                            Cancelar
                        </button>
                        <button
                            type="submit" disabled={loading} className="btn-accent"
                            style={{ flex: 2, padding: '10px', fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                        >
                            {loading ? <Loader2 size={15} style={{ animation: 'spin 0.8s linear infinite' }} /> : null}
                            {product ? 'Guardar cambios' : 'Crear producto'}
                        </button>
                    </div>
                </form>
            </div>
            <style>{`@keyframes fadeIn { from { opacity:0; transform:translateY(8px) } to { opacity:1; transform:translateY(0) } }`}</style>
        </div>
    )
}

// ── Modal Categoría ───────────────────────────────────────────────────────────
function CategoryModal({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
    const [name, setName] = useState('')
    const [emoji, setEmoji] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault()
        setError('')
        setLoading(true)
        try {
            await api.post('/products/categories', { name, emoji: emoji || undefined })
            onSaved()
        } catch (err: any) {
            setError(err.response?.data?.message ?? 'Error al crear la categoría')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 100,
            background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px',
        }}>
            <div style={{
                background: 'var(--bg-surface)', border: '1px solid var(--border)',
                borderRadius: 'var(--radius-xl)', width: '100%', maxWidth: '360px',
                padding: '24px', animation: 'fadeIn 0.2s ease',
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h2 style={{ fontSize: '16px', fontWeight: 700, margin: 0 }}>Nueva categoría</h2>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}>
                        <X size={18} />
                    </button>
                </div>

                {error && (
                    <div style={{
                        background: 'var(--danger-bg)', border: '1px solid rgba(248,113,113,0.25)',
                        borderRadius: 'var(--radius-md)', padding: '10px 14px',
                        display: 'flex', gap: '8px', alignItems: 'center',
                        marginBottom: '16px', fontSize: '13px', color: 'var(--danger)',
                    }}>
                        <AlertCircle size={14} />
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '64px 1fr', gap: '10px' }}>
                        <div>
                            <label style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                                Emoji
                            </label>
                            <input
                                className="input-base"
                                value={emoji} onChange={e => setEmoji(e.target.value)}
                                placeholder="🍞"
                                style={{ width: '100%', padding: '9px 8px', fontSize: '20px', textAlign: 'center' }}
                            />
                        </div>
                        <div>
                            <label style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                                Nombre *
                            </label>
                            <input
                                required className="input-base"
                                value={name} onChange={e => setName(e.target.value)}
                                placeholder="Panes dulces"
                                style={{ width: '100%', padding: '9px 12px', fontSize: '13px' }}
                            />
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                        <button type="button" onClick={onClose} className="btn-ghost" style={{ flex: 1, padding: '10px' }}>
                            Cancelar
                        </button>
                        <button
                            type="submit" disabled={loading} className="btn-accent"
                            style={{ flex: 2, padding: '10px', fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                        >
                            {loading ? <Loader2 size={15} style={{ animation: 'spin 0.8s linear infinite' }} /> : null}
                            Crear categoría
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}