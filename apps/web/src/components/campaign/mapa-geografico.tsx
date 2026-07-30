"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { MapContainer, TileLayer, GeoJSON, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { cn } from "@/lib/utils";
import {
  MapPin,
  Users,
  Building2,
  Layers,
  ChevronDown,
  ChevronRight,
} from "lucide-react";

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
type ChoroplethSource = "mesas" | "votantes";

type AreaStats = {
  mesas: number;
  puestos: number;
} & Record<MetricKey, number>;

type GeoStats = Record<string, AreaStats>;

const VOTANTE_METRICS: { key: MetricKey; label: string }[] = [
  { key: "total", label: "Total" },
  { key: "activos", label: "Activos" },
  { key: "hombres", label: "Masculino" },
  { key: "mujeres", label: "Femenino" },
  { key: "pendientes", label: "Pendientes" },
  { key: "cuarentena", label: "Cuarentena" },
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

function fmt(n: number): string {
  return n.toLocaleString("es-CO");
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
  const [choroplethSource, setChoroplethSource] = useState<ChoroplethSource>("mesas");
  const [votanteMetric, setVotanteMetric] = useState<MetricKey>("total");
  const [loading, setLoading] = useState(true);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [listExpanded, setListExpanded] = useState(true);
  const geoJsonKey = useRef(0);

  const selectCol = alcance.tipo === "departamental" ? "id_municipio" : "id_departamento";
  const areaLabel = alcance.tipo === "nacional" ? "Departamento" : "Municipio";

  // ── Fetch GeoJSON, mesas, and stats ───────────────────────────────────────
  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        let geojson: GeoJSON.FeatureCollection | null = null;

        if (alcance.tipo === "nacional") {
          const res = await fetch("/data/geojson/dptos.geojson");
          geojson = await res.json();
        } else if (alcance.tipo === "departamental") {
          const deptCode = (alcance as any).id_departamento;
          const res = await fetch(`/api/geo/municipios/${deptCode}`);
          geojson = await res.json();
        } else {
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
            const res = await fetch("/data/geojson/dptos.geojson");
            geojson = await res.json();
          }
        }

        if (cancelled) return;
        setGeoData(geojson);
        geoJsonKey.current += 1;

        // ─ Fetch mesas from puestos_votacion (via JOINs) ───────────────────
        // puestos_votacion → comunas → municipios → departamentos
        const mesasMap: Record<string, { mesas: number; puestos: number }> = {};

        // Determinar qué relación usar según el alcance
        let mesasQuery = supabase.current
          .from("puestos_votacion")
          .select("cantidad_mesas, comunas!inner(id_municipio, municipios!inner(id_departamento))") as any;

        const { data: puestosData, error: puestosError } = await mesasQuery;
        
        if (!puestosError) {
          for (const row of puestosData ?? []) {
            // Extraer ids de la relación anidada
            const deptId = row.comunas?.municipios?.id_departamento;
            const munId = row.comunas?.id_municipio;
            
            // Determinar el área según el alcance
            const areaId = alcance.tipo === "departamental" 
              ? String(deptId ?? "unknown")
              : String(munId ?? "unknown");
            
            // Filtrar por alcance si aplica
            if (alcance.tipo === "departamental" && deptId !== (alcance as any).id_departamento) continue;
            if (alcance.tipo === "municipal" && munId !== (alcance as any).id_municipio) continue;
            
            if (!mesasMap[areaId]) mesasMap[areaId] = { mesas: 0, puestos: 0 };
            mesasMap[areaId].mesas += row.cantidad_mesas ?? 0;
            mesasMap[areaId].puestos += 1;
          }
        }

        // ── Fetch votantes stats ────────────────────────────────────────────
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

        const [totalV, activosV, hombresV, mujeresV, pendientesV, cuarentenaV] = await Promise.all([
          fetchGrouped(),
          fetchGrouped({ estado: "activo" }),
          fetchGrouped({ sexo: "Masculino" }),
          fetchGrouped({ sexo: "Femenino" }),
          fetchGrouped({ estado: "pendiente_verificacion" }),
          fetchGrouped({ estado: "en_cuarentena" }),
        ]);

        const allIds = new Set<string>([
          ...Object.keys(mesasMap),
          ...Object.keys(totalV),
        ]);

        const merged: GeoStats = {};
        for (const id of allIds) {
          merged[id] = {
            mesas: mesasMap[id]?.mesas ?? 0,
            puestos: mesasMap[id]?.puestos ?? 0,
            total: totalV[id] ?? 0,
            activos: activosV[id] ?? 0,
            hombres: hombresV[id] ?? 0,
            mujeres: mujeresV[id] ?? 0,
            pendientes: pendientesV[id] ?? 0,
            cuarentena: cuarentenaV[id] ?? 0,
          };
        }

        if (!cancelled) {
          setStats(merged);
          setLoading(false);
        }
      } catch (err) {
        console.error("Error loading map data:", err);
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [campaignId, alcance.tipo, (alcance as any).id_departamento, (alcance as any).id_municipio, filters.sexo, filters.id_rol, filters.estado, selectCol]);

  // ── Derived data ──────────────────────────────────────────────────────────
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

  const totals = useMemo(() => {
    let totalMesas = 0;
    let totalVotantes = 0;
    let totalPuestos = 0;
    let areaCount = 0;
    for (const id of Object.keys(stats)) {
      totalMesas += stats[id].mesas;
      totalVotantes += stats[id].total;
      totalPuestos += stats[id].puestos;
      if (stats[id].mesas > 0 || stats[id].total > 0) areaCount++;
    }
    return { totalMesas, totalVotantes, totalPuestos, areaCount };
  }, [stats]);

  const choroplethValue = useCallback(
    (id: string): number => {
      if (!stats[id]) return 0;
      if (choroplethSource === "mesas") return stats[id].mesas;
      return stats[id][votanteMetric];
    },
    [stats, choroplethSource, votanteMetric]
  );

  const maxValue = useMemo(() => {
    let max = 0;
    for (const id of Object.keys(stats)) {
      const v = choroplethValue(id);
      if (v > max) max = v;
    }
    return max;
  }, [stats, choroplethValue]);

  const sortedAreas = useMemo(() => {
    return Object.entries(stats)
      .map(([id, s]) => ({
        id,
        name: idToName[id] ?? id,
        mesas: s.mesas,
        puestos: s.puestos,
        votantes: s.total,
        activos: s.activos,
      }))
      .sort((a, b) => {
        if (choroplethSource === "mesas") return b.mesas - a.mesas;
        return b.votantes - a.votantes;
      });
  }, [stats, idToName, choroplethSource]);

  const selectedStats = selectedId ? stats[selectedId] : null;
  const selectedName = selectedId ? (idToName[selectedId] ?? selectedId) : null;

  // ── Map style ─────────────────────────────────────────────────────────────
  const geoStyle = useCallback(
    (feature: GeoJSON.Feature | undefined) => {
      if (!feature) return {};
      const id =
        alcance.tipo === "nacional"
          ? feature.properties?.DPTO_CCDGO
          : feature.properties?.MPIO_CDPMP;
      const value = choroplethValue(id);
      const isSelected = id === selectedId;
      return {
        fillColor: choroplethColor(value, maxValue),
        weight: isSelected ? 3 : 1,
        opacity: 1,
        color: isSelected ? "#1d4ed8" : "white",
        fillOpacity: 0.8,
      };
    },
    [choroplethValue, maxValue, selectedId, alcance.tipo]
  );

  const geoStyleRef = useRef(geoStyle);
  geoStyleRef.current = geoStyle;

  const onEachFeature = useCallback(
    (feature: GeoJSON.Feature, layer: L.GeoJSON) => {
      const id =
        alcance.tipo === "nacional"
          ? feature.properties?.DPTO_CCDGO
          : feature.properties?.MPIO_CDPMP;
      const name = idToName[id] ?? id;
      const s = stats[id];

      layer.bindTooltip(
        `<div class="text-xs font-medium">${name}</div>
         ${s ? `<div class="text-[10px] text-neutral-500">${fmt(s.mesas)} mesas · ${fmt(s.total)} votantes</div>` : ""}`,
        { sticky: true, className: "rounded-md border border-neutral-200 bg-white/95 px-2 py-1 shadow-sm" }
      );

      layer.on({
        click: () => {
          setSelectedId((prev) => (prev === id ? null : id));
        },
        mouseover: () => setHoveredId(id),
        mouseout: () => setHoveredId(null),
      });
    },
    [stats, idToName, alcance.tipo]
  );

  const highlightStyle = useCallback(
    (feature: GeoJSON.Feature) => {
      const id =
        alcance.tipo === "nacional"
          ? feature.properties?.DPTO_CCDGO
          : feature.properties?.MPIO_CDPMP;
      const value = choroplethValue(id);
      return {
        fillColor: choroplethColor(value, maxValue),
        weight: 2.5,
        opacity: 1,
        color: "#333",
        fillOpacity: 0.95,
      };
    },
    [choroplethValue, maxValue, alcance.tipo]
  );

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

  const choroplethLabel = choroplethSource === "mesas" ? "Mesas" : VOTANTE_METRICS.find((m) => m.key === votanteMetric)?.label ?? "Votantes";

  // ─── Loading state ────────────────────────────────────────────────────────
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
    <div className="flex gap-4 h-[700px]">
      {/* ─── Sidebar ──────────────────────────────────────────────────────── */}
      <div className="w-80 flex-shrink-0 flex flex-col gap-3 overflow-hidden">
        {/* Tabs */}
        <div className="flex gap-1 rounded-lg border border-neutral-200 bg-neutral-50/50 p-1">
          <button
            type="button"
            className="flex-1 rounded-md bg-white px-3 py-1.5 text-xs font-semibold text-neutral-900 shadow-sm"
          >
            Mesas vs Votantes
          </button>
          <button
            type="button"
            disabled
            className="flex-1 rounded-md px-3 py-1.5 text-xs font-medium text-neutral-400 cursor-not-allowed"
          >
            Género
          </button>
          <button
            type="button"
            disabled
            className="flex-1 rounded-md px-3 py-1.5 text-xs font-medium text-neutral-400 cursor-not-allowed"
          >
            Estado
          </button>
        </div>

        {/* Global stats */}
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-lg border border-blue-200 bg-blue-50/50 p-3">
            <div className="flex items-center gap-1.5 text-blue-600">
              <Layers className="size-3.5" />
              <span className="text-[10px] font-semibold uppercase tracking-wide">Mesas</span>
            </div>
            <p className="mt-1 text-xl font-bold text-blue-700">{fmt(totals.totalMesas)}</p>
          </div>
          <div className="rounded-lg border border-emerald-200 bg-emerald-50/50 p-3">
            <div className="flex items-center gap-1.5 text-emerald-600">
              <Users className="size-3.5" />
              <span className="text-[10px] font-semibold uppercase tracking-wide">Votantes</span>
            </div>
            <p className="mt-1 text-xl font-bold text-emerald-700">{fmt(totals.totalVotantes)}</p>
          </div>
          <div className="rounded-lg border border-neutral-200 bg-neutral-50/50 p-3">
            <div className="flex items-center gap-1.5 text-neutral-500">
              <MapPin className="size-3.5" />
              <span className="text-[10px] font-semibold uppercase tracking-wide">Puestos</span>
            </div>
            <p className="mt-1 text-xl font-bold text-neutral-700">{fmt(totals.totalPuestos)}</p>
          </div>
          <div className="rounded-lg border border-neutral-200 bg-neutral-50/50 p-3">
            <div className="flex items-center gap-1.5 text-neutral-500">
              <Building2 className="size-3.5" />
              <span className="text-[10px] font-semibold uppercase tracking-wide">{areaLabel}s</span>
            </div>
            <p className="mt-1 text-xl font-bold text-neutral-700">{fmt(totals.areaCount)}</p>
          </div>
        </div>

        {/* Selected area card */}
        {selectedStats && selectedName && (
          <div className="rounded-lg border border-blue-300 bg-blue-50/70 p-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-blue-900">{selectedName}</p>
              <button
                type="button"
                onClick={() => setSelectedId(null)}
                className="text-xs text-blue-400 hover:text-blue-600"
              >
                Cerrar
              </button>
            </div>
            <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-neutral-500">Mesas</span>
                <p className="font-bold text-blue-700">{fmt(selectedStats.mesas)}</p>
              </div>
              <div>
                <span className="text-neutral-500">Puestos</span>
                <p className="font-bold text-neutral-700">{fmt(selectedStats.puestos)}</p>
              </div>
              <div>
                <span className="text-neutral-500">Votantes</span>
                <p className="font-bold text-emerald-700">{fmt(selectedStats.total)}</p>
              </div>
              <div>
                <span className="text-neutral-500">Activos</span>
                <p className="font-bold text-emerald-600">{fmt(selectedStats.activos)}</p>
              </div>
              <div>
                <span className="text-neutral-500">Masculino</span>
                <p className="font-bold text-sky-700">{fmt(selectedStats.hombres)}</p>
              </div>
              <div>
                <span className="text-neutral-500">Femenino</span>
                <p className="font-bold text-rose-700">{fmt(selectedStats.mujeres)}</p>
              </div>
            </div>
            {selectedStats.total > 0 && (
              <div className="mt-2 text-[10px] text-neutral-500">
                Ratio: {(selectedStats.mesas / selectedStats.total * 100).toFixed(1)}% mesas/votantes
              </div>
            )}
          </div>
        )}

        {/* Choropleth source toggle + votante sub-metrics */}
        <div className="space-y-2">
          <div className="flex gap-1 rounded-lg border border-neutral-200 bg-neutral-50/50 p-0.5">
            <button
              type="button"
              onClick={() => setChoroplethSource("mesas")}
              className={cn(
                "flex-1 rounded-md px-3 py-1.5 text-xs font-medium transition-all",
                choroplethSource === "mesas"
                  ? "bg-white text-neutral-900 shadow-sm"
                  : "text-neutral-500 hover:text-neutral-700"
              )}
            >
              Mesas
            </button>
            <button
              type="button"
              onClick={() => setChoroplethSource("votantes")}
              className={cn(
                "flex-1 rounded-md px-3 py-1.5 text-xs font-medium transition-all",
                choroplethSource === "votantes"
                  ? "bg-white text-neutral-900 shadow-sm"
                  : "text-neutral-500 hover:text-neutral-700"
              )}
            >
              Votantes
            </button>
          </div>

          {choroplethSource === "votantes" && (
            <div className="flex flex-wrap gap-1">
              {VOTANTE_METRICS.map((m) => (
                <button
                  key={m.key}
                  type="button"
                  onClick={() => setVotanteMetric(m.key)}
                  className={cn(
                    "rounded-md px-2 py-1 text-[10px] font-medium transition-all",
                    votanteMetric === m.key
                      ? "bg-neutral-900 text-white"
                      : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                  )}
                >
                  {m.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Area list */}
        <div className="flex-1 overflow-hidden flex flex-col">
          <button
            type="button"
            onClick={() => setListExpanded(!listExpanded)}
            className="flex items-center gap-1.5 text-xs font-semibold text-neutral-600 hover:text-neutral-900"
          >
            {listExpanded ? <ChevronDown className="size-3.5" /> : <ChevronRight className="size-3.5" />}
            {areaLabel}s ({sortedAreas.length})
          </button>

          {listExpanded && (
            <div className="mt-1 flex-1 overflow-y-auto rounded-lg border border-neutral-200">
              {sortedAreas.map((area) => {
                const isActive = area.id === selectedId;
                const isHovered = area.id === hoveredId;
                const displayValue = choroplethSource === "mesas" ? area.mesas : area.votantes;
                return (
                  <button
                    key={area.id}
                    type="button"
                    onClick={() => setSelectedId(area.id === selectedId ? null : area.id)}
                    onMouseEnter={() => setHoveredId(area.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    className={cn(
                      "flex w-full items-center justify-between border-b border-neutral-100 px-3 py-2 text-left transition-colors last:border-b-0",
                      isActive && "bg-blue-50",
                      isHovered && !isActive && "bg-neutral-50"
                    )}
                  >
                    <div className="min-w-0">
                      <p className={cn(
                        "truncate text-xs font-medium",
                        isActive ? "text-blue-900" : "text-neutral-700"
                      )}>
                        {area.name}
                      </p>
                      <p className="text-[10px] text-neutral-400">
                        {area.puestos} puesto{area.puestos !== 1 ? "s" : ""}
                      </p>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className={cn(
                        "text-xs font-bold",
                        choroplethSource === "mesas" ? "text-blue-700" : "text-emerald-700"
                      )}>
                        {fmt(displayValue)}
                      </span>
                      <span className="text-[10px] text-neutral-400">
                        {choroplethSource === "mesas" ? "mesas" : "votantes"}
                      </span>
                    </div>
                  </button>
                );
              })}
              {sortedAreas.length === 0 && (
                <div className="px-3 py-6 text-center text-xs text-neutral-400">
                  Sin datos para mostrar
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ─── Map ──────────────────────────────────────────────────────────── */}
      <div className="flex-1 relative overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm">
        <MapContainer
          key={geoId}
          center={[4.0, -73.0]}
          zoom={6}
          className="z-0 h-full w-full"
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

        {/* Legend */}
        <div className="absolute bottom-4 right-4 z-[1000] rounded-lg border border-neutral-200 bg-white/95 p-3 shadow-md">
          <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-neutral-600">
            {choroplethLabel}
          </p>
          <div className="flex items-stretch gap-0">
            {legendBreaks.map((b, i) => (
              <div key={i} className="flex flex-col items-center">
                <div className="h-4 w-7" style={{ backgroundColor: b.color }} />
                <span className="mt-0.5 text-[9px] text-neutral-500">{b.label}</span>
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
    </div>
  );
}
