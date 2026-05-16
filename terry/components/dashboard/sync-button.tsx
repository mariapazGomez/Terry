"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function SyncButton() {
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)
  const router = useRouter()

  async function sync() {
    setLoading(true)
    setMsg(null)
    try {
      const res = await fetch("/api/sumup/sync", { method: "POST" })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      setMsg(`${json.sincronizadas} transacciones sincronizadas`)
      router.refresh()
    } catch (err) {
      setMsg(`Error: ${String(err)}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <button
        onClick={sync}
        disabled={loading}
        style={{
          padding: "7px 14px", borderRadius: 7, fontSize: 12, fontWeight: 600,
          background: loading ? "rgba(10,10,10,0.06)" : "#0a0a0a",
          color: loading ? "rgba(10,10,10,0.40)" : "white",
          border: "none", cursor: loading ? "not-allowed" : "pointer",
          fontFamily: "var(--font-sans)", transition: "background 0.15s",
        }}
      >
        {loading ? "Sincronizando..." : "Sincronizar SumUp"}
      </button>
      {msg && (
        <span style={{ fontSize: 11, color: "rgba(10,10,10,0.52)", fontFamily: "var(--font-mono)" }}>
          {msg}
        </span>
      )}
    </div>
  )
}
