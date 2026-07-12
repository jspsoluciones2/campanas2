"use client";

import { useState, useTransition } from "react";
import { updateVotanteNovedadAction } from "@/app/(campaign)/campaign/[id]/actions";
import { Button } from "@/components/ui/button";
import {
  platformInputClass,
  platformSelectClass,
  StatusBadge,
} from "@/components/platform/platform-ui";
import { cn } from "@/lib/utils";

type TipoNovedad = { id: number; novedad: string };

export type VotanteListRow = {
  id: number;
  nombres: string;
  apellidos: string;
  documento: string;
  tipo_documento: string;
  direccion: string | null;
  estado: string;
  creado_en: string;
  id_tipo_novedad: number | null;
  detalle_novedad: string | null;
  roles: { nombre: string } | { nombre: string }[] | null;
  lugares_trabajo: { nombre: string } | { nombre: string }[] | null;
};

const ETIQUETAS_ESTADO: Record<string, string> = {
  activo: "Activo",
  registrado: "Registrado",
  pendiente_verificacion: "Pendiente verificación",
  en_cuarentena: "Cuarentena",
  rechazado: "Rechazado",
};

function nombreRelacion(
  rel: { nombre: string } | { nombre: string }[] | null | undefined
) {
  if (!rel) return "—";
  if (Array.isArray(rel)) return rel[0]?.nombre ?? "—";
  return rel.nombre;
}

function NovedadGestionCells({
  campaignId,
  votanteId,
  tipos,
  initialTipoId,
  initialDetalle,
}: {
  campaignId: number;
  votanteId: number;
  tipos: TipoNovedad[];
  initialTipoId: number | null;
  initialDetalle: string | null;
}) {
  const [tipoId, setTipoId] = useState(initialTipoId != null ? String(initialTipoId) : "");
  const [detalle, setDetalle] = useState(initialDetalle ?? "");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function guardar() {
    setFeedback(null);
    startTransition(async () => {
      const result = await updateVotanteNovedadAction(campaignId, votanteId, {
        id_tipo_novedad: tipoId ? Number(tipoId) : null,
        detalle_novedad: detalle.trim() || null,
      });
      if (result.error) {
        setFeedback(result.error);
        return;
      }
      setFeedback("Guardado");
    });
  }

  return (
    <>
      <td className="min-w-[11rem] px-4 py-3 align-top text-neutral-700">
        <select
          className={cn(platformSelectClass, "w-full min-w-0 text-xs")}
          value={tipoId}
          disabled={pending}
          onChange={(e) => setTipoId(e.target.value)}
          aria-label="Tipo de novedad"
        >
          <option value="">—</option>
          {tipos.map((t) => (
            <option key={t.id} value={t.id}>
              {t.novedad}
            </option>
          ))}
        </select>
      </td>
      <td className="min-w-[14rem] px-4 py-3 align-top text-neutral-700">
        <div className="flex flex-col gap-2">
          <textarea
            className={cn(
              platformInputClass,
              "min-h-[4.5rem] resize-y text-xs leading-relaxed"
            )}
            value={detalle}
            disabled={pending}
            onChange={(e) => setDetalle(e.target.value)}
            placeholder="Detalle de la irregularidad observada…"
            aria-label="Detalle de novedad"
          />
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              size="sm"
              className="h-8 px-3 text-xs"
              disabled={pending}
              onClick={guardar}
            >
              {pending ? "Guardando…" : "Guardar novedad"}
            </Button>
            {feedback ? (
              <span
                className={cn(
                  "text-xs",
                  feedback === "Guardado"
                    ? "text-emerald-700"
                    : "text-red-700"
                )}
              >
                {feedback}
              </span>
            ) : null}
          </div>
        </div>
      </td>
    </>
  );
}

type Props = {
  campaignId: number;
  rows: VotanteListRow[];
  tiposNovedad: TipoNovedad[];
  emptyMessage: string;
};

export function VotantesTable({
  campaignId,
  rows,
  tiposNovedad,
  emptyMessage,
}: Props) {
  return (
    <div className="overflow-x-auto rounded-lg border border-neutral-100">
      <table className="w-full min-w-[72rem] text-sm">
        <thead>
          <tr className="border-b border-neutral-100 bg-neutral-50/80 text-left">
            <th className="px-4 py-3 text-xs font-semibold tracking-wide text-neutral-600">
              Nombre completo
            </th>
            <th className="px-4 py-3 text-xs font-semibold tracking-wide text-neutral-600">
              Documento
            </th>
            <th className="px-4 py-3 text-xs font-semibold tracking-wide text-neutral-600">
              Trabajo
            </th>
            <th className="px-4 py-3 text-xs font-semibold tracking-wide text-neutral-600">
              Dirección
            </th>
            <th className="px-4 py-3 text-xs font-semibold tracking-wide text-neutral-600">
              Rol
            </th>
            <th className="px-4 py-3 text-xs font-semibold tracking-wide text-neutral-600">
              Tipo novedad
            </th>
            <th className="px-4 py-3 text-xs font-semibold tracking-wide text-neutral-600">
              Detalle novedad
            </th>
            <th className="px-4 py-3 text-xs font-semibold tracking-wide text-neutral-600">
              Estado
            </th>
            <th className="px-4 py-3 text-xs font-semibold tracking-wide text-neutral-600">
              Registro
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-100">
          {rows.length ? (
            rows.map((v) => (
              <tr
                key={v.id}
                className="bg-white transition-colors hover:bg-neutral-50/50"
              >
                <td className="px-4 py-3 font-medium text-neutral-900">
                  {v.nombres} {v.apellidos}
                </td>
                <td className="px-4 py-3 text-neutral-700">
                  {v.tipo_documento} {v.documento}
                </td>
                <td className="px-4 py-3 text-neutral-700">
                  {nombreRelacion(v.lugares_trabajo)}
                </td>
                <td className="px-4 py-3 text-neutral-700">
                  {v.direccion ?? "—"}
                </td>
                <td className="px-4 py-3 text-neutral-700">
                  {nombreRelacion(v.roles)}
                </td>
                <NovedadGestionCells
                  campaignId={campaignId}
                  votanteId={v.id}
                  tipos={tiposNovedad}
                  initialTipoId={v.id_tipo_novedad}
                  initialDetalle={v.detalle_novedad}
                />
                <td className="px-4 py-3">
                  <StatusBadge variant="default">
                    {ETIQUETAS_ESTADO[v.estado] ?? v.estado}
                  </StatusBadge>
                </td>
                <td className="px-4 py-3 text-neutral-500">
                  {new Date(v.creado_en).toLocaleDateString("es-CO")}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan={9}
                className="px-4 py-12 text-center text-neutral-500"
              >
                {emptyMessage}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
