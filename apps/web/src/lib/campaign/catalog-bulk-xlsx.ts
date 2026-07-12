import * as XLSX from "xlsx";
import {
  buildHeaderIndexMap,
  validateNoUnknownHeaders,
  CATALOG_BULK_DEFS,
  type BulkCatalogDef,
} from "@/lib/campaign/catalog-bulk-config";
import type { CatalogSegment } from "@/lib/campaign/catalog-nav";

export type ParsedBulkRow = {
  rowNumber: number;
  values: Record<string, string>;
};

export function buildCatalogTemplateWorkbook(segment: CatalogSegment) {
  const def = CATALOG_BULK_DEFS[segment];
  const headers = def.columns.map((column) => column.header);
  const sheet = XLSX.utils.aoa_to_sheet([headers]);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, sheet, "datos");
  return XLSX.write(workbook, { bookType: "xlsx", type: "buffer" }) as Buffer;
}

export function parseCatalogWorkbook(
  buffer: ArrayBuffer,
  segment: CatalogSegment
): { rows: ParsedBulkRow[] } | { error: string } {
  const def = CATALOG_BULK_DEFS[segment];

  let workbook: XLSX.WorkBook;
  try {
    workbook = XLSX.read(buffer, { type: "array" });
  } catch {
    return { error: "No se pudo leer el archivo. Usa un Excel .xlsx válido." };
  }

  const sheetName = workbook.SheetNames[0];
  if (!sheetName) {
    return { error: "El archivo no tiene hojas de cálculo." };
  }

  const sheet = workbook.Sheets[sheetName];
  const matrix = XLSX.utils.sheet_to_json<(string | number | null)[]>(sheet, {
    header: 1,
    defval: "",
    raw: false,
  });

  if (matrix.length < 2) {
    return {
      error: "El archivo debe tener encabezados y al menos una fila de datos.",
    };
  }

  const headerRow = matrix[0].map((cell) => String(cell ?? ""));
  const headerMap = buildHeaderIndexMap(headerRow, def);
  if ("error" in headerMap) {
    return { error: headerMap.error };
  }

  const unknownError = validateNoUnknownHeaders(headerRow, def);
  if (unknownError) {
    return { error: unknownError };
  }

  const rows: ParsedBulkRow[] = [];

  for (let i = 1; i < matrix.length; i++) {
    const rawRow = matrix[i];
    if (!rawRow || rawRow.every((cell) => String(cell ?? "").trim() === "")) {
      continue;
    }

    const values: Record<string, string> = {};
    for (const column of def.columns) {
      const index = headerMap.get(column.key);
      if (index == null) continue;
      values[column.key] = String(rawRow[index] ?? "").trim();
    }

    rows.push({ rowNumber: i + 1, values });
  }

  if (rows.length === 0) {
    return { error: "No hay filas con datos para importar." };
  }

  return { rows };
}

export function catalogBulkDef(segment: CatalogSegment): BulkCatalogDef {
  return CATALOG_BULK_DEFS[segment];
}
