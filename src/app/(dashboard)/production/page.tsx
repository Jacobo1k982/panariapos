'use client'
import { useState } from 'react'
import {
    ChefHat, Plus, X, Search, Play, CheckCircle,
    Clock, AlertTriangle, BookOpen, Layers, Edit2,
    Trash2, ChevronDown, ChevronUp, Package
} from 'lucide-react'
import { useCurrency } from '@/hooks/useCurrency'
import { format } from 'util'

// ─── Tipos ────────────────────────────────────────────────────────────────────
type OrderStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled'

interface RecipeIngredient {
    itemId: string
    itemName: string
    quantity: number
    unit: string
    costUnit: number
}

interface Recipe {
    id: string
    name: string
    category: string
    yield: number
    yieldUnit: string
    ingredients: RecipeIngredient[]
    prepMinutes: number
    notes?: string
}

interface ProductionOrder {
    id: string
    recipeId: string
    recipeName: string
    batches: number
    status: OrderStatus
    scheduledAt: string
    completedAt?: string
    producedQty: number
    notes?: string
}

// ─── Datos demo ───────────────────────────────────────────────────────────────
const DEMO_RECIPES: Recipe[] = [
    {
        id: 'R001', name: 'Pan baguette', category: 'pan',
        yield: 10, yieldUnit: 'unidades', prepMinutes: 120,
        notes: 'Hornear a 220°C por 25 minutos',
        ingredients: [
            { itemId: '1', itemName: 'Harina de trigo', quantity: 1, unit: 'kg', costUnit: 850 },
            { itemId: '3', itemName: 'Levadura seca', quantity: 10, unit: 'g', costUnit: 12 },
            { itemId: '11', itemName: 'Sal', quantity: 0.02, unit: 'kg', costUnit: 380 },
            { itemId: '12', itemName: 'Aceite vegetal', quantity: 0.05, unit: 'l', costUnit: 1200 },
        ],
    },
    {
        id: 'R002', name: 'Croissant mantequilla', category: 'repostería',
        yield: 12, yieldUnit: 'unidades', prepMinutes: 180,
        notes: 'Laminar la masa 3 veces en frío',
        ingredients: [
            { itemId: '1', itemName: 'Harina de trigo', quantity: 0.5, unit: 'kg', costUnit: 850 },
            { itemId: '4', itemName: 'Mantequilla', quantity: 0.25, unit: 'kg', costUnit: 3200 },
            { itemId: '5', itemName: 'Huevos', quantity: 2, unit: 'unit', costUnit: 180 },
            { itemId: '2', itemName: 'Azúcar blanca', quantity: 0.05, unit: 'kg', costUnit: 680 },
            { itemId: '3', itemName: 'Levadura seca', quantity: 7, unit: 'g', costUnit: 12 },
        ],
    },
    {
        id: 'R003', name: 'Pan integral', category: 'pan',
        yield: 8, yieldUnit: 'unidades', prepMinutes: 100,
        ingredients: [
            { itemId: '1', itemName: 'Harina de trigo', quantity: 0.7, unit: 'kg', costUnit: 850 },
            { itemId: '3', itemName: 'Levadura seca', quantity: 8, unit: 'g', costUnit: 12 },
            { itemId: '11', itemName: 'Sal', quantity: 0.015, unit: 'kg', costUnit: 380 },
            { itemId: '6', itemName: 'Leche entera', quantity: 0.2, unit: 'l', costUnit: 750 },
        ],
    },
    {
        id: 'R004', name: 'Torta de chocolate', category: 'repostería',
        yield: 1, yieldUnit: 'torta (8 porciones)', prepMinutes: 90,
        notes: 'Hornear a 180°C por 35 minutos',
        ingredients: [
            { itemId: '1', itemName: 'Harina de trigo', quantity: 0.3, unit: 'kg', costUnit: 850 },
            { itemId: '2', itemName: 'Azúcar blanca', quantity: 0.25, unit: 'kg', costUnit: 680 },
            { itemId: '5', itemName: 'Huevos', quantity: 3, unit: 'unit', costUnit: 180 },
            { itemId: '4', itemName: 'Mantequilla', quantity: 0.15, unit: 'kg', costUnit: 3200 },
            { itemId: '6', itemName: 'Leche entera', quantity: 0.1, unit: 'l', costUnit: 750 },
        ],
    },
]

