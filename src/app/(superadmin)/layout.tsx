"use client"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useAuthStore } from "@/store/auth.store"
import { useEffect } from "react"
import {
    LayoutDashboard, Building2, Users,
    BarChart3, Settings, LogOut, Zap, ShieldCheck
} from "lucide-react"

const NAV = [
    { href: "/admin",          icon: LayoutDashboard, label: "Dashboard" },
    { href: "/admin/tenants",  icon: Building2,       label: "Negocios"  },
    { href: "/admin/users",    icon: Users,           label: "Usuarios"  },
    { href: "/admin/reports",  icon: BarChart3,       label: "Reportes"  },
    { href: "/admin/settings", icon: Settings,        label: "Config"    },
]

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
    const path     = usePathname()
    const router   = useRouter()
    const { user, logout } = useAuthStore()

    useEffect(() => {
        if (user && user.role !== "SUPER_ADMIN") router.replace("/pos")
    }, [user, router])

    const handleLogout = async () => {
        await logout()
        router.push("/login")
    }

    return (
        <div style={{ display: "flex", height: "100vh", overflow: "hidden", background: "var(--bg-base)" }}>

            {/* ── Sidebar — solo desktop ── */}
            <aside className="admin-sidebar">
                {/* Logo */}
                <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "8px 10px", marginBottom: "20px" }}>
                    <div style={{ width: 34, height: 34, borderRadius: "10px", background: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <Zap size={18} color="#0f1117" strokeWidth={2.5} />
                    </div>
                    <div>
                        <div style={{ fontSize: "13px", fontWeight: 700 }}>PanariaPOS</div>
                        <div style={{ fontSize: "10px", color: "var(--accent)", fontWeight: 600 }}>Super Admin</div>
                    </div>
                </div>

                {/* Nav */}
                <nav style={{ flex: 1, display: "flex", flexDirection: "column", gap: "2px" }}>
                    {NAV.map(({ href, icon: Icon, label }) => {
                        const active = path === href || (href !== "/admin" && path.startsWith(href))
                        return (
                            <Link key={href} href={href} style={{ textDecoration: "none" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "9px 12px", borderRadius: "var(--radius-md)", background: active ? "var(--accent-bg)" : "transparent", border: `1px solid ${active ? "var(--accent-border)" : "transparent"}`, cursor: "pointer", transition: "all 0.15s" }}
                                    onMouseEnter={e => { if (!active) (e.currentTarget as HTMLDivElement).style.background = "var(--bg-overlay)" }}
                                    onMouseLeave={e => { if (!active) (e.currentTarget as HTMLDivElement).style.background = "transparent" }}
                                >
                                    <Icon size={16} color={active ? "var(--accent)" : "var(--text-muted)"} strokeWidth={active ? 2.2 : 1.8} />
                                    <span style={{ fontSize: "13px", fontWeight: active ? 600 : 400, color: active ? "var(--accent)" : "var(--text-secondary)" }}>
                                        {label}
                                    </span>
                                </div>
                            </Link>
                        )
                    })}
                </nav>

                {/* Footer */}
                <div style={{ borderTop: "1px solid var(--border)", paddingTop: "12px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "8px 10px", marginBottom: "6px" }}>
                        <div style={{ width: 30, height: 30, borderRadius: "50%", background: "var(--accent-bg)", border: "1px solid var(--accent-border)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <ShieldCheck size={14} color="var(--accent)" />
                        </div>
                        <div>
                            <div style={{ fontSize: "12px", fontWeight: 500 }}>{user?.name ?? "Admin"}</div>
                            <div style={{ fontSize: "10px", color: "var(--text-muted)" }}>Super Admin</div>
                        </div>
                    </div>
                    <button onClick={handleLogout} style={{ width: "100%", padding: "8px 12px", background: "none", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", color: "var(--text-muted)", fontSize: "13px", transition: "all 0.15s", fontFamily: "var(--font-sans)" }}
                        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "var(--danger-bg)"; (e.currentTarget as HTMLButtonElement).style.color = "var(--danger)"; (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(248,113,113,0.3)" }}
                        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "none"; (e.currentTarget as HTMLButtonElement).style.color = "var(--text-muted)"; (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border)" }}
                    >
                        <LogOut size={14} /> Cerrar sesión
                    </button>
                </div>
            </aside>

            {/* ── Contenido principal ── */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>

                {/* Header móvil */}
                <header className="admin-mobile-header">
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <div style={{ width: 28, height: 28, borderRadius: "8px", background: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <Zap size={14} color="#0f1117" strokeWidth={2.5} />
                        </div>
                        <div>
                            <div style={{ fontSize: "12px", fontWeight: 700 }}>PanariaPOS</div>
                            <div style={{ fontSize: "9px", color: "var(--accent)", fontWeight: 600 }}>Super Admin</div>
                        </div>
                    </div>
                    <button onClick={handleLogout} style={{ background: "none", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", padding: "6px 10px", cursor: "pointer", display: "flex", alignItems: "center", gap: "5px", color: "var(--text-muted)", fontSize: "12px", fontFamily: "var(--font-sans)" }}>
                        <LogOut size={13} /> Salir
                    </button>
                </header>

                {/* Contenido */}
                <main style={{ flex: 1, overflow: "auto", background: "var(--bg-base)" }}>
                    {children}
                </main>

                {/* Bottom nav móvil */}
                <nav className="admin-bottom-nav">
                    {NAV.map(({ href, icon: Icon, label }) => {
                        const active = path === href || (href !== "/admin" && path.startsWith(href))
                        return (
                            <Link key={href} href={href} style={{ textDecoration: "none", flex: 1 }}>
                                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "3px", padding: "8px 4px", cursor: "pointer" }}>
                                    <Icon size={18} color={active ? "var(--accent)" : "var(--text-muted)"} strokeWidth={active ? 2.2 : 1.8} />
                                    <span style={{ fontSize: "9px", fontWeight: active ? 600 : 400, color: active ? "var(--accent)" : "var(--text-muted)" }}>
                                        {label}
                                    </span>
                                </div>
                            </Link>
                        )
                    })}
                </nav>
            </div>

            <style>{`
                /* Desktop: sidebar visible */
                .admin-sidebar {
                    width: 220px;
                    flex-shrink: 0;
                    background: var(--bg-surface);
                    border-right: 1px solid var(--border);
                    display: flex;
                    flex-direction: column;
                    padding: 16px 10px;
                    overflow-y: auto;
                }
                .admin-mobile-header {
                    display: none;
                }
                .admin-bottom-nav {
                    display: none;
                }

                /* Móvil: ocultar sidebar, mostrar header + bottom nav */
                @media (max-width: 767px) {
                    .admin-sidebar {
                        display: none;
                    }
                    .admin-mobile-header {
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                        padding: 10px 16px;
                        background: var(--bg-surface);
                        border-bottom: 1px solid var(--border);
                        flex-shrink: 0;
                    }
                    .admin-bottom-nav {
                        display: flex;
                        align-items: center;
                        background: var(--bg-surface);
                        border-top: 1px solid var(--border);
                        flex-shrink: 0;
                    }
                }
            `}</style>
        </div>
    )
}
