"use client";

import { useEffect, useState, useTransition } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { useIsClient } from "@/hooks/use-is-client";
import { Button } from "@/components/ui/button";
import {
  deleteComunaMaestraAction,
  updateComunaMaestraAction,
} from "@/app/(platform)/platform/actions";
import {
  FormField,
  platformInputClass,
  platformSelectClass,
} from "@/components/platform/platform-ui";

export type ComunaRow = {
  id: number;
  nombre: string;
  id_municipio: string | null;
};

export function ComunaMaestraRowActions({
  comuna,
  municipios,
}: {
  comuna: ComunaRow;
  municipios: { id: string; nombre: string }[];
}) {
  const [editing, setEditing] = useState(false);
  const mounted = useIsClient();
  const [pending, startTransition] = useTransition();
  const router = useRouter();

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
      `¿Eliminar la comuna "${comuna.nombre}"? Esta acción no se puede deshacer.`
    );
    if (!ok) return;

    startTransition(async () => {
      const result = await deleteComunaMaestraAction(comuna.id);
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
              aria-labelledby={`edit-comuna-${comuna.id}`}
              className="w-full max-w-lg overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <form
                action={async (formData) => {
                  const result = await updateComunaMaestraAction(formData);
                  if (result?.error) {
                    window.alert(result.error);
                    return;
                  }
                  setEditing(false);
                  router.refresh();
                }}
                className="p-6"
              >
                <input type="hidden" name="id" value={comuna.id} />
                <h3
                  id={`edit-comuna-${comuna.id}`}
                  className="text-base font-semibold text-neutral-900"
                >
                  Editar comuna
                </h3>
                <p className="mt-1 text-sm text-neutral-500">{comuna.nombre}</p>

                <div className="mt-5 space-y-3">
                  <FormField label="ID">
                    <input
                      value={comuna.id}
                      readOnly
                      className={`${platformInputClass} bg-neutral-50 text-neutral-500`}
                    />
                  </FormField>
                  <FormField label="Municipio">
                    <select
                      name="id_municipio"
                      defaultValue={comuna.id_municipio ?? ""}
                      required
                      className={platformSelectClass}
                    >
                      <option value="">Seleccionar municipio</option>
                      {municipios.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.nombre}
                        </option>
                      ))}
                    </select>
                  </FormField>
                  <FormField label="Nombre">
                    <input
                      name="nombre"
                      defaultValue={comuna.nombre}
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
      <div className="flex flex-wrap items-center justify-center gap-2">
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
