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
      { key: "id", header: "id", required: true, example: "04" },
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
      { key: "id", header: "id", required: true, example: "001" },
      { key: "departamento", header: "departamento", required: true, example: "Antioquia" },
      { key: "nombre", header: "nombre", required: true, example: "Medellín" },
      { key: "latitud", header: "latitud", example: "6.2", aliases: ["lat"] },
      { key: "longitud", header: "longitud", example: "-75.5", aliases: ["lng", "lon"] },
    ],
  },
  comunas: {
    label: "Comunas",
    fileName: "plantilla-comunas",
    instructions: "Indica el municipio existente. Carga municipios antes que comunas.",
    columns: [
      { key: "municipio", header: "municipio", required: true, example: "Medellín" },
      { key: "nombre", header: "nombre", required: true, example: "Comuna 1" },
    ],
  },
  barrios: {
    label: "Barrios",
    fileName: "plantilla-barrios",
    instructions: "Indica departamento, municipio y comuna existentes. Carga comunas antes que barrios.",
    columns: [
      { key: "departamento", header: "departamento", required: true, example: "Antioquia" },
      { key: "municipio", header: "municipio", required: true, example: "Medellín" },
      { key: "comuna", header: "comuna", required: true, example: "Comuna 1" },
      { key: "nombre", header: "nombre", required: true, example: "Barrio Centro" },
    ],
  },
  "puestos-votacion": {
    label: "Puestos de votación",
    fileName: "plantilla-puestos-votacion",
    instructions: "Comuna y barrio son obligatorios y deben coincidir. Carga comunas y barrios antes.",
    columns: [
      { key: "nombre", header: "nombre", required: true, example: "Colegio San José" },
      { key: "comuna", header: "comuna", required: true, example: "Comuna 1" },
      { key: "barrio", header: "barrio", required: true, example: "Barrio Centro" },
      { key: "municipio", header: "municipio", example: "Medellín" },
      { key: "direccion", header: "direccion", example: "Calle 10 # 20-30", aliases: ["dirección"] },
      { key: "cupos_hombres", header: "cupos_hombres", example: "120", aliases: ["cupos_h", "votantes_hombres"] },
      { key: "cupos_mujeres", header: "cupos_mujeres", example: "130", aliases: ["cupos_m", "votantes_mujeres"] },
      { key: "mesas", header: "mesas", example: "8", aliases: ["cantidad_mesas"] },
    ],
  },
};
