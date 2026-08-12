"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import { createClient } from "@/lib/supabase/client";
import { Plus, UserPlus, Users, X, Download, CheckSquare } from "lucide-react";
import * as XLSX from "xlsx";
import { updateVotantesEstadoBulkAction } from "@/app/(campaign)/campaign/[id]/actions";
import { VotanteRegisterForm } from "@/components/campaign/votante-register-form";
import {
  VotantesTable,
  type VotanteListRow,
} from "@/components/campaign/votantes-table";
import {
  Card,
  PageHeader,
  platformButtonClass,
  platformInputClass,
  platformSelectClass,
} from "@/components/platform/platform-ui";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import type { AlcanceValue } from "@/components/campaign/mapa-geografico";

type Rol = { id: number; nombre: string; nivel_jerarquia: number };
type Puesto = {
  id: number;
  nombre: string;
  municipio: string | null;
  comunas: { nombre: string } | { nombre: string }[] | null;
};
type LugarTrabajo = { id: number; nombre: string };
type Lider = {
  id: number;
  nombres: string;
  apellidos: string;
  documento: string;
  nivel_jerarquia: number | null;
};
type Departamento = { id: string; nombre: string };
type Municipio = { id: string; nombre: string; id_departamento: string };
type BarrioConComuna = {
  id: number;
  nombre: string;
  id_comuna: number;
  id_municipio: string;
};
type Comuna = { id: number; nombre: string; id_municipio: string | null };
type TipoNovedad = { id: number; novedad: string };

type Props = {
  campaignId: number;
  votantes: VotanteListRow[];
  tiposNovedad: TipoNovedad[];
  roles: Rol[];
  puestos: Puesto[];
  lugaresTrabajo: LugarTrabajo[];
  lideres: Lider[];
  departamentos: Departamento[];
  municipios: Municipio[];
  barrios: BarrioConComuna[];
  comunas: Comuna[];
  alcance?: AlcanceValue;
};

type TabId = "listado" | "crear";

const TABS: { id: TabId; label: string; icon: typeof Users }[] = [
  { id: "listado", label: "Listado", icon: Users },
  { id: "crear", label: "Crear votante", icon: UserPlus },
];

type Filters = {
  search: string;
  id_lider_directo: number;
  id_departamento: string;
  id_municipio: string;
  id_comuna: number;
  id_rol: number;
  estado: string;
};

const DEFAULT_FILTERS: Filters = {
  search: "",
  id_lider_directo: 0,
  id_departamento: "",
  id_municipio: "",
  id_comuna: 0,
  id_rol: 0,
  estado: "",
};

const ESTADOS = [
  { value: "", label: "Todos" },
  { value: "activo", label: "Activo" },
  { value: "registrado", label: "Registrado" },
  { value: "pendiente_verificacion", label: "Pendiente verificación" },
  { value: "en_cuarentena", label: "En cuarentena" },
  { value: "rechazado", label: "Rechazado" },
];

const LIST_COLUMNAS = `id, nombres, apellidos, documento, tipo_documento, sexo, telefono,
  fecha_nacimiento, direccion, mesa, estado, creado_en, id_tipo_novedad, detalle_novedad,
  roles(nombre), lugares_trabajo(nombre), puestos_votacion(nombre, municipio),
  lider_directo:votantes(nombres, apellidos)`;

