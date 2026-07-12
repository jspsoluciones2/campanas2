"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";

type Depto = { id: number; nombre: string };
type Municipio = { id: number; nombre: string; id_departamento: number };

type AlcanceEntry = { id_departamento: number; id_municipio?: number };

type Props = {
  departamentos: Depto[];
  municipios: Municipio[];
  initialAlcance?: AlcanceEntry[];
};

export function TerritorioAlcanceEditor({
  departamentos,
  municipios,
  initialAlcance,
}: Props) {
  const isTodos = !initialAlcance || initialAlcance.length === 0;
  const [mode, setMode] = useState<"todos" | "especifico">(
    isTodos ? "todos" : "especifico"
  );
  const initialDeptos = new Set(
    (initialAlcance ?? []).map((a) => a.id_departamento)
  );
  const initialMunicipios = new Map<number, Set<number>>();
  for (const a of initialAlcance ?? []) {
    if (a.id_municipio) {
      if (!initialMunicipios.has(a.id_departamento)) {
        initialMunicipios.set(a.id_departamento, new Set());
      }
      initialMunicipios.get(a.id_departamento)!.add(a.id_municipio);
    }
  }

  const [selectedDeptos, setSelectedDeptos] =
    useState<Set<number>>(initialDeptos);
  const [selectedMunicipios, setSelectedMunicipios] =
    useState<Map<number, Set<number>>>(initialMunicipios);
  const [expandedDepto, setExpandedDepto] = useState<number | null>(null);

  const municipiosByDepto = useMemo(
    () =>
      municipios.reduce(
        (acc, m) => {
          if (!acc.has(m.id_departamento)) {
            acc.set(m.id_departamento, []);
          }
          acc.get(m.id_departamento)!.push(m);
          return acc;
        },
        new Map<number, Municipio[]>()
      ),
    [municipios]
  );

  function toggleDepto(id: number) {
    setSelectedDeptos((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleMunicipio(deptoId: number, muniId: number) {
    setSelectedMunicipios((prev) => {
      const next = new Map(prev);
      const set = new Set(next.get(deptoId) ?? []);
      if (set.has(muniId)) set.delete(muniId);
      else set.add(muniId);
      if (set.size === 0) next.delete(deptoId);
      else next.set(deptoId, set);
      return next;
    });
  }

  function jsonAlcance(): string {
    if (mode === "todos") return JSON.stringify({ tipo: "todos" });
    const entries: AlcanceEntry[] = [];
    for (const deptoId of selectedDeptos) {
      const munis = selectedMunicipios.get(deptoId);
      if (munis && munis.size > 0) {
        for (const muniId of munis) {
          entries.push({ id_departamento: deptoId, id_municipio: muniId });
        }
      } else {
        entries.push({ id_departamento: deptoId });
      }
    }
    return JSON.stringify({ tipo: "especifico", entries });
  }

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-neutral-700">
        Alcance territorial
      </p>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setMode("todos")}
          className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
            mode === "todos"
              ? "bg-neutral-800 text-white"
              : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
          }`}
        >
          Todos los departamentos
        </button>
        <button
          type="button"
          onClick={() => setMode("especifico")}
          className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
            mode === "especifico"
              ? "bg-neutral-800 text-white"
              : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
          }`}
        >
          Departamentos específicos
        </button>
      </div>

      {mode === "especifico" && (
        <div className="max-h-64 space-y-1 overflow-y-auto rounded-lg border border-neutral-200 p-3">
          {departamentos.map((d) => {
            const checked = selectedDeptos.has(d.id);
            const munis = municipiosByDepto.get(d.id) ?? [];
            const expanded = expandedDepto === d.id;

            return (
              <div key={d.id}>
                <label className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-neutral-50">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleDepto(d.id)}
                    className="size-4 rounded border-neutral-300 text-neutral-800 focus:ring-neutral-800"
                  />
                  <span className="text-neutral-800">{d.nombre}</span>
                  {checked && munis.length > 0 && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        setExpandedDepto(expanded ? null : d.id);
                      }}
                      className="ml-auto text-xs text-neutral-500 hover:text-neutral-800"
                    >
                      {expanded ? "▲ municipios" : "▼ municipios"}
                    </button>
                  )}
                </label>

                {checked && expanded && munis.length > 0 && (
                  <div className="ml-6 space-y-0.5 border-l-2 border-neutral-200 pl-3">
                    <label className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1 text-xs text-neutral-500 hover:bg-neutral-50">
                      <input
                        type="checkbox"
                        checked={!selectedMunicipios.has(d.id)}
                        onChange={() => {
                          setSelectedMunicipios((prev) => {
                            const next = new Map(prev);
                            next.delete(d.id);
                            return next;
                          });
                        }}
                        className="size-3.5 rounded border-neutral-300 text-neutral-800 focus:ring-neutral-800"
                      />
                      Todos los municipios
                    </label>
                    {munis.map((m) => {
                      const mChecked =
                        selectedMunicipios.get(d.id)?.has(m.id) ?? false;
                      return (
                        <label
                          key={m.id}
                          className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1 text-xs hover:bg-neutral-50"
                        >
                          <input
                            type="checkbox"
                            checked={mChecked}
                            onChange={() => toggleMunicipio(d.id, m.id)}
                            className="size-3.5 rounded border-neutral-300 text-neutral-800 focus:ring-neutral-800"
                          />
                          {m.nombre}
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <input type="hidden" name="alcance" value={jsonAlcance()} />

      {mode === "especifico" && selectedDeptos.size === 0 && (
        <p className="text-xs text-amber-600">
          Seleccioná al menos un departamento.
        </p>
      )}
    </div>
  );
}
