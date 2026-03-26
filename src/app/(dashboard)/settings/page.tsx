'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useQueryClient } from '@tanstack/react-query'
import {
    Store, Users, CreditCard, Bell, Shield,
    Save, Plus, Check, Printer, ChevronRight,
    ArrowLeft,
} from 'lucide-react'
import { useTenant } from '@/hooks/useTenant'
import api from '@/lib/api'
import toast from 'react-hot-toast'

type SettingsTab = 'business' | 'users' | 'payments' | 'notifications' | 'security' | 'plans'

interface User {
    id: string; name: string; email: string
    role: 'admin' | 'cashier' | 'production'; active: boolean
}

const DEMO_USERS: User[] = [
    { id: 'U001', name: 'Admin Principal', email: 'admin@panaderia.cr', role: 'admin', active: true },
    { id: 'U002', name: 'Juan Cajero', email: 'juan@panaderia.cr', role: 'cashier', active: true },
    { id: 'U003', name: 'Ana Producción', email: 'ana@panaderia.cr', role: 'production', active: true },
    { id: 'U004', name: 'Luis Cajero', email: 'luis@panaderia.cr', role: 'cashier', active: false },
]

const ROLE_CFG = {
    admin:      { label: 'Administrador', color: 'var(--accent)',  bg: 'var(--accent-bg)'  },
    cashier:    { label: 'Cajero',        color: 'var(--info)',    bg: 'var(--info-bg)'    },
    production: { label: 'Producción',    color: 'var(--success)', bg: 'var(--success-bg)' },
}

const PERMISSIONS = {
    admin:      ['Todo el sistema', 'Usuarios y roles', 'Configuración', 'Reportes completos'],
    cashier:    ['Punto de venta', 'Ver clientes', 'Comprobantes', 'Apertura/cierre caja'],
    production: ['Órdenes producción', 'Recetas', 'Inventario materias primas'],
}

const TABS = [
    { id: 'business'      as const, icon: Store,      label: 'Negocio'        },
    { id: 'users'         as const, icon: Users,      label: 'Usuarios'       },
    { id: 'payments'      as const, icon: CreditCard, label: 'Pagos'          },
    { id: 'notifications' as const, icon: Bell,       label: 'Notificaciones' },
    { id: 'security'      as const, icon: Shield,     label: 'Seguridad'      },
    { id: 'plans'         as const, icon: CreditCard, label: 'Planes'         },
]

