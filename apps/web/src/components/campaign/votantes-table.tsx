"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  updateVotanteEstadoAction,
  updateVotanteNovedadAction,
} from "@/app/(campaign)/campaign/[id]/actions";
import { Button } from "@/components/ui/button";
import {
  platformInputClass,
  platformSelectClass,
  StatusBadge,
} from "@/components/platform/platform-ui";
import { cn } from "@/lib/utils";

type TipoNovedad = { id: number; novedad: string };

const ESTADOS_EDITABLES: { value: string; label: string }[] = [
  { value: "activo", label: "Activo" },
  { value: "registrado", label: "Registrado" },
  { value: "pendiente_verificacion", label: "Pendiente verificación" },
  { value: "en_cuarentena", label: "Cuarentena" },
  { value: "rechazado", label: "Rechazado" },
];

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
  mesa?: string | null;
  roles: { nombre: string } | { nombre: string }[] | null;
  lugares_trabajo: { nombre: string } | { nombre: string }[] | null;
  puestos_votacion?:
    | { nombre: string; municipio?: string | null }
    | { nombre: string; municipio?: string | null }[]
    | null;
  lider_directo?:
    | { nombres: string; apellidos: string }
    | { nombres: string; apellidos: string }[]
    | null;
};

export const ETIQUETAS_ESTADO: Record<string, string> = {
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

function nombreLider(
  rel:
    | { nombres: string; apellidos: string }
    | { nombres: string; apellidos: string }[]
    | null
    | undefined
) {
  if (!rel) return "—";
  const first = Array.isArray(rel) ? rel[0] : rel;
  if (!first) return "—";
  return `${first.nombres} ${first.apellidos}`.trim() || "—";
}

function municipioPuesto(
  rel:
    | { nombre: string; municipio?: string | null }
    | { nombre: string; municipio?: string | null }[]
    | null
    | undefined
) {
  if (!rel) return "—";
  const first = Array.isArray(rel) ? rel[0] : rel;
  return first?.municipio?.trim() || "—";
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
  showCobertura?: boolean;
  showEstadoEditor?: boolean;
  selectedIds?: Set<number>;
  onToggleRow?: (id: number) => void;
  onToggleAllPage?: () => void;
  allPageSelected?: boolean;
}

function EstadoEditorCell({
  campaignId,
  votanteId,
  estado,
}: {
  campaignId: number;
  votanteId: number;
  estado: string;
}) {
  const [pending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<string | null>(null);
  const router = useRouter();

  function cambiar(nuevoEstado: string) {
    if (nuevoEstado === estado) return;
    setFeedback(null);
    startTransition(async () => {
      const result = await updateVotanteEstadoAction(
        campaignId,
        votanteId,
        nuevoEstado
      );
      if (result?.error) {
        setFeedback(result.error);
        return;
      }
      setFeedback("Guardado");
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-1">
      <select
        className={cn(platformSelectClass, "w-full min-w-0 text-xs")}
        value={estado}
        disabled={pending}
        onChange={(e) => cambiar(e.target.value)}
        aria-label="Cambiar estado"
      >
        {ESTADOS_EDITABLES.map((s) => (
          <option key={s.value} value={s.value}>
            {s.label}
          </option>
        ))}
      </select>
      {feedback ? (
        <span
          className={cn(
            "text-xs",
            feedback === "Guardado" ? "text-emerald-700" : "text-red-700"
          )}
        >
          {feedback}
        </span>
      ) : null}
    </div>
  );
}

export function VotantesTable({
  campaignId,
  rows,
  tiposNovedad,
  emptyMessage,
  showCobertura = false,
  showEstadoEditor = false,
  selectedIds,
  onToggleRow,
  onToggleAllPage,
  allPageSelected = false,
}: Props) {
  const selectable = Boolean(onToggleRow && onToggleAllPage);
  return (
    <div className="overflow-x-auto rounded-lg border border-neutral-100">
      <table className="w-full min-w-[72rem] text-sm">
        <thead>
          <tr className="border-b border-neutral-100 bg-neutral-50/80 text-left">
            {selectable ? (
              <th className="w-10 px-3 py-3">
                <input
                  type="checkbox"
                  aria-label="Seleccionar todos los de la página"
                  checked={allPageSelected && rows.length > 0}
                  onChange={onToggleAllPage}
                  className="size-4 accent-blue-600"
                />
              </th>
            ) : null}
            <th className="px-4 py-3 text-xs font-semibold tracking-wide text-neutral-600">
              Nombre completo
            </th>
            <th className="px-4 py-3 text-xs font-semibold tracking-wide text-neutral-600">
              Documento
            </th>
            {showCobertura && (
              <>
                <th className="px-4 py-3 text-xs font-semibold tracking-wide text-neutral-600">
                  Zona
                </th>
                <th className="px-4 py-3 text-xs font-semibold tracking-wide text-neutral-600">
                  Puesto
                </th>
                <th className="px-4 py-3 text-xs font-semibold tracking-wide text-neutral-600">
                  Mesa
                </th>
                <th className="px-4 py-3 text-xs font-semibold tracking-wide text-neutral-600">
                  Líder directo
                </th>
              </>
            )}
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
                className={`bg-white transition-colors ${
                  selectedIds?.has(v.id) ? "bg-blue-50/60" : "hover:bg-neutral-50/50"
                }`}
              >
                {selectable ? (
                  <td className="px-3 py-3">
                    <input
                      type="checkbox"
                      aria-label={`Seleccionar a ${v.nombres} ${v.apellidos}`}
                      checked={selectedIds?.has(v.id) ?? false}
                      onChange={() => onToggleRow?.(v.id)}
                      className="size-4 accent-blue-600"
                    />
                  </td>
                ) : null}
                <td className="px-4 py-3 font-medium text-neutral-900">
                  {v.nombres} {v.apellidos}
                </td>
                <td className="px-4 py-3 text-neutral-700">
                  {v.tipo_documento} {v.documento}
                </td>
                {showCobertura && (
                  <>
                    <td className="px-4 py-3 text-neutral-700">
                      {municipioPuesto(v.puestos_votacion)}
                    </td>
                    <td className="px-4 py-3 text-neutral-700">
                      {nombreRelacion(v.puestos_votacion)}
                    </td>
                    <td className="px-4 py-3 text-neutral-700">
                      {v.mesa?.trim() || "—"}
                    </td>
                    <td className="px-4 py-3 text-neutral-700">
                      {nombreLider(v.lider_directo)}
                    </td>
                  </>
                )}
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
                  {showEstadoEditor ? (
                    <EstadoEditorCell
                      campaignId={campaignId}
                      votanteId={v.id}
                      estado={v.estado}
                    />
                  ) : (
                    <StatusBadge variant="default">
                      {ETIQUETAS_ESTADO[v.estado] ?? v.estado}
                    </StatusBadge>
                  )}
                </td>
                <td className="px-4 py-3 text-neutral-500">
                  {new Date(v.creado_en).toLocaleDateString("es-CO")}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan={(showCobertura ? 13 : 9) + (selectable ? 1 : 0)}
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
