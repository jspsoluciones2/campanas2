"use client";

import { useEffect, useState, useTransition } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import {
  deletePlatformApiIntegrationAction,
  savePlatformApiIntegrationAction,
} from "@/app/(platform)/platform/actions";
import { Button } from "@/components/ui/button";
import {
  FormField,
  FormRow,
  platformInputClass,
} from "@/components/platform/platform-ui";
import type { PlatformApiProveedor } from "@/lib/platform/api-integrations";

export type ApiIntegrationRow = {
  proveedor: PlatformApiProveedor;
  label: string;
  description: string;
  activa: boolean;
  configured: boolean;
  configuracion: Record<string, unknown>;
};

function secretPlaceholder(configured: boolean): string {
  return configured ? "Dejar vacío para no cambiar" : "";
}

export function ApiIntegrationRowActions({ row }: { row: ApiIntegrationRow }) {
  const [editing, setEditing] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const c = row.configuracion;

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
      `¿Eliminar la configuración de ${row.label}? Las campañas no podrán usar esta API hasta volver a configurarla.`
    );
    if (!ok) return;

    startTransition(async () => {
      const result = await deletePlatformApiIntegrationAction(row.proveedor);
      if (result?.error) {
        window.alert(result.error);
        return;
      }
      router.refresh();
    });
  };

  const fields = () => {
    switch (row.proveedor) {
      case "twilio":
        return (
          <>
            <FormField label="Account SID">
              <input
                name="account_sid"
                defaultValue={String(c.account_sid ?? "")}
                placeholder="ACxxxxxxxx"
                className={platformInputClass}
              />
            </FormField>
            <FormField label="Auth Token">
              <input
                name="auth_token"
                type="password"
                placeholder={secretPlaceholder(row.configured)}
                autoComplete="off"
                className={platformInputClass}
              />
            </FormField>
            <FormRow>
              <FormField label="Messaging Service SID">
                <input
                  name="messaging_service_sid"
                  defaultValue={String(c.messaging_service_sid ?? "")}
                  placeholder="MGxxxxxxxx (opcional)"
                  className={platformInputClass}
                />
              </FormField>
              <FormField label="WhatsApp From">
                <input
                  name="whatsapp_from"
                  defaultValue={String(c.whatsapp_from ?? "")}
                  placeholder="whatsapp:+57… (opcional)"
                  className={platformInputClass}
                />
              </FormField>
            </FormRow>
          </>
        );
      case "resolutor_captcha":
        return (
          <>
            <FormField label="API Key">
              <input
                name="api_key"
                type="password"
                placeholder={secretPlaceholder(row.configured)}
                autoComplete="off"
                className={platformInputClass}
              />
            </FormField>
            <FormField label="URL base">
              <input
                name="base_url"
                defaultValue={String(c.base_url ?? "")}
                placeholder="https://api.capsolver.com (opcional)"
                className={platformInputClass}
              />
            </FormField>
          </>
        );
      case "ia_e14":
        return (
          <>
            <FormField label="API Key">
              <input
                name="api_key"
                type="password"
                placeholder={secretPlaceholder(row.configured)}
                autoComplete="off"
                className={platformInputClass}
              />
            </FormField>
            <FormRow>
              <FormField label="Modelo">
                <input
                  name="modelo"
                  defaultValue={String(c.modelo ?? "")}
                  placeholder="gpt-4o (opcional)"
                  className={platformInputClass}
                />
              </FormField>
              <FormField label="URL base">
                <input
                  name="base_url"
                  defaultValue={String(c.base_url ?? "")}
                  placeholder="https://api.openai.com/v1 (opcional)"
                  className={platformInputClass}
                />
              </FormField>
            </FormRow>
          </>
        );
      default:
        return null;
    }
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
              className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl border border-neutral-200 bg-white shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <form
                action={async (formData) => {
                  const result = await savePlatformApiIntegrationAction(formData);
                  if (result?.error) {
                    window.alert(result.error);
                    return;
                  }
                  setEditing(false);
                  router.refresh();
                }}
                className="p-6"
              >
                <input type="hidden" name="proveedor" value={row.proveedor} />
                <h3 className="text-base font-semibold text-neutral-900">
                  Configurar {row.label}
                </h3>

                <div className="mt-5 space-y-3">{fields()}</div>

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
