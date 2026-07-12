import { createClient } from "@/lib/supabase/server";
import { requireCampaignAccess, userCanEditCampaign } from "@/lib/campaign/access";
import { parseCatalogWorkbook, buildErrorWorkbook } from "@/lib/campaign/catalog-bulk-xlsx";
import { importCatalogRows } from "@/lib/campaign/catalog-bulk-import";
import { isBulkCatalogSegment } from "@/lib/campaign/catalog-bulk-config";
import type { CatalogSegment } from "@/lib/campaign/catalog-nav";

function sse(data: object) {
  return `data: ${JSON.stringify(data)}\n\n`;
}

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string; segment: string }> }
) {
  const { id, segment } = await context.params;
  const supabase = await createClient();
  const campaignId = Number(id);

  if (!isBulkCatalogSegment(segment)) {
    return new Response(sse({ type: "error", error: "Catálogo no soportado para carga masiva." }), {
      headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache" },
    });
  }

  const access = await requireCampaignAccess(campaignId);
  if ("error" in access) {
    return new Response(sse({ type: "error", error: "Sin acceso a la campaña." }), {
      headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache" },
    });
  }

  const puedeEditar = await userCanEditCampaign(access.user.id, campaignId);
  if (!puedeEditar) {
    return new Response(sse({ type: "error", error: "No tienes permiso para importar catálogos." }), {
      headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache" },
    });
  }

  const formData = await request.formData();
  const archivo = formData.get("archivo");

  if (!(archivo instanceof File) || archivo.size === 0) {
    return new Response(sse({ type: "error", error: "Selecciona un archivo Excel (.xlsx)." }), {
      headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache" },
    });
  }
  if (archivo.size > 5 * 1024 * 1024) {
    return new Response(sse({ type: "error", error: "El archivo no puede superar 5 MB." }), {
      headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache" },
    });
  }

  const parsed = parseCatalogWorkbook(await archivo.arrayBuffer(), segment as CatalogSegment);
  if ("error" in parsed) {
    return new Response(sse({ type: "error", error: parsed.error }), {
      headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache" },
    });
  }

  const { rows, headerRow } = parsed;
  const total = rows.length;
  let created = 0;
  const allErrors: { row: number; message: string }[] = [];

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      for (const row of rows) {
        const single = await importCatalogRows(supabase, campaignId, segment as CatalogSegment, [row]);
        created += single.created;
        for (const err of single.errors) {
          allErrors.push(err);
        }

        controller.enqueue(encoder.encode(sse({
          type: "progress",
          current: created + allErrors.length,
          total,
          row: row.rowNumber,
          errors: allErrors.length,
        })));
      }

      let archivoError: string | undefined;
      if (allErrors.length > 0) {
        const errorBuf = buildErrorWorkbook(headerRow, allErrors, rows);
        archivoError = errorBuf.toString("base64");
      }

      controller.enqueue(encoder.encode(sse({
        type: "complete",
        created,
        errors: allErrors,
        archivo_error: archivoError,
        total,
        message: `Se importaron ${created} registro(s)${allErrors.length > 0 ? `, ${allErrors.length} con errores.` : "."}`,
      })));
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    },
  });
}
