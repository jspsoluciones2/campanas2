"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { MapContainer, TileLayer, GeoJSON, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { cn } from "@/lib/utils";

// ─── Types ──────────────────────────────────────────────────────────────────
export type AlcanceTipo = "nacional" | "departamental" | "municipal";

export type AlcanceValue =
  | { tipo: "nacional" }
  | { tipo: "departamental"; id_departamento: string; nombre_departamento?: string }
  | { tipo: "municipal"; id_municipio: string; nombre_municipio?: string; id_departamento?: string };

export type GeoFilters = {
  sexo: string;
  id_rol: number;
  estado: string;
};

type MetricKey = "total" | "activos" | "hombres" | "mujeres" | "pendientes" | "cuarentena";

type GeoStats = Record<string, Record<MetricKey, number>>;

const METRICS: { key: MetricKey; label: string }[] = [
  { key: "total", label: "Total votantes" },
  { key: "activos", label: "Activos" },
  { key: "hombres", label: "Masculino" },
  { key: "mujeres", label: "Femenino" },
  { key: "pendientes", label: "Pendientes" },
  { key: "cuarentena", label: "En cuarentena" },
];

const METRIC_COLORS: Record<string, string> = {
  total: "text-blue-700 border-blue-200",
  activos: "text-emerald-700 border-emerald-200",
  hombres: "text-sky-700 border-sky-200",
  mujeres: "text-rose-700 border-rose-200",
  pendientes: "text-amber-700 border-amber-200",
  cuarentena: "text-red-700 border-red-200",
};

// ─── Color scale (yellow → orange → red) ────────────────────────────────────
function choroplethColor(value: number, max: number): string {
  if (max === 0) return "#f0f0f0";
  const pct = value / max;
  if (pct === 0) return "#ffffcc";
  if (pct < 0.1) return "#ffe48d";
  if (pct < 0.2) return "#ffdd7e";
  if (pct < 0.35) return "#fecb66";
  if (pct < 0.5) return "#feb751";
  if (pct < 0.7) return "#fd9e3a";
  if (pct < 0.85) return "#f57e28";
  if (pct < 0.95) return "#e34a1c";
  return "#b10026";
}

// ─── Fit map to GeoJSON bounds ─────────────────────────────────────────────
function FitBounds({ data }: { data: GeoJSON.FeatureCollection }) {
  const map = useMap();
  useEffect(() => {
    if (data.features.length > 0) {
      const bounds = L.geoJSON(data).getBounds();
      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [30, 30] });
      }
    }
  }, [data, map]);
  return null;
}

// ─── Main component ─────────────────────────────────────────────────────────
type Props = {
  campaignId: number;
  alcance: AlcanceValue;
  filters: GeoFilters;
};

