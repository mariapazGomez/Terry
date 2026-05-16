import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine,
} from "recharts"
import type { PuntoMes } from "@/lib/sumup/resumen"

const GREEN = "oklch(0.62 0.15 145)"

function fmt(v: number) {
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`
  if (v >= 1_000)     return `$${(v / 1_000).toFixed(0)}k`
  return `$${v}`
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  const full = new Intl.NumberFormat("es-CL", {
    style: "currency", currency: "CLP", maximumFractionDigits: 0,
  }).format(payload[0].value)
  return (
    <div style={{
      background: "white", border: "1px solid rgba(10,10,10,0.13)",
      borderRadius: 8, padding: "8px 12px",
      boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
      fontFamily: "var(--font-mono)", fontSize: 11,
    }}>
      <p style={{ fontWeight: 600, color: "#0a0a0a", marginBottom: 2 }}>Día {label}</p>
      <p style={{ color: GREEN }}>{full}</p>
    </div>
  )
}

export default function VentasMesChart({ data }: { data: PuntoMes[] }) {
  const promedio = data.length > 0
    ? Math.round(data.reduce((s, d) => s + d.total, 0) / data.length)
    : 0

  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data} margin={{ top: 6, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="2 3" stroke="rgba(10,10,10,0.06)" vertical={false} />
          <XAxis
            dataKey="dia"
            tick={{ fontSize: 9.5, fill: "rgba(10,10,10,0.50)", fontFamily: "var(--font-mono)" }}
            tickLine={false} axisLine={false}
          />
          <YAxis
            tickFormatter={fmt}
            tick={{ fontSize: 9.5, fill: "rgba(10,10,10,0.50)", fontFamily: "var(--font-mono)" }}
            tickLine={false} axisLine={false} width={44}
          />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine
            y={promedio}
            stroke="rgba(10,10,10,0.20)"
            strokeDasharray="3 2"
          />
          <Line
            dataKey="total"
            name="Ventas"
            stroke={GREEN}
            strokeWidth={2}
            dot={{ r: 2, fill: GREEN }}
            activeDot={{ r: 3 }}
          />
        </LineChart>
      </ResponsiveContainer>

      <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 10, color: "rgba(10,10,10,0.70)", fontFamily: "var(--font-mono)" }}>
          <span style={{ width: 16, height: 2, background: GREEN, borderRadius: 1, display: "inline-block" }} />
          Ventas diarias
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 10, color: "rgba(10,10,10,0.70)", fontFamily: "var(--font-mono)" }}>
          <span style={{ width: 16, height: 1, background: "rgba(10,10,10,0.30)", borderRadius: 1, display: "inline-block" }} />
          Promedio {fmt(promedio)}
        </div>
      </div>
    </div>
  )
}
