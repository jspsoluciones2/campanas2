"use client";

import { useEffect, useState, useTransition } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  deleteCampaignAction,
  updateCampaignAction,
} from "@/app/(platform)/platform/actions";
import { FormField, platformInputClass } from "@/components/platform/platform-ui";

export type CampanaActionsRow = {
  id: string;
  nombre: string;
};

export function CampaignRowActions({ campana }: { campana: CampanaActionsRow }) {
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
    const ok = window.confirm(
      `¿Eliminar la campaña "${campana.nombre}"? Se borrarán todos sus datos (votantes, catálogos, etc.). Esta acción no se puede deshacer.`
    );
    if (!ok) return;

    startTransition(async () => {
      const result = await deleteCampaignAction(campana.id);
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
              aria-labelledby={`edit-campana-${campana.id}`}
              className="w-full max-w-lg overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <form
                action={async (formData) => {
                  const result = await updateCampaignAction(formData);
                  if (result?.error) {
                    window.alert(result.error);
                    return;
                  }
                  setEditing(false);
                  router.refresh();
                }}
                className="p-6"
              >
                <input type="hidden" name="id" value={campana.id} />
                <h3
                  id={`edit-campana-${campana.id}`}
                  className="text-base font-semibold text-neutral-900"
                >
                  Editar campaña
                </h3>
                <p className="mt-1 text-sm text-neutral-500">{campana.nombre}</p>

                <div className="mt-5">
                  <FormField label="Nombre de campaña">
                    <input
                      name="nombre"
                      defaultValue={campana.nombre}
                      required
                      className={platformInputClass}
                    />
                  </FormField>
                </div>

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
      <div className="flex flex-wrap items-center justify-end gap-2">
        <Link
          href={`/platform/campaigns/${campana.id}`}
          className="inline-flex h-10 shrink-0 items-center justify-center rounded-lg border border-neutral-200 bg-white px-4 text-sm font-medium text-neutral-800 hover:bg-neutral-50"
        >
          Gestionar
        </Link>
        <Button
          type="button"
          onClick={() => setEditing(true)}
          disabled={pending}
          className="h-10 shrink-0 px-6"
        >
          Editar
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={handleDelete}
          disabled={pending}
          className="h-10 shrink-0 px-6"
        >
          Eliminar
        </Button>
      </div>
      {editModal}
    </>
  );
}
