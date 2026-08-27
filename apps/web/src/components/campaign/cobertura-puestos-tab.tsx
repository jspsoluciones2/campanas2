"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Download, X } from "lucide-react";
import * as XLSX from "xlsx";
import { createClient } from "@/lib/supabase/client";
import {
  fetchPuestosPorAlcance,
  type PuestoOption,
} from "@/lib/campaign/comunas";
import { platformSelectClass } from "@/components/platform/platform-ui";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { AlcanceValue } from "@/components/campaign/mapa-geografico";

type Departamento = { id: string; nombre: string };
type Municipio = { id: string; nombre: string; id_departamento: string };
type Comuna = { id: number; nombre: string; id_municipio: string | null };
type Barrio = { id: number; nombre: string; id_comuna: number };
type Leader = {
  id: number;
  nombres: string;
  apellidos: string;
  roles: { nombre: string } | { nombre: string }[] | null;
};
type Voter = {
  id: number;
  sexo: string | null;
  id_lider_directo: number | null;
  id_departamento: string | null;
  id_municipio: string | null;
  id_barrio_votante: number | null;
  id_puesto_votacion: number | null;
  nombres: string;
  apellidos: string;
  roles: { nombre: string } | { nombre: string }[] | null;
};
type Filters = {
  id_departamento: string;
  id_municipio: string;
  id_comuna: number;
  id_barrio: number;
  id_lider_directo: number;
};
type Row = {
  puesto: PuestoOption;
  mujeresReferenciadas: number;
  hombresReferenciados: number;
  totalReferenciado: number;
  coberturaMujeres: number | null;
  coberturaHombres: number | null;
  coberturaTotal: number | null;
};

const DEFAULT_FILTERS: Filters = {
  id_departamento: "",
  id_municipio: "",
  id_comuna: 0,
  id_barrio: 0,
  id_lider_directo: 0,
};

function relationName(
  relation: { nombre: string } | { nombre: string }[] | null
) {
  return Array.isArray(relation) ? relation[0]?.nombre : relation?.nombre;
}

function percentage(value: number, denominator: number) {
  return denominator > 0 ? (value / denominator) * 100 : null;
}

function percentageLabel(value: number | null) {
  return value == null ? "—" : `${value.toFixed(1)}%`;
}

type Props = {
  campaignId: number;
  initialAlcance?: AlcanceValue;
};

