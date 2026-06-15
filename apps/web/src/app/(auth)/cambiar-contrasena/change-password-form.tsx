"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FormField, platformInputClass } from "@/components/platform/platform-ui";
import { changePasswordAction } from "./actions";

export function ChangePasswordForm() {
  const [error, setError] = useState("");

  return (
    <form
      action={async (formData) => {
        setError("");
        const result = await changePasswordAction(formData);
        if (result?.error) setError(result.error);
      }}
      className="space-y-4"
    >
      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <FormField label="Nueva contraseña">
        <input
          name="nueva_contrasena"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          className={platformInputClass}
        />
      </FormField>

      <FormField label="Confirmar contraseña">
        <input
          name="confirmar_contrasena"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          className={platformInputClass}
        />
      </FormField>

      <p className="text-xs text-neutral-500">Mínimo 8 caracteres.</p>

      <Button type="submit" className="h-10 w-full px-6">
        Guardar y continuar
      </Button>
    </form>
  );
}
