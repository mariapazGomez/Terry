"use client";
import dynamic from "next/dynamic";
import type { PuntoSemana, PuntoMes } from "@/lib/sumup/resumen";

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

const FlujoLineasChart = dynamic(() => import("./flujo-lineas-chart"), {
  ssr: false,
  loading: () => <ChartSkeleton height={190} />,
});

const DistribucionChart = dynamic(() => import("./distribucion-chart"), {
  ssr: false,
  loading: () => <ChartSkeleton height={120} />,
});

const VentasSemanasChart = dynamic(() => import("./ventas-semanas-chart"), {
  ssr: false,
  loading: () => <ChartSkeleton height={220} />,
});

const VentasMesChart = dynamic(() => import("./ventas-mes-chart"), {
  ssr: false,
  loading: () => <ChartSkeleton height={220} />,
});

export function FlujoLineasChartWrapper({ data }: { data: MesData[] }) {
  return <FlujoLineasChart data={data} />;
}

export function DistribucionChartWrapper({ data }: { data: CategoriaEgreso[] }) {
  return <DistribucionChart data={data} />;
}

export function VentasSemanasChartWrapper({ data, labels }: { data: PuntoSemana[]; labels: string[] }) {
  return <VentasSemanasChart data={data} labels={labels} />;
}

export function VentasMesChartWrapper({ data }: { data: PuntoMes[] }) {
  return <VentasMesChart data={data} />;
}


