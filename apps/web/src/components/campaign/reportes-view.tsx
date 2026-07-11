"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  BarChart3,
  Users,
  UserCheck,
  AlertTriangle,
  Clock,
  X,
} from "lucide-react";
import {
  PageHeader,
  platformInputClass,
  platformSelectClass,
} from "@/components/platform/platform-ui";
import {
  VotantesTable,
  type VotanteListRow,
} from "@/components/campaign/votantes-table";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import gsap from "gsap";

type Props = {
  campaignId: string;
  initialTotal: number;
  initialRoles: { id: string; nombre: string }[];
  initialPuestos: { id: string; nombre: string }[];
  initialTiposNovedad: { id: string; novedad: string }[];
  initialVotantes: VotanteListRow[];
};

type TabId = "general" | "geografico" | "evolucion" | "novedades";

const TABS: { id: TabId; label: string }[] = [
  { id: "general", label: "General" },
  { id: "geografico", label: "Geográfico" },
  { id: "evolucion", label: "Evolución" },
  { id: "novedades", label: "Novedades" },
];

type Filters = {
  search: string;
  sexo: string;
  id_rol: string;
  estado: string;
  id_puesto_votacion: string;
};

const DEFAULT_FILTERS: Filters = {
  search: "",
  sexo: "",
  id_rol: "",
  estado: "",
  id_puesto_votacion: "",
};

type CardConfig = {
  id: string;
  label: string;
  color: string;
  iconBg: string;
  borderColor: string;
};

const CARD_CONFIGS: CardConfig[] = [
  {
    id: "total",
    label: "Total votantes",
    color: "text-blue-700",
    iconBg: "bg-blue-100 text-blue-600",
    borderColor: "border-blue-200 bg-blue-50/50",
  },
  {
    id: "hombres",
    label: "Masculino",
    color: "text-sky-700",
    iconBg: "bg-sky-100 text-sky-600",
    borderColor: "border-sky-200 bg-sky-50/50",
  },
  {
    id: "mujeres",
    label: "Femenino",
    color: "text-rose-700",
    iconBg: "bg-rose-100 text-rose-600",
    borderColor: "border-rose-200 bg-rose-50/50",
  },
  {
    id: "activos",
    label: "Activos",
    color: "text-emerald-700",
    iconBg: "bg-emerald-100 text-emerald-600",
    borderColor: "border-emerald-200 bg-emerald-50/50",
  },
  {
    id: "pendientes",
    label: "Pendientes",
    color: "text-amber-700",
    iconBg: "bg-amber-100 text-amber-600",
    borderColor: "border-amber-200 bg-amber-50/50",
  },
  {
    id: "cuarentena",
    label: "En cuarentena",
    color: "text-red-700",
    iconBg: "bg-red-100 text-red-600",
    borderColor: "border-red-200 bg-red-50/50",
  },
];

const CARD_ICONS: Record<string, React.ComponentType<{ className?: string }>> =
  {
    total: Users,
    hombres: Users,
    mujeres: Users,
    activos: UserCheck,
    pendientes: Clock,
    cuarentena: AlertTriangle,
  };

const ESTADOS = [
  { value: "", label: "Todos" },
  { value: "activo", label: "Activo" },
  { value: "registrado", label: "Registrado" },
  { value: "pendiente_verificacion", label: "Pendiente verificación" },
  { value: "en_cuarentena", label: "En cuarentena" },
  { value: "rechazado", label: "Rechazado" },
];

const SEXOS = [
  { value: "", label: "Todos" },
  { value: "Masculino", label: "Masculino" },
  { value: "Femenino", label: "Femenino" },
];

