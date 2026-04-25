"use client";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

type MesData = { label: string; ingresos: number; egresos: number };

function formatCLP(v: number) {
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `$${(v / 1_000).toFixed(0)}k`;
  return `$${v}`;
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const fmt = (v: number) =>
    new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 }).format(v);
  return (
    <div className="rounded-lg border border-zinc-200 bg-white px-3 py-2 shadow-sm text-xs space-y-1">
      <p className="font-medium text-zinc-700">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.fill }}>
          {p.name === "ingresos" ? "Ingresos" : "Egresos"}:{" "}
          <span className="font-semibold">{fmt(p.value)}</span>
        </p>
      ))}
      {payload.length === 2 && (
        <p className={`font-semibold border-t border-zinc-100 pt-1 ${payload[0].value - payload[1].value >= 0 ? "text-emerald-600" : "text-red-500"}`}>
          Balance: {fmt(payload[0].value - payload[1].value)}
        </p>
      )}
    </div>
  );
}

function CustomLegend() {
  return (
    <div className="flex items-center gap-4 justify-end text-xs text-zinc-500 pb-1">
      <span className="flex items-center gap-1.5">
        <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
        Ingresos
      </span>
      <span className="flex items-center gap-1.5">
        <span className="inline-block h-2 w-2 rounded-full bg-rose-400" />
        Egresos
      </span>
    </div>
  );
}

export default function ComparativaChart({ data }: { data: MesData[] }) {
  const tieneData = data.some((d) => d.ingresos > 0 || d.egresos > 0);
  if (!tieneData) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-sm text-zinc-400">Sin datos comparativos</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <CustomLegend />
      <ResponsiveContainer width="100%" height={224}>
        <BarChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }} barGap={2}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 11, fill: "#a1a1aa" }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            tickFormatter={formatCLP}
            tick={{ fontSize: 11, fill: "#a1a1aa" }}
            tickLine={false}
            axisLine={false}
            width={52}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: "#f9f9f9" }} />
          <Bar dataKey="ingresos" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={36} />
          <Bar dataKey="egresos" fill="#fb7185" radius={[4, 4, 0, 0]} maxBarSize={36} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
