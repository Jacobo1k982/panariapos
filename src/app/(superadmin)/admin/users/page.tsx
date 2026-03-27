"use client"
import { useState } from "react"
import {
    Users, Search, Shield, ShoppingCart,
    ChefHat, Crown, CheckCircle, XCircle,
    ChevronDown, X,
} from "lucide-react"
import { useQuery } from "@tanstack/react-query"
import api from "@/lib/api"

const ROLE_CFG: Record<string, { label: string; color: string; bg: string; icon: any }> = {
    SUPER_ADMIN: { label: "Super Admin", color: "var(--danger)",  bg: "var(--danger-bg)",  icon: Crown       },
    ADMIN:       { label: "Admin",       color: "var(--accent)",  bg: "var(--accent-bg)",  icon: Shield      },
    CASHIER:     { label: "Cajero",      color: "var(--info)",    bg: "var(--info-bg)",    icon: ShoppingCart },
    PRODUCTION:  { label: "Producción",  color: "var(--success)", bg: "var(--success-bg)", icon: ChefHat     },
}

function useAllUsers(role?: string, active?: boolean) {
    return useQuery({
        queryKey: ["admin", "users", role, active],
        queryFn:  () => api.get("/admin/users", { params: { role, active } }).then(r => r.data),
    })
}

