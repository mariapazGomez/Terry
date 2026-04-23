"use client";
import dynamic from "next/dynamic";

const VentasChart = dynamic(() => import("./ventas-chart"), { ssr: false });
const ComparativaChart = dynamic(() => import("./comparativa-chart"), { ssr: false });
const DistribucionChart = dynamic(() => import("./distribucion-chart"), { ssr: false });

type DiaVenta = { dia: number; ingresos: number; egresos: number };
type MesData = { label: string; ingresos: number; egresos: number };
type CategoriaEgreso = { nombre: string; monto: number };

export function VentasChartWrapper({ data }: { data: DiaVenta[] }) {
  return <VentasChart data={data} />;
}

export function ComparativaChartWrapper({ data }: { data: MesData[] }) {
  return <ComparativaChart data={data} />;
}

export function DistribucionChartWrapper({ data }: { data: CategoriaEgreso[] }) {
  return <DistribucionChart data={data} />;
}
