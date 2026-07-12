"use client";

import { useEffect, useState, useTransition } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { useIsClient } from "@/hooks/use-is-client";
import { Button } from "@/components/ui/button";
import {
  deleteBarrioAction,
  deleteComunaAction,
  deletePuestoAction,
  deleteRolAction,
  deleteTipoNovedadAction,
  deleteLugarTrabajoAction,
  updateBarrioAction,
  updateComunaAction,
  updatePuestoAction,
  updateRolAction,
  updateTipoNovedadAction,
  updateLugarTrabajoAction,
} from "@/app/(campaign)/campaign/[id]/actions";
import {
  FormField,
  platformInputClass,
  platformSelectClass,
} from "@/components/platform/platform-ui";
import { formatCatalogId, isActionError } from "@/lib/campaign/catalog-codigo";
import {
  ComunaBarrioFields,
  type BarrioOption,
} from "@/components/campaign/comuna-barrio-fields";

type ComunaOption = { id: number; nombre: string };

function useEditModal() {
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

  return { editing, setEditing, mounted, pending, startTransition, router };
}

function ActionButtons({
  onEdit,
  onDelete,
  pending,
}: {
  onEdit: () => void;
  onDelete: () => void;
  pending: boolean;
}) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      <Button
        type="button"
        onClick={onEdit}
        disabled={pending}
        className="h-10 shrink-0 px-6"
      >
        Editar
      </Button>
      <Button
        type="button"
        variant="outline"
        onClick={onDelete}
        disabled={pending}
        className="h-10 shrink-0 px-6"
      >
        Eliminar
      </Button>
    </div>
  );
}

export function ComunaRowActions({
  campaignId,
  comuna,
}: {
  campaignId: number;
  comuna: { id: number; nombre: string };
}) {
  const { editing, setEditing, mounted, pending, startTransition, router } =
    useEditModal();

  const handleDelete = () => {
    const ok = window.confirm(
      `¿Eliminar la comuna "${comuna.nombre}"? Esta acción no se puede deshacer.`
    );
    if (!ok) return;
    startTransition(async () => {
      const result = await deleteComunaAction(campaignId, comuna.id);
      if (isActionError(result)) window.alert(result.error);
      else router.refresh();
    });
  };

  const modal =
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
              className="w-full max-w-lg overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <form
                action={async (formData) => {
                  const result = await updateComunaAction(campaignId, formData);
                  if (isActionError(result)) {
                    window.alert(result.error);
                    return;
                  }
                  setEditing(false);
                  router.refresh();
                }}
                className="p-6"
              >
                <input type="hidden" name="id" value={comuna.id} />
                <h3 className="text-base font-semibold text-neutral-900">
                  Editar comuna
                </h3>
                <div className="mt-5 space-y-3">
                  <p className="text-sm text-neutral-500">
                    ID: <span className="font-medium text-neutral-900">{formatCatalogId(comuna.id)}</span>
                  </p>
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
      <ActionButtons
        onEdit={() => setEditing(true)}
        onDelete={handleDelete}
        pending={pending}
      />
      {modal}
    </>
  );
}

export function LugarTrabajoRowActions({
  campaignId,
  lugar,
  comunas,
}: {
  campaignId: number;
  lugar: {
    id: number;
    nombre: string;
    direccion: string | null;
    id_comuna: string | null;
    id_barrio: string | null;
  };
  comunas: ComunaOption[];
}) {
  const { editing, setEditing, mounted, pending, startTransition, router } =
    useEditModal();

  const handleDelete = () => {
    const ok = window.confirm(
      `¿Eliminar el lugar "${lugar.nombre}"? Esta acción no se puede deshacer.`
    );
    if (!ok) return;
    startTransition(async () => {
      const result = await deleteLugarTrabajoAction(campaignId, lugar.id);
      if (isActionError(result)) window.alert(result.error);
      else router.refresh();
    });
  };

  const modal =
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
              className="w-full max-w-lg overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <form
                action={async (formData) => {
                  const result = await updateLugarTrabajoAction(
                    campaignId,
                    formData
                  );
                  if (isActionError(result)) {
                    window.alert(result.error);
                    return;
                  }
                  setEditing(false);
                  router.refresh();
                }}
                className="p-6"
              >
                <input type="hidden" name="id" value={lugar.id} />
                <h3 className="text-base font-semibold text-neutral-900">
                  Editar lugar de trabajo
                </h3>
                <div className="mt-5 space-y-3">
                  <p className="text-sm text-neutral-500">
                    ID: <span className="font-medium text-neutral-900">{formatCatalogId(lugar.id)}</span>
                  </p>
                  <FormField label="Nombre">
                    <input
                      name="nombre"
                      defaultValue={lugar.nombre}
                      required
                      className={platformInputClass}
                    />
                  </FormField>
                  <FormField label="Dirección">
                    <input
                      name="direccion"
                      defaultValue={lugar.direccion ?? ""}
                      className={platformInputClass}
                    />
                  </FormField>
                  <FormField label="Comuna">
                    <select
                      name="id_comuna"
                      defaultValue={lugar.id_comuna ?? ""}
                      className={platformSelectClass}
                    >
                      <option value="">—</option>
                      {comunas.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.nombre}
                        </option>
                      ))}
                    </select>
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
      <ActionButtons
        onEdit={() => setEditing(true)}
        onDelete={handleDelete}
        pending={pending}
      />
      {modal}
    </>
  );
}

