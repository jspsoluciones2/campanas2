"use client";

import { useActionState } from "react";
import Link from "next/link";
import { createVotanteAction } from "@/app/(campaign)/campaign/[id]/actions";
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
type Puesto = { id: string; nombre: string };
type Lider = { id: string; nombres: string; apellidos: string; documento: string };

type Props = {
  campaignId: string;
  roles: Rol[];
  puestos: Puesto[];
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
  lideres,
}: Props) {
  const [state, formAction, pending] = useActionState(
    submitVotante.bind(null, campaignId),
    {}
  );

  return (
    <Card title="Nuevo votante" description="Estado inicial: pendiente de verificación.">
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
          <FormField label="Sexo">
            <select name="sexo" className={platformSelectClass} defaultValue="">
              <option value="">—</option>
              <option value="Masculino">Masculino</option>
              <option value="Femenino">Femenino</option>
            </select>
          </FormField>
          <FormField label="Teléfono">
            <input name="telefono" className={platformInputClass} />
          </FormField>
          <FormField label="Rol organizacional">
            <select name="id_rol" className={platformSelectClass} defaultValue="">
              <option value="">—</option>
              {roles.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.nombre} (nivel {r.nivel_jerarquia})
                </option>
              ))}
            </select>
          </FormField>
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
          <FormField label="Puesto de votación">
            <select
              name="id_puesto_votacion"
              className={platformSelectClass}
              defaultValue=""
            >
              <option value="">—</option>
              {puestos.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nombre}
                </option>
              ))}
            </select>
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
