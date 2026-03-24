'use client'
import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuthStore } from '@/store/auth.store'
import { Eye, EyeOff, Zap, AlertCircle, ShieldCheck } from 'lucide-react'

export default function LoginPage() {
    const router = useRouter()
    const login = useAuthStore(s => s.login)
    const isLoading = useAuthStore(s => s.isLoading)

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPass, setShowPass] = useState(false)
    const [error, setError] = useState('')

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault()
        setError('')
        try {
            await login(email, password)
            const token = localStorage.getItem('access_token')
            if (token) document.cookie = `access_token=${token}; path=/; max-age=${60 * 60 * 24 * 7}`
            router.push('/pos')
        } catch (err: any) {
            setError(err.message)
        }
    }

    return (
        <div style={{
            minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'var(--bg-base)', padding: '20px',
        }}>
            {/* Background decoration */}
            <div style={{
                position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0,
            }}>
                <div style={{
                    position: 'absolute', top: '-20%', left: '-10%',
                    width: '600px', height: '600px', borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(245,166,35,0.06) 0%, transparent 70%)',
                }} />
                <div style={{
                    position: 'absolute', bottom: '-20%', right: '-10%',
                    width: '500px', height: '500px', borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(96,165,250,0.05) 0%, transparent 70%)',
                }} />
            </div>

            <div style={{
                width: '100%', maxWidth: '400px', position: 'relative', zIndex: 1,
                animation: 'fadeIn 0.3s ease',
            }}>
                {/* Logo */}
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <div style={{
                        width: 52, height: 52,
                        background: 'var(--accent)', borderRadius: '14px',
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        marginBottom: '14px', boxShadow: '0 8px 24px rgba(245,166,35,0.3)',
                    }}>
                        <Zap size={26} color="#0f1117" strokeWidth={2.5} />
                    </div>
                    <h1 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '4px' }}>PanariaPOS</h1>
                    <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Sistema de punto de venta <br /> by JACANA-DEV </p>
                </div>

                {/* Card */}
                <div style={{
                    background: 'var(--bg-surface)', border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-xl)', padding: '32px',
                }}>
                    <h2 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '6px' }}>Iniciar sesión</h2>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '24px' }}>
                        Ingresá con tu correo y contraseña
                    </p>

                    {error && (
                        <div style={{
                            background: 'var(--danger-bg)', border: '1px solid rgba(248,113,113,0.25)',
                            borderRadius: 'var(--radius-md)', padding: '10px 14px',
                            display: 'flex', gap: '8px', alignItems: 'center',
                            marginBottom: '16px', fontSize: '13px', color: 'var(--danger)',
                            animation: 'fadeIn 0.2s ease',
                        }}>
                            <AlertCircle size={14} style={{ flexShrink: 0 }} />
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

                        {/* Email */}
                        <div>
                            <label style={{
                                fontSize: '12px', fontWeight: 500,
                                color: 'var(--text-secondary)', display: 'block', marginBottom: '6px',
                            }}>
                                Correo electrónico
                            </label>
                            <input
                                type="email"
                                autoFocus
                                required
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                placeholder="admin@mipanaderia.cr"
                                className="input-base"
                                style={{ width: '100%', padding: '11px 14px', fontSize: '14px' }}
                            />
                        </div>

                        {/* Password */}
                        <div>
                            <label style={{
                                fontSize: '12px', fontWeight: 500,
                                color: 'var(--text-secondary)', display: 'block', marginBottom: '6px',
                            }}>
                                Contraseña
                            </label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type={showPass ? 'text' : 'password'}
                                    required
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="input-base"
                                    style={{ width: '100%', padding: '11px 40px 11px 14px', fontSize: '14px' }}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPass(v => !v)}
                                    style={{
                                        position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                                        background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)',
                                        display: 'flex', alignItems: 'center',
                                    }}
                                >
                                    {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                                </button>
                            </div>
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="btn-accent"
                            style={{
                                width: '100%', padding: '13px',
                                fontSize: '14px', marginTop: '4px',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                            }}
                        >
                            {isLoading ? (
                                <>
                                    <span style={{
                                        width: 16, height: 16, borderRadius: '50%',
                                        border: '2px solid rgba(0,0,0,0.2)',
                                        borderTopColor: '#0f1117',
                                        animation: 'spin 0.7s linear infinite',
                                        display: 'inline-block',
                                    }} />
                                    Ingresando...
                                </>
                            ) : 'Ingresar'}
                        </button>
                    </form>
                </div>

                {/* Footer */}
                <div style={{ textAlign: 'center', marginTop: '20px' }}>
                    <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '8px' }}>
                        ¿No tenés cuenta?{' '}
                        <Link href="/register" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 500 }}>
                            Registrá tu negocio gratis
                        </Link>
                    </p>
                    <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '10px' }}>
                        <Link href="/pricing" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>
                            Ver planes y precios →
                        </Link>
                    </p>
                    <Link
                        href="/admin"
                        style={{
                            fontSize: '10px',
                            color: 'var(--text-muted)',
                            textDecoration: 'none',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            opacity: 0.5,
                        }}
                    >
                        <ShieldCheck size={11} />
                        Panel de administración
                    </Link>
                </div>
            </div>

            <style>{`
                @keyframes spin { to { transform: rotate(360deg) } }
                @keyframes fadeIn { from { opacity:0; transform:translateY(8px) } to { opacity:1; transform:translateY(0) } }
            `}</style>
        </div>
    )
}