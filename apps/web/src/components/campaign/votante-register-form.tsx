"use client";

import { useActionState, useMemo, useState } from "react";
import Link from "next/link";
import { createVotanteAction } from "@/app/(campaign)/campaign/[id]/actions";
import { etiquetaJerarquia, JERARQUIA_MIN } from "@/lib/campaign/roles";
import { Button } from "@/components/ui/button";
import {
  Card,
  FormField,
  FormRow,
  platformInputClass,
  platformSelectClass,
} from "@/components/platform/platform-ui";

const TIPOS_DOCUMENTO = ["CC", "TI", "CE", "PA", "PEP", "PPT"] as const;

type Rol = { id: string; nombre: string; nivel_jerarquia: number };
type Puesto = {
  id: string;
  nombre: string;
  municipio: string | null;
  comunas: { nombre: string } | { nombre: string }[] | null;
};
type LugarTrabajo = { id: string; nombre: string };
type Lider = { id: string; nombres: string; apellidos: string; documento: string };

type Props = {
  campaignId: string;
  roles: Rol[];
  puestos: Puesto[];
  lugaresTrabajo: LugarTrabajo[];
  lideres: Lider[];
};

type ActionState = {
  error?: string;
  ok?: boolean;
  quarantined?: boolean;
  message?: string;
};

async function submitVotante(
  campaignId: string,
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
}: Props) {
  const [state, formAction, pending] = useActionState(
    submitVotante.bind(null, campaignId),
    {}
  );
  const [rolId, setRolId] = useState("");
  const [municipio, setMunicipio] = useState("");
  const [puestoId, setPuestoId] = useState("");
  const municipios = useMemo(() => {
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
    const puesto = puestos.find((p) => p.id === puestoId);
    if (!puesto?.comunas) return null;
    const rel = puesto.comunas;
    if (Array.isArray(rel)) return rel[0]?.nombre ?? null;
    return rel.nombre;
  }, [puestoId, puestos]);
  const sinLiderDirecto = useMemo(() => {
    const rol = roles.find((r) => r.id === rolId);
    return rol?.nivel_jerarquia === JERARQUIA_MIN;
  }, [rolId, roles]);

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
          <FormField label="Tipo documento">
            <select name="tipo_documento" className={platformSelectClass} defaultValue="CC">
              {TIPOS_DOCUMENTO.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </FormField>
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
              required
            />
          </FormField>
          <FormField label="Dirección">
            <input name="direccion" className={platformInputClass} />
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
          <FormField label="Rol organizacional">
            <select
              name="id_rol"
              className={platformSelectClass}
              defaultValue=""
              onChange={(e) => setRolId(e.target.value)}
            >
              <option value="">—</option>
              {roles.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.nombre} ({etiquetaJerarquia(r.nivel_jerarquia)})
                </option>
              ))}
            </select>
          </FormField>
          {!sinLiderDirecto ? (
          <FormField label="Líder directo">
            <select name="id_lider_directo" className={platformSelectClass} defaultValue="">
              <option value="">—</option>
              {lideres.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.apellidos} {l.nombres} — {l.documento}
                </option>
              ))}
            </select>
          </FormField>
          ) : null}
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
                {municipios.length === 0
                  ? "Sin municipios (carga puestos en Catálogos)"
                  : "—"}
              </option>
              {municipios.map((m) => (
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
                  ? "Primero elige municipio"
                  : puestosFiltrados.length === 0
                    ? "Sin puestos en este municipio"
                    : "—"}
              </option>
              {puestosFiltrados.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nombre}
                </option>
              ))}
            </select>
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
