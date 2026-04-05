import { crearRegistroFinanciero } from "@/modules/registros-financieros/actions";
import {
  getCategorias,
  getRegistrosFinancieros,
} from "@/modules/registros-financieros/queries";
import { subirDocumento } from "@/modules/documentos/actions";
import { getDocumentosPorRegistro } from "@/modules/documentos/queries";
import { getContextoUsuario } from "@/lib/contexto-usuario";
import RegistroCard from "@/components/registros/registro-card";



export default async function RegistrosPage() {
  const contexto = await getContextoUsuario();
  const registros = await getRegistrosFinancieros();
  const categorias = await getCategorias();

  return (
    <main className="space-y-6">
      <section>
        <h1 className="text-2xl font-semibold">Registros financieros</h1>
        <p className="text-sm text-gray-500 mt-1">
          Sucursal activa: {contexto.sucursalActiva?.nombre ?? "Sin sucursal activa"}
        </p>
      </section>

      <section className="rounded-xl border p-4 space-y-4">
        <h2 className="text-lg font-semibold">Nuevo registro</h2>

        <form action={crearRegistroFinanciero} className="grid gap-4 md:grid-cols-2">
        <div className="space-y-1">
          <label className="text-sm">Tipo de registro</label>
          <select
            name="tipo_registro"
            required
            className="w-full rounded-md border px-3 py-2 text-sm"
          >
            <option value="gasto">Gasto</option>
            <option value="ingreso">Ingreso</option>
            <option value="factura">Factura</option>
            <option value="boleta">Boleta</option>
            <option value="otro">Otro</option>
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-sm">Estado</label>
          <select
            name="estado"
            required
            defaultValue="borrador"
            className="w-full rounded-md border px-3 py-2 text-sm"
          >
            <option value="borrador">Borrador</option>
            <option value="pendiente">Pendiente</option>
            <option value="pagado">Pagado</option>
            <option value="vencido">Vencido</option>
            <option value="cancelado">Cancelado</option>
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-sm">Fecha de emision</label>
          <input
            type="date"
            name="fecha_emision"
            required
            className="w-full rounded-md border px-3 py-2 text-sm"
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm">Moneda</label>
          <input
            type="text"
            name="moneda"
            defaultValue="CLP"
            required
            className="w-full rounded-md border px-3 py-2 text-sm"
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm">Categoria</label>
          <select
            name="categoria_id"
            className="w-full rounded-md border px-3 py-2 text-sm"
            defaultValue=""
          >
            <option value="">Sin categoria</option>
            {categorias.map((categoria) => (
              <option key={categoria.id} value={categoria.id}>
                {categoria.nombre} ({categoria.tipo})
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-sm">Numero de documento</label>
          <input
            type="text"
            name="numero_documento"
            className="w-full rounded-md border px-3 py-2 text-sm"
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm">Tercero</label>
          <input
            type="text"
            name="tercero_nombre"
            placeholder="Proveedor o cliente"
            className="w-full rounded-md border px-3 py-2 text-sm"
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm">Monto neto</label>
          <input
            type="number"
            name="monto_neto"
            min="0"
            step="0.01"
            required
            className="w-full rounded-md border px-3 py-2 text-sm"
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm">Monto impuesto</label>
          <input
            type="number"
            name="monto_impuesto"
            min="0"
            step="0.01"
            required
            className="w-full rounded-md border px-3 py-2 text-sm"
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm">Monto total</label>
          <input
            type="number"
            name="monto_total"
            min="0.01"
            step="0.01"
            required
            className="w-full rounded-md border px-3 py-2 text-sm"
          />
        </div>

        <div className="space-y-1 md:col-span-2">
          <label className="text-sm">Descripcion</label>
          <textarea
            name="descripcion"
            className="w-full rounded-md border px-3 py-2 text-sm"
            rows={3}
          />
        </div>

        <div className="md:col-span-2">
          <button
            type="submit"
            className="rounded-md border px-4 py-2 text-sm"
          >
            Crear registro
          </button>
        </div>
      </form>
      </section>

      <section className="rounded-xl border p-4">
        <h2 className="text-lg font-semibold mb-4">Listado</h2>

        {registros.length === 0 ? (
        <p className="text-sm text-gray-500">No hay registros todavía.</p>
        ) : (
          <div className="space-y-3">
            {registros.map((registro) => (
              <RegistroCard key={registro.id} registro={registro} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}