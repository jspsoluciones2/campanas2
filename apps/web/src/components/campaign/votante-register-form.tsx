"use client";

import { useActionState, useMemo, useState } from "react";
import Link from "next/link";
import { createVotanteAction } from "@/app/(campaign)/campaign/[id]/actions";
import {
  etiquetaJerarquia,
  JERARQUIA_MIN,
  rolesBajoJerarquia,
  rolesJerarquiaMaxima,
} from "@/lib/campaign/roles";
import { Button } from "@/components/ui/button";
import {
  Card,
  FormField,
  FormRow,
  platformInputClass,
  platformSelectClass,
} from "@/components/platform/platform-ui";

const SIN_LIDER_VALUE = "__sin_lider__";

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

type Props = {
  campaignId: number;
  roles: Rol[];
  puestos: Puesto[];
  lugaresTrabajo: LugarTrabajo[];
  lideres: Lider[];
  departamentos: Departamento[];
  municipios: Municipio[];
  barrios: BarrioConComuna[];
};

type ActionState = {
  error?: string;
  ok?: boolean;
  quarantined?: boolean;
  message?: string;
};

async function submitVotante(
  campaignId: number,
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  return createVotanteAction(campaignId, formData);
}

export function VotanteRegisterForm({
  campaignId,
  roles,
  puestos,
  lugaresTrabajo,
  lideres,
  departamentos,
  municipios,
  barrios,
}: Props) {
  const [state, formAction, pending] = useActionState(
    submitVotante.bind(null, campaignId),
    {}
  );
  const [liderId, setLiderId] = useState("");
  const [rolId, setRolId] = useState("");
  const [municipio, setMunicipio] = useState("");
  const [puestoId, setPuestoId] = useState("");

  // Estado para ubicación de residencia del votante
  const [residenciaDeptoId, setResidenciaDeptoId] = useState("");
  const [residenciaMuniId, setResidenciaMuniId] = useState("");
  const [residenciaBarrioId, setResidenciaBarrioId] = useState("");

  const municipiosPuesto = useMemo(() => {
    const vistos = new Set<string>();
    const lista: string[] = [];
    for (const puesto of puestos) {
      const nombre = puesto.municipio?.trim();
      if (!nombre) continue;
      const clave = nombre.toLowerCase();
      if (vistos.has(clave)) continue;
      vistos.add(clave);
      lista.push(nombre);
    }
    return lista.sort((a, b) => a.localeCompare(b, "es"));
  }, [puestos]);
  const puestosFiltrados = useMemo(
    () =>
      municipio ? puestos.filter((p) => p.municipio === municipio) : [],
    [municipio, puestos]
  );
  const comunaPuesto = useMemo(() => {
    const puesto = puestos.find((p) => p.id === Number(puestoId));
    if (!puesto?.comunas) return null;
    const rel = puesto.comunas;
    if (Array.isArray(rel)) return rel[0]?.nombre ?? null;
    return rel.nombre;
  }, [puestoId, puestos]);
  const sinLiderDirecto = liderId === SIN_LIDER_VALUE;
  const liderSeleccionado = useMemo(
    () => lideres.find((l) => l.id === Number(liderId)),
    [liderId, lideres]
  );
  const rolesDisponibles = useMemo(() => {
    if (!liderId) return [];
    if (sinLiderDirecto) return rolesJerarquiaMaxima(roles);
    if (liderSeleccionado?.nivel_jerarquia == null) return [];
    return rolesBajoJerarquia(roles, liderSeleccionado.nivel_jerarquia);
  }, [liderId, sinLiderDirecto, liderSeleccionado, roles]);

  // Filtros para ubicación de residencia
  const municipiosResidencia = useMemo(
    () =>
      residenciaDeptoId
        ? municipios.filter((m) => m.id_departamento === residenciaDeptoId)
        : [],
    [municipios, residenciaDeptoId]
  );
  const barriosResidencia = useMemo(
    () =>
      residenciaMuniId
        ? barrios.filter((b) => b.id_municipio === residenciaMuniId)
        : [],
    [barrios, residenciaMuniId]
  );
  const sinDeptos = departamentos.length === 0;
  const sinMunisResidencia = municipiosResidencia.length === 0;
  const sinBarrios = barriosResidencia.length === 0;

  return (
    <Card title="Nuevo votante" description="Estado inicial: registrado. Duplicados van a cuarentena.">
      {state.message ? (
        <p
          className={`mb-4 rounded-lg px-3 py-2 text-sm ${
            state.quarantined
              ? "bg-amber-50 text-amber-900"
              : "bg-emerald-50 text-emerald-900"
          }`}
        >
          {state.message}
          {state.quarantined ? (
            <>
              {" "}
              <Link
                href={`/campaign/${campaignId}/quarantine`}
                className="font-medium underline"
              >
                Ver cuarentena
              </Link>
            </>
          ) : null}
        </p>
      ) : null}
      {state.error ? (
        <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800">
          {state.error}
        </p>
      ) : null}

      <form action={formAction}>
        <FormRow className="flex-col items-stretch lg:flex-row lg:flex-wrap">
          <FormField label="Nombres">
            <input name="nombres" required className={platformInputClass} />
          </FormField>
          <FormField label="Apellidos">
            <input name="apellidos" required className={platformInputClass} />
          </FormField>
          <input type="hidden" name="tipo_documento" value="CC" />
          <FormField label="Documento">
            <input name="documento" required className={platformInputClass} />
          </FormField>
          <FormField label="Fecha de nacimiento">
            <input name="fecha_nacimiento" type="date" className={platformInputClass} />
          </FormField>
          <FormField label="Sexo">
            <select name="sexo" className={platformSelectClass} defaultValue="">
              <option value="">—</option>
              <option value="Masculino">Masculino</option>
              <option value="Femenino">Femenino</option>
            </select>
          </FormField>
          <FormField label="Teléfono">
            <input
              name="telefono"
              type="tel"
              inputMode="numeric"
              className={platformInputClass}
              placeholder="3001234567"
              pattern="3[0-9]{9}"
              title="Celular colombiano de 10 dígitos que empiece por 3"
            />
          </FormField>
          <FormField label="Dirección">
            <input name="direccion" className={platformInputClass} />
          </FormField>

          {/* === UBICACIÓN DE RESIDENCIA DEL VOTANTE === */}
          <div className="w-full border-t border-neutral-100 pt-4 mt-2">
            <p className="text-xs font-semibold tracking-wide text-neutral-500 mb-2">
              UBICACIÓN DE RESIDENCIA
            </p>
          </div>

          <FormField label="Departamento">
            <select
              name="id_departamento"
              disabled={sinDeptos}
              value={residenciaDeptoId}
              onChange={(e) => {
                setResidenciaDeptoId(e.target.value);
                setResidenciaMuniId("");
                setResidenciaBarrioId("");
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

          <FormField label="Municipio">
            <select
              name="id_municipio"
              disabled={!residenciaDeptoId || sinMunisResidencia}
              value={residenciaMuniId}
              onChange={(e) => {
                setResidenciaMuniId(e.target.value);
                setResidenciaBarrioId("");
              }}
              className={platformSelectClass}
            >
              <option value="" disabled>
                {!residenciaDeptoId
                  ? "Selecciona departamento primero"
                  : sinMunisResidencia
                    ? "Sin municipios"
                    : "Seleccionar municipio"}
              </option>
              {municipiosResidencia.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.nombre}
                </option>
              ))}
            </select>
          </FormField>

          <FormField label="Barrio / Vereda (opcional)">
            <select
              name="id_barrio_votante"
              disabled={!residenciaMuniId || sinBarrios}
              value={residenciaBarrioId}
              onChange={(e) => setResidenciaBarrioId(e.target.value)}
              className={platformSelectClass}
            >
              <option value="">
                {!residenciaMuniId
                  ? "Selecciona municipio primero"
                  : sinBarrios
                    ? "Sin barrios registrados"
                    : "— Ninguno —"}
              </option>
              {barriosResidencia.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.nombre}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-neutral-500">
              Barrio de residencia del votante. Puedes dejarlo vacío si no lo sabes.
            </p>
          </FormField>

          <FormField label="Lugar de trabajo">
            <select
              name="id_lugar_trabajo"
              className={platformSelectClass}
              defaultValue=""
            >
              <option value="">
                {lugaresTrabajo.length === 0
                  ? "Sin lugares (crea en Catálogos)"
                  : "—"}
              </option>
              {lugaresTrabajo.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.nombre}
                </option>
              ))}
            </select>
          </FormField>
          <FormField label="Líder directo" className="min-w-[220px]">
            <select
              name="id_lider_directo"
              className={platformSelectClass}
              value={liderId}
              onChange={(e) => {
                setLiderId(e.target.value);
                setRolId("");
              }}
            >
              <option value="">—</option>
              <option value={SIN_LIDER_VALUE}>
                Sin líder (jerarquía {JERARQUIA_MIN})
              </option>
              {lideres.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.apellidos} {l.nombres} — {l.documento}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-neutral-500">
              Elige quién lidera a esta persona, o «Sin líder» si es del cargo más alto.
            </p>
          </FormField>
          <FormField label="Rol organizacional" className="min-w-[220px]">
            <select
              name="id_rol"
              className={platformSelectClass}
              value={rolId}
              disabled={!liderId}
              onChange={(e) => setRolId(e.target.value)}
            >
              <option value="">
                {!liderId
                  ? "—"
                  : rolesDisponibles.length === 0
                    ? sinLiderDirecto
                      ? "Sin roles nivel 1"
                      : "Sin cargos bajo el líder"
                    : "—"}
              </option>
              {rolesDisponibles.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.nombre} ({etiquetaJerarquia(r.nivel_jerarquia)})
                </option>
              ))}
            </select>
            {!liderId ? (
              <p className="mt-1 text-xs text-neutral-500">
                Disponible después de elegir el líder directo.
              </p>
            ) : liderId && !sinLiderDirecto && liderSeleccionado ? (
              <p className="mt-1 text-xs text-neutral-500">
                Solo cargos por debajo de{" "}
                {liderSeleccionado.apellidos} {liderSeleccionado.nombres}.
              </p>
            ) : sinLiderDirecto ? (
              <p className="mt-1 text-xs text-neutral-500">
                Solo cargos de jerarquía {JERARQUIA_MIN} (sin líder).
              </p>
            ) : null}
          </FormField>

          {/* === PUESTO DE VOTACIÓN (opcional) === */}
          <div className="w-full border-t border-neutral-100 pt-4 mt-2">
            <p className="text-xs font-semibold tracking-wide text-neutral-500 mb-2">
              PUESTO DE VOTACIÓN (OPCIONAL)
            </p>
          </div>

          <FormField label="Municipio de votación">
            <select
              className={platformSelectClass}
              value={municipio}
              onChange={(e) => {
                setMunicipio(e.target.value);
                setPuestoId("");
              }}
            >
              <option value="">
                {municipiosPuesto.length === 0
                  ? "Sin municipios (carga puestos en Catálogos)"
                  : "—"}
              </option>
              {municipiosPuesto.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </FormField>
          <FormField label="Puesto de votación">
            <select
              name="id_puesto_votacion"
              className={platformSelectClass}
              value={puestoId}
              disabled={!municipio}
              onChange={(e) => setPuestoId(e.target.value)}
            >
              <option value="">
                {!municipio
                  ? "—"
                  : puestosFiltrados.length === 0
                    ? "Sin puestos"
                    : "—"}
              </option>
              {puestosFiltrados.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nombre}
                </option>
              ))}
            </select>
            {!municipio ? (
              <p className="mt-1 text-xs text-neutral-500">
                Opcional. Disponible después de elegir el municipio.
              </p>
            ) : null}
            {comunaPuesto ? (
              <p className="mt-1 text-xs text-neutral-500">
                Comuna del puesto: {comunaPuesto}
              </p>
            ) : null}
          </FormField>
          <FormField label="Mesa">
            <input name="mesa" className={platformInputClass} />
          </FormField>
          <Button
            type="submit"
            disabled={pending}
            className="h-10 shrink-0 self-end"
          >
            {pending ? "Registrando…" : "Registrar votante"}
          </Button>
        </FormRow>
      </form>
    </Card>
  );
}