export default function SettingsPage() {
    const [tab, setTab]           = useState<SettingsTab | null>(null)
    const [mobileView, setMobileView] = useState<'menu' | 'content'>('menu')
    const router = useRouter()

    const handleTabClick = (id: SettingsTab) => {
        if (id === 'plans') { router.push('/settings/plans'); return }
        setTab(id)
        setMobileView('content')
    }

    const handleBack = () => {
        setMobileView('menu')
    }

    const activeTab = tab ?? 'business'

    return (
        <div style={{ display: 'flex', height: '100%', overflow: 'hidden' }}>

            {/* ── Sidebar — desktop siempre visible, móvil solo en 'menu' ── */}
            <div className={`settings-sidebar ${mobileView === 'content' ? 'settings-sidebar--hidden' : ''}`}>
                <div style={{
                    fontSize: '10px', color: 'var(--text-muted)', fontWeight: 600,
                    padding: '0 8px 10px', letterSpacing: '0.5px', textTransform: 'uppercase',
                }}>
                    Configuración
                </div>
                {TABS.map(t => {
                    const Icon = t.icon
                    const active = tab === t.id
                    return (
                        <button
                            key={t.id}
                            onClick={() => handleTabClick(t.id)}
                            style={{
                                width: '100%', padding: '10px 10px', borderRadius: 'var(--radius-md)',
                                background: active ? 'var(--bg-overlay)' : 'transparent',
                                border: active ? '1px solid var(--border-hover)' : '1px solid transparent',
                                color: active ? 'var(--text-primary)' : 'var(--text-muted)',
                                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px',
                                fontSize: '13px', fontWeight: active ? 500 : 400,
                                transition: 'all 0.15s', textAlign: 'left', fontFamily: 'var(--font-sans)',
                            }}
                        >
                            <Icon size={15} color={active ? 'var(--accent)' : 'var(--text-muted)'} />
                            <span style={{ flex: 1 }}>{t.label}</span>
                            {t.id === 'plans'
                                ? <ChevronRight size={13} color="var(--text-muted)" />
                                : <ChevronRight size={13} color="var(--text-muted)" className="hide-desktop" />
                            }
                        </button>
                    )
                })}
            </div>

            {/* ── Contenido — desktop siempre visible, móvil solo en 'content' ── */}
            <div className={`settings-content ${mobileView === 'menu' ? 'settings-content--hidden' : ''}`}>
                {/* Back button — solo móvil */}
                <button
                    onClick={handleBack}
                    className="hide-desktop"
                    style={{
                        display: 'flex', alignItems: 'center', gap: '6px',
                        background: 'none', border: 'none', cursor: 'pointer',
                        color: 'var(--text-muted)', fontSize: '13px', fontWeight: 500,
                        padding: '0 0 16px', fontFamily: 'var(--font-sans)',
                    }}
                >
                    <ArrowLeft size={15} /> Configuración
                </button>

                {activeTab === 'business'      && <BusinessSettings />}
                {activeTab === 'users'         && <UsersSettings />}
                {activeTab === 'payments'      && <PaymentsSettings />}
                {activeTab === 'notifications' && <NotificationsSettings />}
                {activeTab === 'security'      && <SecuritySettings />}
            </div>

            <style>{`
                .settings-sidebar {
                    width: 210px;
                    flex-shrink: 0;
                    background: var(--bg-surface);
                    border-right: 1px solid var(--border);
                    padding: 16px 10px;
                    display: flex;
                    flex-direction: column;
                    gap: 2px;
                    overflow-y: auto;
                }
                .settings-content {
                    flex: 1;
                    overflow-y: auto;
                    padding: clamp(16px, 3vw, 28px);
                }
                @media (max-width: 767px) {
                    .settings-sidebar {
                        width: 100%;
                        border-right: none;
                        border-bottom: 1px solid var(--border);
                    }
                    .settings-sidebar--hidden { display: none; }
                    .settings-content--hidden { display: none; }
                    .settings-content { width: 100%; }
                }
                @media (min-width: 768px) {
                    .settings-sidebar--hidden { display: flex !important; }
                    .settings-content--hidden { display: block !important; }
                }
                @keyframes spin { to { transform: rotate(360deg) } }
            `}</style>
        </div>
    )
}

