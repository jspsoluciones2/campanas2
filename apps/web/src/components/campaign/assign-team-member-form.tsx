"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { PasswordRevealModal } from "@/components/platform/password-reveal-modal";
import {
  FormField,
  FormRow,
  platformInputClass,
  platformSelectClass,
} from "@/components/platform/platform-ui";
import {
  CAMPAIGN_MEMBER_ROLE_LABELS,
  CAMPAIGN_MEMBER_ROLES,
} from "@/lib/campaign/member-auth";

type AssignTeamMemberFormProps = {
  campaignId: string;
  action: (formData: FormData) => Promise<{
    error?: string;
    ok?: boolean;
    email?: string;
    nombre?: string;
    tempPassword?: string;
  }>;
  allowAdminRole?: boolean;
};

export function AssignTeamMemberForm({
  campaignId,
  action,
  allowAdminRole = true,
}: AssignTeamMemberFormProps) {
  const [error, setError] = useState("");
  const router = useRouter();
  const [reveal, setReveal] = useState<{
    nombre: string;
    email: string;
    password: string;
  } | null>(null);

  const roles = allowAdminRole
    ? CAMPAIGN_MEMBER_ROLES
    : CAMPAIGN_MEMBER_ROLES.filter((rol) => rol !== "administrador_campana");

  return (
    <>
      <form
        id={`assign-team-${campaignId}`}
        action={async (formData) => {
          setError("");
          const result = await action(formData);
          if (result?.error) {
            setError(result.error);
            return;
          }
          if (
            result?.ok &&
            result.tempPassword &&
            result.email &&
            result.nombre
          ) {
            setReveal({
              nombre: result.nombre,
              email: result.email,
              password: result.tempPassword,
            });
            (
              document.getElementById(
                `assign-team-${campaignId}`
              ) as HTMLFormElement
            )?.reset();
            router.refresh();
          }
        }}
      >
        {error && (
          <p className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}
        <input type="hidden" name="id_campana" value={campaignId} />
        <FormRow>
          <FormField label="Nombre" className="min-w-[200px]">
            <input
              name="nombre"
              placeholder="Nombre del integrante"
              className={platformInputClass}
            />
          </FormField>
          <FormField label="Usuario" className="min-w-[200px]">
            <input
              name="usuario"
              type="text"
              placeholder="juan.perez"
              required
              autoComplete="off"
              className={platformInputClass}
            />
          </FormField>
          <FormField label="Contraseña inicial" className="min-w-[200px]">
            <input
              name="contrasena_inicial"
              type="password"
              placeholder="Mínimo 8 caracteres"
              required
              minLength={8}
              autoComplete="new-password"
              className={platformInputClass}
            />
          </FormField>
          <FormField label="Rol">
            <select name="rol" className={platformSelectClass} defaultValue="lector">
              {roles.map((rol) => (
                <option key={rol} value={rol}>
                  {CAMPAIGN_MEMBER_ROLE_LABELS[rol]}
                </option>
              ))}
            </select>
          </FormField>
          <Button type="submit" variant="outline" className="h-10 shrink-0">
            Asignar
          </Button>
        </FormRow>
      </form>

      <PasswordRevealModal
        open={Boolean(reveal)}
        title="Miembro creado — guarda el acceso"
        nombre={reveal?.nombre ?? ""}
        email={reveal?.email ?? ""}
        password={reveal?.password ?? ""}
        onClose={() => setReveal(null)}
      />
    </>
  );
}
