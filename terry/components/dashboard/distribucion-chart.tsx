import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

type CategoriaEgreso = { nombre: string; monto: number };

// Terry-style financial palette
const COLORS = [
  "#0a0a0a",
  "oklch(0.58 0.19 27)",
  "oklch(0.82 0.15 85)",
  "oklch(0.62 0.15 145)",
  "rgba(10,10,10,0.35)",
  "rgba(10,10,10,0.20)",
];

function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  const full = new Intl.NumberFormat("es-CL", {
    style: "currency", currency: "CLP", maximumFractionDigits: 0,
  }).format(d.monto);
  return (
    <div
      style={{
        background: "white", border: "1px solid rgba(10,10,10,0.13)",
        borderRadius: 8, padding: "7px 10px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
        fontFamily: "var(--font-mono)", fontSize: 11,
      }}
    >
      <p style={{ fontWeight: 600, color: "#0a0a0a" }}>{d.nombre}</p>
      <p style={{ color: "rgba(10,10,10,0.55)", marginTop: 2 }}>{full}</p>
    </div>
  );
}

export default function DistribucionChart({ data }: { data: CategoriaEgreso[] }) {
  if (!data.length) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 160 }}>
        <p style={{ fontSize: 12, color: "rgba(10,10,10,0.40)" }}>Sin egresos registrados</p>
      </div>
    );
  }

  const total = data.reduce((s, d) => s + d.monto, 0);

  return (
    <div style={{ display: "flex", gap: 16, alignItems: "center", flex: 1 }}>
      {/* Donut */}
      <div style={{ flexShrink: 0 }}>
        <ResponsiveContainer width={100} height={100}>
          <PieChart>
            <Pie
              data={data}
              cx="50%" cy="50%"
              innerRadius="52%" outerRadius="80%"
              dataKey="monto" paddingAngle={2} strokeWidth={0}
            >
              {data.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div style={{ display: "flex", flexDirection: "column", gap: 6, flex: 1, minWidth: 0 }}>
        {data.slice(0, 6).map((d, i) => (
          <div key={d.nombre} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "rgba(10,10,10,0.70)" }}>
            <span
              style={{
                width: 8, height: 8, borderRadius: 2,
                background: COLORS[i % COLORS.length], flexShrink: 0,
              }}
            />
            <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {d.nombre}
            </span>
            <span style={{ fontFamily: "var(--font-mono)", color: "#0a0a0a", fontSize: 10.5 }}>
              {((d.monto / total) * 100).toFixed(0)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
