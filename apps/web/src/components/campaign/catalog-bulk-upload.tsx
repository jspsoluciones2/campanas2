"use client";

import { useActionState } from "react";
import { Download, Upload } from "lucide-react";
import { bulkUploadCatalogAction } from "@/app/(campaign)/campaign/[id]/actions";
import { CATALOG_BULK_DEFS } from "@/lib/campaign/catalog-bulk-config";
import type { CatalogSegment } from "@/lib/campaign/catalog-nav";
import { Button } from "@/components/ui/button";
import { Card, platformButtonClass } from "@/components/platform/platform-ui";

type BulkUploadState = {
  error?: string;
  ok?: boolean;
  message?: string;
  created?: number;
  skipped?: number;
  errors?: { row: number; message: string }[];
  archivo_error?: string;
};

async function submitBulkUpload(
  campaignId: number,
  segment: CatalogSegment,
  _prev: BulkUploadState,
  formData: FormData
): Promise<BulkUploadState> {
  return bulkUploadCatalogAction(campaignId, segment, formData);
}

type Props = {
  campaignId: number;
  segment: CatalogSegment;
};

export function CatalogBulkUpload({ campaignId, segment }: Props) {
  const def = CATALOG_BULK_DEFS[segment];
  const templateHref = `/api/campaign/${campaignId}/catalogos/${segment}/plantilla`;
  const [state, formAction, pending] = useActionState(
    submitBulkUpload.bind(null, campaignId, segment),
    {}
  );

  const columnas = def.columns.map((column) => column.header).join(", ");

  return (
    <Card
      title="Carga masiva"
      description={`${def.instructions} Columnas: ${columnas}.`}
    >
      <form
        action={formAction}
        className="flex flex-wrap items-center gap-2"
      >
        <a href={templateHref} className={`${platformButtonClass} gap-1.5 px-3`}>
          <Download className="size-4 shrink-0" />
          Plantilla
        </a>
        <input
          id={`bulk-file-${segment}`}
          name="archivo"
          type="file"
          accept=".xlsx,.xls"
          required
          aria-label="Archivo Excel"
          className="h-10 min-w-0 flex-1 text-sm text-neutral-700 file:mr-2 file:rounded-md file:border-0 file:bg-neutral-100 file:px-2.5 file:py-1.5 file:text-sm file:font-medium file:text-neutral-800 hover:file:bg-neutral-200"
        />
        <Button
          type="submit"
          disabled={pending}
          className="h-10 shrink-0 px-4"
        >
          <Upload className="size-4" />
          {pending ? "Importando…" : "Importar"}
        </Button>
      </form>

      {state.message ? (
        <div
          className={`mt-3 rounded-lg px-3 py-2 text-sm ${
            state.error || (state.errors && state.errors.length > 0)
              ? "bg-amber-50 text-amber-900"
              : "bg-emerald-50 text-emerald-900"
          }`}
        >
          {state.message}
        </div>
      ) : null}

      {state.errors && state.errors.length > 0 ? (
        <>
          <ul className="mt-2 max-h-32 overflow-y-auto rounded-lg border border-amber-200 bg-amber-50/50 px-3 py-2 text-sm text-amber-950">
            {state.errors.slice(0, 20).map((item) => (
              <li key={`${item.row}-${item.message}`}>
                Fila {item.row}: {item.message}
              </li>
            ))}
            {state.errors.length > 20 ? (
              <li className="text-amber-700">
                … y {state.errors.length - 20} error(es) más.
              </li>
            ) : null}
          </ul>
          {state.archivo_error ? (
            <a
              href={`data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,${state.archivo_error}`}
              download={`errores-${segment}.xlsx`}
              className={`${platformButtonClass} mt-2 gap-1.5 px-3`}
            >
              <Download className="size-4 shrink-0" />
              Descargar errores
            </a>
          ) : null}
        </>
      ) : null}
    </Card>
  );
}
