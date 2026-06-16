"use client";

import { useActionState } from "react";
import { updateCampaignModulesAction } from "@/app/(platform)/platform/actions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/platform/platform-ui";
import { cn } from "@/lib/utils";

export type CampaignModules = {
  resolutor_captcha: boolean;
  auditoria_e14: boolean;
  whatsapp: boolean;
  telegram: boolean;
  captura_web: boolean;
};

const MODULOS: Array<{
  key: keyof CampaignModules;
  label: string;
  hint?: string;
}> = [
  { key: "resolutor_captcha", label: "CAPTCHA Solver" },
  { key: "auditoria_e14", label: "E14 auditoría" },
  { key: "whatsapp", label: "WhatsApp" },
  { key: "telegram", label: "Telegram", hint: "Canal de captura" },
  { key: "captura_web", label: "Captura web" },
];

type Props = {
  campaignId: string;
  modules: CampaignModules;
};

type ActionState = { error?: string; ok?: boolean };

async function submitModules(
  campaignId: string,
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  return updateCampaignModulesAction(campaignId, formData);
}

export function CampaignModulesForm({ campaignId, modules }: Props) {
  const [state, formAction, pending] = useActionState(
    submitModules.bind(null, campaignId),
    {}
  );

  return (
    <Card
      title="Módulos contratados"
      description="Activa o desactiva los módulos disponibles para esta campaña."
    >
      <form action={formAction} className="space-y-4">
        <ul className="grid gap-3 sm:grid-cols-2">
          {MODULOS.map(({ key, label, hint }) => (
            <li key={key}>
              <label
                className={cn(
                  "flex cursor-pointer items-start gap-3 rounded-lg border border-neutral-100",
                  "bg-neutral-50/50 px-3 py-3 transition-colors hover:bg-neutral-50"
                )}
              >
                <input
                  type="checkbox"
                  name={key}
                  value="1"
                  defaultChecked={modules[key]}
                  disabled={pending}
                  className="mt-0.5 size-4 shrink-0 rounded border-neutral-300"
                />
                <span className="min-w-0">
                  <span className="block text-sm font-medium text-neutral-800">
                    {label}
                  </span>
                  {hint ? (
                    <span className="mt-0.5 block text-xs text-neutral-500">
                      {hint}
                    </span>
                  ) : null}
                </span>
              </label>
            </li>
          ))}
        </ul>

        {state.error ? (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800">
            {state.error}
          </p>
        ) : null}
        {state.ok ? (
          <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
            Módulos actualizados.
          </p>
        ) : null}

        <Button type="submit" disabled={pending} className="h-9">
          {pending ? "Guardando…" : "Guardar módulos"}
        </Button>
      </form>
    </Card>
  );
}
