import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic();

export type DatosFactura = {
  fecha_emision: string;
  fecha_vencimiento: string | null;
  numero_documento: string | null;
  tercero_nombre: string | null;
  monto_neto: number;
  monto_impuesto: number;
  monto_total: number;
  moneda: string;
  tipo_documento: string | null;
  tipo_registro: "gasto" | "ingreso";
  descripcion: string | null;
};

export async function parseFactura(
  imagenBase64: string,
  mimeType: string
): Promise<DatosFactura> {
  const respuesta = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1024,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image",
            source: {
              type: "base64",
              media_type: mimeType as
                | "image/jpeg"
                | "image/png"
                | "image/gif"
                | "image/webp",
              data: imagenBase64,
            },
          },
          {
            type: "text",
            text: `Analiza esta imagen de factura o boleta chilena y extrae los datos. Responde SOLO con JSON válido, sin markdown ni texto adicional:
{
  "fecha_emision": "YYYY-MM-DD",
  "fecha_vencimiento": "YYYY-MM-DD o null si no aparece",
  "numero_documento": "número de folio o null",
  "tercero_nombre": "nombre del emisor o proveedor",
  "monto_neto": número entero sin puntos ni comas,
  "monto_impuesto": número entero del IVA,
  "monto_total": número entero total,
  "moneda": "CLP",
  "tipo_documento": "factura" | "boleta" | "nota_credito" | "otro",
  "tipo_registro": "gasto" | "ingreso",
  "descripcion": "descripción breve o null"
}`,
          },
        ],
      },
    ],
  });

  const texto =
    respuesta.content[0].type === "text" ? respuesta.content[0].text : "{}";
  return JSON.parse(texto.trim());
}
