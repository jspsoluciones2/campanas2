import type { CatalogSegment } from "@/lib/campaign/catalog-nav";

export type BulkColumnDef = {
  key: string;
  header: string;
  required?: boolean;
  example?: string;
  aliases?: string[];
};

export type BulkCatalogDef = {
  label: string;
  fileName: string;
  columns: BulkColumnDef[];
  instructions: string;
};

export const CATALOG_BULK_MAX_ROWS = 2000;

export const CATALOG_BULK_DEFS: Record<CatalogSegment, BulkCatalogDef> = {
  comunas: {
    label: "Comunas",
    fileName: "plantilla-comunas",
    instructions:
      "Una fila por subdivisión territorial. El ID se asigna automáticamente al importar.",
    columns: [
      {
        key: "nombre",
        header: "nombre",
        required: true,
        example: "Comuna 1",
      },
    ],
  },
  barrios: {
    label: "Barrios",
    fileName: "plantilla-barrios",
    instructions:
      "Indica la comuna existente en la campaña. Carga comunas antes que barrios.",
    columns: [
      {
        key: "comuna",
        header: "comuna",
        required: true,
        example: "Comuna 1",
        aliases: ["subdivisión", "subdivision"],
      },
      {
        key: "nombre",
        header: "nombre",
        required: true,
        example: "Barrio Centro",
      },
    ],
  },
  zonas: {
    label: "Zonas asignadas",
    fileName: "plantilla-zonas",
    instructions: "Una fila por zona operativa de la campaña.",
    columns: [
      {
        key: "nombre",
        header: "nombre",
        required: true,
        example: "Zona Norte",
      },
      {
        key: "descripcion",
        header: "descripcion",
        example: "Sector norte del municipio",
        aliases: ["descripción"],
      },
    ],
  },
  puestos: {
    label: "Puestos de votación",
    fileName: "plantilla-puestos",
    instructions:
      "Comuna y barrio son obligatorios y deben coincidir (el barrio debe pertenecer a esa comuna). Carga comunas y barrios antes.",
    columns: [
      {
        key: "nombre",
        header: "nombre",
        required: true,
        example: "Colegio San José",
      },
      {
        key: "comuna",
        header: "comuna",
        required: true,
        example: "Comuna 1",
        aliases: ["subdivisión", "subdivision"],
      },
      {
        key: "barrio",
        header: "barrio",
        required: true,
        example: "Barrio Centro",
      },
      {
        key: "municipio",
        header: "municipio",
        example: "Medellín",
      },
      {
        key: "direccion",
        header: "direccion",
        example: "Calle 10 # 20-30",
        aliases: ["dirección"],
      },
      {
        key: "cupos_hombres",
        header: "cupos_hombres",
        example: "120",
        aliases: ["cupos_h", "votantes_hombres"],
      },
      {
        key: "cupos_mujeres",
        header: "cupos_mujeres",
        example: "130",
        aliases: ["cupos_m", "votantes_mujeres"],
      },
      {
        key: "mesas",
        header: "mesas",
        example: "8",
        aliases: ["cantidad_mesas"],
      },
    ],
  },
  roles: {
    label: "Roles",
    fileName: "plantilla-roles",
    instructions: "Jerarquía numérica: 1, 2 o 3 (se muestra como Jerarquía 1, Jerarquía 2, etc.).",
    columns: [
      {
        key: "nombre",
        header: "nombre",
        required: true,
        example: "Líder de zona",
      },
      {
        key: "nivel",
        header: "jerarquia",
        required: true,
        example: "1",
        aliases: ["nivel", "nivel_jerarquia", "nivel_jerárquico"],
      },
    ],
  },
  "tipos-novedad": {
    label: "Tipos de novedad",
    fileName: "plantilla-tipos-novedad",
    instructions: "Una fila por tipo de novedad aplicable a votantes.",
    columns: [
      {
        key: "novedad",
        header: "novedad",
        required: true,
        example: "Cambio de puesto",
        aliases: ["descripcion", "descripción"],
      },
    ],
  },
  "lugares-trabajo": {
    label: "Lugares de trabajo",
    fileName: "plantilla-lugares-trabajo",
    instructions:
      "Comuna y barrio son opcionales; deben existir en la campaña si los indicas.",
    columns: [
      {
        key: "nombre",
        header: "nombre",
        required: true,
        example: "Empresa ABC",
      },
      {
        key: "direccion",
        header: "direccion",
        example: "Av. Principal 100",
        aliases: ["dirección"],
      },
      {
        key: "comuna",
        header: "comuna",
        example: "Comuna 1",
        aliases: ["subdivisión", "subdivision"],
      },
      {
        key: "barrio",
        header: "barrio",
        example: "Barrio Centro",
      },
    ],
  },
};

export function isBulkCatalogSegment(
  segment: string
): segment is CatalogSegment {
  return segment in CATALOG_BULK_DEFS;
}

export function normalizeBulkHeader(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/\s+/g, "_");
}

export function buildHeaderIndexMap(
  headers: string[],
  def: BulkCatalogDef
): Map<string, number> | { error: string } {
  const normalizedHeaders = headers.map(normalizeBulkHeader);
  const indexByKey = new Map<string, number>();

  for (const column of def.columns) {
    const candidates = [
      column.header,
      ...(column.aliases ?? []),
    ].map(normalizeBulkHeader);

    const index = normalizedHeaders.findIndex((header) =>
      candidates.includes(header)
    );

    if (index === -1) {
      if (column.required) {
        return {
          error: `Falta la columna obligatoria "${column.header}" en la plantilla.`,
        };
      }
      continue;
    }

    indexByKey.set(column.key, index);
  }

  if (indexByKey.size === 0) {
    return { error: "No se reconocieron columnas válidas en el archivo." };
  }

  return indexByKey;
}
