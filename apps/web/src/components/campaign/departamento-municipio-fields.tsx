"use client";

import { useMemo, useState } from "react";
import { FormField, platformSelectClass } from "@/components/platform/platform-ui";
import type { DepartamentoOption, MunicipioOption } from "@/lib/campaign/comunas";

type Props = {
  departamentos: DepartamentoOption[];
  municipios: MunicipioOption[];
  defaultMunicipioId?: string | null;
  departamentoLabel?: string;
  municipioLabel?: string;
  disabled?: boolean;
};

export function DepartamentoMunicipioFields({
  departamentos,
  municipios,
  defaultMunicipioId,
  departamentoLabel = "Departamento",
  municipioLabel = "Municipio",
  disabled = false,
}: Props) {
  const defaultDep = useMemo(() => {
    if (defaultMunicipioId == null) return "";
    const m = municipios.find((m) => m.id === defaultMunicipioId);
    return m ? String(m.id_departamento) : "";
  }, [defaultMunicipioId, municipios]);

  const [departamentoId, setDepartamentoId] = useState(defaultDep);
  const [municipioId, setMunicipioId] = useState(
    defaultMunicipioId != null ? String(defaultMunicipioId) : ""
  );

  const municipiosFiltrados = useMemo(
    () =>
      municipios.filter(
        (m) => String(m.id_departamento) === departamentoId
      ),
    [municipios, departamentoId]
  );

  const sinDeptos = departamentos.length === 0;
  const sinMunicipios = municipiosFiltrados.length === 0;

  return (
    <>
      <FormField label={departamentoLabel}>
        <select
          name="id_departamento"
          required
          disabled={disabled || sinDeptos}
          value={departamentoId}
          onChange={(e) => {
            setDepartamentoId(e.target.value);
            setMunicipioId("");
          }}
          className={platformSelectClass}
        >
          <option value="" disabled>
            {sinDeptos ? "Sin departamentos" : "Seleccionar departamento"}
          </option>
          {departamentos.map((d) => (
            <option key={d.id} value={d.id}>
              {d.nombre}
            </option>
          ))}
        </select>
      </FormField>
      <FormField label={municipioLabel}>
        <select
          name="id_municipio"
          required
          disabled={disabled || sinMunicipios || !departamentoId}
          value={municipioId}
          onChange={(e) => setMunicipioId(e.target.value)}
          className={platformSelectClass}
        >
          <option value="" disabled>
            {!departamentoId
              ? "Selecciona departamento primero"
              : sinMunicipios
                ? "Sin municipios en este departamento"
                : "Seleccionar municipio"}
          </option>
          {municipiosFiltrados.map((m) => (
            <option key={m.id} value={m.id}>
              {m.nombre}
            </option>
          ))}
        </select>
      </FormField>
    </>
  );
}
