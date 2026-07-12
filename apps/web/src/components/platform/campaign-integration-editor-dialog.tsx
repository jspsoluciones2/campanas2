"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { useIsClient } from "@/hooks/use-is-client";
import { saveCampaignIntegrationAction } from "@/app/(platform)/platform/actions";
import { ApiIntegrationFormFields } from "@/components/platform/api-integration-form-fields";
import { CampaignIntegrationClearButton } from "@/components/platform/campaign-integration-clear-button";
import { Button } from "@/components/ui/button";
import type { PlatformApiProveedor } from "@/lib/platform/api-integrations";

export type CampaignIntegrationEditorRow = {
  idCampana: number;
  proveedor: PlatformApiProveedor;
  label: string;
  activa: boolean;
  configured: boolean;
  configuracion: Record<string, unknown>;
};

export function CampaignIntegrationEditorDialog({
  open,
  onClose,
  row,
  campaignName,
}: {
  open: boolean;
  onClose: () => void;
  row: CampaignIntegrationEditorRow;
  campaignName?: string;
}) {
  const mounted = useIsClient();
  const router = useRouter();

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open || !mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-neutral-900/50 p-4 backdrop-blur-[1px]"
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl border border-neutral-200 bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <form
          action={async (formData) => {
            const result = await saveCampaignIntegrationAction(formData);
            if (result?.error) {
              window.alert(result.error);
              return;
            }
            if (result?.warning) {
              window.alert(result.warning);
            }
            onClose();
            router.refresh();
          }}
          className="p-6"
        >
          <input type="hidden" name="id_campana" value={row.idCampana} />
          <input type="hidden" name="proveedor" value={row.proveedor} />
          <h3 className="text-base font-semibold text-neutral-900">
            {row.label}
            {campaignName ? (
              <span className="font-normal text-neutral-500">
                {" "}
                · {campaignName}
              </span>
            ) : null}
          </h3>

          <div className="mt-5 space-y-3">
            <ApiIntegrationFormFields
              proveedor={row.proveedor}
              configuracion={row.configuracion}
              configured={row.configured}
              idCampana={row.idCampana}
            />
          </div>

          <label className="mt-4 flex cursor-pointer items-center gap-2 text-sm text-neutral-700">
            <input
              type="checkbox"
              name="activa"
              defaultChecked={row.activa}
              className="size-4 rounded border-neutral-300"
            />
            Integración activa
          </label>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-2">
            <CampaignIntegrationClearButton
              idCampana={row.idCampana}
              proveedor={row.proveedor}
              label={row.label}
              campaignName={campaignName}
              configured={row.configured}
              onCleared={onClose}
            />
            <div className="ml-auto flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                className="h-10 shrink-0 px-6"
                onClick={onClose}
              >
                Cancelar
              </Button>
              <Button type="submit" className="h-10 shrink-0 px-6">
                Guardar
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
