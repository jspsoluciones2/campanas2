"use client";

import { useEffect, useState, useTransition } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import {
  deleteCampaignIntegrationAction,
  saveCampaignIntegrationAction,
} from "@/app/(platform)/platform/actions";
import { ApiIntegrationFormFields } from "@/components/platform/api-integration-form-fields";
import { Button } from "@/components/ui/button";
import type { PlatformApiProveedor } from "@/lib/platform/api-integrations";

export type CampaignIntegrationRow = {
  idCampana: string;
  proveedor: PlatformApiProveedor;
  label: string;
  description: string;
  activa: boolean;
  configured: boolean;
  configuracion: Record<string, unknown>;
};

export function CampaignIntegrationRowActions({
  row,
}: {
  row: CampaignIntegrationRow;
}) {
  const [editing, setEditing] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!editing) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setEditing(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [editing]);

  const handleDelete = () => {
    if (!row.configured) return;
    const ok = window.confirm(
      `¿Eliminar la configuración de ${row.label} para esta campaña? El consumo dejará de atribuirse a estas credenciales.`
    );
    if (!ok) return;

    startTransition(async () => {
      const result = await deleteCampaignIntegrationAction(
        row.idCampana,
        row.proveedor
      );
      if (result?.error) {
        window.alert(result.error);
        return;
      }
      router.refresh();
    });
  };

  const editModal =
    editing && mounted
      ? createPortal(
          <div
            className="fixed inset-0 z-[200] flex items-center justify-center bg-neutral-900/50 p-4 backdrop-blur-[1px]"
            role="presentation"
            onClick={(e) => {
              if (e.target === e.currentTarget) setEditing(false);
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
                  setEditing(false);
                  router.refresh();
                }}
                className="p-6"
              >
                <input type="hidden" name="id_campana" value={row.idCampana} />
                <input type="hidden" name="proveedor" value={row.proveedor} />
                <h3 className="text-base font-semibold text-neutral-900">
                  Configurar {row.label}
                </h3>
                <p className="mt-1 text-sm text-neutral-500">
                  Credenciales exclusivas de esta campaña para control de costos.
                </p>

                <div className="mt-5 space-y-3">
                  <ApiIntegrationFormFields
                    proveedor={row.proveedor}
                    configuracion={row.configuracion}
                    configured={row.configured}
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

                <div className="mt-6 flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="h-10 shrink-0 px-6"
                    onClick={() => setEditing(false)}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" className="h-10 shrink-0 px-6">
                    Guardar
                  </Button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )
      : null;

  return (
    <>
      <div className="flex flex-wrap items-center justify-center gap-2">
        <Button
          type="button"
          onClick={() => setEditing(true)}
          disabled={pending}
          className="h-10 shrink-0 px-6"
        >
          {row.configured ? "Editar" : "Configurar"}
        </Button>
        {row.configured ? (
          <Button
            type="button"
            variant="outline"
            onClick={handleDelete}
            disabled={pending}
            className="h-10 shrink-0 px-6"
          >
            Eliminar
          </Button>
        ) : null}
      </div>
      {editModal}
    </>
  );
}