const DEMO_ORDERS: ProductionOrder[] = [
    { id: 'O001', recipeId: 'R001', recipeName: 'Pan baguette', batches: 2, status: 'completed', scheduledAt: '2024-01-15 06:00', completedAt: '2024-01-15 08:10', producedQty: 20 },
    { id: 'O002', recipeId: 'R002', recipeName: 'Croissant mantequilla', batches: 1, status: 'in_progress', scheduledAt: '2024-01-15 07:00', producedQty: 0 },
    { id: 'O003', recipeId: 'R003', recipeName: 'Pan integral', batches: 3, status: 'pending', scheduledAt: '2024-01-15 09:00', producedQty: 0 },
    { id: 'O004', recipeId: 'R004', recipeName: 'Torta de chocolate', batches: 2, status: 'pending', scheduledAt: '2024-01-15 10:00', producedQty: 0 },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────
function recipeCost(r: Recipe, batches = 1): number {
    return r.ingredients.reduce((acc, i) => acc + i.quantity * i.costUnit * batches, 0)
}

function costPerUnit(r: Recipe): number {
    return recipeCost(r) / r.yield
}

const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; bg: string }> = {
    pending: { label: 'Pendiente', color: 'var(--text-secondary)', bg: 'var(--bg-overlay)' },
    in_progress: { label: 'En proceso', color: 'var(--accent)', bg: 'var(--accent-bg)' },
    completed: { label: 'Completada', color: 'var(--success)', bg: 'var(--success-bg)' },
    cancelled: { label: 'Cancelada', color: 'var(--danger)', bg: 'var(--danger-bg)' },
}

