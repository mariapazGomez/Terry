'use server'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { getContextoUsuario } from '@/lib/contexto-usuario'

// ─── Ventas diarias marzo 2026 (entre 500k y 1M) ─────────────────────────────
const ventasDiarias = [
  { dia: '2026-03-01', monto: 723000 },
  { dia: '2026-03-02', monto: 891000 },
  { dia: '2026-03-03', monto: 654000 },
  { dia: '2026-03-04', monto: 987000 },
  { dia: '2026-03-05', monto: 512000 },
  { dia: '2026-03-06', monto: 745000 },
  { dia: '2026-03-07', monto: 863000 },
  { dia: '2026-03-08', monto: 934000 },
  { dia: '2026-03-09', monto: 678000 },
  { dia: '2026-03-10', monto: 821000 },
  { dia: '2026-03-11', monto: 560000 },
  { dia: '2026-03-12', monto: 912000 },
  { dia: '2026-03-13', monto: 789000 },
  { dia: '2026-03-14', monto: 645000 },
  { dia: '2026-03-15', monto: 834000 },
  { dia: '2026-03-16', monto: 971000 },
  { dia: '2026-03-17', monto: 702000 },
  { dia: '2026-03-18', monto: 843000 },
  { dia: '2026-03-19', monto: 596000 },
  { dia: '2026-03-20', monto: 877000 },
  { dia: '2026-03-21', monto: 755000 },
  { dia: '2026-03-22', monto: 923000 },
  { dia: '2026-03-23', monto: 689000 },
  { dia: '2026-03-24', monto: 814000 },
  { dia: '2026-03-25', monto: 543000 },
  { dia: '2026-03-26', monto: 899000 },
  { dia: '2026-03-27', monto: 731000 },
  { dia: '2026-03-28', monto: 852000 },
  { dia: '2026-03-29', monto: 500000 },
  { dia: '2026-03-30', monto: 624000 },
  { dia: '2026-03-31', monto: 786000 },
]

