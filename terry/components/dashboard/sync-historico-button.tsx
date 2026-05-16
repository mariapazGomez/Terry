"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

const INK50 = "rgba(10,10,10,0.52)"

export default function SyncHistoricoButton() {
  const [dias, setDias] = useState(30)
  const [loading, setLoading] = useState(false)
  const [resultado, setResultado] = useState<string | null>(null)
  const router = useRouter()

  async function cargar() {
    setLoading(true)
    setResultado(null)
    try {
      const res = await fetch("/api/sumup/sync-historico", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dias }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      setResultado(
        json.insertadas === 0
          ? json.mensaje ?? "Sin transacciones nuevas"
          : `${json.insertadas} transacciones · ${json.paginas} ${json.paginas === 1 ? "página" : "páginas"}`
      )
      router.refresh()
    } catch (err) {
      setResultado(`Error: ${String(err)}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
      <select
        value={dias}
        onChange={(e) => setDias(Number(e.target.value))}
        disabled={loading}
        style={{
          padding: "7px 10px", borderRadius: 7, fontSize: 12,
          border: "1px solid rgba(10,10,10,0.15)",
          background: "white", color: "#0a0a0a",
          fontFamily: "var(--font-mono)", cursor: "pointer",
          outline: "none",
        }}
      >
        <option value={30}>Últimos 30 días</option>
        <option value={60}>Últimos 60 días</option>
        <option value={90}>Últimos 90 días</option>
      </select>

      <button
        onClick={cargar}
        disabled={loading}
        style={{
          padding: "7px 14px", borderRadius: 7, fontSize: 12, fontWeight: 600,
          background: loading ? "rgba(10,10,10,0.06)" : "rgba(10,10,10,0.08)",
          color: loading ? "rgba(10,10,10,0.40)" : "#0a0a0a",
          border: "1px solid rgba(10,10,10,0.12)",
          cursor: loading ? "not-allowed" : "pointer",
          fontFamily: "var(--font-sans)", transition: "background 0.15s",
        }}
      >
        {loading ? "Cargando historial..." : "Carga histórica"}
      </button>

      {resultado && (
        <span style={{ fontSize: 11, color: INK50, fontFamily: "var(--font-mono)" }}>
          {resultado}
        </span>
      )}
    </div>
  )
}
