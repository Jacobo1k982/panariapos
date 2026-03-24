'use client'
import { useState } from 'react'
import { Save, Check, Shield, Globe, Bell } from 'lucide-react'

export default function AdminSettingsPage() {
    const [saved, setSaved] = useState(false)
    const [config, setConfig] = useState({
        platformName: 'PanariaPOS',
        supportEmail: 'soporte@panariapos.com',
        trialDays: 14,
        basicLimit: 1,
        proLimit: 3,
        allowRegister: true,
        maintenanceMode: false,
    })

    const handleSave = () => {
        setSaved(true)
        setTimeout(() => setSaved(false), 2000)
    }

    return (
        <div style={{ padding: '28px', maxWidth: '560px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div>
                <h1 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '4px' }}>
                    Configuración de la plataforma
                </h1>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                    Parámetros globales del SaaS
                </p>
            </div>

            {/* General */}
            <Section title="General" icon={<Globe size={15} />}>
                <Field label="Nombre de la plataforma">
                    <input className="input-base" value={config.platformName}
                        onChange={e => setConfig({ ...config, platformName: e.target.value })}
                        style={{ width: '100%', padding: '9px 12px', fontSize: '13px' }} />
                </Field>
                <Field label="Email de soporte">
                    <input type="email" className="input-base" value={config.supportEmail}
                        onChange={e => setConfig({ ...config, supportEmail: e.target.value })}
                        style={{ width: '100%', padding: '9px 12px', fontSize: '13px' }} />
                </Field>
                <Field label="Días de prueba para nuevos negocios">
                    <input type="number" min="0" max="90" className="input-base"
                        value={config.trialDays}
                        onChange={e => setConfig({ ...config, trialDays: Number(e.target.value) })}
                        style={{ width: '120px', padding: '9px 12px', fontSize: '13px' }} />
                </Field>
            </Section>

            {/* Límites por plan */}
            <Section title="Límites por plan" icon={<Shield size={15} />}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <Field label="Sucursales — Plan Básico">
                        <input type="number" min="1" className="input-base"
                            value={config.basicLimit}
                            onChange={e => setConfig({ ...config, basicLimit: Number(e.target.value) })}
                            style={{ width: '100%', padding: '9px 12px', fontSize: '13px' }} />
                    </Field>
                    <Field label="Sucursales — Plan Pro">
                        <input type="number" min="1" className="input-base"
                            value={config.proLimit}
                            onChange={e => setConfig({ ...config, proLimit: Number(e.target.value) })}
                            style={{ width: '100%', padding: '9px 12px', fontSize: '13px' }} />
                    </Field>
                </div>
            </Section>

            {/* Acceso */}
            <Section title="Acceso y registro" icon={<Bell size={15} />}>
                <ToggleField
                    label="Permitir registro público"
                    sub="Los negocios pueden registrarse desde /register"
                    value={config.allowRegister}
                    onChange={v => setConfig({ ...config, allowRegister: v })}
                />
                <ToggleField
                    label="Modo mantenimiento"
                    sub="Bloquea el acceso a todos los negocios"
                    value={config.maintenanceMode}
                    onChange={v => setConfig({ ...config, maintenanceMode: v })}
                    danger
                />
            </Section>

            <button onClick={handleSave} className="btn-accent"
                style={{ padding: '12px', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px' }}>
                {saved ? <><Check size={15} /> Guardado</> : <><Save size={15} /> Guardar configuración</>}
            </button>
        </div>
    )
}

function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
    return (
        <div style={{
            background: 'var(--bg-surface)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)', overflow: 'hidden',
        }}>
            <div style={{
                padding: '14px 18px', borderBottom: '1px solid var(--border)',
                display: 'flex', alignItems: 'center', gap: '8px',
                fontWeight: 600, fontSize: '14px',
            }}>
                <span style={{ color: 'var(--accent)' }}>{icon}</span>
                {title}
            </div>
            <div style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {children}
            </div>
        </div>
    )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div>
            <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '5px', fontWeight: 500 }}>
                {label}
            </label>
            {children}
        </div>
    )
}

function ToggleField({ label, sub, value, onChange, danger }: {
    label: string
    sub: string
    value: boolean
    onChange: (v: boolean) => void
    danger?: boolean
}) {
    return (
        <div style={{
            display: 'flex', alignItems: 'center', gap: '12px',
            padding: '10px 14px', borderRadius: 'var(--radius-md)',
            background: danger && value ? 'var(--danger-bg)' : 'var(--bg-elevated)',
            border: `1px solid ${danger && value ? 'rgba(248,113,113,0.2)' : 'var(--border)'}`,
            transition: 'all 0.2s',
        }}>
            <div style={{ flex: 1 }}>
                <div style={{
                    fontWeight: 500, fontSize: '13px', marginBottom: '2px',
                    color: danger && value ? 'var(--danger)' : 'var(--text-primary)',
                }}>
                    {label}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{sub}</div>
            </div>
            <div
                onClick={() => onChange(!value)}
                style={{
                    width: 40, height: 22, borderRadius: 11, cursor: 'pointer', flexShrink: 0,
                    background: value
                        ? danger ? 'var(--danger)' : 'var(--accent)'
                        : 'var(--bg-overlay)',
                    border: `1px solid ${value
                        ? danger ? 'var(--danger)' : 'var(--accent-dim)'
                        : 'var(--border-hover)'}`,
                    position: 'relative', transition: 'all 0.2s',
                }}
            >
                <div style={{
                    position: 'absolute', top: 2, left: value ? 19 : 2,
                    width: 16, height: 16, borderRadius: '50%',
                    background: value ? '#fff' : 'var(--text-muted)',
                    transition: 'left 0.2s',
                }} />
            </div>
        </div>
    )
}