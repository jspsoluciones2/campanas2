"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { TerritorioAlcanceEditor, type AlcanceValue } from "@/components/platform/territorio-alcance-editor";
import { updateCampaignAlcanceAction } from "@/app/(platform)/platform/actions";

type ActionState = { ok: boolean; error?: string; warning?: string };

const initialState: ActionState = { ok: true };

type Props = {
  campaignId: string;
  departamentos: { id: string; nombre: string }[];
  municipios: { id: string; nombre: string; id_departamento: string }[];
  initialAlcance: AlcanceValue;
};

export function CampaignAlcanceFormClient({
  campaignId,
  departamentos,
  municipios,
  initialAlcance,
}: Props) {
  const [state, formAction, isPending] = useActionState<ActionState, FormData>(
    async (_prev, formData) => {
      formData.set("id_campana", campaignId);
      const result = await updateCampaignAlcanceAction(formData);
      if ("error" in result) return { ok: false, error: result.error };
      return { ok: true, warning: result.warning };
    },
    initialState
  );

  return (
    <form action={formAction}>
      <input type="hidden" name="id_campana" value={campaignId} />

      {state.error && (
        <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {state.error}
        </div>
      )}

      {state.warning && (
        <div className="mb-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {state.warning}
        </div>
      )}

      <TerritorioAlcanceEditor
        departamentos={departamentos}
        municipios={municipios}
        initialAlcance={initialAlcance}
      />

      <div className="mt-3 flex justify-end">
        <Button type="submit" size="sm" disabled={isPending}>
          {isPending ? "Guardando…" : "Guardar alcance"}
        </Button>
      </div>
    </form>
  );
}
