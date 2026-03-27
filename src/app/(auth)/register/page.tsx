'use client'
import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
    Zap, AlertCircle, CheckCircle,
    Store, User, Phone, MapPin,
    Eye, EyeOff
} from 'lucide-react'
import api from '@/lib/api'

interface Form {
    businessName: string
    ownerName: string
    email: string
    password: string
    confirm: string
    phone: string
    address: string
}

const EMPTY: Form = {
    businessName: '',
    ownerName: '',
    email: '',
    password: '',
    confirm: '',
    phone: '',
    address: '',
}

export default function RegisterPage() {
    const router = useRouter()
    const [form, setForm] = useState<Form>(EMPTY)
    const [showPass, setShowPass] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [done, setDone] = useState(false)
    const [step, setStep] = useState<1 | 2>(1)

    const set = (k: keyof Form, v: string) => setForm(f => ({ ...f, [k]: v }))

    const handleNext = (e: FormEvent) => {
        e.preventDefault()
        if (!form.businessName || !form.ownerName) {
            setError('Completá todos los campos obligatorios')
            return
        }
        setError('')
        setStep(2)
    }

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault()
        setError('')

        if (!form.email || !form.password) {
            setError('Completá todos los campos obligatorios')
            return
        }
        if (form.password.length < 8) {
            setError('La contraseña debe tener al menos 8 caracteres')
            return
        }
        if (form.password !== form.confirm) {
            setError('Las contraseñas no coinciden')
            return
        }

        setLoading(true)
        try {
            await api.post('/tenants/register', {
                businessName: form.businessName,
                ownerName: form.ownerName,
                email: form.email,
                password: form.password,
                phone: form.phone,
                address: form.address,
            })
            setDone(true)
        } catch (err: any) {
            setError(err.response?.data?.message ?? 'Error al registrar el negocio')
        } finally {
            setLoading(false)
        }
    }

    if (done) {
        return (
            <div style={{
                minHeight: '100vh', display: 'flex', alignItems: 'center',
                justifyContent: 'center', background: 'var(--bg-base)', padding: '20px',
            }}>
                <div style={{
                    width: '100%', maxWidth: '400px', textAlign: 'center',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px',
                    animation: 'fadeIn 0.3s ease',
                }}>
                    <div style={{
                        width: 72, height: 72, borderRadius: '50%',
                        background: 'var(--success-bg)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        <CheckCircle size={36} color="var(--success)" />
                    </div>
                    <div>
                        <h2 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '8px' }}>
                            ¡Negocio registrado!
                        </h2>
                        <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: '1.6' }}>
                            Tu cuenta ha sido creada exitosamente.
                            Ya podés iniciar sesión con tu correo y contraseña.
                        </p>
                    </div>
                    <div style={{
                        width: '100%', background: 'var(--bg-surface)',
                        border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)',
                        padding: '16px 20px',
                        display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px',
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: 'var(--text-muted)' }}>Negocio</span>
                            <span style={{ fontWeight: 600 }}>{form.businessName}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: 'var(--text-muted)' }}>Email</span>
                            <span style={{ fontFamily: 'var(--font-mono)' }}>{form.email}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: 'var(--text-muted)' }}>Plan inicial</span>
                            <span style={{ color: 'var(--accent)', fontWeight: 600 }}>Básico (gratis)</span>
                        </div>
                    </div>
                    <button
                        onClick={() => router.push('/login')}
                        className="btn-accent"
                        style={{ width: '100%', padding: '13px', fontSize: '14px' }}
                    >
                        Ir al login
                    </button>
                </div>
                <style>{`@keyframes fadeIn { from { opacity:0; transform:translateY(8px) } to { opacity:1; transform:translateY(0) } }`}</style>
            </div>
        )
    }

    return (
        <div style={{
            minHeight: '100vh', display: 'flex', alignItems: 'center',
            justifyContent: 'center', background: 'var(--bg-base)', padding: '20px',
        }}>
            {/* Background */}
            <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
                <div style={{
                    position: 'absolute', top: '-20%', right: '-10%',
                    width: '500px', height: '500px', borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(96,165,250,0.05) 0%, transparent 70%)',
                }} />
                <div style={{
                    position: 'absolute', bottom: '-20%', left: '-10%',
                    width: '600px', height: '600px', borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(245,166,35,0.05) 0%, transparent 70%)',
                }} />
            </div>

            <div style={{
                width: '100%', maxWidth: '460px',
                position: 'relative', zIndex: 1,
                animation: 'fadeIn 0.3s ease',
            }}>

                {/* Logo */}
                <div style={{ textAlign: 'center', marginBottom: '28px' }}>
                    <div style={{
                        width: 52, height: 52, background: 'var(--accent)',
                        borderRadius: '14px', display: 'inline-flex',
                        alignItems: 'center', justifyContent: 'center',
                        marginBottom: '12px', boxShadow: '0 8px 24px rgba(245,166,35,0.25)',
                    }}>
                        <Zap size={26} color="#0f1117" strokeWidth={2.5} />
                    </div>
                    <h1 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '4px' }}>
                        Registrá tu panadería
                    </h1>
                    <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                        Empezá gratis en minutos — sin tarjeta de crédito
                    </p>
                </div>

                {/* Stepper */}
                <div style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    marginBottom: '24px',
                }}>
                    {[1, 2].map(s => (
                        <div key={s} style={{ display: 'flex', alignItems: 'center', flex: s === 1 ? 1 : undefined }}>
                            <div style={{
                                width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '12px', fontWeight: 700,
                                background: step >= s ? 'var(--accent)' : 'var(--bg-overlay)',
                                color: step >= s ? '#0f1117' : 'var(--text-muted)',
                                border: `1px solid ${step >= s ? 'var(--accent)' : 'var(--border)'}`,
                                transition: 'all 0.2s',
                            }}>
                                {step > s ? '✓' : s}
                            </div>
                            <span style={{
                                marginLeft: '7px', fontSize: '12px', fontWeight: 500,
                                color: step >= s ? 'var(--text-primary)' : 'var(--text-muted)',
                            }}>
                                {s === 1 ? 'Tu negocio' : 'Tu cuenta'}
                            </span>
                            {s === 1 && (
                                <div style={{
                                    flex: 1, height: 1, margin: '0 12px',
                                    background: step > 1 ? 'var(--accent)' : 'var(--border)',
                                    transition: 'background 0.3s',
                                }} />
                            )}
                        </div>
                    ))}
                </div>

                {/* Card */}
                <div style={{
                    background: 'var(--bg-surface)', border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-xl)', padding: '28px',
                }}>

                    {/* Error */}
                    {error && (
                        <div style={{
                            background: 'var(--danger-bg)', border: '1px solid rgba(248,113,113,0.25)',
                            borderRadius: 'var(--radius-md)', padding: '10px 14px',
                            display: 'flex', gap: '8px', alignItems: 'center',
                            marginBottom: '16px', fontSize: '13px', color: 'var(--danger)',
                        }}>
                            <AlertCircle size={14} style={{ flexShrink: 0 }} />
                            {error}
                        </div>
                    )}

                    {/* ── Step 1 — Datos del negocio ── */}
                    {step === 1 && (
                        <form onSubmit={handleNext} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                            <div style={{ marginBottom: '4px' }}>
                                <div style={{ fontWeight: 600, fontSize: '15px', marginBottom: '2px' }}>
                                    Datos del negocio
                                </div>
                                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                                    Información básica de tu panadería o cafetería
                                </div>
                            </div>

                            {/* Nombre del negocio */}
                            <div>
                                <label style={{
                                    fontSize: '12px', fontWeight: 500, color: 'var(--text-secondary)',
                                    display: 'block', marginBottom: '6px',
                                }}>
                                    Nombre del negocio *
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <Store size={14} color="var(--text-muted)" style={{
                                        position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)',
                                    }} />
                                    <input
                                        autoFocus required
                                        className="input-base"
                                        value={form.businessName}
                                        onChange={e => set('businessName', e.target.value)}
                                        placeholder="Panadería La Central"
                                        style={{ width: '100%', padding: '10px 12px 10px 34px', fontSize: '14px' }}
                                    />
                                </div>
                            </div>

                            {/* Nombre del dueño */}
                            <div>
                                <label style={{
                                    fontSize: '12px', fontWeight: 500, color: 'var(--text-secondary)',
                                    display: 'block', marginBottom: '6px',
                                }}>
                                    Tu nombre completo *
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <User size={14} color="var(--text-muted)" style={{
                                        position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)',
                                    }} />
                                    <input
                                        required
                                        className="input-base"
                                        value={form.ownerName}
                                        onChange={e => set('ownerName', e.target.value)}
                                        placeholder="María Rodríguez"
                                        style={{ width: '100%', padding: '10px 12px 10px 34px', fontSize: '14px' }}
                                    />
                                </div>
                            </div>

                            {/* Teléfono y dirección */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                <div>
                                    <label style={{
                                        fontSize: '12px', fontWeight: 500, color: 'var(--text-secondary)',
                                        display: 'block', marginBottom: '6px',
                                    }}>
                                        Teléfono
                                    </label>
                                    <div style={{ position: 'relative' }}>
                                        <Phone size={13} color="var(--text-muted)" style={{
                                            position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)',
                                        }} />
                                        <input
                                            className="input-base"
                                            value={form.phone}
                                            onChange={e => set('phone', e.target.value)}
                                            placeholder="2222-3333"
                                            style={{ width: '100%', padding: '10px 10px 10px 30px', fontSize: '13px' }}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label style={{
                                        fontSize: '12px', fontWeight: 500, color: 'var(--text-secondary)',
                                        display: 'block', marginBottom: '6px',
                                    }}>
                                        Ubicación
                                    </label>
                                    <div style={{ position: 'relative' }}>
                                        <MapPin size={13} color="var(--text-muted)" style={{
                                            position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)',
                                        }} />
                                        <input
                                            className="input-base"
                                            value={form.address}
                                            onChange={e => set('address', e.target.value)}
                                            placeholder="San José, CR"
                                            style={{ width: '100%', padding: '10px 10px 10px 30px', fontSize: '13px' }}
                                        />
                                    </div>
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="btn-accent"
                                style={{
                                    width: '100%', padding: '13px',
                                    fontSize: '14px', marginTop: '4px',
                                }}
                            >
                                Continuar →
                            </button>
                        </form>
                    )}

                    {/* ── Step 2 — Credenciales ── */}
                    {step === 2 && (
                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                            <div style={{ marginBottom: '4px' }}>
                                <div style={{ fontWeight: 600, fontSize: '15px', marginBottom: '2px' }}>
                                    Creá tu cuenta
                                </div>
                                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                                    Con estos datos vas a iniciar sesión
                                </div>
                            </div>

                            {/* Email */}
                            <div>
                                <label style={{
                                    fontSize: '12px', fontWeight: 500, color: 'var(--text-secondary)',
                                    display: 'block', marginBottom: '6px',
                                }}>
                                    Correo electrónico *
                                </label>
                                <input
                                    type="email" autoFocus required
                                    className="input-base"
                                    value={form.email}
                                    onChange={e => set('email', e.target.value)}
                                    placeholder="admin@mipanaderia.cr"
                                    style={{ width: '100%', padding: '10px 14px', fontSize: '14px' }}
                                />
                            </div>

                            {/* Contraseña */}
                            <div>
                                <label style={{
                                    fontSize: '12px', fontWeight: 500, color: 'var(--text-secondary)',
                                    display: 'block', marginBottom: '6px',
                                }}>
                                    Contraseña * (mín. 8 caracteres)
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <input
                                        type={showPass ? 'text' : 'password'}
                                        required
                                        className="input-base"
                                        value={form.password}
                                        onChange={e => set('password', e.target.value)}
                                        placeholder="••••••••"
                                        style={{ width: '100%', padding: '10px 40px 10px 14px', fontSize: '14px' }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPass(v => !v)}
                                        style={{
                                            position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                                            background: 'none', border: 'none', cursor: 'pointer',
                                            color: 'var(--text-muted)', display: 'flex', alignItems: 'center',
                                        }}
                                    >
                                        {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                                    </button>
                                </div>
                            </div>

                            {/* Confirmar */}
                            <div>
                                <label style={{
                                    fontSize: '12px', fontWeight: 500, color: 'var(--text-secondary)',
                                    display: 'block', marginBottom: '6px',
                                }}>
                                    Confirmar contraseña *
                                </label>
                                <input
                                    type="password" required
                                    className="input-base"
                                    value={form.confirm}
                                    onChange={e => set('confirm', e.target.value)}
                                    placeholder="••••••••"
                                    style={{ width: '100%', padding: '10px 14px', fontSize: '14px' }}
                                />
                                {form.confirm && form.password !== form.confirm && (
                                    <div style={{ fontSize: '11px', color: 'var(--danger)', marginTop: '5px' }}>
                                        Las contraseñas no coinciden
                                    </div>
                                )}
                            </div>

                            {/* Plan info */}
                            <div style={{
                                padding: '12px 14px', borderRadius: 'var(--radius-md)',
                                background: 'var(--accent-bg)', border: '1px solid var(--accent-border)',
                                fontSize: '12px', color: 'var(--text-secondary)',
                                display: 'flex', gap: '8px', alignItems: 'flex-start',
                            }}>
                                <Zap size={13} color="var(--accent)" style={{ flexShrink: 0, marginTop: '1px' }} />
                                <span>
                                    Empezás con el <strong style={{ color: 'var(--accent)' }}>plan Básico gratuito</strong>.
                                    Podés actualizar a Pro o Enterprise desde el panel de configuración.
                                </span>
                            </div>

                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button
                                    type="button"
                                    onClick={() => { setStep(1); setError('') }}
                                    className="btn-ghost"
                                    style={{ flex: 1, padding: '12px' }}
                                >
                                    ← Atrás
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading || form.password !== form.confirm}
                                    className="btn-accent"
                                    style={{
                                        flex: 2, padding: '12px', fontSize: '14px',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                                        opacity: loading || (form.confirm && form.password !== form.confirm) ? 0.5 : 1,
                                    }}
                                >
                                    {loading ? (
                                        <>
                                            <span style={{
                                                width: 15, height: 15, borderRadius: '50%',
                                                border: '2px solid rgba(0,0,0,0.2)',
                                                borderTopColor: '#0f1117',
                                                animation: 'spin 0.7s linear infinite',
                                                display: 'inline-block',
                                            }} />
                                            Registrando...
                                        </>
                                    ) : 'Crear cuenta gratis'}
                                </button>
                            </div>
                        </form>
                    )}
                </div>

                {/* Footer */}
                <div style={{
                    textAlign: 'center', fontSize: '11px', color: 'var(--text-muted)',
                    marginTop: '16px', position: 'relative', zIndex: 2,
                }}>
                    ¿Ya tenés cuenta?{' '}
                    <Link href="/login" style={{
                        color: 'var(--accent)', textDecoration: 'none', fontWeight: 500,
                        display: 'inline-block', padding: '4px 2px',
                    }}>
                        Iniciá sesión
                    </Link>
                </div>
            </div>
            <style>{`
        @keyframes spin   { to { transform: rotate(360deg) } }
        @keyframes fadeIn { from { opacity:0; transform:translateY(8px) } to { opacity:1; transform:translateY(0) } }
      `}</style>
        </div>
    )
}