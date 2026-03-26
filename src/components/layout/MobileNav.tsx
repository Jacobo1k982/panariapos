'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth.store'
import { useCurrentRegister } from '@/hooks/useCash'
import {
    ShoppingCart, Package, ShoppingBag,
    BarChart3, MoreHorizontal, X,
    ChefHat, Users, Truck, Settings,
    DollarSign, LogOut, Zap, FileText
} from 'lucide-react'
import CashRegisterModal from '@/components/pos/CashRegisterModal'
import CloseCashRegisterModal from '@/components/pos/CloseCashRegisterModal'

// Las 4 rutas principales en la bottom bar
const MAIN_NAV = [
    { href: '/pos', icon: ShoppingCart, label: 'POS' },
    { href: '/products', icon: Package, label: 'Productos' },
    { href: '/sales', icon: ShoppingBag, label: 'Ventas' },
    { href: '/reports', icon: BarChart3, label: 'Reportes' },
]

// El resto en el drawer "Más"
const MORE_NAV = [
    { href: '/inventory', icon: Package, label: 'Inventario' },
    { href: '/production', icon: ChefHat, label: 'Producción' },
    { href: '/customers', icon: Users, label: 'Clientes' },
    { href: '/suppliers', icon: Truck, label: 'Proveedores' },
    { href: '/settings', icon: Settings, label: 'Config' },
    { href: '/quotes', icon: FileText, label: 'Cotizaciones' }
]

