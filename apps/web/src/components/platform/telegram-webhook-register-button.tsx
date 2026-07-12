"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { registerCampaignTelegramWebhookAction } from "@/app/(platform)/platform/actions";
import { Button } from "@/components/ui/button";

export function TelegramWebhookRegisterButton({
  idCampana,
  httpsReady,
}: {
  idCampana: number;
  httpsReady: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <Button
      type="button"
      variant="outline"
      className="h-10 shrink-0 px-6"
      disabled={!httpsReady || pending}
      onClick={() => {
        startTransition(async () => {
          const result = await registerCampaignTelegramWebhookAction(idCampana);
          if (result?.error) {
            window.alert(result.error);
            return;
          }
          window.alert(result?.message ?? "Webhook registrado.");
          router.refresh();
        });
      }}
    >
      {pending ? "Registrando…" : "Registrar webhook"}
    </Button>
  );
}