export function MapaGeografico({ campaignId, alcance, filters }: Props) {
  const supabase = useRef(createClient());
  const [geoData, setGeoData] = useState<GeoJSON.FeatureCollection | null>(null);
  const [stats, setStats] = useState<GeoStats>({});
  const [metric, setMetric] = useState<MetricKey>("total");
  const [loading, setLoading] = useState(true);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const geoJsonKey = useRef(0);

  // ── Fetch GeoJSON and stats ───────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        let geojson: GeoJSON.FeatureCollection | null = null;
        let nameProp = "";

        if (alcance.tipo === "nacional") {
          // Fetch department GeoJSON from public
          const res = await fetch("/data/geojson/dptos.geojson");
          geojson = await res.json();
          nameProp = "DPTO_CCDGO";
        } else if (alcance.tipo === "departamental") {
          const deptCode = (alcance as any).id_departamento;
          const res = await fetch(`/api/geo/municipios/${deptCode}`);
          geojson = await res.json();
          nameProp = "MPIO_CDPMP";
        } else {
          // Municipal — fetch single municipio from dptos.geojson
          // Actually, load municipios for the parent department and filter
          const parentDept = (alcance as any).id_departamento;
          if (parentDept) {
            const res = await fetch(`/api/geo/municipios/${parentDept}`);
            const all = await res.json();
            const munCode = (alcance as any).id_municipio;
            const feats = all.features.filter(
              (f: any) => f.properties?.MPIO_CDPMP === munCode
            );
            geojson = { type: "FeatureCollection", features: feats };
          } else {
            // Fallback: show all deptos
            const res = await fetch("/data/geojson/dptos.geojson");
            geojson = await res.json();
          }
          nameProp = "MPIO_CDPMP";
        }

        if (cancelled) return;
        setGeoData(geojson);
        geoJsonKey.current += 1;

        // ── Fetch stats ─────────────────────────────────────────────────────
        const selectCol = alcance.tipo === "departamental" ? "id_municipio" : "id_departamento";
        const statsMap: GeoStats = {};

        // Helper: fetch grouped counts with optional extra filter
        async function fetchGrouped(extraFilters?: Record<string, string>): Promise<Record<string, number>> {
          let q = supabase.current
            .from("votantes")
            .select(`${selectCol}, count:count(*)`)
            .eq("id_campana", campaignId) as any;

          if (alcance.tipo === "departamental") {
            q = q.eq("id_departamento", (alcance as any).id_departamento);
          }
          if (alcance.tipo === "municipal") {
            q = q.eq("id_municipio", (alcance as any).id_municipio);
          }
          if (filters.sexo) q = q.eq("sexo", filters.sexo);
          if (filters.id_rol) q = q.eq("id_rol", filters.id_rol);
          if (filters.estado) q = q.eq("estado", filters.estado);
          if (extraFilters) {
            for (const [k, v] of Object.entries(extraFilters)) {
              if (v) q = q.eq(k, v);
            }
          }

          const { data, error } = await q;
          if (error) return {};

          const map: Record<string, number> = {};
          for (const row of data ?? []) {
            const id = String(row[selectCol] ?? "unknown");
            map[id] = (row as any).count ?? 0;
          }
          return map;
        }

        // Fetch all metric groups in parallel
        const allFetches = await Promise.all([
          fetchGrouped(),                                                         // total
          fetchGrouped({ estado: "activo" }),                                     // activos
          fetchGrouped({ sexo: "Masculino" }),                                    // hombres
          fetchGrouped({ sexo: "Femenino" }),                                     // mujeres
          fetchGrouped({ estado: "pendiente_verificacion" }),                     // pendientes
          fetchGrouped({ estado: "en_cuarentena" }),                              // cuarentena
        ]);

        const metricKeys: MetricKey[] = ["total", "activos", "hombres", "mujeres", "pendientes", "cuarentena"];
        const allIds = new Set<string>();

        // Collect all geo IDs from results
        for (const m of allFetches) {
          for (const id of Object.keys(m)) allIds.add(id);
        }

        // Merge into statsMap
        for (const id of allIds) {
          statsMap[id] = { total: 0, activos: 0, hombres: 0, mujeres: 0, pendientes: 0, cuarentena: 0 };
          for (let mi = 0; mi < metricKeys.length; mi++) {
            statsMap[id][metricKeys[mi]] = allFetches[mi][id] ?? 0;
          }
        }

        if (!cancelled) {
          setStats(statsMap);
          setLoading(false);
        }
      } catch (err) {
        console.error("Error loading map data:", err);
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [campaignId, alcance.tipo, (alcance as any).id_departamento, (alcance as any).id_municipio, filters.sexo, filters.id_rol, filters.estado]);

  // ── Compute name map from GeoJSON ─────────────────────────────────────────
  const idToName = useMemo(() => {
    if (!geoData) return {};
    const map: Record<string, string> = {};
    for (const feat of geoData.features) {
      if (alcance.tipo === "nacional") {
        map[feat.properties?.DPTO_CCDGO] = feat.properties?.DPTO_CNMBR;
      } else {
        map[feat.properties?.MPIO_CDPMP] = feat.properties?.MPIO_CNMBR;
      }
    }
    return map;
  }, [geoData, alcance.tipo]);

  // ── Max value for color scaling ───────────────────────────────────────────
  const maxValue = useMemo(() => {
    let max = 0;
    for (const id of Object.keys(stats)) {
      if (stats[id][metric] > max) max = stats[id][metric];
    }
    return max;
  }, [stats, metric]);

  // ── Style function ────────────────────────────────────────────────────────
  const geoStyle = useCallback(
    (feature: GeoJSON.Feature | undefined) => {
      if (!feature) return {};
      const id =
        alcance.tipo === "nacional"
          ? feature.properties?.DPTO_CCDGO
          : feature.properties?.MPIO_CDPMP;
      const value = stats[id]?.[metric] ?? 0;
      return {
        fillColor: choroplethColor(value, maxValue),
        weight: 1,
        opacity: 1,
        color: "white",
        fillOpacity: 0.8,
      };
    },
    [stats, metric, maxValue, alcance.tipo]
  );

  // useCallback with fresh deps
  const geoStyleRef = useRef(geoStyle);
  geoStyleRef.current = geoStyle;

  // ── Tooltip / Popup / Interaction ─────────────────────────────────────────
  const onEachFeature = useCallback(
    (feature: GeoJSON.Feature, layer: L.GeoJSON) => {
      const id =
        alcance.tipo === "nacional"
          ? feature.properties?.DPTO_CCDGO
          : feature.properties?.MPIO_CDPMP;
      const name = idToName[id] ?? id;

      // Tooltip on hover
      layer.bindTooltip(
        `<div class="text-xs font-medium">${name}</div>`,
        { sticky: true, className: "rounded-md border border-neutral-200 bg-white/95 px-2 py-1 shadow-sm" }
      );

      // Popup on click
      const s = stats[id];
      layer.on({
        click: () => {
          if (!s) return;
          const content = `
            <div class="min-w-[180px]">
              <p class="mb-2 font-semibold text-sm">${name}</p>
              <table class="w-full text-xs">
                <tr><td class="pr-3 text-neutral-500">Total</td><td class="font-medium text-right">${s.total.toLocaleString("es-CO")}</td></tr>
                <tr><td class="pr-3 text-neutral-500">Activos</td><td class="font-medium text-right">${s.activos.toLocaleString("es-CO")}</td></tr>
                <tr><td class="pr-3 text-neutral-500">Masculino</td><td class="font-medium text-right">${s.hombres.toLocaleString("es-CO")}</td></tr>
                <tr><td class="pr-3 text-neutral-500">Femenino</td><td class="font-medium text-right">${s.mujeres.toLocaleString("es-CO")}</td></tr>
                <tr><td class="pr-3 text-neutral-500">Pendientes</td><td class="font-medium text-right">${s.pendientes.toLocaleString("es-CO")}</td></tr>
                <tr><td class="pr-3 text-neutral-500">Cuarentena</td><td class="font-medium text-right">${s.cuarentena.toLocaleString("es-CO")}</td></tr>
              </table>
            </div>
          `;
          layer.bindPopup(content, { className: "rounded-lg shadow-lg border" }).openPopup();
        },
        mouseover: () => setHoveredId(id),
        mouseout: () => setHoveredId(null),
      });
    },
    [stats, idToName, alcance.tipo]
  );

  // ── Highlight style on hover ──────────────────────────────────────────────
  const highlightStyle = useCallback(
    (feature: GeoJSON.Feature) => {
      const id =
        alcance.tipo === "nacional"
          ? feature.properties?.DPTO_CCDGO
          : feature.properties?.MPIO_CDPMP;
      const value = stats[id]?.[metric] ?? 0;
      return {
        fillColor: choroplethColor(value, maxValue),
        weight: 2.5,
        opacity: 1,
        color: "#333",
        fillOpacity: 0.95,
      };
    },
    [stats, metric, maxValue, alcance.tipo]
  );

  // ── Legend items ──────────────────────────────────────────────────────────
  const legendBreaks = useMemo(() => {
    const steps = [
      { label: "0", threshold: 0 },
      { label: "10%", threshold: 0.1 },
      { label: "20%", threshold: 0.2 },
      { label: "35%", threshold: 0.35 },
      { label: "50%", threshold: 0.5 },
      { label: "70%", threshold: 0.7 },
      { label: "85%", threshold: 0.85 },
      { label: "95%", threshold: 0.95 },
    ];
    return steps.map((s) => ({
      label: s.label,
      color: choroplethColor(maxValue * s.threshold + 1, maxValue),
    }));
  }, [maxValue]);

  // ── Render ────────────────────────────────────────────────────────────────
  const activeMetricLabel = METRICS.find((m) => m.key === metric)?.label ?? "Total votantes";

  if (!geoData) {
    return (
      <div className="flex items-center justify-center rounded-xl border border-neutral-200 bg-white p-16">
        <div className="flex items-center gap-2 text-sm text-neutral-500">
          <div className="size-4 animate-spin rounded-full border-2 border-neutral-300 border-t-neutral-600" />
          Cargando mapa...
        </div>
      </div>
    );
  }

  const geoId = `mapa-${alcance.tipo}-${geoJsonKey.current}`;

  return (
    <div className="space-y-4">
      {/* Métrica selector */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-medium text-neutral-500">Color por:</span>
        <div className="flex flex-wrap gap-1">
          {METRICS.map((m) => (
            <button
              key={m.key}
              type="button"
              onClick={() => setMetric(m.key)}
              className={cn(
                "rounded-lg px-3 py-1.5 text-xs font-medium transition-all",
                metric === m.key
                  ? "bg-neutral-900 text-white shadow-sm"
                  : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
              )}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Mapa */}
      <div className="relative overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm">
        <MapContainer
          key={geoId}
          center={[4.0, -73.0]}
          zoom={6}
          className="z-0 h-[600px] w-full"
          zoomControl={true}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
            maxZoom={20}
          />

          <FitBounds data={geoData} />

          <GeoJSON
            key={`geojson-${geoJsonKey.current}`}
            data={geoData}
            style={(feature: any) => geoStyleRef.current(feature)}
            onEachFeature={onEachFeature}
          />
        </MapContainer>

        {/* Leyenda */}
        <div className="absolute bottom-4 right-4 z-[1000] rounded-lg border border-neutral-200 bg-white/95 p-3 shadow-md">
          <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-neutral-600">
            {activeMetricLabel}
          </p>
          <div className="flex items-stretch gap-0">
            {legendBreaks.map((b, i) => (
              <div
                key={i}
                className="flex flex-col items-center"
              >
                <div
                  className="h-4 w-7"
                  style={{ backgroundColor: b.color }}
                />
                <span className="mt-0.5 text-[9px] text-neutral-500">
                  {b.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Loading overlay */}
        {loading && (
          <div className="absolute inset-0 z-[1001] flex items-center justify-center bg-white/60">
            <div className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm text-neutral-600 shadow-md">
              <div className="size-4 animate-spin rounded-full border-2 border-neutral-300 border-t-neutral-600" />
              Actualizando datos...
            </div>
          </div>
        )}
      </div>

      {/* Info bar */}
      {!loading && (
        <div className="flex flex-wrap items-center gap-x-6 gap-y-1 rounded-lg bg-neutral-50 px-4 py-2 text-xs text-neutral-500">
          <span>
            Unidades:{" "}
            <strong className="text-neutral-700">
              {alcance.tipo === "nacional"
                ? "Departamentos"
                : alcance.tipo === "departamental"
                  ? "Municipios"
                  : "Municipio"}
            </strong>
          </span>
          {hoveredId && (
            <>
              <span className="text-neutral-300">|</span>
              <span>
                Seleccionado: <strong className="text-neutral-700">{idToName[hoveredId] ?? hoveredId}</strong>
              </span>
              <span className="text-neutral-300">|</span>
              <span>
                {activeMetricLabel}:{" "}
                <strong className="text-neutral-700">
                  {(stats[hoveredId]?.[metric] ?? 0).toLocaleString("es-CO")}
                </strong>
              </span>
            </>
          )}
          {!hoveredId && (
            <span className="italic">Pasá el mouse sobre el mapa para ver detalles</span>
          )}
        </div>
      )}
    </div>
  );
}
