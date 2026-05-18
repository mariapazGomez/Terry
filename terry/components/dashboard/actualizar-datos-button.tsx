"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

type Paso = "idle" | "sync" | "snapshot" | "ok" | "error"

const LABEL: Record<Paso, string> = {
  idle:     "Actualizar datos",
  sync:     "Sincronizando...",
  snapshot: "Generando resúmenes...",
  ok:       "Actualizado",
  error:    "Error — reintentar",
}

function desdeFecha(diasAtras: number): string {
  const d = new Date()
  d.setDate(d.getDate() - diasAtras)
  return d.toISOString().slice(0, 10)
}

export default function ActualizarDatosButton() {
  const [paso, setPaso]   = useState<Paso>("idle")
  const [info, setInfo]   = useState<string | null>(null)
  const router            = useRouter()

  async function actualizar() {
    setPaso("sync")
    setInfo(null)

    try {
      // 1. Sincronizar transacciones nuevas desde SumUp
      const syncRes  = await fetch("/api/sumup/sync", { method: "POST" })
      const syncJson = await syncRes.json()
      if (!syncRes.ok) throw new Error(syncJson.error ?? "Error en sync")

      // 2. Regenerar snapshots diarios (últimos 90 días cubre la comparativa 3 meses)
      setPaso("snapshot")
      const snapRes  = await fetch("/api/sumup/snapshots/dia", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ desde: desdeFecha(90) }),
      })
      const snapJson = await snapRes.json()
      if (!snapRes.ok) throw new Error(snapJson.error ?? "Error en snapshot")

      const txLabel  = syncJson.sincronizadas > 0
        ? `${syncJson.sincronizadas} tx nuevas`
        : "sin tx nuevas"
      const diasLabel = `${snapJson.dias} días actualizados`

      setPaso("ok")
      setInfo(`${txLabel} · ${diasLabel}`)
      router.refresh()

      // Volver al estado idle después de 4 s
      setTimeout(() => { setPaso("idle"); setInfo(null) }, 4000)

    } catch (err) {
      setPaso("error")
      setInfo(String(err))
      setTimeout(() => { setPaso("idle"); setInfo(null) }, 6000)
    }
  }

  const busy    = paso === "sync" || paso === "snapshot"
  const isError = paso === "error"

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <button
        onClick={actualizar}
        disabled={busy}
        style={{
          display: "flex", alignItems: "center", gap: 6,
          padding: "6px 13px", borderRadius: 7,
          fontSize: 11, fontWeight: 500,
          fontFamily: "var(--font-mono)",
          border: "1px solid rgba(10,10,10,0.13)",
          background: isError ? "oklch(0.97 0.02 27)" : busy ? "rgba(10,10,10,0.04)" : "white",
          color: isError ? "oklch(0.50 0.18 27)" : busy ? "rgba(10,10,10,0.40)" : "rgba(10,10,10,0.60)",
          cursor: busy ? "wait" : "pointer",
          transition: "background 0.15s, color 0.15s",
        }}
      >
        {/* Spinner mientras trabaja */}
        {busy ? (
          <svg
            width="12" height="12" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" strokeWidth="2.5"
            strokeLinecap="round"
            style={{ animation: "spin 0.8s linear infinite" }}
          >
            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
          </svg>
        ) : paso === "ok" ? (
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="oklch(0.62 0.15 145)" strokeWidth="2.5" strokeLinecap="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        ) : (
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="1 4 1 10 7 10" />
            <path d="M3.51 15a9 9 0 1 0 .49-3.51" />
          </svg>
        )}
        {LABEL[paso]}
      </button>

      {/* Indicador de paso en progreso */}
      {busy && (
        <span style={{ fontSize: 10, color: "rgba(10,10,10,0.35)", fontFamily: "var(--font-mono)" }}>
          {paso === "sync" ? "1/2" : "2/2"}
        </span>
      )}

      {/* Resultado */}
      {info && !busy && (
        <span style={{
          fontSize: 10, fontFamily: "var(--font-mono)",
          color: isError ? "oklch(0.50 0.18 27)" : "rgba(10,10,10,0.40)",
        }}>
          {info}
        </span>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}
