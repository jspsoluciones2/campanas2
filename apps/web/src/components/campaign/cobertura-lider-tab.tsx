"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Download, X } from "lucide-react";
import { platformSelectClass } from "@/components/platform/platform-ui";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { AlcanceValue } from "@/components/campaign/mapa-geografico";
import * as XLSX from "xlsx";

type Departamento = { id: string; nombre: string };
type Municipio = { id: string; nombre: string; id_departamento: string };
type Comuna = { id: number; nombre: string; id_municipio: string | null };
type Barrio = { id: number; nombre: string; id_comuna: number };
type Puesto = { id: number; nombre: string };

type VotanteConRoles = {
  id: number;
  nombres: string;
  apellidos: string;
  documento: string;
  telefono: string | null;
  id_rol: number | null;
  id_lider_directo: number | null;
  id_departamento: string | null;
  id_municipio: string | null;
  id_barrio_votante: number | null;
  id_puesto_votacion: number | null;
  mesa: string | null;
  roles: { nombre: string } | { nombre: string }[] | null;
};

type Filters = {
  id_departamento: string;
  id_municipio: string;
  id_comuna: number;
  id_barrio: number;
  id_puesto_votacion: number;
};

type PuestoRanking = {
  nombre: string;
  cantidad: number;
};

const DEFAULT_FILTERS: Filters = {
  id_departamento: "",
  id_municipio: "",
  id_comuna: 0,
  id_barrio: 0,
  id_puesto_votacion: 0,
};

type Props = {
  campaignId: number;
  initialPuestos: { id: number; nombre: string }[];
  initialAlcance?: AlcanceValue;
};

function nombreRelacion(
  rel: { nombre: string } | { nombre: string }[] | null | undefined
): string | null {
  if (!rel) return null;
  if (Array.isArray(rel)) return rel[0]?.nombre ?? null;
  return rel.nombre;
}

