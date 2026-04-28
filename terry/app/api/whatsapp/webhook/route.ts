import { createServiceClient } from "@/lib/supabase/service-client";
import { parseFactura } from "@/lib/whatsapp/parse-invoice";

export const maxDuration = 60;

const BUCKET = "documentos-financieros";

function twiml(mensaje: string): Response {
  const xml = `<?xml version="1.0" encoding="UTF-8"?><Response><Message>${mensaje}</Message></Response>`;
  return new Response(xml, { headers: { "Content-Type": "text/xml" } });
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const numMedia = parseInt((formData.get("NumMedia") as string) ?? "0");

  if (numMedia === 0) {
    return twiml(
      "Hola! Envíame una foto de tu factura o boleta y la proceso automáticamente."
    );
  }

  const mediaUrl = formData.get("MediaUrl0") as string;
  const mediaType =
    (formData.get("MediaContentType0") as string) ?? "image/jpeg";

  const orgId = process.env.WHATSAPP_ORG_ID!;
  const sucursalId = process.env.WHATSAPP_SUCURSAL_ID!;

  try {
    // 1. Descargar imagen desde Twilio (requiere Basic Auth)
    const auth = Buffer.from(
      `${process.env.TWILIO_ACCOUNT_SID}:${process.env.TWILIO_AUTH_TOKEN}`
    ).toString("base64");

    const imgResponse = await fetch(mediaUrl, {
      headers: { Authorization: `Basic ${auth}` },
    });
    if (!imgResponse.ok) throw new Error("No se pudo descargar la imagen");

    const imgBuffer = await imgResponse.arrayBuffer();
    const imgBase64 = Buffer.from(imgBuffer).toString("base64");
    const imgBytes = imgBuffer.byteLength;

    // 2. Subir a Supabase Storage
    const supabase = createServiceClient();
    const timestamp = Date.now();
    const ext = mediaType.split("/")[1] ?? "jpg";
    const ruta = `whatsapp/${orgId}/${timestamp}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(ruta, Buffer.from(imgBuffer), { contentType: mediaType });

    if (uploadError) throw new Error(`Storage: ${uploadError.message}`);

    // 3. Extraer datos con Claude Vision
    const datos = await parseFactura(imgBase64, mediaType);

    // 4. Insertar registro financiero
    const { data: registro, error: regError } = await supabase
      .from("registros_financieros")
      .insert({
        organizacion_id: orgId,
        sucursal_id: sucursalId,
        tipo_registro: datos.tipo_registro,
        fuente: "whatsapp",
        estado: "pendiente",
        fecha_emision: datos.fecha_emision,
        fecha_vencimiento: datos.fecha_vencimiento,
        numero_documento: datos.numero_documento,
        tercero_nombre: datos.tercero_nombre,
        monto_neto: datos.monto_neto,
        monto_impuesto: datos.monto_impuesto,
        monto_total: datos.monto_total,
        moneda: datos.moneda ?? "CLP",
        tipo_documento: datos.tipo_documento,
        descripcion: datos.descripcion,
      })
      .select("id")
      .single();

    if (regError) throw new Error(`DB: ${regError.message}`);

    // 5. Guardar referencia al archivo
    await supabase.from("archivos_documentos").insert({
      organizacion_id: orgId,
      registro_financiero_id: registro.id,
      nombre_archivo: `whatsapp_${timestamp}.${ext}`,
      ruta_archivo: ruta,
      tipo_mime: mediaType,
      tamano: imgBytes,
    });

    // 6. Confirmar al usuario
    const lineas = [
      `Procesado`,
      datos.tercero_nombre ? `Emisor: ${datos.tercero_nombre}` : null,
      datos.numero_documento ? `N° ${datos.numero_documento}` : null,
      `Total: $${datos.monto_total.toLocaleString("es-CL")}`,
      datos.tipo_documento ? `Tipo: ${datos.tipo_documento}` : null,
      `Estado: pendiente de revisión`,
    ].filter(Boolean);

    return twiml(lineas.join("\n"));
  } catch (err) {
    console.error("[whatsapp/webhook]", err);
    return twiml("No pude procesar la imagen. Intenta con una foto más nítida.");
  }
}
