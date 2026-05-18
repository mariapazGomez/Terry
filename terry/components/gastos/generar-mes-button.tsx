"use client"

import { useState, useTransition } from "react"
import { generarGastosDelMes } from "@/modules/gastos-recurrentes/actions"

export default function GenerarMesButton({ anio, mes, label }: { anio: number; mes: number; label: string }) {
  const [pending, start] = useTransition()
  const [msg, setMsg]    = useState<string | null>(null)

  function handleClick() {
    setMsg(null)
    start(async () => {
      const { generados } = await generarGastosDelMes(anio, mes)
      setMsg(generados === 0 ? "Todo al día, sin nuevos gastos que generar" : `${generados} gasto${generados > 1 ? "s" : ""} generado${generados > 1 ? "s" : ""}`)
    })
  }

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <button
        onClick={handleClick}
        disabled={pending}
        style={{
          display: "flex", alignItems: "center", gap: 6,
          padding: "7px 14px", borderRadius: 7, fontSize: 12, fontWeight: 600,
          border: "1px solid rgba(10,10,10,0.13)",
          background: pending ? "rgba(10,10,10,0.04)" : "#0a0a0a",
          color: pending ? "rgba(10,10,10,0.40)" : "white",
          cursor: pending ? "wait" : "pointer",
          fontFamily: "var(--font-mono)", transition: "background 0.15s",
        }}
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
        </svg>
        {pending ? "Generando..." : `Generar gastos de ${label}`}
      </button>
      {msg && (
        <span style={{ fontSize: 11, color: "rgba(10,10,10,0.45)", fontFamily: "var(--font-mono)" }}>
          {msg}
        </span>
      )}
    </div>
  )
}