export default function MobileNav() {
    const path = usePathname()
    const router = useRouter()
    const { user, logout } = useAuthStore()
    const { data: register } = useCurrentRegister()
    const [showMore, setShowMore] = useState(false)
    const [showOpen, setShowOpen] = useState(false)
    const [showClose, setShowClose] = useState(false)
    const isOpen = !!register

    const handleLogout = async () => {
        setShowMore(false)
        await logout()
        document.cookie = 'access_token=; path=/; max-age=0'
        router.push('/login')
    }

    const isMoreActive = MORE_NAV.some(n => path === n.href || path.startsWith(n.href + '/'))

    return (
        <>
            {/* Bottom bar */}
            <nav style={{
                height: '60px',
                background: 'var(--bg-surface)',
                borderTop: '1px solid var(--border)',
                display: 'flex',
                alignItems: 'center',
                padding: '0 4px',
                paddingBottom: 'env(safe-area-inset-bottom)',
                flexShrink: 0,
                position: 'relative',
                zIndex: 50,
            }}>
                {MAIN_NAV.map(({ href, icon: Icon, label }) => {
                    const active = path === href || path.startsWith(href + '/')
                    return (
                        <Link
                            key={href}
                            href={href}
                            className={`mobile-nav-item${active ? ' active' : ''}`}
                        >
                            <Icon
                                size={19}
                                color={active ? 'var(--accent)' : 'var(--text-muted)'}
                                strokeWidth={active ? 2.2 : 1.8}
                            />
                            <span style={{
                                fontSize: '9px', fontWeight: 600,
                                color: active ? 'var(--accent)' : 'var(--text-muted)',
                            }}>
                                {label}
                            </span>
                        </Link>
                    )
                })}

                {/* Botón "Más" */}
                <button
                    onClick={() => setShowMore(true)}
                    className={`mobile-nav-item${isMoreActive ? ' active' : ''}`}
                    style={{ flex: 1, border: 'none', cursor: 'pointer' }}
                >
                    <MoreHorizontal
                        size={19}
                        color={isMoreActive ? 'var(--accent)' : 'var(--text-muted)'}
                        strokeWidth={1.8}
                    />
                    <span style={{
                        fontSize: '9px', fontWeight: 600,
                        color: isMoreActive ? 'var(--accent)' : 'var(--text-muted)',
                    }}>
                        Más
                    </span>
                </button>
            </nav>

            {/* Drawer "Más" */}
            {showMore && (
                <>
                    {/* Backdrop */}
                    <div
                        onClick={() => setShowMore(false)}
                        style={{
                            position: 'fixed', inset: 0, zIndex: 100,
                            background: 'rgba(0,0,0,0.5)',
                            backdropFilter: 'blur(4px)',
                        }}
                    />

                    {/* Panel */}
                    <div style={{
                        position: 'fixed', bottom: 0, left: 0, right: 0,
                        zIndex: 101,
                        background: 'var(--bg-surface)',
                        borderTop: '1px solid var(--border)',
                        borderRadius: '20px 20px 0 0',
                        padding: '16px 16px calc(16px + env(safe-area-inset-bottom))',
                        animation: 'slideUp 0.25s ease',
                    }}>
                        {/* Handle */}
                        <div style={{
                            width: 36, height: 4, borderRadius: 2,
                            background: 'var(--border-hover)',
                            margin: '0 auto 16px',
                        }} />

                        {/* Header del drawer */}
                        <div style={{
                            display: 'flex', alignItems: 'center',
                            justifyContent: 'space-between', marginBottom: '12px',
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <div style={{
                                    width: 32, height: 32, borderRadius: '50%',
                                    background: 'var(--accent-bg)',
                                    border: '1.5px solid var(--accent-border)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: '13px', fontWeight: 700, color: 'var(--accent)',
                                }}>
                                    {user?.name?.charAt(0).toUpperCase() ?? 'U'}
                                </div>
                                <div>
                                    <div style={{ fontSize: '13px', fontWeight: 600 }}>{user?.name}</div>
                                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{user?.branchName ?? 'Sucursal'}</div>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowMore(false)}
                                style={{
                                    background: 'var(--bg-overlay)', border: '1px solid var(--border)',
                                    borderRadius: '50%', width: 32, height: 32,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    cursor: 'pointer', color: 'var(--text-muted)',
                                }}
                            >
                                <X size={15} />
                            </button>
                        </div>

                        {/* Links */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px' }}>
                            {MORE_NAV.map(({ href, icon: Icon, label }) => {
                                const active = path === href || path.startsWith(href + '/')
                                return (
                                    <Link
                                        key={href}
                                        href={href}
                                        onClick={() => setShowMore(false)}
                                        style={{
                                            display: 'flex', alignItems: 'center', gap: '10px',
                                            padding: '12px 14px',
                                            borderRadius: 'var(--radius-md)',
                                            background: active ? 'var(--accent-bg)' : 'var(--bg-overlay)',
                                            border: `1px solid ${active ? 'var(--accent-border)' : 'transparent'}`,
                                            textDecoration: 'none',
                                        }}
                                    >
                                        <Icon size={17} color={active ? 'var(--accent)' : 'var(--text-secondary)'} strokeWidth={active ? 2.2 : 1.8} />
                                        <span style={{
                                            fontSize: '13px', fontWeight: 500,
                                            color: active ? 'var(--accent)' : 'var(--text-primary)',
                                        }}>
                                            {label}
                                        </span>
                                    </Link>
                                )
                            })}
                        </div>

                        {/* Acciones */}
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                                onClick={() => { setShowMore(false); isOpen ? setShowClose(true) : setShowOpen(true) }}
                                style={{
                                    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                                    padding: '12px', borderRadius: 'var(--radius-md)',
                                    background: isOpen ? 'var(--success-bg)' : 'var(--bg-overlay)',
                                    border: `1px solid ${isOpen ? 'rgba(52,211,153,0.22)' : 'var(--border)'}`,
                                    cursor: 'pointer', fontSize: '13px', fontWeight: 600,
                                    color: isOpen ? 'var(--success)' : 'var(--text-secondary)',
                                }}
                            >
                                <DollarSign size={15} />
                                {isOpen ? 'Cerrar caja' : 'Abrir caja'}
                            </button>
                            <button
                                onClick={handleLogout}
                                style={{
                                    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                                    padding: '12px', borderRadius: 'var(--radius-md)',
                                    background: 'var(--danger-bg)',
                                    border: '1px solid rgba(248,113,113,0.18)',
                                    cursor: 'pointer', fontSize: '13px', fontWeight: 600,
                                    color: 'var(--danger)',
                                }}
                            >
                                <LogOut size={15} />
                                Salir
                            </button>
                        </div>
                    </div>
                </>
            )}

            {showOpen && <CashRegisterModal onClose={() => setShowOpen(false)} />}
            {showClose && register && (
                <CloseCashRegisterModal
                    registerId={register.id}
                    onClose={() => setShowClose(false)}
                    onClosed={() => { setShowClose(false); window.location.reload() }}
                />
            )}
        </>
    )
}
