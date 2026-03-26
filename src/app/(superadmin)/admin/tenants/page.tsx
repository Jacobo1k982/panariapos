"use client"
import { useState } from "react"
import {
  Building2, Search, Plus, X, Edit2,
  CheckCircle, XCircle, Crown, Star,
  Zap, Users, MapPin, ChevronRight,
  ToggleLeft, ToggleRight
} from "lucide-react"
import { useAdminTenants, useUpdateTenantPlan, useToggleTenant } from "@/hooks/useAdmin"
import toast from "react-hot-toast"

const PLAN_CFG: Record<string, { label:string; color:string; bg:string; icon:any }> = {
  BASIC:      { label:"Básico",     color:"var(--text-secondary)", bg:"var(--bg-overlay)",  icon:Zap   },
  PRO:        { label:"Pro",        color:"var(--accent)",         bg:"var(--accent-bg)",   icon:Star  },
  ENTERPRISE: { label:"Enterprise", color:"var(--success)",        bg:"var(--success-bg)",  icon:Crown },
}

export default function TenantsPage() {
  const [search,    setSearch]    = useState("")
  const [filterPlan, setFilterPlan] = useState("")
  const [filterActive, setFilterActive] = useState<boolean | undefined>(undefined)
  const [selected,  setSelected]  = useState<any>(null)
  const [editPlan,  setEditPlan]  = useState(false)
  const [newPlan,   setNewPlan]   = useState("")

  const { data: tenants = [], isLoading } = useAdminTenants(filterActive, filterPlan || undefined)
  const updatePlan   = useUpdateTenantPlan()
  const toggleTenant = useToggleTenant()

  const filtered = (tenants as any[]).filter(t =>
    search
      ? t.name.toLowerCase().includes(search.toLowerCase()) ||
        t.slug.toLowerCase().includes(search.toLowerCase())
      : true
  )

  const handleToggle = async (tenant: any) => {
    try {
      await toggleTenant.mutateAsync({ id: tenant.id, active: !tenant.active })
      toast.success(`Negocio ${!tenant.active ? "activado" : "suspendido"}`)
      if (selected?.id === tenant.id) {
        setSelected({ ...selected, active: !tenant.active })
      }
    } catch {
      toast.error("Error al cambiar estado")
    }
  }

  const handleUpdatePlan = async () => {
    if (!newPlan || !selected) return
    try {
      await updatePlan.mutateAsync({ id: selected.id, plan: newPlan })
      toast.success("Plan actualizado")
      setSelected({ ...selected, plan: newPlan })
      setEditPlan(false)
    } catch {
      toast.error("Error al actualizar plan")
    }
  }

  return (
    <div style={{ display:"flex", height:"100%", overflow:"hidden" }}>

      {/* Lista */}
      <div style={{
        flex:1, display:"flex", flexDirection:"column",
        borderRight: selected ? "1px solid var(--border)" : "none",
        overflow:"hidden",
      }}>

        {/* Toolbar */}
        <div style={{ padding:"20px 24px 0", flexShrink:0 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:"16px" }}>
            <div>
              <h2 style={{ fontSize:"18px", fontWeight:700, marginBottom:"3px" }}>Negocios</h2>
              <p style={{ fontSize:"12px", color:"var(--text-muted)" }}>
                {filtered.length} negocio{filtered.length !== 1 ? "s" : ""} en la plataforma
              </p>
            </div>
          </div>

          <div style={{ display:"flex", gap:"8px", flexWrap:"wrap", marginBottom:"16px" }}>
            {/* Search */}
            <div style={{ position:"relative", flex:1, minWidth:"200px" }}>
              <Search size={13} color="var(--text-muted)" style={{ position:"absolute", left:9, top:"50%", transform:"translateY(-50%)" }}/>
              <input
                className="input-base"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Buscar por nombre o slug..."
                style={{ width:"100%", padding:"8px 10px 8px 28px", fontSize:"13px" }}
              />
            </div>

            {/* Filtro plan */}
            <select
              className="input-base"
              value={filterPlan}
              onChange={e => setFilterPlan(e.target.value)}
              style={{ padding:"8px 12px", fontSize:"13px", cursor:"pointer" }}
            >
              <option value="">Todos los planes</option>
              <option value="BASIC">Básico</option>
              <option value="PRO">Pro</option>
              <option value="ENTERPRISE">Enterprise</option>
            </select>

            {/* Filtro estado */}
            <select
              className="input-base"
              value={filterActive === undefined ? "" : String(filterActive)}
              onChange={e => setFilterActive(e.target.value === "" ? undefined : e.target.value === "true")}
              style={{ padding:"8px 12px", fontSize:"13px", cursor:"pointer" }}
            >
              <option value="">Todos los estados</option>
              <option value="true">Activos</option>
              <option value="false">Inactivos</option>
            </select>
          </div>
        </div>

        {/* Tabla */}
        <div style={{ flex:1, overflowY:"auto", padding:"0 24px 24px" }}>

          {/* Header tabla */}
          <div style={{
            display:"grid",
            gridTemplateColumns:"2fr 1fr 1fr 80px 80px 40px",
            gap:"12px", padding:"8px 14px",
            fontSize:"10px", fontWeight:600,
            color:"var(--text-muted)", letterSpacing:"0.5px",
            textTransform:"uppercase", borderBottom:"1px solid var(--border)",
          }}>
            <span>Negocio</span>
            <span>Plan</span>
            <span>Sucursales / Usuarios</span>
            <span>Estado</span>
            <span>Creado</span>
            <span></span>
          </div>

          {isLoading ? (
            <div style={{ textAlign:"center", padding:"48px", color:"var(--text-muted)", fontSize:"13px" }}>
              Cargando negocios...
            </div>
          ) : filtered.length === 0 ? (
            <div style={{
              textAlign:"center", padding:"48px",
              display:"flex", flexDirection:"column", alignItems:"center", gap:"10px",
            }}>
              <Building2 size={36} color="var(--text-muted)"/>
              <div style={{ fontSize:"14px", fontWeight:500 }}>Sin negocios</div>
            </div>
          ) : (
            filtered.map((tenant: any) => {
              const pcfg      = PLAN_CFG[tenant.plan] ?? PLAN_CFG.BASIC
              const PlanIcon  = pcfg.icon
              const isSelected = selected?.id === tenant.id

              return (
                <div
                  key={tenant.id}
                  onClick={() => setSelected(isSelected ? null : tenant)}
                  style={{
                    display:"grid",
                    gridTemplateColumns:"2fr 1fr 1fr 80px 80px 40px",
                    gap:"12px", padding:"13px 14px",
                    alignItems:"center", fontSize:"13px",
                    borderBottom:"1px solid var(--border)",
                    background: isSelected ? "var(--bg-overlay)" : "transparent",
                    cursor:"pointer", transition:"background 0.1s",
                  }}
                  onMouseEnter={e => {
                    if (!isSelected)
                      (e.currentTarget as HTMLDivElement).style.background = "var(--bg-elevated)"
                  }}
                  onMouseLeave={e => {
                    if (!isSelected)
                      (e.currentTarget as HTMLDivElement).style.background = "transparent"
                  }}
                >
                  {/* Nombre */}
                  <div>
                    <div style={{ fontWeight:600, marginBottom:"2px" }}>{tenant.name}</div>
                    <div style={{ fontSize:"11px", color:"var(--text-muted)", fontFamily:"var(--font-mono)" }}>
                      {tenant.slug}
                    </div>
                  </div>

                  {/* Plan */}
                  <span style={{
                    fontSize:"11px", fontWeight:600,
                    padding:"3px 10px", borderRadius:"20px",
                    color:pcfg.color, background:pcfg.bg,
                    display:"inline-flex", alignItems:"center", gap:"5px",
                  }}>
                    <PlanIcon size={11}/> {pcfg.label}
                  </span>

                  {/* Stats */}
                  <div style={{ fontSize:"11px", color:"var(--text-muted)", display:"flex", gap:"10px" }}>
                    <span>🏪 {tenant.branches?.length ?? tenant._count?.branches ?? 0}</span>
                    <span>👤 {tenant._count?.users ?? 0}</span>
                  </div>

                  {/* Estado */}
                  <span style={{
                    fontSize:"10px", fontWeight:600,
                    padding:"2px 8px", borderRadius:"20px",
                    color:    tenant.active ? "var(--success)" : "var(--danger)",
                    background:tenant.active ? "var(--success-bg)" : "var(--danger-bg)",
                  }}>
                    {tenant.active ? "Activo" : "Inactivo"}
                  </span>

                  {/* Fecha */}
                  <span style={{ fontSize:"11px", color:"var(--text-muted)" }}>
                    {new Date(tenant.createdAt).toLocaleDateString("es-CR")}
                  </span>

                  {/* Flecha */}
                  <ChevronRight size={14} color="var(--text-muted)"/>
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* Detalle */}
      {selected && (
        <div style={{
          width:"380px", flexShrink:0, overflow:"hidden",
          background:"var(--bg-surface)",
          display:"flex", flexDirection:"column",
        }}>

          {/* Header */}
          <div style={{
            padding:"20px 22px", borderBottom:"1px solid var(--border)", flexShrink:0,
            display:"flex", justifyContent:"space-between", alignItems:"flex-start",
          }}>
            <div>
              <div style={{ fontWeight:700, fontSize:"17px", marginBottom:"4px" }}>
                {selected.name}
              </div>
              <div style={{
                fontSize:"11px", color:"var(--text-muted)",
                fontFamily:"var(--font-mono)",
              }}>
                {selected.slug}
              </div>
            </div>
            <button
              onClick={() => setSelected(null)}
              style={{ background:"none", border:"none", cursor:"pointer", color:"var(--text-muted)" }}
            >
              <X size={15}/>
            </button>
          </div>

          {/* Info */}
          <div style={{ flex:1, overflowY:"auto", padding:"18px 22px" }}>

            {/* Stats */}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"8px", marginBottom:"20px" }}>
              {[
                { label:"Sucursales", value: selected.branches?.length ?? selected._count?.branches ?? 0,  icon:"🏪" },
                { label:"Usuarios",   value: selected._count?.users    ?? 0,                               icon:"👤" },
                { label:"Productos",  value: selected._count?.products  ?? 0,                              icon:"📦" },
                { label:"Clientes",   value: selected._count?.customers ?? 0,                              icon:"👥" },
              ].map(s => (
                <div key={s.label} style={{
                  background:"var(--bg-elevated)",
                  borderRadius:"var(--radius-md)", padding:"12px 14px",
                }}>
                  <div style={{ fontSize:"10px", color:"var(--text-muted)", marginBottom:"5px" }}>
                    {s.icon} {s.label}
                  </div>
                  <div style={{ fontSize:"20px", fontWeight:700 }}>{s.value}</div>
                </div>
              ))}
            </div>

            {/* Plan actual */}
            <div style={{ marginBottom:"16px" }}>
              <div style={{
                fontSize:"11px", color:"var(--text-muted)", fontWeight:600,
                textTransform:"uppercase", letterSpacing:"0.5px", marginBottom:"8px",
              }}>
                Plan actual
              </div>
              {editPlan ? (
                <div style={{ display:"flex", flexDirection:"column", gap:"8px" }}>
                  <select
                    className="input-base"
                    value={newPlan}
                    onChange={e => setNewPlan(e.target.value)}
                    style={{ padding:"9px 12px", fontSize:"13px", cursor:"pointer" }}
                  >
                    <option value="">Seleccionar plan</option>
                    <option value="BASIC">Básico</option>
                    <option value="PRO">Pro</option>
                    <option value="ENTERPRISE">Enterprise</option>
                  </select>
                  <div style={{ display:"flex", gap:"6px" }}>
                    <button
                      onClick={() => setEditPlan(false)}
                      className="btn-ghost"
                      style={{ flex:1, padding:"8px" }}
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleUpdatePlan}
                      className="btn-accent"
                      disabled={!newPlan || updatePlan.isPending}
                      style={{ flex:2, padding:"8px", opacity:!newPlan ? 0.4 : 1 }}
                    >
                      {updatePlan.isPending ? "Guardando..." : "Guardar cambio"}
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{
                  display:"flex", alignItems:"center", justifyContent:"space-between",
                  padding:"12px 14px",
                  background:"var(--bg-elevated)", border:"1px solid var(--border)",
                  borderRadius:"var(--radius-md)",
                }}>
                  {(() => {
                    const pcfg = PLAN_CFG[selected.plan] ?? PLAN_CFG.BASIC
                    const Icon = pcfg.icon
                    return (
                      <span style={{
                        display:"flex", alignItems:"center", gap:"7px",
                        fontSize:"14px", fontWeight:600,
                        color:pcfg.color,
                      }}>
                        <Icon size={16}/> {pcfg.label}
                      </span>
                    )
                  })()}
                  <button
                    onClick={() => { setEditPlan(true); setNewPlan(selected.plan) }}
                    className="btn-ghost"
                    style={{
                      padding:"5px 12px", fontSize:"12px",
                      display:"flex", alignItems:"center", gap:"5px",
                    }}
                  >
                    <Edit2 size={11}/> Cambiar
                  </button>
                </div>
              )}
            </div>

            {/* Sucursales */}
            {selected.branches?.length > 0 && (
              <div style={{ marginBottom:"16px" }}>
                <div style={{
                  fontSize:"11px", color:"var(--text-muted)", fontWeight:600,
                  textTransform:"uppercase", letterSpacing:"0.5px", marginBottom:"8px",
                }}>
                  Sucursales
                </div>
                <div style={{ display:"flex", flexDirection:"column", gap:"5px" }}>
                  {selected.branches.map((b: any) => (
                    <div key={b.id} style={{
                      display:"flex", alignItems:"center", gap:"8px",
                      padding:"9px 12px",
                      background:"var(--bg-elevated)", border:"1px solid var(--border)",
                      borderRadius:"var(--radius-md)", fontSize:"13px",
                    }}>
                      <MapPin size={13} color="var(--text-muted)"/>
                      <span style={{ flex:1 }}>{b.name}</span>
                      <span style={{
                        fontSize:"10px", padding:"1px 6px", borderRadius:"20px",
                        color:    b.active ? "var(--success)" : "var(--danger)",
                        background:b.active ? "var(--success-bg)" : "var(--danger-bg)",
                      }}>
                        {b.active ? "Activa" : "Inactiva"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Contacto */}
            <div style={{ marginBottom:"16px" }}>
              <div style={{
                fontSize:"11px", color:"var(--text-muted)", fontWeight:600,
                textTransform:"uppercase", letterSpacing:"0.5px", marginBottom:"8px",
              }}>
                Información
              </div>
              <div style={{
                background:"var(--bg-elevated)", border:"1px solid var(--border)",
                borderRadius:"var(--radius-md)", padding:"12px 14px",
                display:"flex", flexDirection:"column", gap:"6px", fontSize:"12px",
              }}>
                {selected.phone && (
                  <div style={{ display:"flex", justifyContent:"space-between" }}>
                    <span style={{ color:"var(--text-muted)" }}>Teléfono</span>
                    <span>{selected.phone}</span>
                  </div>
                )}
                {selected.address && (
                  <div style={{ display:"flex", justifyContent:"space-between" }}>
                    <span style={{ color:"var(--text-muted)" }}>Dirección</span>
                    <span style={{ textAlign:"right", maxWidth:"200px" }}>{selected.address}</span>
                  </div>
                )}
                <div style={{ display:"flex", justifyContent:"space-between" }}>
                  <span style={{ color:"var(--text-muted)" }}>Registrado</span>
                  <span>{new Date(selected.createdAt).toLocaleDateString("es-CR")}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Acciones */}
          <div style={{
            borderTop:"1px solid var(--border)",
            padding:"16px 22px", flexShrink:0,
            display:"flex", gap:"8px",
          }}>
            <button
              onClick={() => handleToggle(selected)}
              disabled={toggleTenant.isPending}
              style={{
                flex:1, padding:"10px", borderRadius:"var(--radius-md)",
                fontSize:"13px", fontWeight:500, cursor:"pointer",
                display:"flex", alignItems:"center", justifyContent:"center", gap:"6px",
                background:  selected.active ? "var(--danger-bg)"  : "var(--success-bg)",
                border:`1px solid ${selected.active ? "rgba(248,113,113,0.3)" : "rgba(52,211,153,0.3)"}`,
                color:       selected.active ? "var(--danger)"      : "var(--success)",
                transition:"all 0.15s",
              }}
            >
              {selected.active
                ? <><XCircle size={14}/> Suspender</>
                : <><CheckCircle size={14}/> Activar</>
              }
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