// ─── Componente principal ─────────────────────────────────────────────────────
export default function ProductionPage() {
    const { format } = useCurrency()

    const [tab, setTab] = useState<'orders' | 'recipes'>('orders')
    const [recipes, setRecipes] = useState<Recipe[]>(DEMO_RECIPES)
    const [orders, setOrders] = useState<ProductionOrder[]>(DEMO_ORDERS)
    const [search, setSearch] = useState('')
    const [showOrderModal, setShowOrderModal] = useState(false)
    const [showRecipeModal, setShowRecipeModal] = useState(false)
    const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null)
    const [expandedRecipe, setExpandedRecipe] = useState<string | null>(null)

    const pending = orders.filter(o => o.status === 'pending').length
    const inProgress = orders.filter(o => o.status === 'in_progress').length
    const todayDone = orders.filter(o => o.status === 'completed').length
    const totalProduced = orders.filter(o => o.status === 'completed').reduce((a, o) => a + o.producedQty, 0)

    const updateOrderStatus = (id: string, status: OrderStatus) => {
        setOrders(prev => prev.map(o =>
            o.id === id ? {
                ...o, status,
                completedAt: status === 'completed' ? new Date().toLocaleString('es-CR') : o.completedAt,
                producedQty: status === 'completed'
                    ? (recipes.find(r => r.id === o.recipeId)?.yield ?? 0) * o.batches
                    : o.producedQty,
            } : o
        ))
    }

    const handleNewOrder = (order: ProductionOrder) => {
        setOrders(prev => [...prev, { ...order, id: `O${String(Date.now()).slice(-4)}` }])
        setShowOrderModal(false)
    }

    const handleSaveRecipe = (recipe: Recipe) => {
        setRecipes(prev =>
            editingRecipe
                ? prev.map(r => r.id === recipe.id ? recipe : r)
                : [...prev, { ...recipe, id: `R${String(Date.now()).slice(-4)}` }]
        )
        setShowRecipeModal(false)
        setEditingRecipe(null)
    }

    const filteredOrders = orders.filter(o =>
        o.recipeName.toLowerCase().includes(search.toLowerCase()))
    const filteredRecipes = recipes.filter(r =>
        r.name.toLowerCase().includes(search.toLowerCase()))

    return (
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px', height: '100%', overflow: 'auto' }}>

            {/* ── Stat cards ── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '12px' }}>
                {[
                    { label: 'Pendientes', value: pending, color: 'var(--text-secondary)', icon: <Clock size={15} /> },
                    { label: 'En proceso', value: inProgress, color: 'var(--accent)', icon: <Play size={15} /> },
                    { label: 'Completadas hoy', value: todayDone, color: 'var(--success)', icon: <CheckCircle size={15} /> },
                    { label: 'Uds. producidas', value: totalProduced, color: 'var(--info)', icon: <Package size={15} /> },
                ].map(s => (
                    <div key={s.label} style={{
                        background: 'var(--bg-surface)', border: '1px solid var(--border)',
                        borderRadius: 'var(--radius-lg)', padding: '16px 18px',
                    }}>
                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginBottom: '8px' }}>
                            <span style={{ color: s.color }}>{s.icon}</span>
                            <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 500 }}>{s.label}</span>
                        </div>
                        <div style={{ fontSize: '24px', fontWeight: 700, color: s.color }}>{s.value}</div>
                    </div>
                ))}
            </div>

            {/* ── Tabs + toolbar ── */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '3px', gap: '2px' }}>
                    {(['orders', 'recipes'] as const).map(t => (
                        <button key={t} onClick={() => setTab(t)} style={{
                            padding: '7px 18px', borderRadius: '7px', fontSize: '13px', fontWeight: 500,
                            background: tab === t ? 'var(--bg-overlay)' : 'transparent',
                            color: tab === t ? 'var(--text-primary)' : 'var(--text-muted)',
                            border: tab === t ? '1px solid var(--border-hover)' : '1px solid transparent',
                            cursor: 'pointer', transition: 'all 0.15s',
                        }}>
                            {t === 'orders' ? '📋 Órdenes' : '📖 Recetas'}
                        </button>
                    ))}
                </div>

                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <div style={{ position: 'relative' }}>
                        <Search size={13} color="var(--text-muted)" style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)' }} />
                        <input className="input-base" value={search} onChange={e => setSearch(e.target.value)}
                            placeholder="Buscar..." style={{ padding: '8px 10px 8px 28px', fontSize: '13px', width: '180px' }} />
                    </div>
                    <button
                        onClick={() => tab === 'orders' ? setShowOrderModal(true) : (setEditingRecipe(null), setShowRecipeModal(true))}
                        className="btn-accent"
                        style={{ padding: '9px 16px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                        <Plus size={14} />
                        {tab === 'orders' ? 'Nueva orden' : 'Nueva receta'}
                    </button>
                </div>
            </div>

            {/* ── Contenido según tab ── */}
            {tab === 'orders' ? (
                <OrdersPanel
                    orders={filteredOrders}
                    onStatusChange={updateOrderStatus}
                />
            ) : (
                <RecipesPanel
                    recipes={filteredRecipes}
                    expanded={expandedRecipe}
                    onExpand={id => setExpandedRecipe(id === expandedRecipe ? null : id)}
                    onEdit={r => { setEditingRecipe(r); setShowRecipeModal(true) }}
                    onDelete={id => setRecipes(prev => prev.filter(r => r.id !== id))}
                />
            )}

            {/* ── Modales ── */}
            {showOrderModal && (
                <NewOrderModal
                    recipes={recipes}
                    onSave={handleNewOrder}
                    onClose={() => setShowOrderModal(false)}
                />
            )}
            {showRecipeModal && (
                <RecipeModal
                    recipe={editingRecipe}
                    onSave={handleSaveRecipe}
                    onClose={() => { setShowRecipeModal(false); setEditingRecipe(null) }}
                />
            )}
        </div>
    )
}

