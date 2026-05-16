import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from "recharts"
import type { PuntoSemana } from "@/lib/sumup/resumen"

const COLORES = [
  "rgba(10,10,10,0.18)",
  "rgba(10,10,10,0.38)",
  "rgba(10,10,10,0.62)",
  "oklch(0.62 0.15 145)",
]

function fmt(v: number) {
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`
  if (v >= 1_000)     return `$${(v / 1_000).toFixed(0)}k`
  return `$${v}`
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: "white", border: "1px solid rgba(10,10,10,0.13)",
      borderRadius: 8, padding: "8px 12px",
      boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
      fontFamily: "var(--font-mono)", fontSize: 11,
    }}>
      <p style={{ fontWeight: 600, color: "#0a0a0a", marginBottom: 4 }}>{label}</p>
      {payload.map((p: any) => p.value != null && (
        <p key={p.dataKey} style={{ color: p.stroke, margin: "2px 0" }}>
          {p.name}: <span style={{ fontWeight: 600 }}>{fmt(p.value)}</span>
        </p>
      ))}
    </div>
  )
}

export default function VentasSemanasChart({
  data,
  labels,
}: {
  data: PuntoSemana[]
  labels: string[]
}) {
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
          {labels.map((label, i) => (
            <Line
              key={i}
              dataKey={`semana${i + 1}`}
              name={label}
              stroke={COLORES[i]}
              strokeWidth={i === labels.length - 1 ? 2 : 1.4}
              dot={{ r: 2, fill: COLORES[i] }}
              activeDot={{ r: 3 }}
              connectNulls={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>

      <div style={{ display: "flex", gap: 14, marginTop: 8, flexWrap: "wrap" }}>
        {labels.map((label, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 10, color: "rgba(10,10,10,0.70)", fontFamily: "var(--font-mono)" }}>
            <span style={{ width: 16, height: i === labels.length - 1 ? 2 : 1.5, background: COLORES[i], borderRadius: 1, display: "inline-block" }} />
            {label}
          </div>
        ))}
      </div>
    </div>
  )
}
