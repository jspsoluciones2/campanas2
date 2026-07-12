"use client";

import { useMemo, useState } from "react";
import { FormField, platformSelectClass } from "@/components/platform/platform-ui";

export type ComunaOption = { id: number; nombre: string };
export type BarrioOption = { id: number; nombre: string; id_comuna: number };

type Props = {
  comunas: ComunaOption[];
  barrios: BarrioOption[];
  defaultComunaId?: number | null;
  defaultBarrioId?: number | null;
  disabled?: boolean;
};

export function ComunaBarrioFields({
  comunas,
  barrios,
  defaultComunaId,
  defaultBarrioId,
  disabled = false,
}: Props) {
  const [comunaId, setComunaId] = useState(
    defaultComunaId != null ? String(defaultComunaId) : ""
  );
  const [barrioId, setBarrioId] = useState(
    defaultBarrioId != null ? String(defaultBarrioId) : ""
  );

  const barriosFiltrados = useMemo(
    () => barrios.filter((barrio) => barrio.id_comuna === Number(comunaId)),
    [barrios, comunaId]
  );

  const sinComunas = comunas.length === 0;
  const sinBarrios = barrios.length === 0;

  return (
    <>
      <FormField label="Comuna">
        <select
          name="id_comuna"
          required
          disabled={disabled || sinComunas}
          value={comunaId}
          onChange={(event) => {
            setComunaId(event.target.value);
            setBarrioId("");
          }}
          className={platformSelectClass}
        >
          <option value="" disabled>
            {sinComunas ? "Sin comunas" : "Seleccionar comuna"}
          </option>
          {comunas.map((comuna) => (
            <option key={comuna.id} value={comuna.id}>
              {comuna.nombre}
            </option>
          ))}
        </select>
      </FormField>
      <FormField label="Barrio">
        <select
          name="id_barrio"
          required
          disabled={disabled || sinBarrios || !comunaId}
          value={barrioId}
          onChange={(event) => setBarrioId(event.target.value)}
          className={platformSelectClass}
        >
          <option value="" disabled>
            {!comunaId
              ? "Selecciona comuna primero"
              : barriosFiltrados.length === 0
                ? "Sin barrios en esta comuna"
                : "Seleccionar barrio"}
          </option>
          {barriosFiltrados.map((barrio) => (
            <option key={barrio.id} value={barrio.id}>
              {barrio.nombre}
            </option>
          ))}
        </select>
      </FormField>
    </>
  );
}