// ─── BusinessSettings ─────────────────────────────────────────────────────────
function BusinessSettings() {
    const qc = useQueryClient()
    const { data: tenant, isLoading } = useTenant()
    const [saving, setSaving] = useState(false)
    const [saved, setSaved]   = useState(false)
    const [logoPreview, setLogoPreview] = useState('')
    const [form, setForm] = useState({
        name: '', slogan: '', phone: '', address: '',
        timezone: 'America/Costa_Rica', logoUrl: '', receiptMsg: '',
    })

    useEffect(() => {
        if (tenant) {
            setForm({
                name:       tenant.name       ?? '',
                slogan:     tenant.slogan     ?? '',
                phone:      tenant.phone      ?? '',
                address:    tenant.address    ?? '',
                timezone:   tenant.timezone   ?? 'America/Costa_Rica',
                logoUrl:    tenant.logoUrl    ?? '',
                receiptMsg: tenant.receiptMsg ?? '',
            })
            if (tenant.logoUrl) setLogoPreview(tenant.logoUrl)
        }
    }, [tenant])

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return
        if (file.size > 2 * 1024 * 1024) { alert('Máximo 2MB'); return }
        const reader = new FileReader()
        reader.onloadend = () => {
            const b64 = reader.result as string
            setLogoPreview(b64)
            setForm(f => ({ ...f, logoUrl: b64 }))
        }
        reader.readAsDataURL(file)
    }

    const handleSave = async () => {
        setSaving(true)
        try {
            await api.patch('/tenants/me', form)
            await qc.invalidateQueries({ queryKey: ['tenant'] })
            setSaved(true)
            toast.success('Cambios guardados')
            setTimeout(() => setSaved(false), 2000)
        } catch (err: any) {
            toast.error(err.response?.data?.message ?? 'Error al guardar')
        } finally { setSaving(false) }
    }

    if (isLoading) return <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>Cargando...</div>

    return (
        <div style={{ maxWidth: 560 }}>
            <SectionHeader title="Información del negocio" sub="Datos que aparecen en los comprobantes" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

                {/* Logo */}
                <div>
                    <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px', fontWeight: 500 }}>
                        Logo del negocio
                    </label>
                    <label htmlFor="logo-upload" style={{
                        border: `2px dashed ${logoPreview ? 'var(--accent-border)' : 'var(--border-hover)'}`,
                        borderRadius: 'var(--radius-lg)', padding: '20px', textAlign: 'center',
                        cursor: 'pointer', display: 'block',
                        background: logoPreview ? 'var(--accent-bg)' : 'var(--bg-elevated)',
                        transition: 'all 0.15s',
                    }}>
                        {logoPreview ? (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                                <img src={logoPreview} alt="Logo" style={{ width: 72, height: 72, objectFit: 'contain', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'var(--bg-surface)' }} />
                                <span style={{ fontSize: '11px', color: 'var(--accent)' }}>Click para cambiar</span>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                                <div style={{ fontSize: '28px' }}>🏪</div>
                                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Click para subir logo</div>
                                <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>PNG, JPG — máx 2MB</div>
                            </div>
                        )}
                    </label>
                    <input id="logo-upload" type="file" accept="image/*" onChange={handleLogoChange} style={{ display: 'none' }} />
                    {logoPreview && (
                        <button onClick={() => { setLogoPreview(''); setForm(f => ({ ...f, logoUrl: '' })) }}
                            style={{ marginTop: '6px', width: '100%', padding: '6px', background: 'none', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', cursor: 'pointer', fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-sans)' }}>
                            Eliminar logo
                        </button>
                    )}
                </div>

                <FieldRow label="Nombre del negocio">
                    <input className="input-base" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} style={{ padding: '9px 12px', fontSize: '13px' }} />
                </FieldRow>

                <FieldRow label="Slogan (opcional)">
                    <input className="input-base" value={form.slogan} onChange={e => setForm({ ...form, slogan: e.target.value })} style={{ padding: '9px 12px', fontSize: '13px' }} />
                </FieldRow>

                {/* Teléfono y zona horaria — stack en móvil */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
                    <FieldRow label="Teléfono">
                        <input className="input-base" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} style={{ padding: '9px 12px', fontSize: '13px' }} />
                    </FieldRow>
                    <FieldRow label="Zona horaria">
                        <select className="input-base" value={form.timezone} onChange={e => setForm({ ...form, timezone: e.target.value })} style={{ padding: '9px 12px', fontSize: '13px', cursor: 'pointer' }}>
                            <option value="America/Costa_Rica">Costa Rica (GMT-6)</option>
                            <option value="America/Mexico_City">México (GMT-6)</option>
                            <option value="America/Bogota">Colombia (GMT-5)</option>
                        </select>
                    </FieldRow>
                </div>

                <FieldRow label="Dirección">
                    <input className="input-base" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} style={{ padding: '9px 12px', fontSize: '13px' }} />
                </FieldRow>

                <Divider label="Comprobante de venta" />

                <FieldRow label="Mensaje en pie de ticket">
                    <textarea className="input-base" value={form.receiptMsg} onChange={e => setForm({ ...form, receiptMsg: e.target.value })} rows={2} style={{ padding: '9px 12px', fontSize: '13px', resize: 'vertical' }} />
                </FieldRow>

                {/* Preview ticket */}
                <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '16px', fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-secondary)', lineHeight: '1.8' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                        <Printer size={12} color="var(--text-muted)" />
                        <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Vista previa del ticket</span>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        {logoPreview && <img src={logoPreview} alt="Logo" style={{ width: 48, height: 48, objectFit: 'contain', borderRadius: '6px', display: 'block', margin: '0 auto 6px' }} />}
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{form.name || 'Nombre del negocio'}</div>
                        <div>{form.slogan}</div>
                        <div>{form.phone}</div>
                        <div style={{ borderTop: '1px dashed var(--border-hover)', margin: '6px 0', paddingTop: '6px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Pan baguette x1</span><span>₡850</span></div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Café x1</span><span>₡1.500</span></div>
                        </div>
                        <div style={{ borderTop: '1px dashed var(--border-hover)', paddingTop: '6px', fontWeight: 600, color: 'var(--text-primary)', display: 'flex', justifyContent: 'space-between' }}>
                            <span>TOTAL</span><span>₡2.350</span>
                        </div>
                        <div style={{ marginTop: '6px', fontSize: '10px' }}>{form.receiptMsg || 'Gracias por su compra'}</div>
                    </div>
                </div>

                {tenant && (form.name !== (tenant.name ?? '') || form.slogan !== (tenant.slogan ?? '') || form.phone !== (tenant.phone ?? '') || form.address !== (tenant.address ?? '') || form.receiptMsg !== (tenant.receiptMsg ?? '') || form.logoUrl !== (tenant.logoUrl ?? '')) && (
                    <div style={{ padding: '8px 12px', borderRadius: 'var(--radius-md)', background: 'var(--accent-bg)', border: '1px solid var(--accent-border)', fontSize: '11px', color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        ⚠ Tenés cambios sin guardar
                    </div>
                )}

                <button onClick={handleSave} disabled={saving} className="btn-accent" style={{ padding: '11px', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px', opacity: saving ? 0.6 : 1 }}>
                    {saving ? <><Spinner /> Guardando...</> : saved ? <><Check size={15} /> Guardado</> : <><Save size={15} /> Guardar cambios</>}
                </button>
            </div>
        </div>
    )
}

// ─── UsersSettings ────────────────────────────────────────────────────────────
function UsersSettings() {
    const [users, setUsers] = useState<User[]>(DEMO_USERS)
    const [showForm, setShowForm] = useState(false)
    const [newUser, setNewUser] = useState({ name: '', email: '', role: 'cashier' as User['role'] })

    const toggleActive = (id: string) => setUsers(prev => prev.map(u => u.id === id ? { ...u, active: !u.active } : u))

    const addUser = () => {
        if (!newUser.name || !newUser.email) return
        setUsers(prev => [...prev, { ...newUser, id: `U${Date.now()}`, active: true }])
        setNewUser({ name: '', email: '', role: 'cashier' })
        setShowForm(false)
    }

    return (
        <div style={{ maxWidth: 600 }}>
            <SectionHeader title="Usuarios y roles" sub="Gestión de acceso al sistema" />

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                {users.map(u => {
                    const cfg = ROLE_CFG[u.role]
                    return (
                        <div key={u.id} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '12px 14px', display: 'flex', alignItems: 'center', gap: '10px', opacity: u.active ? 1 : 0.5 }}>
                            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--bg-overlay)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)' }}>
                                {u.name.split(' ').slice(0,2).map(w => w[0]).join('').toUpperCase()}
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px', flexWrap: 'wrap' }}>
                                    <span style={{ fontWeight: 600, fontSize: '13px' }}>{u.name}</span>
                                    <span style={{ fontSize: '10px', fontWeight: 600, padding: '1px 7px', borderRadius: '20px', color: cfg.color, background: cfg.bg, whiteSpace: 'nowrap' }}>{cfg.label}</span>
                                </div>
                                <div style={{ fontSize: '11px', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.email}</div>
                            </div>
                            <button onClick={() => toggleActive(u.id)} style={{ padding: '4px 8px', borderRadius: 'var(--radius-sm)', fontSize: '11px', fontWeight: 500, background: u.active ? 'var(--danger-bg)' : 'var(--success-bg)', border: `1px solid ${u.active ? 'rgba(248,113,113,0.3)' : 'rgba(52,211,153,0.3)'}`, color: u.active ? 'var(--danger)' : 'var(--success)', cursor: 'pointer', flexShrink: 0, fontFamily: 'var(--font-sans)' }}>
                                {u.active ? 'Desactivar' : 'Activar'}
                            </button>
                        </div>
                    )
                })}
            </div>

            {showForm ? (
                <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '10px' }}>
                        <input className="input-base" placeholder="Nombre completo" value={newUser.name} onChange={e => setNewUser({ ...newUser, name: e.target.value })} style={{ padding: '9px 12px', fontSize: '13px' }} />
                        <input className="input-base" placeholder="Correo electrónico" value={newUser.email} onChange={e => setNewUser({ ...newUser, email: e.target.value })} style={{ padding: '9px 12px', fontSize: '13px' }} />
                    </div>
                    <select className="input-base" value={newUser.role} onChange={e => setNewUser({ ...newUser, role: e.target.value as User['role'] })} style={{ padding: '9px 12px', fontSize: '13px', cursor: 'pointer' }}>
                        <option value="cashier">Cajero</option>
                        <option value="production">Producción</option>
                        <option value="admin">Administrador</option>
                    </select>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button onClick={() => setShowForm(false)} className="btn-ghost" style={{ flex: 1, padding: '9px' }}>Cancelar</button>
                        <button onClick={addUser} className="btn-accent" style={{ flex: 2, padding: '9px' }}>Crear usuario</button>
                    </div>
                </div>
            ) : (
                <button onClick={() => setShowForm(true)} className="btn-ghost" style={{ width: '100%', padding: '10px', fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                    <Plus size={14} /> Invitar usuario
                </button>
            )}

            <Divider label="Permisos por rol" />

            {/* Permisos — 1 col en móvil, 3 en desktop */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '10px' }}>
                {Object.entries(ROLE_CFG).map(([role, cfg]) => (
                    <div key={role} style={{ background: 'var(--bg-surface)', border: `1px solid ${cfg.color}25`, borderRadius: 'var(--radius-lg)', padding: '14px' }}>
                        <div style={{ fontSize: '11px', fontWeight: 700, color: cfg.color, marginBottom: '10px', padding: '2px 8px', background: cfg.bg, borderRadius: '20px', display: 'inline-block' }}>
                            {cfg.label}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                            {PERMISSIONS[role as keyof typeof PERMISSIONS].map(p => (
                                <div key={p} style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'flex', gap: '6px', alignItems: 'center' }}>
                                    <Check size={10} color={cfg.color} /> {p}
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

// ─── PaymentsSettings ─────────────────────────────────────────────────────────
function PaymentsSettings() {
    const [methods, setMethods] = useState({ cash: true, card: true, sinpe: true, transfer: true, credit: true })
    const [sinpeNumber, setSinpeNumber] = useState('8888-1234')
    const [saved, setSaved] = useState(false)

    return (
        <div style={{ maxWidth: 500 }}>
            <SectionHeader title="Métodos de pago" sub="Configurá qué métodos acepta tu negocio" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
                {[
                    { key: 'cash',     label: 'Efectivo',      sub: 'Sin configuración adicional' },
                    { key: 'card',     label: 'Tarjeta',       sub: 'Requiere terminal física' },
                    { key: 'sinpe',    label: 'SINPE Móvil',   sub: `Número: ${sinpeNumber}` },
                    { key: 'transfer', label: 'Transferencia', sub: 'IBAN: CR04 0152 0200 1026 2840 66' },
                    { key: 'credit',   label: 'Fiado / Crédito', sub: 'Solo clientes con límite autorizado' },
                ].map(m => (
                    <div key={m.key} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '12px 14px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 500, fontSize: '13px', marginBottom: '2px' }}>{m.label}</div>
                            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{m.sub}</div>
                        </div>
                        <Toggle value={methods[m.key as keyof typeof methods]} onChange={v => setMethods(prev => ({ ...prev, [m.key]: v }))} />
                    </div>
                ))}
            </div>

            {methods.sinpe && (
                <>
                    <Divider label="Configuración SINPE Móvil" />
                    <FieldRow label="Número de teléfono SINPE">
                        <input className="input-base" value={sinpeNumber} onChange={e => setSinpeNumber(e.target.value)} placeholder="8888-1234" style={{ padding: '9px 12px', fontSize: '13px', fontFamily: 'var(--font-mono)' }} />
                    </FieldRow>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '6px', marginBottom: '16px' }}>
                        Este número aparecerá en el comprobante para que el cliente realice la transferencia.
                    </div>
                </>
            )}

            <button onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 2000) }} className="btn-accent" style={{ padding: '11px', width: '100%', marginTop: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px' }}>
                {saved ? <><Check size={15} /> Guardado</> : <><Save size={15} /> Guardar configuración</>}
            </button>
        </div>
    )
}

// ─── NotificationsSettings ────────────────────────────────────────────────────
function NotificationsSettings() {
    const [notifs, setNotifs] = useState({ lowStock: true, expiry: true, dailySummary: false, creditOverdue: true, newSale: false })

    return (
        <div style={{ maxWidth: 500 }}>
            <SectionHeader title="Notificaciones" sub="Configurá qué alertas recibir en el sistema" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {[
                    { key: 'lowStock',      label: 'Stock bajo',           sub: 'Cuando un ítem baje del mínimo configurado' },
                    { key: 'expiry',        label: 'Próximos a vencer',    sub: 'Alertas 7 días antes del vencimiento' },
                    { key: 'dailySummary',  label: 'Resumen diario',       sub: 'Reporte del día al cerrar caja' },
                    { key: 'creditOverdue', label: 'Fiado vencido',        sub: 'Clientes con crédito sin pago por más de 30 días' },
                    { key: 'newSale',       label: 'Notif. por cada venta', sub: 'Recomendado solo en bajo volumen' },
                ].map(n => (
                    <div key={n.key} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '12px 14px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 500, fontSize: '13px', marginBottom: '2px' }}>{n.label}</div>
                            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{n.sub}</div>
                        </div>
                        <Toggle value={notifs[n.key as keyof typeof notifs]} onChange={v => setNotifs(prev => ({ ...prev, [n.key]: v }))} />
                    </div>
                ))}
            </div>
        </div>
    )
}

// ─── SecuritySettings ─────────────────────────────────────────────────────────
function SecuritySettings() {
    const [form, setForm] = useState({ current: '', next: '', confirm: '' })
    const [saved, setSaved] = useState(false)

    const sessions = [
        { device: 'Chrome · Windows', location: 'San José, CR', date: 'Hoy', current: true },
        { device: 'Safari · iPhone 14', location: 'San José, CR', date: 'Ayer 19:15', current: false },
    ]

    const handleSave = () => {
        if (!form.current || !form.next) return
        if (form.next !== form.confirm) { alert('Las contraseñas no coinciden'); return }
        setSaved(true)
        setForm({ current: '', next: '', confirm: '' })
        setTimeout(() => setSaved(false), 2000)
    }

    return (
        <div style={{ maxWidth: 500 }}>
            <SectionHeader title="Seguridad" sub="Contraseña y sesiones activas" />
            <Divider label="Cambiar contraseña" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
                {[{ key: 'current', label: 'Contraseña actual' }, { key: 'next', label: 'Nueva contraseña' }, { key: 'confirm', label: 'Confirmar contraseña' }].map(f => (
                    <FieldRow key={f.key} label={f.label}>
                        <input type="password" className="input-base" value={form[f.key as keyof typeof form]} onChange={e => setForm({ ...form, [f.key]: e.target.value })} style={{ padding: '9px 12px', fontSize: '13px' }} />
                    </FieldRow>
                ))}
                <button onClick={handleSave} className="btn-accent" style={{ padding: '11px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px' }}>
                    {saved ? <><Check size={15} /> Actualizada</> : <><Shield size={15} /> Actualizar contraseña</>}
                </button>
            </div>

            <Divider label="Sesiones activas" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {sessions.map((s, i) => (
                    <div key={i} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '12px 14px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px', flexWrap: 'wrap' }}>
                                <span style={{ fontWeight: 500, fontSize: '13px' }}>{s.device}</span>
                                {s.current && <span style={{ fontSize: '10px', background: 'var(--success-bg)', color: 'var(--success)', padding: '1px 6px', borderRadius: '20px', fontWeight: 600 }}>Sesión actual</span>}
                            </div>
                            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{s.location} · {s.date}</div>
                        </div>
                        {!s.current && (
                            <button style={{ background: 'var(--danger-bg)', border: '1px solid rgba(248,113,113,0.3)', color: 'var(--danger)', borderRadius: 'var(--radius-sm)', padding: '4px 10px', fontSize: '11px', cursor: 'pointer', fontFamily: 'var(--font-sans)' }}>
                                Cerrar
                            </button>
                        )}
                    </div>
                ))}
            </div>
        </div>
    )
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function SectionHeader({ title, sub }: { title: string; sub: string }) {
    return (
        <div style={{ marginBottom: '20px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '4px' }}>{title}</h2>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{sub}</p>
        </div>
    )
}

function Divider({ label }: { label: string }) {
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '18px 0 14px' }}>
            <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
            <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{label}</span>
            <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
        </div>
    )
}

function FieldRow({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div>
            <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '5px', fontWeight: 500 }}>{label}</label>
            {children}
        </div>
    )
}

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
    return (
        <div onClick={() => onChange(!value)} style={{ width: 40, height: 22, borderRadius: 11, cursor: 'pointer', flexShrink: 0, background: value ? 'var(--accent)' : 'var(--bg-overlay)', border: `1px solid ${value ? 'var(--accent-dim)' : 'var(--border-hover)'}`, position: 'relative', transition: 'all 0.2s' }}>
            <div style={{ position: 'absolute', top: 2, left: value ? 19 : 2, width: 16, height: 16, borderRadius: '50%', background: value ? '#0f1117' : 'var(--text-muted)', transition: 'left 0.2s' }} />
        </div>
    )
}

function Spinner() {
    return <span style={{ width: 14, height: 14, borderRadius: '50%', border: '2px solid rgba(0,0,0,0.2)', borderTopColor: '#0f1117', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} />
}
