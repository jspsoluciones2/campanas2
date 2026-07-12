"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createCampaignAction } from "@/app/(platform)/platform/actions";
import { Button } from "@/components/ui/button";
import {
  FormField,
  FormRow,
  platformInputClass,
  platformSelectClass,
} from "@/components/platform/platform-ui";
import { TerritorioAlcanceEditor } from "@/components/platform/territorio-alcance-editor";
import type { MunicipioOption, DepartamentoOption } from "@/lib/campaign/comunas";

type Option = { id: number; nombre: string };

export function CreateCampaignForm({
  clientes,
  procesos,
  departamentos = [],
  municipios = [],
}: {
  clientes: Option[];
  procesos: Option[];
  departamentos?: DepartamentoOption[];
  municipios?: MunicipioOption[];
}) {
  const [error, setError] = useState("");
  const router = useRouter();

  return (
    <form
      action={async (formData) => {
        setError("");
        const result = await createCampaignAction(formData);
        if (result?.error) {
          setError(result.error);
          return;
        }
        (
          document.getElementById("create-campaign-form") as HTMLFormElement
        )?.reset();
        router.refresh();
      }}
      id="create-campaign-form"
    >
      {error && (
        <p className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}
      <FormRow>
        <FormField label="Nombre de campaña">
          <input
            name="nombre"
            placeholder="Nombre de campaña"
            required
            className={platformInputClass}
          />
        </FormField>
        <FormField label="Cliente">
          <select
            name="id_cliente"
            required
            className={platformSelectClass}
            defaultValue=""
          >
            <option value="" disabled>
              Seleccionar cliente
            </option>
            {clientes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            ))}
          </select>
        </FormField>
        <FormField label="Proceso electoral">
          <select
            name="id_proceso_electoral"
            required
            className={platformSelectClass}
            defaultValue=""
          >
            <option value="" disabled>
              Seleccionar proceso
            </option>
            {procesos.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nombre}
              </option>
            ))}
          </select>
        </FormField>
      </FormRow>
      <div className="mt-4">
        <TerritorioAlcanceEditor
          departamentos={departamentos}
          municipios={municipios}
        />
      </div>
      <div className="mt-4 flex justify-end">
        <Button type="submit" className="h-10 shrink-0 px-6">
          Crear campaña
        </Button>
      </div>
    </form>
  );
}