// ─── OrdersPanel ──────────────────────────────────────────────────────────────
function OrdersPanel({
    orders, onStatusChange
}: {
    orders: ProductionOrder[]
    onStatusChange: (id: string, s: OrderStatus) => void
}) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {orders.length === 0 && (
                <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)', fontSize: '13px' }}>
                    No hay órdenes de producción
                </div>
            )}
            {orders.map(order => {
                const cfg = STATUS_CONFIG[order.status]
                return (
                    <div key={order.id} style={{
                        background: 'var(--bg-surface)', border: '1px solid var(--border)',
                        borderRadius: 'var(--radius-lg)', padding: '16px 20px',
                        display: 'grid', gridTemplateColumns: '1fr auto',
                        gap: '16px', alignItems: 'center',
                    }}>
                        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', minWidth: 0 }}>
                            {/* Status indicator */}
                            <div style={{
                                width: 42, height: 42, borderRadius: '10px',
                                background: cfg.bg, border: `1px solid ${cfg.color}30`,
                                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                            }}>
                                {order.status === 'completed' ? <CheckCircle size={18} color={cfg.color} /> :
                                    order.status === 'in_progress' ? <Play size={18} color={cfg.color} /> :
                                        order.status === 'cancelled' ? <X size={18} color={cfg.color} /> :
                                            <Clock size={18} color={cfg.color} />}
                            </div>

                            <div style={{ minWidth: 0 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
                                    <span style={{ fontWeight: 600, fontSize: '14px' }}>{order.recipeName}</span>
                                    <span style={{
                                        fontSize: '10px', fontWeight: 600, padding: '2px 7px', borderRadius: '20px',
                                        color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.color}25`,
                                    }}>{cfg.label}</span>
                                </div>
                                <div style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', gap: '14px' }}>
                                    <span>🔢 {order.batches} lote{order.batches !== 1 ? 's' : ''}</span>
                                    <span>🕐 {order.scheduledAt}</span>
                                    {order.completedAt && <span>✅ {order.completedAt}</span>}
                                    {order.producedQty > 0 && <span>📦 {order.producedQty} uds. producidas</span>}
                                </div>
                            </div>
                        </div>

                        {/* Acciones */}
                        <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                            {order.status === 'pending' && (
                                <>
                                    <button onClick={() => onStatusChange(order.id, 'in_progress')}
                                        className="btn-accent" style={{ padding: '7px 14px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                        <Play size={12} /> Iniciar
                                    </button>
                                    <button onClick={() => onStatusChange(order.id, 'cancelled')}
                                        className="btn-ghost" style={{ padding: '7px 10px', fontSize: '12px' }}>
                                        <X size={12} />
                                    </button>
                                </>
                            )}
                            {order.status === 'in_progress' && (
                                <button onClick={() => onStatusChange(order.id, 'completed')}
                                    style={{
                                        padding: '7px 14px', fontSize: '12px', borderRadius: 'var(--radius-md)',
                                        background: 'var(--success-bg)', border: '1px solid rgba(52,211,153,0.3)',
                                        color: 'var(--success)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px',
                                    }}>
                                    <CheckCircle size={12} /> Completar
                                </button>
                            )}
                        </div>
                    </div>
                )
            })}
        </div>
    )
}

// ─── RecipesPanel ─────────────────────────────────────────────────────────────
function RecipesPanel({
    recipes, expanded, onExpand, onEdit, onDelete
}: {
    recipes: Recipe[]
    expanded: string | null
    onExpand: (id: string) => void
    onEdit: (r: Recipe) => void
    onDelete: (id: string) => void
}) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {recipes.map(recipe => {
                const isOpen = expanded === recipe.id
                const total = recipeCost(recipe)
                const perUnit = costPerUnit(recipe)

                return (
                    <div key={recipe.id} style={{
                        background: 'var(--bg-surface)', border: '1px solid var(--border)',
                        borderRadius: 'var(--radius-lg)', overflow: 'hidden',
                        transition: 'border-color 0.15s',
                    }}>
                        {/* Header */}
                        <div
                            onClick={() => onExpand(recipe.id)}
                            style={{
                                padding: '16px 20px', cursor: 'pointer',
                                display: 'grid', gridTemplateColumns: '1fr auto',
                                gap: '12px', alignItems: 'center',
                            }}
                            onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = 'var(--bg-elevated)'}
                            onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = 'transparent'}
                        >
                            <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                                <div style={{
                                    width: 40, height: 40, borderRadius: '10px',
                                    background: 'var(--accent-bg)', border: '1px solid var(--accent-border)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: '20px', flexShrink: 0,
                                }}>
                                    {recipe.category === 'pan' ? '🍞' : recipe.category === 'repostería' ? '🧁' : '🥘'}
                                </div>
                                <div>
                                    <div style={{ fontWeight: 600, fontSize: '14px', marginBottom: '3px' }}>{recipe.name}</div>
                                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', gap: '12px' }}>
                                        <span>🔢 Rinde {recipe.yield} {recipe.yieldUnit}</span>
                                        <span>⏱ {recipe.prepMinutes} min</span>
                                        <span>🧂 {recipe.ingredients.length} ingredientes</span>
                                    </div>
                                </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '2px' }}>Costo/unidad</div>
                                    <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--accent)', fontSize: '15px' }}>
                                        {format(Math.round(perUnit))}
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '4px' }}>
                                    <button onClick={e => { e.stopPropagation(); onEdit(recipe) }}
                                        style={{ background: 'none', border: '1px solid var(--border)', borderRadius: '6px', padding: '5px', cursor: 'pointer', color: 'var(--text-muted)' }}>
                                        <Edit2 size={12} />
                                    </button>
                                    <button onClick={e => { e.stopPropagation(); onDelete(recipe.id) }}
                                        style={{ background: 'none', border: '1px solid transparent', borderRadius: '6px', padding: '5px', cursor: 'pointer', color: 'var(--text-muted)' }}
                                        onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.color = 'var(--danger)'}
                                        onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-muted)'}>
                                        <Trash2 size={12} />
                                    </button>
                                    {isOpen ? <ChevronUp size={16} color="var(--text-muted)" /> : <ChevronDown size={16} color="var(--text-muted)" />}
                                </div>
                            </div>
                        </div>

                        {/* Ingredientes expandidos */}
                        {isOpen && (
                            <div style={{ borderTop: '1px solid var(--border)', padding: '16px 20px', background: 'var(--bg-elevated)' }}>
                                {recipe.notes && (
                                    <div style={{
                                        padding: '10px 14px', borderRadius: 'var(--radius-md)',
                                        background: 'var(--accent-bg)', border: '1px solid var(--accent-border)',
                                        fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '14px',
                                        display: 'flex', gap: '8px', alignItems: 'flex-start',
                                    }}>
                                        <BookOpen size={13} color="var(--accent)" style={{ flexShrink: 0, marginTop: 1 }} />
                                        {recipe.notes}
                                    </div>
                                )}

                                <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '8px', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                                    Ingredientes (1 lote)
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '14px' }}>
                                    {recipe.ingredients.map((ing, i) => (
                                        <div key={i} style={{
                                            display: 'grid', gridTemplateColumns: '1fr auto auto',
                                            gap: '12px', alignItems: 'center',
                                            padding: '8px 12px', borderRadius: 'var(--radius-sm)',
                                            background: 'var(--bg-surface)', border: '1px solid var(--border)',
                                        }}>
                                            <span style={{ fontSize: '13px' }}>{ing.itemName}</span>
                                            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-secondary)' }}>
                                                {ing.quantity} {ing.unit}
                                            </span>
                                            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-muted)' }}>
                                                {format(Math.round(ing.quantity * ing.costUnit))}
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                {/* Resumen de costos */}
                                <div style={{
                                    display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '10px',
                                    padding: '12px', borderRadius: 'var(--radius-md)',
                                    background: 'var(--bg-overlay)', border: '1px solid var(--border)',
                                }}>
                                    {[
                                        { label: 'Costo total lote', value: format(Math.round(total)) },
                                        { label: 'Costo por unidad', value: format(Math.round(perUnit)) },
                                        { label: 'Tiempo preparación', value: `${recipe.prepMinutes} min` },
                                    ].map(s => (
                                        <div key={s.label} style={{ textAlign: 'center' }}>
                                            <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginBottom: '4px' }}>{s.label}</div>
                                            <div style={{ fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--accent)', fontSize: '14px' }}>{s.value}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )
            })}
        </div>
    )
}

// ─── NewOrderModal ────────────────────────────────────────────────────────────
function NewOrderModal({
    recipes, onSave, onClose
}: {
    recipes: Recipe[]
    onSave: (o: ProductionOrder) => void
    onClose: () => void
}) {
    const [recipeId, setRecipeId] = useState(recipes[0]?.id ?? '')
    const [batches, setBatches] = useState(1)
    const [scheduled, setScheduled] = useState('')
    const [notes, setNotes] = useState('')

    const recipe = recipes.find(r => r.id === recipeId)
    const totalQty = (recipe?.yield ?? 0) * batches
    const totalCost = recipe ? recipeCost(recipe, batches) : 0

    const handleSave = () => {
        if (!recipe) return
        onSave({
            id: '', recipeId, recipeName: recipe.name,
            batches, status: 'pending',
            scheduledAt: scheduled || new Date().toLocaleString('es-CR'),
            producedQty: 0, notes,
        })
    }

    return (
        <div style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center',
            justifyContent: 'center', zIndex: 100,
        }}>
            <div className="card animate-pop" style={{ width: 440, padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                    <div style={{ fontWeight: 600, fontSize: '15px' }}>Nueva orden de producción</div>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                        <X size={16} />
                    </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    {/* Receta */}
                    <div>
                        <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Receta</label>
                        <select className="input-base" value={recipeId} onChange={e => setRecipeId(e.target.value)}
                            style={{ width: '100%', padding: '9px 12px', fontSize: '13px', cursor: 'pointer' }}>
                            {recipes.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                        </select>
                    </div>

                    {/* Lotes */}
                    <div>
                        <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                            Cantidad de lotes
                        </label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <button onClick={() => setBatches(b => Math.max(1, b - 1))}
                                style={{ width: 36, height: 36, borderRadius: '8px', background: 'var(--bg-overlay)', border: '1px solid var(--border)', cursor: 'pointer', fontSize: '18px', color: 'var(--text-primary)' }}>
                                −
                            </button>
                            <input type="number" min={1} value={batches} onChange={e => setBatches(Math.max(1, Number(e.target.value)))}
                                className="input-base" style={{ width: 80, padding: '8px', fontSize: '18px', fontFamily: 'var(--font-mono)', fontWeight: 700, textAlign: 'center' }} />
                            <button onClick={() => setBatches(b => b + 1)}
                                style={{ width: 36, height: 36, borderRadius: '8px', background: 'var(--bg-overlay)', border: '1px solid var(--border)', cursor: 'pointer', fontSize: '18px', color: 'var(--text-primary)' }}>
                                +
                            </button>
                            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                                = {totalQty} {recipe?.yieldUnit ?? 'unidades'}
                            </span>
                        </div>
                    </div>

                    {/* Preview costos */}
                    {recipe && (
                        <div style={{
                            display: 'grid', gridTemplateColumns: '1fr 1fr',
                            gap: '8px', padding: '12px', borderRadius: 'var(--radius-md)',
                            background: 'var(--accent-bg)', border: '1px solid var(--accent-border)',
                        }}>
                            <div>
                                <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginBottom: '3px' }}>Costo total</div>
                                <div style={{ fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--accent)' }}>
                                    {format(Math.round(totalCost))}
                                </div>
                            </div>
                            <div>
                                <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginBottom: '3px' }}>Costo/unidad</div>
                                <div style={{ fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--accent)' }}>
                                    {format(Math.round(totalCost / totalQty))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Horario */}
                    <div>
                        <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                            Programar para (opcional)
                        </label>
                        <input type="datetime-local" className="input-base" value={scheduled}
                            onChange={e => setScheduled(e.target.value)}
                            style={{ width: '100%', padding: '9px 12px', fontSize: '13px' }} />
                    </div>

                    {/* Notas */}
                    <div>
                        <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                            Notas (opcional)
                        </label>
                        <textarea className="input-base" value={notes} onChange={e => setNotes(e.target.value)}
                            placeholder="Instrucciones especiales..." rows={2}
                            style={{ width: '100%', padding: '9px 12px', fontSize: '13px', resize: 'vertical' }} />
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '8px', marginTop: '20px' }}>
                    <button onClick={onClose} className="btn-ghost" style={{ flex: 1, padding: '11px' }}>Cancelar</button>
                    <button onClick={handleSave} className="btn-accent" disabled={!recipeId}
                        style={{ flex: 2, padding: '11px', opacity: !recipeId ? 0.4 : 1 }}>
                        Crear orden
                    </button>
                </div>
            </div>
        </div>
    )
}

// ─── RecipeModal ──────────────────────────────────────────────────────────────
function RecipeModal({
    recipe, onSave, onClose
}: {
    recipe: Recipe | null
    onSave: (r: Recipe) => void
    onClose: () => void
}) {
    const [form, setForm] = useState<Recipe>(recipe ?? {
        id: '', name: '', category: 'pan', yield: 1,
        yieldUnit: 'unidades', prepMinutes: 60, ingredients: [], notes: '',
    })

    const setF = (k: keyof Recipe, v: unknown) => setForm(f => ({ ...f, [k]: v }))

    const addIngredient = () => setForm(f => ({
        ...f,
        ingredients: [...f.ingredients, { itemId: '', itemName: '', quantity: 0, unit: 'kg', costUnit: 0 }]
    }))

    const updateIng = (i: number, k: keyof RecipeIngredient, v: string | number) =>
        setForm(f => ({
            ...f,
            ingredients: f.ingredients.map((ing, idx) => idx === i ? { ...ing, [k]: v } : ing)
        }))

    const removeIng = (i: number) =>
        setForm(f => ({ ...f, ingredients: f.ingredients.filter((_, idx) => idx !== i) }))

    return (
        <div style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center',
            justifyContent: 'center', zIndex: 100,
        }}>
            <div className="card animate-pop" style={{ width: 520, padding: '24px', maxHeight: '90vh', overflowY: 'auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                    <div style={{ fontWeight: 600, fontSize: '15px' }}>{recipe ? 'Editar receta' : 'Nueva receta'}</div>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                        <X size={16} />
                    </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {/* Nombre y categoría */}
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '10px' }}>
                        <div>
                            <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '5px' }}>Nombre</label>
                            <input className="input-base" value={form.name} onChange={e => setF('name', e.target.value)}
                                placeholder="Pan baguette" style={{ width: '100%', padding: '9px 12px', fontSize: '13px' }} />
                        </div>
                        <div>
                            <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '5px' }}>Categoría</label>
                            <select className="input-base" value={form.category} onChange={e => setF('category', e.target.value)}
                                style={{ width: '100%', padding: '9px 12px', fontSize: '13px', cursor: 'pointer' }}>
                                <option value="pan">Pan</option>
                                <option value="repostería">Repostería</option>
                                <option value="bebidas">Bebidas</option>
                                <option value="otro">Otro</option>
                            </select>
                        </div>
                    </div>

                    {/* Rendimiento y tiempo */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                        <div>
                            <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '5px' }}>Rendimiento</label>
                            <input type="number" className="input-base" value={form.yield} onChange={e => setF('yield', Number(e.target.value))}
                                style={{ width: '100%', padding: '9px 12px', fontSize: '13px' }} />
                        </div>
                        <div>
                            <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '5px' }}>Unidad</label>
                            <input className="input-base" value={form.yieldUnit} onChange={e => setF('yieldUnit', e.target.value)}
                                placeholder="unidades" style={{ width: '100%', padding: '9px 12px', fontSize: '13px' }} />
                        </div>
                        <div>
                            <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '5px' }}>Tiempo (min)</label>
                            <input type="number" className="input-base" value={form.prepMinutes} onChange={e => setF('prepMinutes', Number(e.target.value))}
                                style={{ width: '100%', padding: '9px 12px', fontSize: '13px' }} />
                        </div>
                    </div>

                    {/* Ingredientes */}
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                            <label style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 500 }}>Ingredientes</label>
                            <button onClick={addIngredient} className="btn-ghost"
                                style={{ padding: '4px 10px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <Plus size={11} /> Agregar
                            </button>
                        </div>

                        {form.ingredients.length === 0 && (
                            <div style={{
                                textAlign: 'center', padding: '20px', color: 'var(--text-muted)', fontSize: '12px',
                                border: '1px dashed var(--border)', borderRadius: 'var(--radius-md)'
                            }}>
                                Sin ingredientes — haz clic en Agregar
                            </div>
                        )}

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            {form.ingredients.map((ing, i) => (
                                <div key={i} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr auto', gap: '6px', alignItems: 'center' }}>
                                    <input className="input-base" value={ing.itemName}
                                        onChange={e => updateIng(i, 'itemName', e.target.value)}
                                        placeholder="Nombre ingrediente" style={{ padding: '7px 9px', fontSize: '12px' }} />
                                    <input type="number" className="input-base" value={ing.quantity || ''}
                                        onChange={e => updateIng(i, 'quantity', Number(e.target.value))}
                                        placeholder="Cant." style={{ padding: '7px 9px', fontSize: '12px' }} />
                                    <select className="input-base" value={ing.unit}
                                        onChange={e => updateIng(i, 'unit', e.target.value)}
                                        style={{ padding: '7px 9px', fontSize: '12px', cursor: 'pointer' }}>
                                        {['kg', 'g', 'l', 'ml', 'unit', 'pack'].map(u => <option key={u} value={u}>{u}</option>)}
                                    </select>
                                    <input type="number" className="input-base" value={ing.costUnit || ''}
                                        onChange={e => updateIng(i, 'costUnit', Number(e.target.value))}
                                        placeholder="₡/u" style={{ padding: '7px 9px', fontSize: '12px' }} />
                                    <button onClick={() => removeIng(i)}
                                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '4px' }}
                                        onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.color = 'var(--danger)'}
                                        onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-muted)'}>
                                        <X size={13} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Notas */}
                    <div>
                        <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '5px' }}>
                            Notas / instrucciones
                        </label>
                        <textarea className="input-base" value={form.notes ?? ''} onChange={e => setF('notes', e.target.value)}
                            placeholder="Temperatura de horno, tiempos, tips..." rows={2}
                            style={{ width: '100%', padding: '9px 12px', fontSize: '13px', resize: 'vertical' }} />
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '8px', marginTop: '20px' }}>
                    <button onClick={onClose} className="btn-ghost" style={{ flex: 1, padding: '11px' }}>Cancelar</button>
                    <button onClick={() => onSave(form)} className="btn-accent" disabled={!form.name}
                        style={{ flex: 2, padding: '11px', opacity: !form.name ? 0.4 : 1 }}>
                        {recipe ? 'Guardar cambios' : 'Crear receta'}
                    </button>
                </div>
            </div>
        </div>
    )
}