"use client";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

type CategoriaEgreso = { nombre: string; monto: number };

const COLORS = [
  "#0f172a", "#334155", "#64748b", "#94a3b8", "#cbd5e1", "#e2e8f0",
];

function formatCLP(v: number) {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(v);
}

function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="rounded-lg border border-zinc-200 bg-white px-3 py-2 shadow-sm text-xs">
      <p className="font-medium text-zinc-700">{d.nombre}</p>
      <p className="text-zinc-500">{formatCLP(d.monto)}</p>
    </div>
  );
}

export default function DistribucionChart({ data }: { data: CategoriaEgreso[] }) {
  if (!data.length) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-sm text-zinc-400">Sin egresos registrados</p>
      </div>
    );
  }

  const total = data.reduce((s, d) => s + d.monto, 0);

  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height={180}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius="55%"
              outerRadius="80%"
              dataKey="monto"
              paddingAngle={2}
              strokeWidth={0}
            >
              {data.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="space-y-1.5">
        {data.slice(0, 6).map((d, i) => (
          <div key={d.nombre} className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 min-w-0">
              <span
                className="h-2 w-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: COLORS[i % COLORS.length] }}
              />
              <span className="text-zinc-600 truncate">{d.nombre}</span>
            </div>
            <span className="text-zinc-400 tabular-nums ml-2">
              {((d.monto / total) * 100).toFixed(0)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