// ─── Gastos reales del Excel (Marzo 2026) ────────────────────────────────────
const gastos = [
  // Compras de insumos
  { fecha: '2026-03-02', desc: 'Compra general insumos', monto: 140000, tercero: '' },
  { fecha: '2026-03-02', desc: 'Mantención camioneta', monto: 387615, tercero: '' },
  { fecha: '2026-03-03', desc: 'Verduras', monto: 31640, tercero: '' },
  { fecha: '2026-03-03', desc: 'Eric Montalvo - pan semana feb', monto: 29670, tercero: 'Eric Montalvo' },
  { fecha: '2026-03-04', desc: 'Cecilia Royal - insumos', monto: 42900, tercero: 'Cecilia Royal' },
  { fecha: '2026-03-04', desc: '2 bandejas', monto: 21480, tercero: '' },
  { fecha: '2026-03-05', desc: 'Pan', monto: 3660, tercero: '' },
  { fecha: '2026-03-05', desc: 'Samuel Ríos - delivery', monto: 12000, tercero: 'Samuel Ríos' },
  { fecha: '2026-03-06', desc: 'Abarrotes y aseo', monto: 116047, tercero: '' },
  { fecha: '2026-03-06', desc: 'Verduras - Ricardo Cox', monto: 180000, tercero: 'Ricardo Cristian Cox' },
  { fecha: '2026-03-06', desc: 'Mariscos, merluza y camarón', monto: 204248, tercero: '' },
  { fecha: '2026-03-06', desc: 'Distribuidora Alfredo Rabanal - abarrotes', monto: 189638, tercero: 'Dist. Alfredo Rabanal' },
  { fecha: '2026-03-06', desc: 'Pan', monto: 39412, tercero: '' },
  { fecha: '2026-03-06', desc: 'Envases y empaques', monto: 20093, tercero: '' },
  { fecha: '2026-03-07', desc: 'Alargador', monto: 14540, tercero: '' },
  { fecha: '2026-03-07', desc: 'Vanni - empaques', monto: 29072, tercero: 'Vanni' },
  { fecha: '2026-03-07', desc: 'Samuel Ríos - delivery vie/sab', monto: 24000, tercero: 'Samuel Ríos' },
  { fecha: '2026-03-07', desc: 'Samuel Ríos - delivery', monto: 7000, tercero: 'Samuel Ríos' },
  { fecha: '2026-03-08', desc: 'Jessica - productos mariscos', monto: 5000, tercero: 'Jessica' },
  { fecha: '2026-03-09', desc: 'Jonatan Eduardo Leiva - pescado', monto: 1000000, tercero: 'Jonatan Leiva' },
  { fecha: '2026-03-11', desc: 'Combustible camioneta', monto: 163832, tercero: '' },
  { fecha: '2026-03-11', desc: 'Tomate y cilantro', monto: 14202, tercero: '' },
  { fecha: '2026-03-11', desc: 'Ají no moto', monto: 5000, tercero: '' },
  { fecha: '2026-03-11', desc: 'Verduras', monto: 140400, tercero: '' },
  { fecha: '2026-03-11', desc: 'Paltas y lechuga', monto: 4800, tercero: '' },
  { fecha: '2026-03-11', desc: 'Samuel Ríos - delivery', monto: 17500, tercero: 'Samuel Ríos' },
  { fecha: '2026-03-13', desc: 'Provimarket - abarrotes', monto: 54332, tercero: 'Provimarket' },
  { fecha: '2026-03-13', desc: 'Dist. Dical - huevos', monto: 8600, tercero: 'Dist. Dical' },
  { fecha: '2026-03-13', desc: 'Vanni - abarrotes', monto: 129683, tercero: 'Vanni' },
  { fecha: '2026-03-13', desc: 'J.C. Arancibia - gas', monto: 26085, tercero: 'J.C. Arancibia' },
  { fecha: '2026-03-13', desc: 'Queso parmesano', monto: 39160, tercero: '' },
  { fecha: '2026-03-15', desc: 'Provimarket - abarrotes', monto: 8310, tercero: 'Provimarket' },
  { fecha: '2026-03-15', desc: 'Samuel Ríos - delivery', monto: 39500, tercero: 'Samuel Ríos' },
  { fecha: '2026-03-16', desc: 'Distribuidora Alfredo Rabanal - insumos', monto: 252614, tercero: 'Dist. Alfredo Rabanal' },
  { fecha: '2026-03-17', desc: 'Jonatan Eduardo Leiva - pescado', monto: 1000000, tercero: 'Jonatan Leiva' },
  // Servicios
  { fecha: '2026-03-02', desc: 'Abogado - honorarios', monto: 1000000, tercero: 'Fabricio Abogado' },
  { fecha: '2026-03-06', desc: 'Norma Miranda - multa SII', monto: 212000, tercero: 'Norma Miranda' },
  { fecha: '2026-03-09', desc: 'Norma Miranda - imposiciones + fonasa', monto: 836216, tercero: 'Norma Miranda' },
  { fecha: '2026-03-16', desc: 'Fabricio Abogado - notificaciones', monto: 130000, tercero: 'Fabricio Abogado' },
  // Arriendo
  { fecha: '2026-03-16', desc: 'Jorge González - pago arriendo', monto: 1260000, tercero: 'Jorge González' },
  // Crédito / financiero
  { fecha: '2026-03-03', desc: 'Pago línea de crédito', monto: 2000000, tercero: '' },
  { fecha: '2026-03-03', desc: 'Pago crédito', monto: 970422, tercero: '' },
]

