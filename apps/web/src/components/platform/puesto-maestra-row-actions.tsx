"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
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

type Depto = { id: string; nombre: string };
type Municipio = { id: string; nombre: string; id_departamento: string };
type Comuna = { id: number; nombre: string; id_municipio: number };
type Barrio = { id: number; nombre: string; id_comuna: number };

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

function findComunaContext(comunaId: number | null, comunas: Comuna[], municipios: Municipio[]) {
  if (!comunaId) return { comuna: undefined, municipio: undefined };
  const comuna = comunas.find((c) => c.id === comunaId);
  const municipio = comuna
    ? municipios.find((m) => Number(m.id) === comuna.id_municipio)
    : undefined;
  return { comuna, municipio };
}

export function PuestoMaestraRowActions({
  puesto,
  departamentos,
  municipios,
  comunas,
  barrios,
}: {
  puesto: PuestoRow;
  departamentos: Depto[];
  municipios: Municipio[];
  comunas: Comuna[];
  barrios: Barrio[];
}) {
  const [editing, setEditing] = useState(false);
  const mounted = useIsClient();
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  // Contexto inicial para cascada en edición
  const ctx = useMemo(
    () => findComunaContext(puesto.id_comuna, comunas, municipios),
    [puesto.id_comuna, comunas, municipios]
  );

  const [editDepto, setEditDepto] = useState(() => {
    if (!ctx.municipio) return "";
    const depto = departamentos.find((d) => d.id === ctx.municipio!.id_departamento);
    return depto?.id ?? "";
  });
  const [editMunicipio, setEditMunicipio] = useState(() => ctx.municipio?.id ?? "");

  // Resetear cascada al abrir edición
  useEffect(() => {
    if (editing) {
      const c = findComunaContext(puesto.id_comuna, comunas, municipios);
      const deptoId = c.municipio
        ? (departamentos.find((d) => d.id === c.municipio!.id_departamento)?.id ?? "")
        : "";
      setEditDepto(deptoId);
      setEditMunicipio(c.municipio?.id ?? "");
    }
  }, [editing, puesto.id_comuna, comunas, municipios, departamentos]);

  const editMunicipios = useMemo(
    () => municipios.filter((m) => m.id_departamento === editDepto),
    [municipios, editDepto]
  );
  const editComunas = useMemo(
    () => comunas.filter((c) => String(c.id_municipio) === editMunicipio),
    [comunas, editMunicipio]
  );

  const filteredBarrios = puesto.id_comuna
    ? barrios.filter((b) => b.id_comuna === puesto.id_comuna)
    : barrios;

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

                  <FormField label="Departamento">
                    <select
                      value={editDepto}
                      onChange={(e) => { setEditDepto(e.target.value); setEditMunicipio(""); }}
                      className={platformSelectClass}
                    >
                      <option value="">Seleccionar departamento</option>
                      {departamentos.map((d) => (
                        <option key={d.id} value={d.id}>{d.nombre}</option>
                      ))}
                    </select>
                  </FormField>

                  <FormField label="Municipio">
                    <select
                      value={editMunicipio}
                      onChange={(e) => setEditMunicipio(e.target.value)}
                      disabled={!editDepto}
                      className={platformSelectClass}
                    >
                      <option value="">
                        {editDepto ? "Seleccionar municipio" : "Primero elige departamento"}
                      </option>
                      {editMunicipios.map((m) => (
                        <option key={m.id} value={m.id}>{m.nombre}</option>
                      ))}
                    </select>
                  </FormField>

                  <FormField label="Comuna">
                    <select
                      name="id_comuna"
                      key={editMunicipio + "-" + puesto.id}
                      defaultValue={puesto.id_comuna ?? ""}
                      required
                      disabled={!editMunicipio}
                      className={platformSelectClass}
                    >
                      <option value="">
                        {editMunicipio ? "Seleccionar comuna" : "Primero elige municipio"}
                      </option>
                      {editComunas.map((c) => (
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
                      disabled={!puesto.id_comuna}
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
