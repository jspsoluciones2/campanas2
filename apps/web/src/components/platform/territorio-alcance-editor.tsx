"use client";

import { useMemo, useState } from "react";
import { platformSelectClass } from "@/components/platform/platform-ui";

export type AlcanceTipo = "nacional" | "departamental" | "municipal";

type Depto = { id: string; nombre: string };
type Municipio = { id: string; nombre: string; id_departamento: string };

type AlcanceNacional = { tipo: "nacional" };
type AlcanceDepartamental = { tipo: "departamental"; id_departamento: string };
type AlcanceMunicipal = { tipo: "municipal"; id_municipio: string };

export type AlcanceValue =
  | AlcanceNacional
  | AlcanceDepartamental
  | AlcanceMunicipal;

type Props = {
  departamentos: Depto[];
  municipios: Municipio[];
  /** Si la campaña ya tiene alcance definido, pasar el objeto serializado. */
  initialAlcance?: AlcanceValue;
};

function parseInitial(tipo?: AlcanceTipo, row?: { id_departamento?: string | null; id_municipio?: string | null }): AlcanceValue {
  if (tipo === "departamental" && row?.id_departamento) {
    return { tipo: "departamental", id_departamento: row.id_departamento };
  }
  if (tipo === "municipal" && row?.id_municipio) {
    return { tipo: "municipal", id_municipio: row.id_municipio };
  }
  return { tipo: "nacional" };
}

export function TerritorioAlcanceEditor({
  departamentos,
  municipios,
  initialAlcance,
}: Props) {
  const [tipo, setTipo] = useState<AlcanceTipo>(initialAlcance?.tipo ?? "nacional");
  const [idDepartamento, setIdDepartamento] = useState(
    initialAlcance?.tipo === "departamental"
      ? (initialAlcance as AlcanceDepartamental).id_departamento
      : ""
  );
  const [idMunicipio, setIdMunicipio] = useState(
    initialAlcance?.tipo === "municipal"
      ? (initialAlcance as AlcanceMunicipal).id_municipio
      : ""
  );

  const municipiosFiltrados = useMemo(
    () =>
      idDepartamento
        ? municipios.filter((m) => m.id_departamento === idDepartamento)
        : [],
    [municipios, idDepartamento]
  );

  /** Serializa según el tipo activo, manteniendo depto/municipio en el hidden input incluso si no se muestran. */
  function jsonAlcance(): string {
    switch (tipo) {
      case "nacional":
        return JSON.stringify({ tipo: "nacional" });
      case "departamental":
        return JSON.stringify({ tipo: "departamental", id_departamento: idDepartamento });
      case "municipal":
        return JSON.stringify({ tipo: "municipal", id_municipio: idMunicipio });
    }
  }

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-neutral-700">
        Alcance territorial
      </p>

      {/* Radio buttons */}
      <fieldset className="flex flex-wrap gap-2">
        {([
          { value: "nacional", label: "Nacional" },
          { value: "departamental", label: "Departamental" },
          { value: "municipal", label: "Municipal" },
        ] as const).map((opt) => (
          <label
            key={opt.value}
            className={`cursor-pointer rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              tipo === opt.value
                ? "bg-neutral-800 text-white"
                : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
            }`}
          >
            <input
              type="radio"
              name="alcance_tipo"
              value={opt.value}
              checked={tipo === opt.value}
              onChange={() => setTipo(opt.value)}
              className="sr-only"
            />
            {opt.label}
          </label>
        ))}
      </fieldset>

      {/* Departamental: dropdown de departamentos */}
      {tipo === "departamental" && (
        <div>
          <label className="text-sm font-medium text-neutral-700">
            Departamento
          </label>
          <select
            value={idDepartamento}
            onChange={(e) => setIdDepartamento(e.target.value)}
            required
            className={platformSelectClass}
          >
            <option value="" disabled>
              Seleccionar departamento
            </option>
            {departamentos.map((d) => (
              <option key={d.id} value={d.id}>
                {d.nombre}
              </option>
            ))}
          </select>
          {!idDepartamento && (
            <p className="mt-1 text-xs text-amber-600">
              Seleccioná un departamento.
            </p>
          )}
        </div>
      )}

      {/* Municipal: dropdown de departamento → dropdown de municipio */}
      {tipo === "municipal" && (
        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium text-neutral-700">
              Departamento
            </label>
            <select
              value={idDepartamento}
              onChange={(e) => {
                setIdDepartamento(e.target.value);
                setIdMunicipio("");
              }}
              required
              className={platformSelectClass}
            >
              <option value="" disabled>
                Seleccionar departamento
              </option>
              {departamentos.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.nombre}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-neutral-700">
              Municipio
            </label>
            <select
              value={idMunicipio}
              onChange={(e) => setIdMunicipio(e.target.value)}
              required
              disabled={!idDepartamento}
              className={platformSelectClass}
            >
              <option value="" disabled>
                {idDepartamento
                  ? "Seleccionar municipio"
                  : "Primero seleccioná un departamento"}
              </option>
              {municipiosFiltrados.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.nombre}
                </option>
              ))}
            </select>
            {idDepartamento && !idMunicipio && (
              <p className="mt-1 text-xs text-amber-600">
                Seleccioná un municipio.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Serializado oculto para el form submit */}
      <input type="hidden" name="alcance" value={jsonAlcance()} />
    </div>
  );
}

export { parseInitial };
