export type MaestrasBulkDef = {
  label: string;
  fileName: string;
  columns: { key: string; header: string; required?: boolean; example?: string; aliases?: string[] }[];
  instructions: string;
};

export const MAESTRAS_BULK_DEFS: Record<string, MaestrasBulkDef> = {
  departamentos: {
    label: "Departamentos",
    fileName: "plantilla-departamentos",
    instructions: "Una fila por departamento. Latitud y longitud son opcionales.",
    columns: [
      { key: "nombre", header: "nombre", required: true, example: "Antioquia" },
      { key: "latitud", header: "latitud", example: "6.5", aliases: ["lat"] },
      { key: "longitud", header: "longitud", example: "-75.5", aliases: ["lng", "lon"] },
    ],
  },
  municipios: {
    label: "Municipios",
    fileName: "plantilla-municipios",
    instructions: "Indica el departamento existente. Carga departamentos antes que municipios.",
    columns: [
      { key: "departamento", header: "departamento", required: true, example: "Antioquia" },
      { key: "nombre", header: "nombre", required: true, example: "Medellín" },
      { key: "latitud", header: "latitud", example: "6.2", aliases: ["lat"] },
      { key: "longitud", header: "longitud", example: "-75.5", aliases: ["lng", "lon"] },
    ],
  },
};
