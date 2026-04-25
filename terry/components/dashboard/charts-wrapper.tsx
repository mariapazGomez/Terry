"use client";
import { useEffect, useState, type ComponentType } from "react";

type MesData = { label: string; ingresos: number; egresos: number };
type CategoriaEgreso = { nombre: string; monto: number };

function ChartSkeleton({ height }: { height: number }) {
  return (
    <div
      style={{ width: "100%", height, borderRadius: 8, background: "rgba(10,10,10,0.05)" }}
      className="animate-pulse"
    />
  );
}

export function FlujoLineasChartWrapper({ data }: { data: MesData[] }) {
  const [Chart, setChart] = useState<ComponentType<{ data: MesData[] }> | null>(null);

  useEffect(() => {
    let cancelled = false;
    import("./flujo-lineas-chart").then((mod) => {
      if (!cancelled) setChart(() => mod.default);
    });
    return () => { cancelled = true; };
  }, []);

  if (!Chart) return <ChartSkeleton height={190} />;
  return <Chart data={data} />;
}

export function DistribucionChartWrapper({ data }: { data: CategoriaEgreso[] }) {
  const [Chart, setChart] = useState<ComponentType<{ data: CategoriaEgreso[] }> | null>(null);

  useEffect(() => {
    let cancelled = false;
    import("./distribucion-chart").then((mod) => {
      if (!cancelled) setChart(() => mod.default);
    });
    return () => { cancelled = true; };
  }, []);

  if (!Chart) return <ChartSkeleton height={120} />;
  return <Chart data={data} />;
}
