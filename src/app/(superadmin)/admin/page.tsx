"use client"
import { useAdminMetrics, useAdminTenants } from "@/hooks/useAdmin"
import { formatCRC } from "@/lib/utils"
import {
  Building2, Users, ShoppingBag,
  TrendingUp, CheckCircle, XCircle,
  Crown, Star, Zap
} from "lucide-react"

const PLAN_CFG: Record<string, { label:string; color:string; bg:string; icon:any }> = {
  BASIC:      { label:"Básico",     color:"var(--text-secondary)", bg:"var(--bg-overlay)",  icon:Zap      },
  PRO:        { label:"Pro",        color:"var(--accent)",         bg:"var(--accent-bg)",   icon:Star     },
  ENTERPRISE: { label:"Enterprise", color:"var(--success)",        bg:"var(--success-bg)",  icon:Crown    },
}

export default function AdminDashboard() {
  const { data: metrics, isLoading: loadingM } = useAdminMetrics()
  const { data: tenants = [], isLoading: loadingT } = useAdminTenants()

  const recentTenants = (tenants as any[]).slice(0, 5)

  return (
    <div style={{ padding:"28px", display:"flex", flexDirection:"column", gap:"24px" }}>

      {/* Header */}
      <div>
        <h1 style={{ fontSize:"22px", fontWeight:700, marginBottom:"4px" }}>
          Panel de administración
        </h1>
        <p style={{ fontSize:"13px", color:"var(--text-muted)" }}>
          Vista global de todos los negocios en la plataforma
        </p>
      </div>

      {/* KPI cards */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:"14px" }}>
        {[
          {
            label: "Total negocios",
            value: loadingM ? "..." : metrics?.totalTenants ?? 0,
            sub:   `${metrics?.activeTenants ?? 0} activos`,
            color: "var(--info)",
            icon:  <Building2 size={18}/>,
          },
          {
            label: "Ventas este mes",
            value: loadingM ? "..." : formatCRC(metrics?.totalSalesThisMonth ?? 0),
            sub:   `${metrics?.totalOrdersThisMonth ?? 0} órdenes`,
            color: "var(--accent)",
            mono:  true,
            icon:  <ShoppingBag size={18}/>,
          },
          {
            label: "Negocios activos",
            value: loadingM ? "..." : metrics?.activeTenants ?? 0,
            sub:   `de ${metrics?.totalTenants ?? 0} registrados`,
            color: "var(--success)",
            icon:  <CheckCircle size={18}/>,
          },
          {
            label: "Inactivos / suspendidos",
            value: loadingM ? "..." :
              (metrics?.totalTenants ?? 0) - (metrics?.activeTenants ?? 0),
            sub:   "Requieren atención",
            color: "var(--danger)",
            icon:  <XCircle size={18}/>,
          },
        ].map(k => (
          <div key={k.label} style={{
            background:"var(--bg-surface)", border:"1px solid var(--border)",
            borderRadius:"var(--radius-lg)", padding:"20px",
          }}>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"14px" }}>
              <span style={{ color:k.color, opacity:0.8 }}>{k.icon}</span>
            </div>
            <div style={{
              fontSize:"24px", fontWeight:700, marginBottom:"4px",
              fontFamily: k.mono ? "var(--font-mono)" : "var(--font-sans)",
              letterSpacing: k.mono ? "-0.5px" : "0",
            }}>
              {k.value}
            </div>
            <div style={{ fontSize:"12px", color:"var(--text-muted)", marginBottom:"2px" }}>
              {k.label}
            </div>
            <div style={{ fontSize:"11px", color:"var(--text-muted)", opacity:0.7 }}>
              {k.sub}
            </div>
          </div>
        ))}
      </div>

      {/* Distribución por plan */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 2fr", gap:"16px" }}>

        {/* Planes */}
        <div style={{
          background:"var(--bg-surface)", border:"1px solid var(--border)",
          borderRadius:"var(--radius-lg)", padding:"20px",
        }}>
          <div style={{ fontWeight:600, fontSize:"14px", marginBottom:"16px" }}>
            Distribución por plan
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:"10px" }}>
            {["BASIC","PRO","ENTERPRISE"].map(plan => {
              const cfg   = PLAN_CFG[plan]
              const Icon  = cfg.icon
              const count = metrics?.byPlan?.find((p: any) => p.plan === plan)?._count?.id ?? 0
              const total = metrics?.totalTenants ?? 1
              const pct   = Math.round((count / total) * 100)

              return (
                <div key={plan}>
                  <div style={{
                    display:"flex", justifyContent:"space-between",
                    alignItems:"center", marginBottom:"5px",
                  }}>
                    <div style={{ display:"flex", alignItems:"center", gap:"6px" }}>
                      <Icon size={13} color={cfg.color}/>
                      <span style={{ fontSize:"13px", fontWeight:500 }}>{cfg.label}</span>
                    </div>
                    <div style={{ display:"flex", alignItems:"center", gap:"8px" }}>
                      <span style={{ fontSize:"12px", color:"var(--text-muted)" }}>{count}</span>
                      <span style={{
                        fontSize:"10px", fontWeight:600, padding:"1px 6px",
                        borderRadius:"20px", color:cfg.color, background:cfg.bg,
                      }}>{pct}%</span>
                    </div>
                  </div>
                  <div style={{ height:5, background:"var(--bg-overlay)", borderRadius:3 }}>
                    <div style={{
                      height:"100%", borderRadius:3,
                      width:`${pct}%`, background:cfg.color,
                      transition:"width 0.4s ease",
                    }}/>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Negocios recientes */}
        <div style={{
          background:"var(--bg-surface)", border:"1px solid var(--border)",
          borderRadius:"var(--radius-lg)", padding:"20px",
        }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"16px" }}>
            <div style={{ fontWeight:600, fontSize:"14px" }}>Negocios recientes</div>
            <a href="/admin/tenants" style={{
              fontSize:"12px", color:"var(--accent)", textDecoration:"none",
              fontWeight:500,
            }}>
              Ver todos →
            </a>
          </div>

          {loadingT ? (
            <div style={{ textAlign:"center", padding:"24px", color:"var(--text-muted)", fontSize:"13px" }}>
              Cargando...
            </div>
          ) : (
            <div style={{ display:"flex", flexDirection:"column", gap:"8px" }}>
              {recentTenants.map((tenant: any) => {
                const pcfg = PLAN_CFG[tenant.plan] ?? PLAN_CFG.BASIC
                const Icon = pcfg.icon
                return (
                  <div key={tenant.id} style={{
                    display:"grid", gridTemplateColumns:"36px 1fr auto auto",
                    gap:"12px", alignItems:"center",
                    padding:"10px 14px",
                    background:"var(--bg-elevated)", border:"1px solid var(--border)",
                    borderRadius:"var(--radius-md)",
                  }}>
                    <div style={{
                      width:36, height:36, borderRadius:"9px",
                      background:pcfg.bg, border:`1px solid ${pcfg.color}30`,
                      display:"flex", alignItems:"center", justifyContent:"center",
                    }}>
                      <Icon size={16} color={pcfg.color}/>
                    </div>

                    <div style={{ minWidth:0 }}>
                      <div style={{ fontWeight:600, fontSize:"13px", marginBottom:"2px" }}>
                        {tenant.name}
                      </div>
                      <div style={{ fontSize:"11px", color:"var(--text-muted)" }}>
                        {tenant._count?.branches ?? 0} sucursal{(tenant._count?.branches ?? 0) !== 1 ? "es" : ""} ·{" "}
                        {tenant._count?.users ?? 0} usuario{(tenant._count?.users ?? 0) !== 1 ? "s" : ""}
                      </div>
                    </div>

                    <span style={{
                      fontSize:"10px", fontWeight:600,
                      padding:"2px 8px", borderRadius:"20px",
                      color:pcfg.color, background:pcfg.bg,
                    }}>
                      {pcfg.label}
                    </span>

                    <span style={{
                      fontSize:"10px", fontWeight:600,
                      padding:"2px 8px", borderRadius:"20px",
                      color:    tenant.active ? "var(--success)" : "var(--danger)",
                      background:tenant.active ? "var(--success-bg)" : "var(--danger-bg)",
                    }}>
                      {tenant.active ? "Activo" : "Inactivo"}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