export function BarrioRowActions({
  campaignId,
  barrio,
  comunas,
}: {
  campaignId: number;
  barrio: { id: number; nombre: string; id_comuna: number };
  comunas: ComunaOption[];
}) {
  const { editing, setEditing, mounted, pending, startTransition, router } =
    useEditModal();

  const handleDelete = () => {
    const ok = window.confirm(
      `¿Eliminar el barrio "${barrio.nombre}"? Esta acción no se puede deshacer.`
    );
    if (!ok) return;
    startTransition(async () => {
      const result = await deleteBarrioAction(campaignId, barrio.id);
      if (isActionError(result)) window.alert(result.error);
      else router.refresh();
    });
  };

  const modal =
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
              className="w-full max-w-lg overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <form
                action={async (formData) => {
                  const result = await updateBarrioAction(campaignId, formData);
                  if (isActionError(result)) {
                    window.alert(result.error);
                    return;
                  }
                  setEditing(false);
                  router.refresh();
                }}
                className="p-6"
              >
                <input type="hidden" name="id" value={barrio.id} />
                <h3 className="text-base font-semibold text-neutral-900">
                  Editar barrio
                </h3>
                <div className="mt-5 space-y-3">
                  <p className="text-sm text-neutral-500">
                    ID: <span className="font-medium text-neutral-900">{formatCatalogId(barrio.id)}</span>
                  </p>
                  <FormField label="Comuna">
                    <select
                      name="id_comuna"
                      required
                      defaultValue={barrio.id_comuna}
                      className={platformSelectClass}
                    >
                      {comunas.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.nombre}
                        </option>
                      ))}
                    </select>
                  </FormField>
                  <FormField label="Nombre">
                    <input
                      name="nombre"
                      defaultValue={barrio.nombre}
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
      <ActionButtons
        onEdit={() => setEditing(true)}
        onDelete={handleDelete}
        pending={pending}
      />
      {modal}
    </>
  );
}

export function RolRowActions({
  campaignId,
  rol,
}: {
  campaignId: number;
  rol: { id: number; nombre: string; nivel_jerarquia: number };
}) {
  const { editing, setEditing, mounted, pending, startTransition, router } =
    useEditModal();

  const handleDelete = () => {
    const ok = window.confirm(
      `¿Eliminar el rol "${rol.nombre}"? Esta acción no se puede deshacer.`
    );
    if (!ok) return;
    startTransition(async () => {
      const result = await deleteRolAction(campaignId, rol.id);
      if (isActionError(result)) window.alert(result.error);
      else router.refresh();
    });
  };

  const modal =
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
              className="w-full max-w-lg overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <form
                action={async (formData) => {
                  const result = await updateRolAction(campaignId, formData);
                  if (isActionError(result)) {
                    window.alert(result.error);
                    return;
                  }
                  setEditing(false);
                  router.refresh();
                }}
                className="p-6"
              >
                <input type="hidden" name="id" value={rol.id} />
                <h3 className="text-base font-semibold text-neutral-900">
                  Editar rol
                </h3>
                <div className="mt-5 space-y-3">
                  <p className="text-sm text-neutral-500">
                    ID: <span className="font-medium text-neutral-900">{formatCatalogId(rol.id)}</span>
                  </p>
                  <FormField label="Nombre">
                    <input
                      name="nombre"
                      defaultValue={rol.nombre}
                      required
                      className={platformInputClass}
                    />
                  </FormField>
                  <FormField label="Jerarquía">
                    <input
                      type="number"
                      name="nivel_jerarquia"
                      min={1}
                      step={1}
                      required
                      defaultValue={rol.nivel_jerarquia}
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
      <ActionButtons
        onEdit={() => setEditing(true)}
        onDelete={handleDelete}
        pending={pending}
      />
      {modal}
    </>
  );
}

