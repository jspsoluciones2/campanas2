"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClientAction } from "@/app/(platform)/platform/actions";
import { Button } from "@/components/ui/button";
import { PasswordRevealModal } from "@/components/platform/password-reveal-modal";
import {
  FormField,
  FormRow,
  platformInputClass,
} from "@/components/platform/platform-ui";

export function CreateClientForm() {
  const [error, setError] = useState("");
  const router = useRouter();
  const [reveal, setReveal] = useState<{
    nombre: string;
    email: string;
    password: string;
  } | null>(null);

  return (
    <>
      <form
        action={async (formData) => {
          setError("");
          const result = await createClientAction(formData);
          if (result?.error) {
            setError(result.error);
            return;
          }
          if (result?.ok && result.tempPassword && result.email && result.nombre) {
            setReveal({
              nombre: result.nombre,
              email: result.email,
              password: result.tempPassword,
            });
            (document.getElementById("create-client-form") as HTMLFormElement)?.reset();
            router.refresh();
          }
        }}
        id="create-client-form"
      >
        {error && (
          <p className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}
        <FormRow>
          <FormField label="Nombre">
            <input
              name="nombre"
              placeholder="Nombre completo"
              required
              className={platformInputClass}
            />
          </FormField>
          <FormField label="Documento">
            <input
              name="documento"
              placeholder="CC / NIT"
              className={platformInputClass}
            />
          </FormField>
          <FormField label="Teléfono">
            <input
              name="telefono"
              placeholder="+57 …"
              className={platformInputClass}
            />
          </FormField>
          <FormField label="Correo de contacto">
            <input
              name="correo_contacto"
              type="email"
              placeholder="correo@ejemplo.com"
              required
              className={platformInputClass}
            />
          </FormField>
          <FormField label="Contraseña inicial">
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
          <Button type="submit" className="h-10 shrink-0 px-6">
            Crear cliente
          </Button>
        </FormRow>
      </form>

      <PasswordRevealModal
        open={Boolean(reveal)}
        title="Cliente creado — guarda el acceso"
        nombre={reveal?.nombre ?? ""}
        email={reveal?.email ?? ""}
        password={reveal?.password ?? ""}
        onClose={() => setReveal(null)}
      />
    </>
  );
}