export function CoberturaLiderTab({
  campaignId,
  initialPuestos,
  initialAlcance,
}: Props) {
  const supabase = useRef(createClient());
  const [departamentos, setDepartamentos] = useState<Departamento[]>([]);
  const [municipios, setMunicipios] = useState<Municipio[]>([]);
  const [comunas, setComunas] = useState<Comuna[]>([]);
  const [barrios, setBarrios] = useState<Barrio[]>([]);
  const [allVoters, setAllVoters] = useState<VotanteConRoles[]>([]);
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadAttempt, setLoadAttempt] = useState(0);
  const [selectedLeaderId, setSelectedLeaderId] = useState<number | null>(null);

  const alcance: AlcanceValue = initialAlcance ?? { tipo: "nacional" };
  const scopeDept =
    alcance.tipo === "departamental" ? alcance.id_departamento : undefined;
  const scopeMun =
    alcance.tipo === "municipal" ? alcance.id_municipio : undefined;

  const puestoNombre = useMemo(() => {
    const map = new Map<number, string>();
    for (const p of initialPuestos) map.set(p.id, p.nombre);
    return map;
  }, [initialPuestos]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [deptRes, munRes, comRes, barRes, votRes] = await Promise.all([
          supabase.current
            .from("departamentos")
            .select("id, nombre")
            .order("nombre"),
          supabase.current
            .from("municipios")
            .select("id, nombre, id_departamento")
            .order("nombre"),
          supabase.current
            .from("comunas")
            .select("id, nombre, id_municipio")
            .order("nombre"),
          supabase.current
            .from("barrios")
            .select("id, nombre, id_comuna")
            .order("nombre"),
          supabase.current
            .from("votantes")
            .select(
              `id, nombres, apellidos, documento, telefono, id_rol, id_lider_directo, id_departamento, id_municipio, id_barrio_votante, id_puesto_votacion, mesa, roles(nombre)`
            )
            .eq("id_campana", campaignId),
        ]);

        if (cancelled) return;

        if (
          deptRes.error ||
          munRes.error ||
          comRes.error ||
          barRes.error ||
          votRes.error
        ) {
          setError("No se pudo cargar la información de líderes.");
          return;
        }

        setDepartamentos(deptRes.data ?? []);
        setMunicipios(munRes.data ?? []);
        setComunas(comRes.data ?? []);
        setBarrios(barRes.data ?? []);
        setAllVoters((votRes.data ?? []) as VotanteConRoles[]);
      } catch {
        if (!cancelled) {
          setError("No se pudo cargar la información de líderes.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [campaignId, loadAttempt]);

  const cascade = useMemo(() => {
    const showDepartamento = alcance.tipo === "nacional";
    const showMunicipio = alcance.tipo !== "municipal";
    const showComuna = true;
    const showBarrio = true;

    const municipioOptions = showMunicipio
      ? alcance.tipo === "departamental"
        ? municipios.filter((m) => m.id_departamento === scopeDept)
        : filters.id_departamento
          ? municipios.filter((m) => m.id_departamento === filters.id_departamento)
          : []
      : [];

    const comunaOptions =
      alcance.tipo === "municipal"
        ? comunas.filter((c) => c.id_municipio === scopeMun)
        : filters.id_municipio
          ? comunas.filter((c) => c.id_municipio === filters.id_municipio)
          : [];

    const barrioOptions = filters.id_comuna
      ? barrios.filter((b) => b.id_comuna === filters.id_comuna)
      : [];

    return {
      showDepartamento,
      showMunicipio,
      showComuna,
      showBarrio,
      municipioOptions,
      comunaOptions,
      barrioOptions,
    };
  }, [
    alcance.tipo,
    scopeDept,
    scopeMun,
    municipios,
    comunas,
    barrios,
    filters.id_departamento,
    filters.id_municipio,
    filters.id_comuna,
  ]);

  const eligible = useMemo(() => {
    return allVoters.filter((v) => {
      if (scopeDept && v.id_departamento !== scopeDept) return false;
      if (scopeMun && v.id_municipio !== scopeMun) return false;
      if (filters.id_departamento && v.id_departamento !== filters.id_departamento)
        return false;
      if (filters.id_municipio && v.id_municipio !== filters.id_municipio)
        return false;
      if (filters.id_comuna) {
        const barriosDeComuna = barrios
          .filter((b) => b.id_comuna === filters.id_comuna)
          .map((b) => b.id);
        const ids = barriosDeComuna.length ? barriosDeComuna : [-1];
        if (v.id_barrio_votante == null || !ids.includes(v.id_barrio_votante))
          return false;
      }
      if (filters.id_barrio && v.id_barrio_votante !== filters.id_barrio)
        return false;
      if (
        filters.id_puesto_votacion &&
        v.id_puesto_votacion !== filters.id_puesto_votacion
      )
        return false;
      return true;
    });
  }, [allVoters, filters, barrios, scopeDept, scopeMun]);

  const leaders = useMemo(() => {
    return allVoters.filter((v) => {
      const nombre = nombreRelacion(v.roles);
      return Boolean(nombre) && nombre !== "Votante";
    });
  }, [allVoters]);

  const ranking = useMemo(() => {
    return leaders
      .map((leader) => {
        const referidosDelLider = eligible.filter(
          (v) => v.id_lider_directo === leader.id
        );
        const porPuesto = new Map<number, number>();

        for (const referido of referidosDelLider) {
          if (referido.id_puesto_votacion == null) continue;
          porPuesto.set(
            referido.id_puesto_votacion,
            (porPuesto.get(referido.id_puesto_votacion) ?? 0) + 1
          );
        }

        const topPuestos: PuestoRanking[] = Array.from(porPuesto.entries())
          .map(([id, cantidad]) => ({
            nombre: puestoNombre.get(id) ?? "Puesto sin nombre",
            cantidad,
          }))
          .sort((a, b) => {
            if (b.cantidad !== a.cantidad) return b.cantidad - a.cantidad;
            return a.nombre.localeCompare(b.nombre, "es");
          })
          .slice(0, 3);

        return {
          leader,
          referidos: referidosDelLider.length,
          puestoFuerte: topPuestos[0] ?? null,
          otrosPuestos: topPuestos.slice(1),
        };
      })
      .sort((a, b) => {
        if (b.referidos !== a.referidos) return b.referidos - a.referidos;
        const na = `${a.leader.nombres} ${a.leader.apellidos}`;
        const nb = `${b.leader.nombres} ${b.leader.apellidos}`;
        return na.localeCompare(nb, "es");
      });
  }, [leaders, eligible, puestoNombre]);

  const totalReferidos = useMemo(
    () => ranking.reduce((acc, r) => acc + r.referidos, 0),
    [ranking]
  );

  const selectedEntry = useMemo(
    () => ranking.find((r) => r.leader.id === selectedLeaderId) ?? null,
    [ranking, selectedLeaderId]
  );

  const selectedReferidos = useMemo(
    () =>
      selectedEntry
        ? eligible.filter((v) => v.id_lider_directo === selectedEntry.leader.id)
        : [],
    [selectedEntry, eligible]
  );

  const hasActiveFilters = Boolean(
    filters.id_departamento ||
      filters.id_municipio ||
      filters.id_comuna ||
      filters.id_barrio ||
      filters.id_puesto_votacion
  );

  function changeFilter(key: keyof Filters, value: string) {
    const numeric =
      key === "id_comuna" || key === "id_barrio" || key === "id_puesto_votacion";
    setFilters((prev) => {
      const next: Filters = {
        ...prev,
        [key]: numeric ? (value ? Number(value) : 0) : value,
      };
      if (key === "id_departamento") {
        next.id_municipio = "";
        next.id_comuna = 0;
        next.id_barrio = 0;
      } else if (key === "id_municipio") {
        next.id_comuna = 0;
        next.id_barrio = 0;
      } else if (key === "id_comuna") {
        next.id_barrio = 0;
      }
      return next;
    });
  }

  function clearFilters() {
    setFilters(DEFAULT_FILTERS);
  }

  function descargarExcel() {
    const filas = ranking.map((row, index) => ({
      Posición: index + 1,
      Líder: `${row.leader.nombres} ${row.leader.apellidos}`.trim(),
      Documento: row.leader.documento,
      Rol: nombreRelacion(row.leader.roles) ?? "—",
      "Puesto fuerte": row.puestoFuerte
        ? `${row.puestoFuerte.nombre} (${row.puestoFuerte.cantidad})`
        : "—",
      "Otros puestos": row.otrosPuestos.length
        ? row.otrosPuestos
            .map((puesto) => `${puesto.nombre} (${puesto.cantidad})`)
            .join("; ")
        : "—",
      Referidos: row.referidos,
    }));
    const ws = XLSX.utils.json_to_sheet(filas);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Cobertura Líder");
    const fecha = new Date().toISOString().slice(0, 10);
    XLSX.writeFile(wb, `cobertura-lider-campana-${campaignId}-${fecha}.xlsx`);
  }

  function Select({
    label,
    value,
    options,
    disabled,
    placeholder,
    onChange,
  }: {
    label: string;
    value: string;
    options: { id: string | number; nombre: string }[];
    disabled?: boolean;
    placeholder: string;
    onChange: (value: string) => void;
  }) {
    return (
      <div className="w-[180px]">
        <label className="mb-1 block text-xs font-medium text-neutral-500">
          {label}
        </label>
        <select
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          className={cn(platformSelectClass, disabled && "opacity-60")}
        >
          <option value="">{placeholder}</option>
          {options.map((o) => (
            <option key={o.id} value={o.id}>
              {o.nombre}
            </option>
          ))}
        </select>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm shadow-neutral-200/60">
        <div className="flex flex-wrap items-end gap-3">
          {cascade.showDepartamento && (
            <Select
              label="Departamento"
              value={filters.id_departamento}
              options={departamentos}
              placeholder="Todos"
              onChange={(value) => changeFilter("id_departamento", value)}
            />
          )}
          {cascade.showMunicipio && (
            <Select
              label="Municipio"
              value={filters.id_municipio}
              options={cascade.municipioOptions}
              disabled={
                alcance.tipo === "nacional" && !filters.id_departamento
              }
              placeholder={
                alcance.tipo === "nacional" && !filters.id_departamento
                  ? "Elige departamento"
                  : cascade.municipioOptions.length === 0
                    ? "Sin municipios"
                    : "Todos"
              }
              onChange={(value) => changeFilter("id_municipio", value)}
            />
          )}
          {cascade.showComuna && (
            <Select
              label="Comuna"
              value={filters.id_comuna ? String(filters.id_comuna) : ""}
              options={cascade.comunaOptions}
              disabled={
                alcance.tipo === "nacional"
                  ? !filters.id_municipio
                  : alcance.tipo === "departamental"
                    ? !filters.id_municipio
                    : false
              }
              placeholder={
                alcance.tipo === "municipal"
                  ? cascade.comunaOptions.length === 0
                    ? "Sin comunas"
                    : "Todas"
                  : !filters.id_municipio
                    ? "Elige municipio"
                    : cascade.comunaOptions.length === 0
                      ? "Sin comunas"
                      : "Todas"
              }
              onChange={(value) => changeFilter("id_comuna", value)}
            />
          )}
          {cascade.showBarrio && (
            <Select
              label="Barrio"
              value={filters.id_barrio ? String(filters.id_barrio) : ""}
              options={cascade.barrioOptions}
              disabled={!filters.id_comuna}
              placeholder={
                !filters.id_comuna
                  ? "Elige comuna"
                  : cascade.barrioOptions.length === 0
                    ? "Sin barrios"
                    : "Todos"
              }
              onChange={(value) => changeFilter("id_barrio", value)}
            />
          )}
          <Select
            label="Puesto de votación"
            value={
              filters.id_puesto_votacion
                ? String(filters.id_puesto_votacion)
                : ""
            }
            options={initialPuestos}
            placeholder="Todos"
            onChange={(value) => changeFilter("id_puesto_votacion", value)}
          />
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

      {loading ? (
        <div className="flex items-center justify-center rounded-xl border border-neutral-200 bg-white p-16">
          <div className="flex items-center gap-2 text-sm text-neutral-500">
            <div className="size-4 animate-spin rounded-full border-2 border-neutral-300 border-t-neutral-600" />
            Cargando líderes…
          </div>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-neutral-200 bg-white p-16">
          <p className="text-sm text-neutral-500">{error}</p>
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs"
            onClick={() => setLoadAttempt((n) => n + 1)}
          >
            Reintentar
          </Button>
        </div>
      ) : (
        <>
          <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm shadow-neutral-200/60">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-neutral-500">
                <span className="font-semibold text-neutral-900">
                  {leaders.length.toLocaleString("es-CO")}
                </span>{" "}
                líderes ·{" "}
                <span className="font-semibold text-neutral-900">
                  {totalReferidos.toLocaleString("es-CO")}
                </span>{" "}
                referidos
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={descargarExcel}
                disabled={ranking.length === 0}
                className="h-8 text-xs"
              >
                <Download className="mr-1 size-3" /> Descargar Excel
              </Button>
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-neutral-200 shadow-sm shadow-neutral-200/60">
            <div className="overflow-x-auto rounded-lg border border-neutral-100">
              <table className="w-full min-w-[80rem] text-sm">
                <thead>
                  <tr className="border-b border-neutral-100 bg-neutral-50/80 text-left">
                    <th className="px-4 py-3 text-xs font-semibold tracking-wide text-neutral-600">
                      Posición
                    </th>
                    <th className="px-4 py-3 text-xs font-semibold tracking-wide text-neutral-600">
                      Líder
                    </th>
                    <th className="px-4 py-3 text-xs font-semibold tracking-wide text-neutral-600">
                      Documento
                    </th>
                    <th className="px-4 py-3 text-xs font-semibold tracking-wide text-neutral-600">
                      Rol
                    </th>
                    <th className="px-4 py-3 text-xs font-semibold tracking-wide text-neutral-600">
                      Puesto fuerte
                    </th>
                    <th className="px-4 py-3 text-xs font-semibold tracking-wide text-neutral-600">
                      Otros puestos
                    </th>
                    <th className="px-4 py-3 text-xs font-semibold tracking-wide text-neutral-600">
                      Referidos
                    </th>
                    <th className="px-4 py-3 text-xs font-semibold tracking-wide text-neutral-600">
                      Detalle
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {ranking.length ? (
                    ranking.map((row, index) => (
                      <tr
                        key={row.leader.id}
                        className="bg-white transition-colors hover:bg-neutral-50/50"
                      >
                        <td className="px-4 py-3 font-semibold text-neutral-900">
                          {index + 1}
                        </td>
                        <td className="px-4 py-3 font-medium text-neutral-900">
                          {row.leader.nombres} {row.leader.apellidos}
                        </td>
                        <td className="px-4 py-3 text-neutral-700">
                          {row.leader.documento}
                        </td>
                        <td className="px-4 py-3 text-neutral-700">
                          {nombreRelacion(row.leader.roles) ?? "—"}
                        </td>
                        <td className="px-4 py-3 text-neutral-700">
                          {row.puestoFuerte ? (
                            <div>
                              <div className="font-medium text-neutral-900">
                                {row.puestoFuerte.nombre}
                              </div>
                              <div className="text-xs text-neutral-500">
                                {row.puestoFuerte.cantidad.toLocaleString("es-CO")}
                              </div>
                            </div>
                          ) : (
                            "—"
                          )}
                        </td>
                        <td className="px-4 py-3 text-neutral-700">
                          {row.otrosPuestos.length ? (
                            <div className="space-y-1">
                              {row.otrosPuestos.map((puesto) => (
                                <div key={puesto.nombre}>
                                  <span>{puesto.nombre}</span>{" "}
                                  <span className="text-xs text-neutral-500">
                                    ({puesto.cantidad.toLocaleString("es-CO")})
                                  </span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            "—"
                          )}
                        </td>
                        <td className="px-4 py-3 font-bold text-neutral-900">
                          {row.referidos.toLocaleString("es-CO")}
                        </td>
                        <td className="px-4 py-3">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="h-8 text-xs"
                            onClick={() => setSelectedLeaderId(row.leader.id)}
                          >
                            Ver detalle
                          </Button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={8}
                        className="px-4 py-12 text-center text-neutral-500"
                      >
                        Sin líderes que coincidan con los filtros.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {selectedEntry && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-neutral-900/50 p-4 backdrop-blur-[1px]"
          role="presentation"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedLeaderId(null);
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            className="w-full max-w-2xl overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3 border-b border-neutral-100 p-5">
              <div>
                <h3 className="text-base font-semibold text-neutral-900">
                  {selectedEntry.leader.nombres} {selectedEntry.leader.apellidos}
                </h3>
                <p className="mt-1 text-sm text-neutral-500">
                  {selectedEntry.leader.documento} ·{" "}
                  {nombreRelacion(selectedEntry.leader.roles) ?? "Sin rol"} ·{" "}
                  {selectedEntry.leader.id_puesto_votacion != null
                    ? puestoNombre.get(selectedEntry.leader.id_puesto_votacion) ??
                      "—"
                    : "—"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedLeaderId(null)}
                className="rounded-lg p-1.5 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-600"
                aria-label="Cerrar"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="max-h-[55vh] overflow-auto p-5">
              {selectedReferidos.length ? (
                <div className="overflow-x-auto rounded-lg border border-neutral-100">
                  <table className="w-full min-w-[40rem] text-sm">
                    <thead>
                      <tr className="border-b border-neutral-100 bg-neutral-50/80 text-left">
                        <th className="px-4 py-3 text-xs font-semibold tracking-wide text-neutral-600">
                          Nombre
                        </th>
                        <th className="px-4 py-3 text-xs font-semibold tracking-wide text-neutral-600">
                          Documento
                        </th>
                        <th className="px-4 py-3 text-xs font-semibold tracking-wide text-neutral-600">
                          Puesto
                        </th>
                        <th className="px-4 py-3 text-xs font-semibold tracking-wide text-neutral-600">
                          Mesa
                        </th>
                        <th className="px-4 py-3 text-xs font-semibold tracking-wide text-neutral-600">
                          Rol
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100">
                      {selectedReferidos.map((v) => (
                        <tr
                          key={v.id}
                          className="bg-white transition-colors hover:bg-neutral-50/50"
                        >
                          <td className="px-4 py-3 font-medium text-neutral-900">
                            {v.nombres} {v.apellidos}
                          </td>
                          <td className="px-4 py-3 text-neutral-700">
                            {v.documento}
                          </td>
                          <td className="px-4 py-3 text-neutral-700">
                            {v.id_puesto_votacion != null
                              ? puestoNombre.get(v.id_puesto_votacion) ?? "—"
                              : "—"}
                          </td>
                          <td className="px-4 py-3 text-neutral-700">
                            {v.mesa?.trim() || "—"}
                          </td>
                          <td className="px-4 py-3 text-neutral-700">
                            {nombreRelacion(v.roles) ?? "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="py-8 text-center text-sm text-neutral-500">
                  Este líder no tiene referidos con los filtros actuales.
                </p>
              )}
            </div>

            <div className="flex justify-end border-t border-neutral-100 p-4">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-9 text-xs"
                onClick={() => setSelectedLeaderId(null)}
              >
                Cerrar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
