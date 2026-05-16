import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from "recharts"
import type { PuntoDia } from "@/lib/sumup/resumen"

const GREEN = "oklch(0.62 0.15 145)"

function fmt(v: number) {
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`
  if (v >= 1_000)     return `$${(v / 1_000).toFixed(0)}k`
  return `$${v}`
}

function fmtFull(v: number) {
  return new Intl.NumberFormat("es-CL", {
    style: "currency", currency: "CLP", maximumFractionDigits: 0,
  }).format(v)
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null
  const p = payload[0]?.payload as PuntoDia
  return (
    <div style={{
      background: "white", border: "1px solid rgba(10,10,10,0.13)",
      borderRadius: 8, padding: "8px 12px",
      boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
      fontFamily: "var(--font-mono)", fontSize: 11,
    }}>
      <p style={{ fontWeight: 600, color: "#0a0a0a", marginBottom: 2 }}>
        {p.mes} · S{p.semana} · {p.dia}
      </p>
      <p style={{ color: "#2d7a45" }}>{fmtFull(p.total)}</p>
    </div>
  )
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomXAxisTick({ x, y, payload, puntos }: any) {
  const punto = puntos.find((p: PuntoDia) => p.fecha === payload.value) as PuntoDia | undefined
  if (!punto) return null

  return (
    <g transform={`translate(${x},${y})`}>
      <text x={0} y={0} dy={12} textAnchor="middle" fontSize={7.5}
        fill="rgba(10,10,10,0.50)" fontFamily="var(--font-mono)">
        {punto.dia}
      </text>
      {punto.esInicioSemana && (
        <text x={0} y={0} dy={24} textAnchor="start" fontSize={7}
          fill="rgba(10,10,10,0.35)" fontFamily="var(--font-mono)">
          S{punto.semana}
        </text>
      )}
      {punto.esPrimeroMes && (
        <text x={0} y={0} dy={38} textAnchor="start" fontSize={7.5}
          fill="rgba(10,10,10,0.60)" fontFamily="var(--font-mono)" fontWeight="600">
          {punto.mes}
        </text>
      )}
    </g>
  )
}

export default function Ventas3MesesChart({
  puntos,
  meses,
}: {
  puntos: PuntoDia[]
  meses: string[]
}) {
  if (!puntos.length) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 280 }}>
        <p style={{ fontSize: 12, color: "rgba(10,10,10,0.40)", fontFamily: "var(--font-mono)" }}>Sin datos</p>
      </div>
    )
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={puntos} margin={{ top: 6, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="2 3" stroke="rgba(10,10,10,0.06)" vertical={false} />
          <XAxis
            dataKey="fecha"
            tick={(props) => <CustomXAxisTick {...props} puntos={puntos} />}
            height={52}
            tickLine={false}
            axisLine={false}
            interval={0}
          />
          <YAxis
            tickFormatter={fmt}
            tick={{ fontSize: 9.5, fill: "rgba(10,10,10,0.50)", fontFamily: "var(--font-mono)" }}
            tickLine={false} axisLine={false} width={44}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line
            dataKey="total"
            stroke={GREEN}
            strokeWidth={1.5}
            dot={false}
            activeDot={{ r: 3, fill: GREEN }}
            connectNulls={false}
          />
        </LineChart>
      </ResponsiveContainer>

      <div style={{ display: "flex", gap: 14, marginTop: 6, flexWrap: "wrap" }}>
        {meses.map((mes, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 10, color: "rgba(10,10,10,0.60)", fontFamily: "var(--font-mono)" }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "rgba(10,10,10,0.20)", display: "inline-block" }} />
            {mes}
          </div>
        ))}
      </div>
    </div>
  )
}