export default function AdminUsersPage() {
    const [search,       setSearch]       = useState("")
    const [filterRole,   setFilterRole]   = useState("")
    const [filterActive, setFilterActive] = useState<string>("")
    const [selected,     setSelected]     = useState<any>(null)

    const { data: users = [], isLoading } = useAllUsers(
        filterRole   || undefined,
        filterActive === "" ? undefined : filterActive === "true",
    )

    const filtered = (users as any[]).filter(u =>
        !search ||
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase()) ||
        u.tenant?.name?.toLowerCase().includes(search.toLowerCase())
    )

    return (
        <div style={{ display: "flex", height: "100%", overflow: "hidden" }}>

            {/* Lista */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", borderRight: selected ? "1px solid var(--border)" : "none" }}>

                {/* Toolbar */}
                <div style={{ padding: "20px 24px 0", flexShrink: 0 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px", flexWrap: "wrap", gap: "8px" }}>
                        <div>
                            <h2 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "3px" }}>Usuarios</h2>
                            <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                                {filtered.length} usuario{filtered.length !== 1 ? "s" : ""} en la plataforma
                            </p>
                        </div>
                    </div>

                    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "16px" }}>
                        {/* Búsqueda */}
                        <div style={{ position: "relative", flex: 1, minWidth: "200px" }}>
                            <Search size={13} color="var(--text-muted)" style={{ position: "absolute", left: 9, top: "50%", transform: "translateY(-50%)" }} />
                            <input
                                className="input-base"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                placeholder="Buscar por nombre, email o negocio..."
                                style={{ width: "100%", padding: "8px 10px 8px 28px", fontSize: "13px" }}
                            />
                        </div>

                        {/* Filtro rol */}
                        <select
                            className="input-base"
                            value={filterRole}
                            onChange={e => setFilterRole(e.target.value)}
                            style={{ padding: "8px 12px", fontSize: "13px", cursor: "pointer" }}
                        >
                            <option value="">Todos los roles</option>
                            <option value="ADMIN">Admin</option>
                            <option value="CASHIER">Cajero</option>
                            <option value="PRODUCTION">Producción</option>
                            <option value="SUPER_ADMIN">Super Admin</option>
                        </select>

                        {/* Filtro estado */}
                        <select
                            className="input-base"
                            value={filterActive}
                            onChange={e => setFilterActive(e.target.value)}
                            style={{ padding: "8px 12px", fontSize: "13px", cursor: "pointer" }}
                        >
                            <option value="">Todos los estados</option>
                            <option value="true">Activos</option>
                            <option value="false">Inactivos</option>
                        </select>
                    </div>
                </div>

                {/* Tabla */}
                <div style={{ flex: 1, overflowY: "auto", padding: "0 24px 24px" }}>
                    {/* Header */}
                    <div style={{
                        display: "grid", gridTemplateColumns: "2fr 2fr 1fr 1fr 80px 32px",
                        gap: "12px", padding: "8px 14px",
                        fontSize: "10px", fontWeight: 600,
                        color: "var(--text-muted)", letterSpacing: "0.5px",
                        textTransform: "uppercase", borderBottom: "1px solid var(--border)",
                    }}>
                        <span>Usuario</span>
                        <span>Negocio</span>
                        <span>Rol</span>
                        <span>Último login</span>
                        <span>Estado</span>
                        <span></span>
                    </div>

                    {isLoading ? (
                        <div style={{ textAlign: "center", padding: "48px", color: "var(--text-muted)", fontSize: "13px" }}>
                            Cargando usuarios...
                        </div>
                    ) : filtered.length === 0 ? (
                        <div style={{ textAlign: "center", padding: "48px", display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
                            <Users size={36} color="var(--text-muted)" />
                            <div style={{ fontSize: "14px", fontWeight: 500, color: "var(--text-muted)" }}>Sin usuarios</div>
                        </div>
                    ) : (
                        filtered.map((user: any) => {
                            const rcfg      = ROLE_CFG[user.role] ?? ROLE_CFG.CASHIER
                            const RoleIcon  = rcfg.icon
                            const isSelected = selected?.id === user.id
                            return (
                                <div
                                    key={user.id}
                                    onClick={() => setSelected(isSelected ? null : user)}
                                    style={{
                                        display: "grid", gridTemplateColumns: "2fr 2fr 1fr 1fr 80px 32px",
                                        gap: "12px", padding: "12px 14px", alignItems: "center",
                                        fontSize: "13px", borderBottom: "1px solid var(--border)",
                                        background: isSelected ? "var(--bg-overlay)" : "transparent",
                                        cursor: "pointer", transition: "background 0.1s",
                                    }}
                                    onMouseEnter={e => { if (!isSelected) (e.currentTarget as HTMLDivElement).style.background = "var(--bg-elevated)" }}
                                    onMouseLeave={e => { if (!isSelected) (e.currentTarget as HTMLDivElement).style.background = "transparent" }}
                                >
                                    {/* Usuario */}
                                    <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0 }}>
                                        <div style={{
                                            width: 32, height: 32, borderRadius: "50%", flexShrink: 0,
                                            background: rcfg.bg, border: `1px solid ${rcfg.color}30`,
                                            display: "flex", alignItems: "center", justifyContent: "center",
                                            fontSize: "12px", fontWeight: 700, color: rcfg.color,
                                        }}>
                                            {user.name?.charAt(0).toUpperCase()}
                                        </div>
                                        <div style={{ minWidth: 0 }}>
                                            <div style={{ fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.name}</div>
                                            <div style={{ fontSize: "11px", color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.email}</div>
                                        </div>
                                    </div>

                                    {/* Negocio */}
                                    <div style={{ fontSize: "12px", color: "var(--text-secondary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                        {user.tenant?.name ?? <span style={{ color: "var(--text-muted)" }}>—</span>}
                                    </div>

                                    {/* Rol */}
                                    <span style={{
                                        fontSize: "10px", fontWeight: 600,
                                        padding: "3px 8px", borderRadius: "20px",
                                        color: rcfg.color, background: rcfg.bg,
                                        display: "inline-flex", alignItems: "center", gap: "4px",
                                        whiteSpace: "nowrap",
                                    }}>
                                        <RoleIcon size={10} /> {rcfg.label}
                                    </span>

                                    {/* Último login */}
                                    <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                                        {user.lastLogin
                                            ? new Date(user.lastLogin).toLocaleDateString("es-CR")
                                            : "Nunca"}
                                    </div>

                                    {/* Estado */}
                                    <span style={{
                                        fontSize: "10px", fontWeight: 600,
                                        padding: "2px 8px", borderRadius: "20px",
                                        color:      user.active ? "var(--success)" : "var(--danger)",
                                        background: user.active ? "var(--success-bg)" : "var(--danger-bg)",
                                    }}>
                                        {user.active ? "Activo" : "Inactivo"}
                                    </span>

                                    <ChevronDown size={13} color="var(--text-muted)" style={{ transform: "rotate(-90deg)" }} />
                                </div>
                            )
                        })
                    )}
                </div>
            </div>

            {/* Detalle */}
            {selected && (
                <div style={{ width: 340, flexShrink: 0, background: "var(--bg-surface)", display: "flex", flexDirection: "column", overflow: "hidden" }}>
                    {/* Header */}
                    <div style={{ padding: "20px 22px", borderBottom: "1px solid var(--border)", flexShrink: 0, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <div>
                            <div style={{ fontWeight: 700, fontSize: "16px", marginBottom: "4px" }}>{selected.name}</div>
                            <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>{selected.email}</div>
                        </div>
                        <button onClick={() => setSelected(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}>
                            <X size={15} />
                        </button>
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1, overflowY: "auto", padding: "18px 22px", display: "flex", flexDirection: "column", gap: "16px" }}>

                        {/* Rol */}
                        <div>
                            <div style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "8px" }}>Rol</div>
                            {(() => {
                                const rcfg = ROLE_CFG[selected.role] ?? ROLE_CFG.CASHIER
                                const Icon = rcfg.icon
                                return (
                                    <span style={{ display: "inline-flex", alignItems: "center", gap: "7px", fontSize: "14px", fontWeight: 600, color: rcfg.color, background: rcfg.bg, padding: "6px 14px", borderRadius: "20px" }}>
                                        <Icon size={15} /> {rcfg.label}
                                    </span>
                                )
                            })()}
                        </div>

                        {/* Negocio */}
                        <div>
                            <div style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "8px" }}>Negocio</div>
                            <div style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", padding: "12px 14px", fontSize: "13px" }}>
                                <div style={{ fontWeight: 600, marginBottom: "2px" }}>{selected.tenant?.name ?? "—"}</div>
                                {selected.tenant?.plan && (
                                    <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>Plan: {selected.tenant.plan}</div>
                                )}
                            </div>
                        </div>

                        {/* Sucursal */}
                        {selected.branch && (
                            <div>
                                <div style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "8px" }}>Sucursal</div>
                                <div style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", padding: "12px 14px", fontSize: "13px" }}>
                                    {selected.branch.name}
                                </div>
                            </div>
                        )}

                        {/* Actividad */}
                        <div>
                            <div style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "8px" }}>Actividad</div>
                            <div style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", padding: "12px 14px", display: "flex", flexDirection: "column", gap: "8px", fontSize: "12px" }}>
                                <div style={{ display: "flex", justifyContent: "space-between" }}>
                                    <span style={{ color: "var(--text-muted)" }}>Último login</span>
                                    <span style={{ fontWeight: 500 }}>
                                        {selected.lastLogin ? new Date(selected.lastLogin).toLocaleString("es-CR") : "Nunca"}
                                    </span>
                                </div>
                                <div style={{ display: "flex", justifyContent: "space-between" }}>
                                    <span style={{ color: "var(--text-muted)" }}>Registrado</span>
                                    <span style={{ fontWeight: 500 }}>{new Date(selected.createdAt).toLocaleDateString("es-CR")}</span>
                                </div>
                                <div style={{ display: "flex", justifyContent: "space-between" }}>
                                    <span style={{ color: "var(--text-muted)" }}>Estado</span>
                                    <span style={{
                                        fontWeight: 600, fontSize: "11px",
                                        color:      selected.active ? "var(--success)" : "var(--danger)",
                                    }}>
                                        {selected.active ? "✓ Activo" : "✗ Inactivo"}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
