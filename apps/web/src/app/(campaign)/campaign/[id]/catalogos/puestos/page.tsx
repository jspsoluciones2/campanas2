import { redirect } from "next/navigation";
import { requireCampaignAccess } from "@/lib/campaign/access";
import { escapeIlikeTerm } from "@/lib/platform/master-list";
import { fetchPuestosList } from "@/lib/campaign/puestos";
import { formatCatalogId } from "@/lib/campaign/catalog-codigo";
import { createPuestoFormAction } from "../../actions";
import {
  CatalogListFilter,
  CatalogPagination,
  CATALOG_PAGE_SIZE,
  catalogListHref,
} from "@/components/campaign/catalog-list-controls";
import { PuestoRowActions } from "@/components/campaign/catalog-row-actions";
import { CatalogBulkUpload } from "@/components/campaign/catalog-bulk-upload";
import { ComunaBarrioFields } from "@/components/campaign/comuna-barrio-fields";
import { Button } from "@/components/ui/button";
import {
  Card,
  DataTable,
  FormField,
  FormRow,
  PageHeader,
  platformInputClass,
} from "@/components/platform/platform-ui";

function nombreRelacion(
  rel: { nombre: string } | { nombre: string }[] | null | undefined
) {
  if (!rel) return "—";
  if (Array.isArray(rel)) return rel[0]?.nombre ?? "—";
  return rel.nombre;
}

export default async function CatalogPuestosPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ q?: string; page?: string; error?: string }>;
}) {
  const { id } = await params;
  const campaignId = Number(id);
  const {
    q: qRaw = "",
    page: pageRaw = "1",
    error: errorRaw,
  } = await searchParams;
  const q = qRaw.trim();
  const formError = errorRaw ? decodeURIComponent(errorRaw) : null;
  const filters = { q };
  const page = Math.max(1, Number.parseInt(pageRaw, 10) || 1);
  const from = (page - 1) * CATALOG_PAGE_SIZE;
  const to = from + CATALOG_PAGE_SIZE - 1;

  const { supabase } = await requireCampaignAccess(campaignId);

  const { data: comunas } = await supabase
    .from("comunas")
    .select("id, nombre")
    .eq("id_campana", campaignId)
    .order("nombre");

  const { data: barrios } = await supabase
    .from("barrios")
    .select("id, nombre, id_comuna, comunas!inner(id_campana)")
    .eq("comunas.id_campana", campaignId)
    .order("nombre");

  const comunasList = comunas ?? [];
  const barriosList = (barrios ?? []).map((barrio) => ({
    id: barrio.id,
    nombre: barrio.nombre,
    id_comuna: barrio.id_comuna,
  }));

  const term = escapeIlikeTerm(q);
  const { rows, count: total, error: listError } = await fetchPuestosList(
    supabase,
    campaignId,
    { q: term, from, to }
  );
  const totalPages = Math.max(1, Math.ceil(total / CATALOG_PAGE_SIZE));

  if (total > 0 && page > totalPages) {
    redirect(catalogListHref(campaignId, "puestos", filters, totalPages));
  }

  const list = rows;
  const emptyMessage = q
    ? "Sin coincidencias. Prueba otro criterio de búsqueda."
    : listError
      ? "No se pudo cargar el listado. Revisa el aviso arriba."
      : comunasList.length === 0 || barriosList.length === 0
      ? "Crea comunas y barrios primero, luego agrega puestos."
      : "Sin puestos. Crea el primero arriba.";

  return (
    <>
      <PageHeader
        title="Puestos de votación"
        description="Cupos H/M por puesto. Comuna y barrio obligatorios y deben coincidir."
      />

      {formError ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {formError}
        </div>
      ) : null}

      {listError ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <p className="font-medium">No se pudo leer los puestos guardados.</p>
          <p className="mt-1">{listError}</p>
          <p className="mt-2">
            Si acabas de activar IDs autoincrementales, ejecuta la migración{" "}
            <code className="text-xs">015_codigo_autoincremental.sql</code> en
            Supabase y recarga esta página.
          </p>
        </div>
      ) : null}

       <CatalogBulkUpload campaignId={campaignId} segment="puestos" />

      <Card title="Nuevo puesto de votación">
        <form action={createPuestoFormAction.bind(null, campaignId)}>
          <FormRow className="flex-col items-stretch lg:flex-row lg:flex-wrap">
            <FormField label="Nombre">
              <input name="nombre" required className={platformInputClass} />
            </FormField>
            <FormField label="Municipio">
              <input name="municipio" className={platformInputClass} />
            </FormField>
            <FormField label="Dirección">
              <input name="direccion" className={platformInputClass} />
            </FormField>
            <ComunaBarrioFields
              comunas={comunasList}
              barrios={barriosList}
              disabled={comunasList.length === 0 || barriosList.length === 0}
            />
            <FormField label="Cupos H">
              <input
                name="votantes_hombres_admite"
                type="number"
                min={0}
                defaultValue={0}
                className={platformInputClass}
              />
            </FormField>
            <FormField label="Cupos M">
              <input
                name="votantes_mujeres_admite"
                type="number"
                min={0}
                defaultValue={0}
                className={platformInputClass}
              />
            </FormField>
            <FormField label="Mesas">
              <input
                name="cantidad_mesas"
                type="number"
                min={0}
                defaultValue={0}
                className={platformInputClass}
              />
            </FormField>
            <Button
              type="submit"
              disabled={comunasList.length === 0 || barriosList.length === 0}
              className="h-10 shrink-0 self-end px-6"
            >
              Crear puesto
            </Button>
          </FormRow>
        </form>
      </Card>

      <Card title="Creados" description={`${total} puesto(s)`}>
        <CatalogListFilter
          campaignId={campaignId}
          segment="puestos"
          q={q}
          placeholder="Nombre, municipio o ID del puesto"
        />
        <DataTable
          data={list}
          rowKey={(p) => String(p.id)}
          emptyMessage={emptyMessage}
          columns={[
            {
              key: "codigo",
              header: "ID",
              cell: (p) => formatCatalogId(p.id),
            },
            {
              key: "nombre",
              header: "Puesto",
              cell: (p) => (
                <span className="font-medium text-neutral-900">{p.nombre}</span>
              ),
            },
            {
              key: "mun",
              header: "Municipio",
              cell: (p) => p.municipio ?? "—",
            },
            {
              key: "comuna",
              header: "Comuna",
              cell: (p) => nombreRelacion(p.comunas),
            },
            {
              key: "barrio",
              header: "Barrio",
              cell: (p) => nombreRelacion(p.barrios),
            },
            {
              key: "h",
              header: "Cupos H",
              cell: (p) => p.votantes_hombres_admite,
            },
            {
              key: "m",
              header: "Cupos M",
              cell: (p) => p.votantes_mujeres_admite,
            },
            {
              key: "mesas",
              header: "Mesas",
              cell: (p) => p.cantidad_mesas,
            },
            {
              key: "acciones",
              header: "Acciones",
              className: "text-center",
              cell: (p) => (
                <PuestoRowActions
                  campaignId={campaignId}
                  puesto={p}
                  comunas={comunasList}
                  barrios={barriosList}
                />
              ),
            },
          ]}
        />
        <CatalogPagination
          campaignId={campaignId}
          segment="puestos"
          page={page}
          totalPages={totalPages}
          total={total}
          filters={filters}
          entityLabel="puesto(s)"
          ariaLabel="Paginación de puestos de votación"
        />
      </Card>
    </>
  );
}
