import { subirDocumento } from "@/modules/documentos/actions";
import { getDocumentosPorRegistro } from "@/modules/documentos/queries";
import { eliminarDocumento } from "@/modules/documentos/actions";

type RegistroCardProps = {
  registro: {
    id: string;
    tipo_registro: string;
    estado: string;
    fecha_emision: string;
    moneda: string;
    numero_documento: string | null;
    tercero_nombre: string | null;
    monto_neto: number;
    monto_impuesto: number;
    monto_total: number;
    descripcion: string | null;
  };
};

export default async function RegistroCard({ registro }: RegistroCardProps) {
  const documentos = await getDocumentosPorRegistro(registro.id);

  return (
    <div className="rounded-lg border p-4 space-y-4">
      <div>
        <p className="font-medium">
          {registro.tipo_registro} - {registro.monto_total} {registro.moneda}
        </p>
        <p className="text-sm text-gray-600">Estado: {registro.estado}</p>
        <p className="text-sm text-gray-600">Fecha: {registro.fecha_emision}</p>
        <p className="text-sm text-gray-600">
          Documento: {registro.numero_documento ?? "Sin numero"}
        </p>
        <p className="text-sm text-gray-600">
          Tercero: {registro.tercero_nombre ?? "Sin tercero"}
        </p>
        <p className="text-sm text-gray-600">
          Neto: {registro.monto_neto} | Impuesto: {registro.monto_impuesto}
        </p>
        <p className="text-sm text-gray-600">
          {registro.descripcion ?? "Sin descripcion"}
        </p>
      </div>

      <div className="border-t pt-4 space-y-3">
        <h3 className="text-sm font-semibold">Adjuntar documento</h3>

        <form action={subirDocumento} className="flex flex-col gap-3 md:flex-row">
          <input type="hidden" name="registro_financiero_id" value={registro.id} />

          <input
            type="file"
            name="archivo"
            required
            className="text-sm"
            accept=".pdf,.png,.jpg,.jpeg,.webp"
          />

          <button
            type="submit"
            className="rounded-md border px-3 py-2 text-sm"
          >
            Subir archivo
          </button>
        </form>

        <div>
          <h4 className="text-sm font-semibold mb-2">Documentos</h4>

          {documentos.length === 0 ? (
            <p className="text-sm text-gray-500">Sin documentos adjuntos.</p>
          ) : (
            <div className="space-y-2">
              {documentos.map((documento) => (
                <div
                  key={documento.id}
                  className="rounded-md border px-3 py-2 text-sm flex justify-between items-center"
                >
                  <div>
                    <p>{documento.nombre_archivo}</p>
                    <p className="text-gray-500 text-xs">
                      {documento.tipo_mime ?? "Sin tipo"}
                    </p>
                  </div>

                  <div className="flex gap-3 items-center">
                    <a
                      href={`/api/documentos?ruta=${encodeURIComponent(documento.ruta_archivo)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 underline"
                    >
                      Ver
                    </a>

                    <form action={eliminarDocumento}>
                      <input type="hidden" name="documento_id" value={documento.id} />
                      <input type="hidden" name="ruta_archivo" value={documento.ruta_archivo} />

                      <button type="submit" className="text-red-600 underline">
                        Eliminar
                      </button>
                    </form>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}