export function VotantesPanel({
  campaignId,
  votantes,
  tiposNovedad,
  roles,
  puestos,
  lugaresTrabajo,
  lideres,
  departamentos,
  municipios,
  barrios,
  comunas,
  alcance,
}: Props) {
  const [activeTab, setActiveTab] = useState<TabId>(
    votantes.length === 0 ? "crear" : "listado"
  );
  const [rows, setRows] = useState<VotanteListRow[]>(votantes);
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [searchInput, setSearchInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(votantes.length);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [bulkEstado, setBulkEstado] = useState("");
  const [bulkFeedback, setBulkFeedback] = useState<string | null>(null);
  const [pendingBulk, startBulk] = useTransition();
  const supabase = useRef(createClient());
  const debouncedRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const PAGE_SIZE = 50;

  const municipiosResidencia = useMemo(
    () =>
      filters.id_departamento
        ? municipios.filter(
            (m) => m.id_departamento === filters.id_departamento
          )
        : [],
    [municipios, filters.id_departamento]
  );
  const comunasFiltradas = useMemo(
    () =>
      filters.id_municipio
        ? comunas.filter((c) => c.id_municipio === filters.id_municipio)
        : comunas,
    [comunas, filters.id_municipio]
  );

  const hasActiveFilters =
    filters.search ||
    filters.id_lider_directo ||
    filters.id_departamento ||
    filters.id_municipio ||
    filters.id_comuna ||
    filters.id_rol ||
    filters.estado;

  const applyFilters = useCallback((q: any) => {
    if (filters.search) {
      q = q.or(
        `nombres.ilike.%${filters.search}%,apellidos.ilike.%${filters.search}%,documento.ilike.%${filters.search}%`
      );
    }
    if (filters.id_lider_directo)
      q = q.eq("id_lider_directo", filters.id_lider_directo);
    if (filters.id_departamento)
      q = q.eq("id_departamento", filters.id_departamento);
    if (filters.id_municipio) q = q.eq("id_municipio", filters.id_municipio);
    if (filters.id_comuna) {
      // Votantes cuya comuna de residencia coincide (barrio_votante → comuna)
      const barriosDeComuna = barrios
        .filter((b) => b.id_comuna === filters.id_comuna)
        .map((b) => b.id);
      const ids = barriosDeComuna.length ? barriosDeComuna : [-1];
      q = q.in("id_barrio_votante", ids);
    }
    if (filters.id_rol) q = q.eq("id_rol", filters.id_rol);
    if (filters.estado) q = q.eq("estado", filters.estado);
    return q;
  }, [filters, barrios]);

  const fetchListado = useCallback(async () => {
    setLoading(true);
    const from = (page - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;
    let q = applyFilters(
      supabase.current
        .from("votantes")
        .select(LIST_COLUMNAS, { count: "exact" } as any)
        .eq("id_campana", campaignId)
        .order("creado_en", { ascending: false })
        .range(from, to)
    );
    const { data, count, error } = await q;
    if (!error) {
      setRows((data ?? []) as unknown as VotanteListRow[]);
      if (typeof count === "number") setTotal(count);
    }
    setLoading(false);
  }, [applyFilters, campaignId, page]);

  useEffect(() => {
    if (!activeTab || activeTab !== "listado") return;
    if (filters.search !== searchInput) return;
    fetchListado();
  }, [fetchListado, activeTab, filters, searchInput]);

  useEffect(() => {
    setPage(1);
    setSelectedIds(new Set());
    setBulkFeedback(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.search, filters.id_lider_directo, filters.id_departamento, filters.id_municipio, filters.id_comuna, filters.id_rol, filters.estado]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const allPageSelected =
    rows.length > 0 && rows.every((r) => selectedIds.has(r.id));
  const selectedCount = selectedIds.size;

  function toggleRow(id: number) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAllPage() {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      const pageIds = rows.map((r) => r.id);
      const allSel = pageIds.length > 0 && pageIds.every((id) => next.has(id));
      if (allSel) pageIds.forEach((id) => next.delete(id));
      else pageIds.forEach((id) => next.add(id));
      return next;
    });
  }

  async function selectAllFiltered() {
    setLoading(true);
    let q = applyFilters(
      supabase.current
        .from("votantes")
        .select("id")
        .eq("id_campana", campaignId)
        .limit(5000) as any
    );
    const { data, error } = await q;
    if (!error) {
      const ids = (data ?? []).map((r: any) => r.id).filter((n: any) => n != null);
      setSelectedIds((prev) => {
        const next = new Set(prev);
        ids.forEach((id: number) => next.add(id));
        return next;
      });
    }
    setLoading(false);
  }

  function clearSelection() {
    setSelectedIds(new Set());
    setBulkFeedback(null);
  }

  function cambiarPagina(p: number) {
    setPage(Math.min(Math.max(1, p), totalPages));
  }

  function changeFilter(key: keyof Filters, value: string) {
    const numeric =
      key === "id_lider_directo" ||
      key === "id_comuna" ||
      key === "id_rol";
    setFilters((prev) => ({
      ...prev,
      [key]: numeric ? (value ? Number(value) : 0) : value,
    }));
  }

  function handleSearchChange(value: string) {
    setSearchInput(value);
    if (debouncedRef.current) clearTimeout(debouncedRef.current);
    debouncedRef.current = setTimeout(() => {
      setFilters((prev) => ({ ...prev, search: value.trim() }));
    }, 350);
  }

  function clearFilters() {
    setSearchInput("");
    setFilters(DEFAULT_FILTERS);
  }

  async function aplicarBulkEstado() {
    if (!bulkEstado || selectedIds.size === 0) return;
    setBulkFeedback(null);
    startBulk(async () => {
      const result = await updateVotantesEstadoBulkAction(
        campaignId,
        Array.from(selectedIds),
        bulkEstado
      );
      if (result?.error) {
        setBulkFeedback(result.error);
        return;
      }
      setBulkFeedback(
        `Estado actualizado para ${result?.count ?? selectedIds.size} votante(s).`
      );
      clearSelection();
      fetchListado();
    });
  }

  function primer<T>(rel: T | T[] | null | undefined): T | null {
    if (!rel) return null;
    return Array.isArray(rel) ? (rel[0] ?? null) : rel;
  }

  async function descargarExcel() {
    if (selectedIds.size === 0) return;
    const ids = Array.from(selectedIds);
    const { data } = await supabase.current
      .from("votantes")
      .select(LIST_COLUMNAS)
      .eq("id_campana", campaignId)
      .in("id", ids) as any;
    const filas = (data ?? []).map((v: any) => {
      const puesto = primer(v.puestos_votacion);
      const lider = primer(v.lider_directo);
      return {
        "Nombre completo": `${v.nombres} ${v.apellidos}`,
        Documento: `${v.tipo_documento} ${v.documento}`,
        "Estado": v.estado,
        Zona: puesto?.municipio?.trim() || "—",
        Puesto: puesto?.nombre ?? "—",
        Mesa: v.mesa?.trim() || "—",
        "Líder directo": lider ? `${lider.nombres} ${lider.apellidos}`.trim() : "—",
        Trabajo: primer(v.lugares_trabajo)?.nombre ?? "—",
        Dirección: v.direccion ?? "—",
        Rol: primer(v.roles)?.nombre ?? "—",
        Registro: v.creado_en ? new Date(v.creado_en).toLocaleDateString("es-CO") : "—",
      };
    });
    const ws = XLSX.utils.json_to_sheet(filas);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Votantes");
    const fecha = new Date().toISOString().slice(0, 10);
    XLSX.writeFile(wb, `votantes-campana-${campaignId}-${fecha}.xlsx`);
  }

  return (
    <>
      <PageHeader
        title="Votantes"
        description="Registro manual de votantes. Las novedades las completa el equipo al detectar irregularidades."
      >
        <button
          type="button"
          onClick={() => setActiveTab("crear")}
          className={cn(platformButtonClass, "gap-2")}
        >
          <Plus className="size-4 shrink-0" aria-hidden />
          Nuevo votante
        </button>
      </PageHeader>

      <div className="flex flex-wrap gap-1 rounded-xl border border-neutral-200 bg-neutral-50/50 p-1.5">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200",
                active
                  ? "bg-white text-neutral-900 shadow-sm"
                  : "text-neutral-500 hover:text-neutral-700",
                tab.id === "crear" && active && "bg-blue-50"
              )}
            >
              <Icon className="size-4 shrink-0" aria-hidden />
              {tab.label}
              {tab.id === "listado" ? (
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-xs font-semibold",
                    active
                      ? "bg-neutral-900 text-white"
                      : "bg-neutral-200 text-neutral-600"
                  )}
                >
                  {rows.length}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>

      {activeTab === "listado" ? (
        <Card
          title="Listado"
          description={`${total} votante(s) coinciden con los filtros`}
        >
          <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
            <div className="flex flex-wrap items-end gap-3">
              <div className="min-w-[200px] flex-1">
                <label className="mb-1 block text-xs font-medium text-neutral-500">
                  Buscar
                </label>
                <input
                  type="text"
                  placeholder="Nombre, apellido o documento..."
                  value={searchInput}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className={platformInputClass}
                />
              </div>
              <div className="w-[180px]">
                <label className="mb-1 block text-xs font-medium text-neutral-500">
                  Líder directo
                </label>
                <select
                  value={filters.id_lider_directo || ""}
                  onChange={(e) =>
                    changeFilter("id_lider_directo", e.target.value)
                  }
                  className={platformSelectClass}
                >
                  <option value="">Todos</option>
                  {lideres.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.apellidos} {l.nombres}
                    </option>
                  ))}
                </select>
              </div>
              <div className="w-[160px]">
                <label className="mb-1 block text-xs font-medium text-neutral-500">
                  Departamento
                </label>
                <select
                  value={filters.id_departamento}
                  onChange={(e) =>
                    changeFilter("id_departamento", e.target.value)
                  }
                  className={platformSelectClass}
                >
                  <option value="">Todos</option>
                  {departamentos.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.nombre}
                    </option>
                  ))}
                </select>
              </div>
              <div className="w-[160px]">
                <label className="mb-1 block text-xs font-medium text-neutral-500">
                  Municipio
                </label>
                <select
                  value={filters.id_municipio}
                  disabled={!filters.id_departamento}
                  onChange={(e) =>
                    changeFilter("id_municipio", e.target.value)
                  }
                  className={platformSelectClass}
                >
                  <option value="">
                    {!filters.id_departamento
                      ? "Elige departamento"
                      : municipiosResidencia.length === 0
                        ? "Sin municipios"
                        : "Todos"}
                  </option>
                  {municipiosResidencia.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.nombre}
                    </option>
                  ))}
                </select>
              </div>
              <div className="w-[160px]">
                <label className="mb-1 block text-xs font-medium text-neutral-500">
                  Comuna
                </label>
                <select
                  value={filters.id_comuna || ""}
                  onChange={(e) => changeFilter("id_comuna", e.target.value)}
                  className={platformSelectClass}
                >
                  <option value="">Todas</option>
                  {comunasFiltradas.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nombre}
                    </option>
                  ))}
                </select>
              </div>
              <div className="w-[150px]">
                <label className="mb-1 block text-xs font-medium text-neutral-500">
                  Rol
                </label>
                <select
                  value={filters.id_rol || ""}
                  onChange={(e) => changeFilter("id_rol", e.target.value)}
                  className={platformSelectClass}
                >
                  <option value="">Todos</option>
                  {roles.map((r) => (
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
                  onChange={(e) => changeFilter("estado", e.target.value)}
                  className={platformSelectClass}
                >
                  {ESTADOS.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
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

          <div className="mt-3 flex flex-wrap items-center gap-2 rounded-xl border border-neutral-200 bg-neutral-50/60 px-3 py-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 text-xs"
              onClick={selectAllFiltered}
              disabled={loading}
            >
              <CheckSquare className="mr-1 size-3.5" />
              Seleccionar todos ({total})
            </Button>
            {selectedCount > 0 ? (
              <>
                <span className="text-xs font-semibold text-blue-700">
                  {selectedCount} seleccionado(s)
                </span>
                <select
                  value={bulkEstado}
                  onChange={(e) => setBulkEstado(e.target.value)}
                  className={cn(platformSelectClass, "h-8 w-[180px] text-xs")}
                  aria-label="Cambiar estado en lote"
                >
                  <option value="">Cambiar estado a…</option>
                  {ESTADOS.filter((s) => s.value).map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
                <Button
                  type="button"
                  size="sm"
                  className="h-8 text-xs"
                  onClick={aplicarBulkEstado}
                  disabled={!bulkEstado || pendingBulk}
                >
                  {pendingBulk ? "Aplicando…" : "Aplicar estado"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs"
                  onClick={descargarExcel}
                >
                  <Download className="mr-1 size-3.5" /> Excel
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 text-xs"
                  onClick={clearSelection}
                >
                  <X className="mr-1 size-3" /> Quitar selección
                </Button>
              </>
            ) : null}
            {bulkFeedback ? (
              <span className="text-xs text-neutral-600">{bulkFeedback}</span>
            ) : null}
          </div>

          {loading && (
            <div className="flex items-center justify-center py-3">
              <div className="flex items-center gap-2 text-sm text-neutral-500">
                <div className="size-4 animate-spin rounded-full border-2 border-neutral-300 border-t-neutral-600" />
                Actualizando...
              </div>
            </div>
          )}

          <VotantesTable
            campaignId={campaignId}
            rows={rows}
            tiposNovedad={tiposNovedad}
            emptyMessage="Sin votantes que coincidan con los filtros. Registra el primero en la pestaña Crear votante."
            showEstadoEditor
            showCobertura
            selectedIds={selectedIds}
            onToggleRow={toggleRow}
            onToggleAllPage={toggleAllPage}
            allPageSelected={allPageSelected}
          />

          <div className="mt-3 flex items-center justify-between gap-3">
            <p className="text-xs text-neutral-500">
              Página {page} de {totalPages} · {total} coincidencia(s)
            </p>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 text-xs"
                disabled={page <= 1 || loading}
                onClick={() => cambiarPagina(page - 1)}
              >
                Anterior
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 text-xs"
                disabled={page >= totalPages || loading}
                onClick={() => cambiarPagina(page + 1)}
              >
                Siguiente
              </Button>
            </div>
          </div>
        </Card>
      ) : (
        <VotanteRegisterForm
          campaignId={campaignId}
          roles={roles}
          puestos={puestos}
          lugaresTrabajo={lugaresTrabajo}
          lideres={lideres}
          departamentos={departamentos}
          municipios={municipios}
          barrios={barrios}
          alcance={alcance}
        />
      )}
    </>
  );
}