// ─── Sueldos marzo 2026 (7 trabajadores x ~650k) ─────────────────────────────
const sueldos = [
  { nombre: 'Gloria Méndez', monto: 650000 },
  { nombre: 'Noemí Vargas', monto: 650000 },
  { nombre: 'Samuel Ríos', monto: 650000 },
  { nombre: 'Andrés Fuentes', monto: 650000 },
  { nombre: 'Yasna Pizarro', monto: 650000 },
  { nombre: 'German Mosqueira', monto: 650000 },
  { nombre: 'Eric Montalvo', monto: 650000 },
]

function iva(total: number) {
  const neto = Math.round(total / 1.19)
  return { monto_neto: neto, monto_impuesto: total - neto, monto_total: total }
}

async function insertarDatosDummy() {
  'use server'
  const supabase = await createClient()
  const contexto = await getContextoUsuario()

  if (!contexto.sucursalActiva) throw new Error('No hay sucursal activa')

  const base = {
    organizacion_id: contexto.organizacionId,
    sucursal_id: contexto.sucursalActiva.id,
    moneda: 'CLP',
    creado_por: contexto.user.id,
  }

  // 1. Ventas diarias
  const ingresos = ventasDiarias.map((v) => ({
    ...base,
    ...iva(v.monto),
    tipo_registro: 'ingreso',
    estado: 'pagado',
    fecha_emision: v.dia,
    descripcion: 'Ventas del día',
  }))

  const { error: errIngresos } = await supabase
    .from('registros_financieros')
    .insert(ingresos)
  if (errIngresos) throw new Error(`Ingresos: ${errIngresos.message}`)

  // 2. Gastos del Excel
  const egresosExcel = gastos.map((g) => ({
    ...base,
    ...iva(g.monto),
    tipo_registro: 'gasto',
    estado: 'pagado',
    fecha_emision: g.fecha,
    descripcion: g.desc,
    tercero_nombre: g.tercero || null,
  }))

  const { error: errGastos } = await supabase
    .from('registros_financieros')
    .insert(egresosExcel)
  if (errGastos) throw new Error(`Gastos: ${errGastos.message}`)

  // 3. Sueldos (sin IVA)
  const egresosSueldos = sueldos.map((s) => ({
    ...base,
    monto_neto: s.monto,
    monto_impuesto: 0,
    monto_total: s.monto,
    tipo_registro: 'gasto',
    estado: 'pagado',
    fecha_emision: '2026-03-28',
    descripcion: `Sueldo marzo 2026 - ${s.nombre}`,
    tercero_nombre: s.nombre,
  }))

  const { error: errSueldos } = await supabase
    .from('registros_financieros')
    .insert(egresosSueldos)
  if (errSueldos) throw new Error(`Sueldos: ${errSueldos.message}`)

  revalidatePath('/dashboard')
}

export default async function SeedPage() {
  return (
    <div className="p-6 max-w-xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-zinc-950">
          Insertar datos de prueba
        </h1>
        <p className="mt-1 text-sm text-zinc-400">
          Inserta datos reales de Marzo 2026: 31 días de ventas, 42 gastos del Excel y 7 sueldos.
        </p>
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white p-5 space-y-3">
        <div className="text-sm space-y-1">
          <div className="flex justify-between">
            <span className="text-zinc-500">Ingresos (ventas diarias)</span>
            <span className="font-medium text-emerald-600">31 registros</span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-500">Gastos del Excel (Marzo)</span>
            <span className="font-medium text-red-500">42 registros</span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-500">Sueldos marzo (7 trabajadores)</span>
            <span className="font-medium text-red-500">7 registros</span>
          </div>
        </div>

        <div className="border-t border-zinc-100 pt-3">
          <form action={insertarDatosDummy}>
            <button
              type="submit"
              className="w-full rounded-lg bg-zinc-950 px-4 py-2.5 text-sm font-medium text-white hover:bg-zinc-800 transition-colors"
            >
              Insertar datos
            </button>
          </form>
        </div>
      </div>

      <p className="text-xs text-zinc-400">
        Esta página es solo para desarrollo. Elimínala antes de ir a producción.
      </p>
    </div>
  )
}
