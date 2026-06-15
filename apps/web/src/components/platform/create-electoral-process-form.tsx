"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createElectoralProcessAction } from "@/app/(platform)/platform/actions";
import { Button } from "@/components/ui/button";
import {
  FormField,
  FormRow,
  platformInputClass,
} from "@/components/platform/platform-ui";

export function CreateElectoralProcessForm() {
  const [error, setError] = useState("");
  const router = useRouter();

  return (
    <form
      action={async (formData) => {
        setError("");
        const result = await createElectoralProcessAction(formData);
        if (result?.error) {
          setError(result.error);
          return;
        }
        (
          document.getElementById(
            "create-electoral-process-form"
          ) as HTMLFormElement
        )?.reset();
        router.refresh();
      }}
      id="create-electoral-process-form"
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
            placeholder="Ej. Presidencia 2026"
            required
            className={platformInputClass}
          />
        </FormField>
        <FormField label="Fecha elección">
          <input
            name="fecha_eleccion"
            type="date"
            className={platformInputClass}
          />
        </FormField>
        <Button type="submit" className="h-10 shrink-0 px-6">
          Crear proceso
        </Button>
      </FormRow>
    </form>
  );
}
