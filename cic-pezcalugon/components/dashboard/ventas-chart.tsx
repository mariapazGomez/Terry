"use client";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

type DiaVenta = { dia: number; ingresos: number; egresos: number };

function formatCLP(v: number) {
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `$${(v / 1_000).toFixed(0)}k`;
  return `$${v}`;
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-zinc-200 bg-white px-3 py-2 shadow-sm text-xs">
      <p className="font-medium text-zinc-700 mb-1">Día {label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color }}>
          {p.name === "ingresos" ? "Ingresos" : "Egresos"}:{" "}
          <span className="font-semibold">
            {new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 }).format(p.value)}
          </span>
        </p>
      ))}
    </div>
  );
}

export default function VentasChart({ data }: { data: DiaVenta[] }) {
  if (!data.length) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-sm text-zinc-400">Sin datos para este período</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="gradIngresos" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="gradEgresos" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.12} />
            <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" vertical={false} />
        <XAxis
          dataKey="dia"
          tick={{ fontSize: 11, fill: "#a1a1aa" }}
          tickLine={false}
          axisLine={false}
          interval={4}
        />
        <YAxis
          tickFormatter={formatCLP}
          tick={{ fontSize: 11, fill: "#a1a1aa" }}
          tickLine={false}
          axisLine={false}
          width={48}
        />
        <Tooltip content={<CustomTooltip />} />
        <Area
          type="monotone"
          dataKey="ingresos"
          stroke="#10b981"
          strokeWidth={2}
          fill="url(#gradIngresos)"
          dot={false}
          activeDot={{ r: 4, fill: "#10b981" }}
        />
        <Area
          type="monotone"
          dataKey="egresos"
          stroke="#f43f5e"
          strokeWidth={2}
          fill="url(#gradEgresos)"
          dot={false}
          activeDot={{ r: 4, fill: "#f43f5e" }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
