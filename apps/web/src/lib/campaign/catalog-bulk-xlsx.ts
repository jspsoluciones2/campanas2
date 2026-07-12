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
  raw: string[];
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
): { rows: ParsedBulkRow[]; headerRow: string[] } | { error: string } {
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
  const cellCount = headerRow.length;

  for (let i = 1; i < matrix.length; i++) {
    const rawRow = matrix[i];
    const raw = rawRow
      ? Array.from({ length: cellCount }, (_, ci) =>
          String(rawRow[ci] ?? "").trim()
        )
      : [];
    if (raw.every((cell) => cell === "")) continue;

    const values: Record<string, string> = {};
    for (const column of def.columns) {
      const index = headerMap.get(column.key);
      if (index == null) continue;
      values[column.key] = raw[index] ?? "";
    }

    rows.push({ rowNumber: i + 1, values, raw });
  }

  if (rows.length === 0) {
    return { error: "No hay filas con datos para importar." };
  }

  return { rows, headerRow };
}

export function buildErrorWorkbook(
  rawHeaders: string[],
  errors: { row: number; message: string }[],
  rows: ParsedBulkRow[]
): Buffer {
  const errorByRow = new Map<number, string>();
  for (const err of errors) {
    const prev = errorByRow.get(err.row);
    errorByRow.set(err.row, prev ? `${prev}; ${err.message}` : err.message);
  }

  const headers = [...rawHeaders, "error"];
  const data: (string | number | null)[][] = [headers];

  for (const row of rows) {
    const errMsg = errorByRow.get(row.rowNumber);
    if (!errMsg) continue;
    data.push([...row.raw, errMsg]);
  }

  const sheet = XLSX.utils.aoa_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, sheet, "errores");

  const colWidths = rawHeaders.map((h) => ({
    wch: Math.max(h.length + 2, 20),
  }));
  colWidths.push({ wch: 50 });
  sheet["!cols"] = colWidths;

  return XLSX.write(workbook, { bookType: "xlsx", type: "buffer" }) as Buffer;
}

export function catalogBulkDef(segment: CatalogSegment): BulkCatalogDef {
  return CATALOG_BULK_DEFS[segment];
}
