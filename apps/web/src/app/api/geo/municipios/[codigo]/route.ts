import { NextResponse } from "next/server";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

const MPIOS_PATH = join(process.cwd(), "public/data/geojson/mpios.geojson");

let _parsed: GeoJSON.FeatureCollection | null = null;

async function loadMunicipios(): Promise<GeoJSON.FeatureCollection> {
  if (_parsed) return _parsed;
  const raw = await readFile(MPIOS_PATH, "utf-8");
  _parsed = JSON.parse(raw) as GeoJSON.FeatureCollection;
  return _parsed;
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ codigo: string }> }
) {
  try {
    const { codigo } = await context.params;
    const all = await loadMunicipios();

    const features = all.features.filter(
      (f) => f.properties?.DPTO_CCDGO === codigo
    );

    if (features.length === 0) {
      return NextResponse.json(
        { error: `No se encontraron municipios para el código ${codigo}` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      type: "FeatureCollection",
      features,
    });
  } catch (err) {
    console.error("Error loading municipios GeoJSON:", err);
    return NextResponse.json(
      { error: "Error al cargar datos geográficos" },
      { status: 500 }
    );
  }
}