export function ReportesView({
  campaignId,
  initialTotal,
  initialRoles,
  initialPuestos,
  initialTiposNovedad,
  initialVotantes,
}: Props) {
  const [activeTab, setActiveTab] = useState<TabId>("general");
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [searchInput, setSearchInput] = useState("");
  const [votantes, setVotantes] = useState<VotanteListRow[]>(initialVotantes);
  const [loading, setLoading] = useState(false);
  const [cardValues, setCardValues] = useState<Record<string, number>>({});

  const cardsWrapperRef = useRef<HTMLDivElement>(null);
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const supabase = useRef(createClient());

  const debouncedSearchRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );

  const hasActiveFilters =
    filters.search ||
    filters.sexo ||
    filters.id_rol ||
    filters.estado ||
    filters.id_puesto_votacion;

  function buildCountQuery(extraFilters?: Record<string, string>) {
    let q = supabase.current
      .from("votantes")
      .select("*", { count: "exact", head: true } as any)
      .eq("id_campana", campaignId) as any;
    if (filters.search) {
      q = q.or(
        `nombres.ilike.%${filters.search}%,apellidos.ilike.%${filters.search}%,documento.ilike.%${filters.search}%`
      );
    }
    if (filters.sexo) q = q.eq("sexo", filters.sexo);
    if (filters.id_rol) q = q.eq("id_rol", filters.id_rol);
    if (filters.estado) q = q.eq("estado", filters.estado);
    if (filters.id_puesto_votacion)
      q = q.eq("id_puesto_votacion", filters.id_puesto_votacion);
    if (extraFilters) {
      for (const [k, v] of Object.entries(extraFilters)) {
        if (v) q = q.eq(k, v);
      }
    }
    return q;
  }

  function buildListQuery() {
    let q = supabase.current
      .from("votantes")
      .select(
        `id, nombres, apellidos, documento, tipo_documento, sexo, telefono, fecha_nacimiento, direccion, estado, creado_en, id_tipo_novedad, detalle_novedad, roles(nombre), lugares_trabajo(nombre)`
      )
      .eq("id_campana", campaignId)
      .order("creado_en", { ascending: false })
      .limit(100) as any;
    if (filters.search) {
      q = q.or(
        `nombres.ilike.%${filters.search}%,apellidos.ilike.%${filters.search}%,documento.ilike.%${filters.search}%`
      );
    }
    if (filters.sexo) q = q.eq("sexo", filters.sexo);
    if (filters.id_rol) q = q.eq("id_rol", filters.id_rol);
    if (filters.estado) q = q.eq("estado", filters.estado);
    if (filters.id_puesto_votacion)
      q = q.eq("id_puesto_votacion", filters.id_puesto_votacion);
    return q;
  }

  const fetchFilteredData = useCallback(async () => {
    setLoading(true);

    const [
      { count: total },
      { count: hombres },
      { count: mujeres },
      { count: activos },
      { count: pendientes },
      { count: cuarentena },
      { data: votersList },
    ] = await Promise.all([
      buildCountQuery(),
      buildCountQuery({ sexo: "Masculino" }),
      buildCountQuery({ sexo: "Femenino" }),
      buildCountQuery({ estado: "activo" }),
      buildCountQuery({ estado: "pendiente_verificacion" }),
      buildCountQuery({ estado: "en_cuarentena" }),
      buildListQuery(),
    ]);

    const newValues = {
      total: total ?? 0,
      hombres: hombres ?? 0,
      mujeres: mujeres ?? 0,
      activos: activos ?? 0,
      pendientes: pendientes ?? 0,
      cuarentena: cuarentena ?? 0,
    };

    setCardValues(newValues);
    setVotantes((votersList ?? []) as unknown as VotanteListRow[]);
    setLoading(false);
  }, [filters, campaignId]);

  useEffect(() => {
    fetchFilteredData();
  }, [fetchFilteredData]);

  useEffect(() => {
    if (debouncedSearchRef.current) {
      clearTimeout(debouncedSearchRef.current);
    }
    debouncedSearchRef.current = setTimeout(() => {
      setFilters((prev) => ({ ...prev, search: searchInput }));
    }, 350);
    return () => {
      if (debouncedSearchRef.current) {
        clearTimeout(debouncedSearchRef.current);
      }
    };
  }, [searchInput]);

  useEffect(() => {
    if (cardsWrapperRef.current) {
      gsap.fromTo(
        cardsWrapperRef.current.children,
        { y: -16, opacity: 0, scale: 0.96 },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 0.4,
          stagger: 0.04,
          ease: "back.out(1.4)",
          clearProps: "transform",
        }
      );
    }
  }, [cardValues]);

  useEffect(() => {
    if (contentRef.current) {
      gsap.fromTo(
        contentRef.current,
        { y: 12, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.35, ease: "power2.out" }
      );
    }
  }, [activeTab]);

  useEffect(() => {
    if (tableContainerRef.current && votantes.length > 0 && !hasActiveFilters) {
      gsap.fromTo(
        tableContainerRef.current,
        { y: 20, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.5,
          delay: 0.3,
          ease: "power2.out",
        }
      );
    }
  }, []);

  function clearFilters() {
    setSearchInput("");
    setFilters(DEFAULT_FILTERS);
  }

  function handleSelectFilter(key: keyof Filters, value: string) {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }

  function TabButton({ tab }: { tab: (typeof TABS)[number] }) {
    return (
      <button
        type="button"
        onClick={() => setActiveTab(tab.id)}
        className={cn(
          "rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200",
          activeTab === tab.id
            ? "bg-white text-neutral-900 shadow-sm"
            : "text-neutral-500 hover:text-neutral-700"
        )}
      >
        {tab.label}
      </button>
    );
  }

  return (
    <div ref={contentRef}>
      <PageHeader
        title="Reportes"
        description="Análisis y visualización de datos de la campaña"
      />

      <div className="flex flex-wrap gap-1 rounded-xl border border-neutral-200 bg-neutral-50/50 p-1.5">
        {TABS.map((tab) => (
          <TabButton key={tab.id} tab={tab} />
        ))}
      </div>

      {activeTab === "general" && (
        <div className="space-y-6">
          <div
            ref={cardsWrapperRef}
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6"
          >
            {CARD_CONFIGS.map((cfg) => {
              const Icon = CARD_ICONS[cfg.id];
              const val = cardValues[cfg.id] ?? 0;
              return (
                <div
                  key={cfg.id}
                  className={cn(
                    "rounded-xl border p-4 shadow-sm shadow-neutral-200/60 transition-shadow hover:shadow-md",
                    cfg.borderColor
                  )}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs font-medium tracking-wide uppercase opacity-70">
                        {cfg.label}
                      </p>
                      <p className={cn("mt-1 text-2xl font-bold", cfg.color)}>
                        {val.toLocaleString("es-CO")}
                      </p>
                    </div>
                    <div className={cn("rounded-lg p-2", cfg.iconBg)}>
                      <Icon className="size-5" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm shadow-neutral-200/60">
            <div className="flex flex-wrap items-end gap-3">
              <div className="min-w-[200px] flex-1">
                <label className="mb-1 block text-xs font-medium text-neutral-500">
                  Buscar
                </label>
                <input
                  type="text"
                  placeholder="Nombre o documento..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className={platformInputClass}
                />
              </div>
              <div className="w-[130px]">
                <label className="mb-1 block text-xs font-medium text-neutral-500">
                  Sexo
                </label>
                <select
                  value={filters.sexo}
                  onChange={(e) =>
                    handleSelectFilter("sexo", e.target.value)
                  }
                  className={platformSelectClass}
                >
                  {SEXOS.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="w-[160px]">
                <label className="mb-1 block text-xs font-medium text-neutral-500">
                  Rol
                </label>
                <select
                  value={filters.id_rol}
                  onChange={(e) =>
                    handleSelectFilter("id_rol", e.target.value)
                  }
                  className={platformSelectClass}
                >
                  <option value="">Todos</option>
                  {initialRoles.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.nombre}
                    </option>
                  ))}
                </select>
              </div>
              <div className="w-[160px]">
                <label className="mb-1 block text-xs font-medium text-neutral-500">
                  Estado
                </label>
                <select
                  value={filters.estado}
                  onChange={(e) =>
                    handleSelectFilter("estado", e.target.value)
                  }
                  className={platformSelectClass}
                >
                  {ESTADOS.map((e) => (
                    <option key={e.value} value={e.value}>
                      {e.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="w-[160px]">
                <label className="mb-1 block text-xs font-medium text-neutral-500">
                  Puesto
                </label>
                <select
                  value={filters.id_puesto_votacion}
                  onChange={(e) =>
                    handleSelectFilter(
                      "id_puesto_votacion",
                      e.target.value
                    )
                  }
                  className={platformSelectClass}
                >
                  <option value="">Todos</option>
                  {initialPuestos.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nombre}
                    </option>
                  ))}
                </select>
              </div>
              {hasActiveFilters && (
                <div className="flex items-end pb-0.5">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="h-8 text-xs"
                  >
                    <X className="mr-1 size-3" /> Limpiar
                  </Button>
                </div>
              )}
            </div>
          </div>

          {loading && (
            <div className="flex items-center justify-center py-3">
              <div className="flex items-center gap-2 text-sm text-neutral-500">
                <div className="size-4 animate-spin rounded-full border-2 border-neutral-300 border-t-neutral-600" />
                Actualizando...
              </div>
            </div>
          )}

          <div ref={tableContainerRef}>
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm text-neutral-500">
                {votantes.length} votante(s) mostrados
                {hasActiveFilters && " (filtrados)"}
              </p>
            </div>
            <div className="overflow-hidden rounded-xl border border-neutral-200 shadow-sm shadow-neutral-200/60">
              <VotantesTable
                campaignId={campaignId}
                rows={votantes}
                tiposNovedad={initialTiposNovedad}
                emptyMessage="Sin votantes que coincidan con los filtros."
              />
            </div>
          </div>
        </div>
      )}

      {activeTab === "geografico" && (
        <div className="flex items-center justify-center rounded-xl border-2 border-dashed border-neutral-200 bg-white p-16">
          <div className="text-center">
            <BarChart3 className="mx-auto size-10 text-neutral-300" />
            <p className="mt-3 text-sm font-medium text-neutral-500">
              Distribución Geográfica
            </p>
            <p className="mt-1 text-xs text-neutral-400">
              Próximamente: análisis por comuna, barrio y puesto de votación.
            </p>
          </div>
        </div>
      )}

      {activeTab === "evolucion" && (
        <div className="flex items-center justify-center rounded-xl border-2 border-dashed border-neutral-200 bg-white p-16">
          <div className="text-center">
            <BarChart3 className="mx-auto size-10 text-neutral-300" />
            <p className="mt-3 text-sm font-medium text-neutral-500">
              Evolución de Registro
            </p>
            <p className="mt-1 text-xs text-neutral-400">
              Próximamente: gráficos de registro de votantes en el tiempo.
            </p>
          </div>
        </div>
      )}

      {activeTab === "novedades" && (
        <div className="flex items-center justify-center rounded-xl border-2 border-dashed border-neutral-200 bg-white p-16">
          <div className="text-center">
            <BarChart3 className="mx-auto size-10 text-neutral-300" />
            <p className="mt-3 text-sm font-medium text-neutral-500">
              Novedades
            </p>
            <p className="mt-1 text-xs text-neutral-400">
              Próximamente: reporte de novedades y seguimiento de incidencias.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
