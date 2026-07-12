import { NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { MAESTRAS_BULK_DEFS } from "@/lib/platform/maestras-bulk-config";

export async function GET(
  _request: Request,
  context: { params: Promise<{ tipo: string }> }
) {
  const { tipo } = await context.params;
  const def = MAESTRAS_BULK_DEFS[tipo];
  if (!def) {
    return NextResponse.json({ error: "Plantilla no encontrada." }, { status: 404 });
  }

  const headers = def.columns.map((c) => c.header);
  const sheet = XLSX.utils.aoa_to_sheet([headers]);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, sheet, "datos");
  const buffer = XLSX.write(workbook, { bookType: "xlsx", type: "buffer" }) as Buffer;

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${def.fileName}.xlsx"`,
    },
  });
}
