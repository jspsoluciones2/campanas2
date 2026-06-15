"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteCampaignIntegrationAction } from "@/app/(platform)/platform/actions";
import { Button } from "@/components/ui/button";
import type { PlatformApiProveedor } from "@/lib/platform/api-integrations";

export function CampaignIntegrationClearButton({
  idCampana,
  proveedor,
  label,
  campaignName,
  configured,
  onCleared,
  className = "h-10 shrink-0 px-6",
}: {
  idCampana: string;
  proveedor: PlatformApiProveedor;
  label: string;
  campaignName?: string;
  configured: boolean;
  onCleared?: () => void;
  className?: string;
}) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  if (!configured) return null;

  const handleClear = () => {
    const scope = campaignName ? ` de ${campaignName}` : "";
    const ok = window.confirm(
      `¿Limpiar la configuración de ${label}${scope}? Se borran las credenciales y queda sin configurar.`
    );
    if (!ok) return;

    startTransition(async () => {
      const result = await deleteCampaignIntegrationAction(idCampana, proveedor);
      if (result?.error) {
        window.alert(result.error);
        return;
      }
      onCleared?.();
      router.refresh();
    });
  };

  return (
    <Button
      type="button"
      variant="outline"
      onClick={handleClear}
      disabled={pending}
      className={className}
    >
      {pending ? "Limpiando…" : "Limpiar"}
    </Button>
  );
}