export function CoberturaPuestosTab({ campaignId, initialAlcance }: Props) {
  const supabase = useRef(createClient());
  const [departamentos, setDepartamentos] = useState<Departamento[]>([]);
  const [municipios, setMunicipios] = useState<Municipio[]>([]);
  const [comunas, setComunas] = useState<Comuna[]>([]);
  const [barrios, setBarrios] = useState<Barrio[]>([]);
  const [puestos, setPuestos] = useState<PuestoOption[]>([]);
  const [voters, setVoters] = useState<Voter[]>([]);
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadAttempt, setLoadAttempt] = useState(0);

  const alcance: AlcanceValue = initialAlcance ?? { tipo: "nacional" };
  const scopeDept =
    alcance.tipo === "departamental" || alcance.tipo === "municipal"
      ? alcance.id_departamento
      : undefined;
  const scopeMun = alcance.tipo === "municipal" ? alcance.id_municipio : undefined;

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [deptRes, munRes, comRes, barRes, puestosRes, votersRes] =
          await Promise.all([
            supabase.current.from("departamentos").select("id, nombre").order("nombre"),
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
            fetchPuestosPorAlcance(supabase.current, campaignId),
            supabase.current
              .from("votantes")
              .select(
                "id, sexo, id_lider_directo, id_departamento, id_municipio, id_barrio_votante, id_puesto_votacion, nombres, apellidos, roles(nombre)"
              )
              .eq("id_campana", campaignId),
          ]);

        if (cancelled) return;
        if (deptRes.error || munRes.error || comRes.error || barRes.error || votersRes.error) {
          setError("No se pudo cargar la información de cobertura.");
          return;
        }
        setDepartamentos((deptRes.data ?? []) as Departamento[]);
        setMunicipios((munRes.data ?? []) as Municipio[]);
        setComunas((comRes.data ?? []) as Comuna[]);
        setBarrios((barRes.data ?? []) as Barrio[]);
        setPuestos(puestosRes);
        setVoters((votersRes.data ?? []) as Voter[]);
      } catch {
        if (!cancelled) setError("No se pudo cargar la información de cobertura.");
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
    const municipioOptions =
      alcance.tipo === "departamental"
        ? municipios.filter((m) => m.id_departamento === scopeDept)
        : filters.id_departamento
          ? municipios.filter((m) => m.id_departamento === filters.id_departamento)
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
      showDepartamento: alcance.tipo === "nacional",
      showMunicipio: alcance.tipo !== "municipal",
      municipioOptions,
      comunaOptions,
      barrioOptions,
    };
  }, [alcance.tipo, barrios, comunas, filters.id_comuna, filters.id_departamento, filters.id_municipio, municipios, scopeDept, scopeMun]);

  const leaders = useMemo(
    () =>
      voters.filter((v) => {
        const role = relationName(v.roles);
        return Boolean(role) && role !== "Votante";
      }) as Leader[],
    [voters]
  );

  const rows = useMemo<Row[]>(() => {
    const barrioIds = filters.id_comuna
      ? new Set(barrios.filter((b) => b.id_comuna === filters.id_comuna).map((b) => b.id))
      : null;
    const eligible = voters.filter((v) => {
      if (scopeDept && v.id_departamento !== scopeDept) return false;
      if (scopeMun && v.id_municipio !== scopeMun) return false;
      if (filters.id_departamento && v.id_departamento !== filters.id_departamento) return false;
      if (filters.id_municipio && v.id_municipio !== filters.id_municipio) return false;
      if (barrioIds && (v.id_barrio_votante == null || !barrioIds.has(v.id_barrio_votante))) return false;
      if (filters.id_barrio && v.id_barrio_votante !== filters.id_barrio) return false;
      if (filters.id_lider_directo && v.id_lider_directo !== filters.id_lider_directo) return false;
      return v.id_lider_directo != null && v.id_puesto_votacion != null;
    });
    const counts = new Map<number, { mujeres: number; hombres: number; total: number }>();
    for (const voter of eligible) {
      const count = counts.get(voter.id_puesto_votacion!) ?? { mujeres: 0, hombres: 0, total: 0 };
      count.total += 1;
      if (voter.sexo === "Femenino") count.mujeres += 1;
      if (voter.sexo === "Masculino") count.hombres += 1;
      counts.set(voter.id_puesto_votacion!, count);
    }
    return puestos
      .map((puesto) => {
        const count = counts.get(puesto.id) ?? { mujeres: 0, hombres: 0, total: 0 };
        const totalRestriction =
          (puesto.votantes_mujeres_admite ?? 0) + (puesto.votantes_hombres_admite ?? 0);
        return {
          puesto,
          mujeresReferenciadas: count.mujeres,
          hombresReferenciados: count.hombres,
          totalReferenciado: count.total,
          coberturaMujeres: percentage(count.mujeres, puesto.votantes_mujeres_admite ?? 0),
          coberturaHombres: percentage(count.hombres, puesto.votantes_hombres_admite ?? 0),
          coberturaTotal: percentage(count.total, totalRestriction),
        };
      })
      .sort((a, b) => {
        if ((b.coberturaTotal ?? -1) !== (a.coberturaTotal ?? -1)) {
          return (b.coberturaTotal ?? -1) - (a.coberturaTotal ?? -1);
        }
        if (b.totalReferenciado !== a.totalReferenciado) return b.totalReferenciado - a.totalReferenciado;
        return a.puesto.nombre.localeCompare(b.puesto.nombre, "es");
      });
  }, [barrios, filters, puestos, scopeDept, scopeMun, voters]);

  const hasActiveFilters = Boolean(
    filters.id_departamento || filters.id_municipio || filters.id_comuna || filters.id_barrio || filters.id_lider_directo
  );

  function changeFilter(key: keyof Filters, value: string) {
    const numeric = key === "id_comuna" || key === "id_barrio" || key === "id_lider_directo";
    setFilters((prev) => {
      const next = { ...prev, [key]: numeric ? (value ? Number(value) : 0) : value };
      if (key === "id_departamento") {
        next.id_municipio = "";
        next.id_comuna = 0;
        next.id_barrio = 0;
      } else if (key === "id_municipio") {
        next.id_comuna = 0;
        next.id_barrio = 0;
      } else if (key === "id_comuna") next.id_barrio = 0;
      return next;
    });
  }

  function descargarExcel() {
    const data = rows.map((row) => ({
      Puesto: row.puesto.nombre,
      "Restricción mujeres": row.puesto.votantes_mujeres_admite ?? 0,
      "Mujeres referenciadas": row.mujeresReferenciadas,
      "% cobertura mujeres": row.coberturaMujeres,
      "Restricción hombres": row.puesto.votantes_hombres_admite ?? 0,
      "Hombres referenciados": row.hombresReferenciados,
      "% cobertura hombres": row.coberturaHombres,
      "Total restricción":
        (row.puesto.votantes_mujeres_admite ?? 0) + (row.puesto.votantes_hombres_admite ?? 0),
      "Total referenciado": row.totalReferenciado,
      "Cobertura total %": row.coberturaTotal,
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Cobertura Puestos");
    const fecha = new Date().toISOString().slice(0, 10);
    XLSX.writeFile(wb, `cobertura-puestos-campana-${campaignId}-${fecha}.xlsx`);
  }

  function Select({ label, value, options, disabled, placeholder, onChange }: { label: string; value: string; options: { id: string | number; nombre: string }[]; disabled?: boolean; placeholder: string; onChange: (value: string) => void }) {
    return (
      <div className="w-[180px]">
        <label className="mb-1 block text-xs font-medium text-neutral-500">{label}</label>
        <select value={value} disabled={disabled} onChange={(e) => onChange(e.target.value)} className={cn(platformSelectClass, disabled && "opacity-60")}>
          <option value="">{placeholder}</option>
          {options.map((option) => <option key={option.id} value={option.id}>{option.nombre}</option>)}
        </select>
      </div>
    );
  }

  if (loading) {
    return <div className="flex items-center justify-center rounded-xl border border-neutral-200 bg-white p-16"><div className="flex items-center gap-2 text-sm text-neutral-500"><div className="size-4 animate-spin rounded-full border-2 border-neutral-300 border-t-neutral-600" /> Cargando cobertura...</div></div>;
  }
  if (error) {
    return <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-neutral-200 bg-white p-16"><p className="text-sm text-neutral-500">{error}</p><Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => setLoadAttempt((value) => value + 1)}>Reintentar</Button></div>;
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm shadow-neutral-200/60">
        <div className="flex flex-wrap items-end gap-3">
          {cascade.showDepartamento && <Select label="Departamento" value={filters.id_departamento} options={departamentos} placeholder="Todos" onChange={(value) => changeFilter("id_departamento", value)} />}
          {cascade.showMunicipio && <Select label="Municipio" value={filters.id_municipio} options={cascade.municipioOptions} disabled={alcance.tipo === "nacional" && !filters.id_departamento} placeholder={alcance.tipo === "nacional" && !filters.id_departamento ? "Elige departamento" : "Todos"} onChange={(value) => changeFilter("id_municipio", value)} />}
          <Select label="Comuna" value={filters.id_comuna ? String(filters.id_comuna) : ""} options={cascade.comunaOptions} disabled={alcance.tipo !== "municipal" && !filters.id_municipio} placeholder={!filters.id_municipio && alcance.tipo !== "municipal" ? "Elige municipio" : "Todas"} onChange={(value) => changeFilter("id_comuna", value)} />
          <Select label="Barrio" value={filters.id_barrio ? String(filters.id_barrio) : ""} options={cascade.barrioOptions} disabled={!filters.id_comuna} placeholder={!filters.id_comuna ? "Elige comuna" : "Todos"} onChange={(value) => changeFilter("id_barrio", value)} />
          <Select label="Líder" value={filters.id_lider_directo ? String(filters.id_lider_directo) : ""} options={leaders.map((leader) => ({ id: leader.id, nombre: `${leader.nombres} ${leader.apellidos}`.trim() }))} placeholder="Todos" onChange={(value) => changeFilter("id_lider_directo", value)} />
          {hasActiveFilters && <Button variant="ghost" size="sm" onClick={() => setFilters(DEFAULT_FILTERS)} className="h-8 text-xs"><X className="mr-1 size-3" /> Limpiar</Button>}
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-neutral-500">{rows.length.toLocaleString("es-CO")} puesto(s) en el alcance{hasActiveFilters && " con filtros activos"}</p>
        <Button type="button" variant="outline" size="sm" onClick={descargarExcel} disabled={rows.length === 0} className="h-8 text-xs"><Download className="mr-1 size-3" /> Descargar reporte</Button>
      </div>
      <div className="overflow-hidden rounded-xl border border-neutral-200 shadow-sm shadow-neutral-200/60">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[90rem] text-sm">
            <thead><tr className="border-b border-neutral-100 bg-neutral-50/80 text-left">
              {["Puesto", "Restricción mujeres", "Mujeres referenciadas", "% cobertura mujeres", "Restricción hombres", "Hombres referenciados", "% cobertura hombres", "Total restricción", "Total referenciado", "Cobertura total %"].map((heading) => <th key={heading} className="whitespace-nowrap px-4 py-3 text-xs font-semibold tracking-wide text-neutral-600">{heading}</th>)}
            </tr></thead>
            <tbody className="divide-y divide-neutral-100">
              {rows.length ? rows.map((row) => { const totalRestriction = (row.puesto.votantes_mujeres_admite ?? 0) + (row.puesto.votantes_hombres_admite ?? 0); return <tr key={row.puesto.id} className="bg-white transition-colors hover:bg-neutral-50/50">
                <td className="whitespace-nowrap px-4 py-3 font-medium text-neutral-900">{row.puesto.nombre}</td>
                <td className="px-4 py-3 text-neutral-700">{row.puesto.votantes_mujeres_admite ?? 0}</td><td className="px-4 py-3 text-neutral-700">{row.mujeresReferenciadas}</td><td className="px-4 py-3 text-neutral-700">{percentageLabel(row.coberturaMujeres)}</td>
                <td className="px-4 py-3 text-neutral-700">{row.puesto.votantes_hombres_admite ?? 0}</td><td className="px-4 py-3 text-neutral-700">{row.hombresReferenciados}</td><td className="px-4 py-3 text-neutral-700">{percentageLabel(row.coberturaHombres)}</td>
                <td className="px-4 py-3 text-neutral-700">{totalRestriction}</td><td className="px-4 py-3 font-semibold text-neutral-900">{row.totalReferenciado}</td><td className="px-4 py-3 font-semibold text-neutral-900">{percentageLabel(row.coberturaTotal)}</td>
              </tr>; }) : <tr><td colSpan={10} className="px-4 py-12 text-center text-neutral-500">No hay puestos en el alcance de la campaña.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