export function TipoNovedadRowActions({
  campaignId,
  tipo,
}: {
  campaignId: number;
  tipo: { id: number; novedad: string };
}) {
  const { editing, setEditing, mounted, pending, startTransition, router } =
    useEditModal();

  const handleDelete = () => {
    const ok = window.confirm(
      `¿Eliminar el tipo "${tipo.novedad}"? Esta acción no se puede deshacer.`
    );
    if (!ok) return;
    startTransition(async () => {
      const result = await deleteTipoNovedadAction(campaignId, tipo.id);
      if (isActionError(result)) window.alert(result.error);
      else router.refresh();
    });
  };

  const modal =
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
              className="w-full max-w-lg overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <form
                action={async (formData) => {
                  const result = await updateTipoNovedadAction(
                    campaignId,
                    formData
                  );
                  if (isActionError(result)) {
                    window.alert(result.error);
                    return;
                  }
                  setEditing(false);
                  router.refresh();
                }}
                className="p-6"
              >
                <input type="hidden" name="id" value={tipo.id} />
                <h3 className="text-base font-semibold text-neutral-900">
                  Editar tipo de novedad
                </h3>
                <p className="mt-5 text-sm text-neutral-500">
                  ID: <span className="font-medium text-neutral-900">{formatCatalogId(tipo.id)}</span>
                </p>
                <FormField label="Descripción" className="mt-3">
                  <input
                    name="novedad"
                    defaultValue={tipo.novedad}
                    required
                    className={platformInputClass}
                  />
                </FormField>
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
      <ActionButtons
        onEdit={() => setEditing(true)}
        onDelete={handleDelete}
        pending={pending}
      />
      {modal}
    </>
  );
}

export function PuestoRowActions({
  campaignId,
  puesto,
  comunas,
  barrios,
}: {
  campaignId: number;
  puesto: {
    id: number;
    nombre: string;
    municipio: string | null;
    direccion: string | null;
    id_comuna: number | null;
    id_barrio: number | null;
    votantes_hombres_admite: number;
    votantes_mujeres_admite: number;
    cantidad_mesas: number;
  };
  comunas: ComunaOption[];
  barrios: BarrioOption[];
}) {
  const { editing, setEditing, mounted, pending, startTransition, router } =
    useEditModal();

  const handleDelete = () => {
    const ok = window.confirm(
      `¿Eliminar el puesto "${puesto.nombre}"? Esta acción no se puede deshacer.`
    );
    if (!ok) return;
    startTransition(async () => {
      const result = await deletePuestoAction(campaignId, puesto.id);
      if (isActionError(result)) window.alert(result.error);
      else router.refresh();
    });
  };

  const modal =
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
              className="w-full max-w-2xl overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <form
                action={async (formData) => {
                  const result = await updatePuestoAction(campaignId, formData);
                  if (isActionError(result)) {
                    window.alert(result.error);
                    return;
                  }
                  setEditing(false);
                  router.refresh();
                }}
                className="max-h-[85vh] overflow-y-auto p-6"
              >
                <input type="hidden" name="id" value={puesto.id} />
                <h3 className="text-base font-semibold text-neutral-900">
                  Editar puesto de votación
                </h3>
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <p className="text-sm text-neutral-500 sm:col-span-2">
                    ID: <span className="font-medium text-neutral-900">{formatCatalogId(puesto.id)}</span>
                  </p>
                  <FormField label="Nombre">
                    <input
                      name="nombre"
                      defaultValue={puesto.nombre}
                      required
                      className={platformInputClass}
                    />
                  </FormField>
                  <FormField label="Municipio">
                    <input
                      name="municipio"
                      defaultValue={puesto.municipio ?? ""}
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
                  <ComunaBarrioFields
                    comunas={comunas}
                    barrios={barrios}
                    defaultComunaId={puesto.id_comuna}
                    defaultBarrioId={puesto.id_barrio}
                  />
                  <FormField label="Cupos H">
                    <input
                      name="votantes_hombres_admite"
                      type="number"
                      min={0}
                      defaultValue={puesto.votantes_hombres_admite}
                      className={platformInputClass}
                    />
                  </FormField>
                  <FormField label="Cupos M">
                    <input
                      name="votantes_mujeres_admite"
                      type="number"
                      min={0}
                      defaultValue={puesto.votantes_mujeres_admite}
                      className={platformInputClass}
                    />
                  </FormField>
                  <FormField label="Mesas">
                    <input
                      name="cantidad_mesas"
                      type="number"
                      min={0}
                      defaultValue={puesto.cantidad_mesas}
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
      <ActionButtons
        onEdit={() => setEditing(true)}
        onDelete={handleDelete}
        pending={pending}
      />
      {modal}
    </>
  );
}

