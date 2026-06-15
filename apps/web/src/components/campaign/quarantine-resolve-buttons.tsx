"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  resolveQuarantineAction,
  type QuarantineResolveAction,
} from "@/app/(campaign)/campaign/[id]/actions";

const ETIQUETAS_ACCION: Record<QuarantineResolveAction, string> = {
  fusionar: "Fusionar",
  descartar: "Descartar",
  escalar: "Escalar",
};

type Props = {
  campaignId: string;
  quarantineId: string;
  disabled?: boolean;
};

export function QuarantineResolveButtons({
  campaignId,
  quarantineId,
  disabled,
}: Props) {
  const router = useRouter();
  const [pending, setPending] = useState<QuarantineResolveAction | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleAction(action: QuarantineResolveAction) {
    setPending(action);
    setError(null);
    const result = await resolveQuarantineAction(campaignId, quarantineId, action);
    setPending(null);
    if (result?.error) {
      setError(result.error);
      return;
    }
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-2">
        {(["fusionar", "descartar", "escalar"] as const).map((action) => (
          <Button
            key={action}
            type="button"
            size="sm"
            variant={action === "descartar" ? "outline" : "default"}
            disabled={disabled || pending !== null}
            onClick={() => handleAction(action)}
            className="h-8"
          >
            {pending === action ? "Procesando…" : ETIQUETAS_ACCION[action]}
          </Button>
        ))}
      </div>
      {error ? <p className="text-xs text-red-600">{error}</p> : null}
    </div>
  );
}
