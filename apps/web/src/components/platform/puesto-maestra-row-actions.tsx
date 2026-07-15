"use client";

import { useEffect, useState, useTransition } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { useIsClient } from "@/hooks/use-is-client";
import { Button } from "@/components/ui/button";
import {
  deletePuestoMaestraAction,
  updatePuestoMaestraAction,
} from "@/app/(platform)/platform/actions";
import {
  FormField,
  platformInputClass,
  platformSelectClass,
} from "@/components/platform/platform-ui";

export type PuestoRow = {
  id: number;
  nombre: string;
  direccion: string | null;
  id_comuna: number | null;
  id_barrio: number | null;
  votantes_hombres_admite: number;
  votantes_mujeres_admite: number;
  cantidad_mesas: number;
};

export function PuestoMaestraRowActions({
  puesto,
  comunas,
  barrios,
}: {
  puesto: PuestoRow;
  comunas: { id: number; nombre: string }[];
  barrios: { id: number; nombre: string; id_comuna: number }[];
}) {
  const [editing, setEditing] = useState(false);
  const mounted = useIsClient();
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const [selectedComuna, setSelectedComuna] = useState<number | null>(
    puesto.id_comuna
  );

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

  const filteredBarrios = selectedComuna
    ? barrios.filter((b) => b.id_comuna === selectedComuna)
    : barrios;

  const handleDelete = () => {
    const ok = window.confirm(
      `¿Eliminar el puesto "${puesto.nombre}"? Esta acción no se puede deshacer.`
    );
    if (!ok) return;

    startTransition(async () => {
      const result = await deletePuestoMaestraAction(puesto.id);
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
              aria-labelledby={`edit-puesto-${puesto.id}`}
              className="w-full max-w-lg overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <form
                action={async (formData) => {
                  const result = await updatePuestoMaestraAction(formData);
                  if (result?.error) {
                    window.alert(result.error);
                    return;
                  }
                  setEditing(false);
                  router.refresh();
                }}
                className="p-6"
              >
                <input type="hidden" name="id" value={puesto.id} />
                <h3
                  id={`edit-puesto-${puesto.id}`}
                  className="text-base font-semibold text-neutral-900"
                >
                  Editar puesto de votación
                </h3>
                <p className="mt-1 text-sm text-neutral-500">{puesto.nombre}</p>

                <div className="mt-5 space-y-3">
                  <FormField label="ID">
                    <input
                      value={puesto.id}
                      readOnly
                      className={`${platformInputClass} bg-neutral-50 text-neutral-500`}
                    />
                  </FormField>
                  <FormField label="Nombre">
                    <input
                      name="nombre"
                      defaultValue={puesto.nombre}
                      required
                      className={platformInputClass}
                    />
                  </FormField>
                  <FormField label="Dirección">
                    <input
                      name="direccion"
                      defaultValue={puesto.direccion ?? ""}
                      className={platformInputClass}
                    />
                  </FormField>
                  <FormField label="Comuna">
                    <select
                      name="id_comuna"
                      defaultValue={puesto.id_comuna ?? ""}
                      required
                      className={platformSelectClass}
                      onChange={(e) => {
                        setSelectedComuna(
                          e.target.value ? Number(e.target.value) : null
                        );
                      }}
                    >
                      <option value="">Seleccionar comuna</option>
                      {comunas.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.nombre}
                        </option>
                      ))}
                    </select>
                  </FormField>
                  <FormField label="Barrio">
                    <select
                      name="id_barrio"
                      defaultValue={puesto.id_barrio ?? ""}
                      required
                      className={platformSelectClass}
                    >
                      <option value="">Seleccionar barrio</option>
                      {filteredBarrios.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.nombre}
                        </option>
                      ))}
                    </select>
                  </FormField>
                  <div className="flex gap-3">
                    <FormField label="Cupos H">
                      <input
                        name="votantes_hombres_admite"
                        type="number"
                        defaultValue={puesto.votantes_hombres_admite}
                        className={platformInputClass}
                      />
                    </FormField>
                    <FormField label="Cupos M">
                      <input
                        name="votantes_mujeres_admite"
                        type="number"
                        defaultValue={puesto.votantes_mujeres_admite}
                        className={platformInputClass}
                      />
                    </FormField>
                    <FormField label="Mesas">
                      <input
                        name="cantidad_mesas"
                        type="number"
                        defaultValue={puesto.cantidad_mesas}
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
