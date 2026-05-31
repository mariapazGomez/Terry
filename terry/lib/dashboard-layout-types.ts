export type WidgetId =
  | "ventas-hoy"
  | "balance-mes"
  | "comparativa-3m"
  | "acumulado-2m"
  | "ventas-hora"
  | "heatmap-hora-dia"
  | "indicadores-mes"
  | "analisis-financiero"
  | "vencimientos"

export type WidgetConfig = {
  id: WidgetId
  visible: boolean
}

export const DEFAULT_LAYOUT: WidgetConfig[] = [
  { id: "ventas-hoy",          visible: true },
  { id: "vencimientos",        visible: true },
  { id: "balance-mes",         visible: true },
  { id: "comparativa-3m",      visible: true },
  { id: "acumulado-2m",        visible: true },
  { id: "ventas-hora",         visible: true },
  { id: "heatmap-hora-dia",   visible: true },
  { id: "analisis-financiero", visible: true },
]
