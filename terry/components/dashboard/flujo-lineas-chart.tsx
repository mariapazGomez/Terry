import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

type MesData = { label: string; ingresos: number; egresos: number };

const GREEN = "oklch(0.62 0.15 145)";
const RED   = "oklch(0.58 0.19 27)";
const INK   = "#0a0a0a";

function fmt(v: number) {
  if (Math.abs(v) >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
  if (Math.abs(v) >= 1_000)     return `$${(v / 1_000).toFixed(0)}k`;
  return `$${v}`;
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const full = (v: number) =>
    new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 }).format(v);
  const colors: Record<string, string> = { ingresos: GREEN, egresos: RED, neto: INK };
  const names: Record<string, string>  = { ingresos: "Ingresos", egresos: "Egresos", neto: "Neto" };
  return (
    <div
      style={{
        background: "white", border: "1px solid rgba(10,10,10,0.13)",
        borderRadius: 8, padding: "8px 12px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
        fontFamily: "var(--font-mono)", fontSize: 11,
      }}
    >
      <p style={{ fontWeight: 600, color: "#0a0a0a", marginBottom: 4 }}>{label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} style={{ color: colors[p.dataKey] || INK, margin: "2px 0" }}>
          {names[p.dataKey] || p.dataKey}: <span style={{ fontWeight: 600 }}>{full(p.value)}</span>
        </p>
      ))}
    </div>
  );
}

export default function FlujoLineasChart({ data }: { data: MesData[] }) {
  if (!data.length) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 160 }}>
        <p style={{ fontSize: 12, color: "rgba(10,10,10,0.40)" }}>Sin datos</p>
      </div>
    );
  }

  const chartData = data.map((d) => ({
    ...d,
    neto: d.ingresos - d.egresos,
  }));

  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
      <ResponsiveContainer width="100%" height={160}>
        <LineChart data={chartData} margin={{ top: 6, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="2 3" stroke="rgba(10,10,10,0.06)" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 9.5, fill: "rgba(10,10,10,0.50)", fontFamily: "var(--font-mono)" }}
            tickLine={false} axisLine={false}
          />
          <YAxis
            tickFormatter={fmt}
            tick={{ fontSize: 9.5, fill: "rgba(10,10,10,0.50)", fontFamily: "var(--font-mono)" }}
            tickLine={false} axisLine={false} width={44}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line dataKey="ingresos" stroke={GREEN} strokeWidth={1.6} dot={{ r: 2, fill: GREEN }} activeDot={{ r: 3 }} />
          <Line dataKey="egresos"  stroke={RED}   strokeWidth={1.6} dot={{ r: 2, fill: RED }}   activeDot={{ r: 3 }} />
          <Line dataKey="neto"     stroke={INK}   strokeWidth={1.4} dot={{ r: 2, fill: INK }}   activeDot={{ r: 3 }} strokeDasharray="3 2" />
        </LineChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div style={{ display: "flex", gap: 12, marginTop: 8, flexWrap: "wrap" }}>
        {[
          { label: "Ingresos", color: GREEN },
          { label: "Egresos",  color: RED },
          { label: "Neto",     color: INK },
        ].map((s) => (
          <div key={s.label} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 10.5, color: "rgba(10,10,10,0.70)", fontFamily: "var(--font-mono)" }}>
            <span style={{ width: 8, height: 2, background: s.color, borderRadius: 1, display: "inline-block" }} />
            {s.label}
          </div>
        ))}
      </div>
    </div>
  );
}
