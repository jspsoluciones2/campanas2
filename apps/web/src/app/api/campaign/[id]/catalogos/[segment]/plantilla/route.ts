import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  CATALOG_BULK_DEFS,
  isBulkCatalogSegment,
} from "@/lib/campaign/catalog-bulk-config";
import { buildCatalogTemplateWorkbook } from "@/lib/campaign/catalog-bulk-xlsx";
import { userCanAccessCampaign } from "@/lib/campaign/access";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string; segment: string }> }
) {
  const { id, segment } = await context.params;

  if (!isBulkCatalogSegment(segment)) {
    return NextResponse.json({ error: "Catálogo no válido." }, { status: 404 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autenticado." }, { status: 401 });
  }

  const puedeAcceder = await userCanAccessCampaign(user.id, id);
  if (!puedeAcceder) {
    return NextResponse.json({ error: "Sin acceso a la campaña." }, { status: 403 });
  }

  const def = CATALOG_BULK_DEFS[segment];
  const buffer = buildCatalogTemplateWorkbook(segment);

  return new NextResponse(new Uint8Array(buffer), {
    status: 200,
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${def.fileName}.xlsx"`,
      "Cache-Control": "no-store",
    },
  });
}
