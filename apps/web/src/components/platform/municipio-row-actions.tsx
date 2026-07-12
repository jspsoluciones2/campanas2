"use client";

import { useEffect, useState, useTransition } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { useIsClient } from "@/hooks/use-is-client";
import { Button } from "@/components/ui/button";
import {
  deleteMunicipioAction,
  updateMunicipioAction,
} from "@/app/(platform)/platform/actions";
import {
  FormField,
  platformInputClass,
  platformSelectClass,
} from "@/components/platform/platform-ui";

export type MunicipioRow = {
  id: string;
  nombre: string;
  id_departamento: string;
  latitud: number | null;
  longitud: number | null;
};

export function MunicipioRowActions({
  municipio,
  departamentos,
}: {
  municipio: MunicipioRow;
  departamentos: { id: string; nombre: string }[];
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
      `¿Eliminar el municipio "${municipio.nombre}"? Esta acción no se puede deshacer.`
    );
    if (!ok) return;

    startTransition(async () => {
      const result = await deleteMunicipioAction(municipio.id);
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
              aria-labelledby={`edit-municipio-${municipio.id}`}
              className="w-full max-w-lg overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <form
                action={async (formData) => {
                  const result = await updateMunicipioAction(formData);
                  if (result?.error) {
                    window.alert(result.error);
                    return;
                  }
                  setEditing(false);
                  router.refresh();
                }}
                className="p-6"
              >
                <input type="hidden" name="id" value={municipio.id} />
                <h3
                  id={`edit-municipio-${municipio.id}`}
                  className="text-base font-semibold text-neutral-900"
                >
                  Editar municipio
                </h3>
                <p className="mt-1 text-sm text-neutral-500">{municipio.nombre}</p>

                <div className="mt-5 space-y-3">
                  <FormField label="ID">
                    <input
                      value={municipio.id}
                      readOnly
                      className={`${platformInputClass} bg-neutral-50 text-neutral-500`}
                    />
                  </FormField>
                  <FormField label="Departamento">
                    <select
                      name="id_departamento"
                      defaultValue={municipio.id_departamento}
                      required
                      className={platformSelectClass}
                    >
                      <option value="">Seleccionar departamento</option>
                      {departamentos.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.nombre}
                        </option>
                      ))}
                    </select>
                  </FormField>
                  <FormField label="Nombre">
                    <input
                      name="nombre"
                      defaultValue={municipio.nombre}
                      required
                      className={platformInputClass}
                    />
                  </FormField>
                  <div className="flex gap-3">
                    <FormField label="Latitud">
                      <input
                        name="latitud"
                        type="number"
                        step="any"
                        defaultValue={municipio.latitud ?? ""}
                        className={platformInputClass}
                      />
                    </FormField>
                    <FormField label="Longitud">
                      <input
                        name="longitud"
                        type="number"
                        step="any"
                        defaultValue={municipio.longitud ?? ""}
                        className={platformInputClass}
                      />
                    </FormField>
                  </div>
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
