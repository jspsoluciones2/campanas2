import { redirect } from "next/navigation";
import { requireCampaignAccess } from "@/lib/campaign/access";
import {
  fetchComunasList,
  fetchDepartamentos,
  fetchMunicipios,
  COMUNA_LABEL_CREACION,
} from "@/lib/campaign/comunas";
import { formatCatalogId } from "@/lib/campaign/catalog-codigo";
import { escapeIlikeTerm } from "@/lib/platform/master-list";
import { createComunaFormAction } from "../../actions";
import {
  CatalogListFilter,
  CatalogPagination,
  CATALOG_PAGE_SIZE,
  catalogListHref,
} from "@/components/campaign/catalog-list-controls";
import { ComunaRowActions } from "@/components/campaign/catalog-row-actions";
import { CatalogBulkUpload } from "@/components/campaign/catalog-bulk-upload";
import { DepartamentoMunicipioFields } from "@/components/campaign/departamento-municipio-fields";
import { Button } from "@/components/ui/button";
import {
  Card,
  DataTable,
  FormRow,
  PageHeader,
} from "@/components/platform/platform-ui";

export default async function CatalogComunasPage({
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

  const departamentos = await fetchDepartamentos(supabase);
  const municipios = await fetchMunicipios(supabase);

  const term = escapeIlikeTerm(q);
  const { rows, count: total, error: listError } = await fetchComunasList(
    supabase,
    campaignId,
    { q: term, from, to }
  );
  const totalPages = Math.max(1, Math.ceil(total / CATALOG_PAGE_SIZE));

  if (total > 0 && page > totalPages) {
    redirect(catalogListHref(campaignId, "comunas", filters, totalPages));
  }

  const list = rows;
  const emptyMessage = q
    ? "Sin coincidencias. Prueba otro criterio de búsqueda."
    : listError
      ? "No se pudo cargar el listado. Revisa el aviso arriba."
      : "Sin comunas. Crea la primera arriba.";

  return (
    <>
      <PageHeader
        title="Comunas"
        description="Catálogo territorial de la campaña."
      />

      {formError ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {formError}
        </div>
      ) : null}

      {listError ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <p className="font-medium">No se pudo leer las comunas guardadas.</p>
          <p className="mt-1">{listError}</p>
          <p className="mt-2">
            Si acabas de activar IDs autoincrementales, ejecuta la migración{" "}
            <code className="text-xs">015_codigo_autoincremental.sql</code> en Supabase
            y recarga esta página.
          </p>
        </div>
      ) : null}

       <CatalogBulkUpload campaignId={campaignId} segment="comunas" />

      <Card
        title={`Nueva ${COMUNA_LABEL_CREACION.toLowerCase()}`}
        description="En algunos municipios no aplica el término comuna; registra aquí la subdivisión territorial que use tu campaña (localidad, corregimiento, etc.)."
      >
        <form action={createComunaFormAction.bind(null, campaignId)}>
          <FormRow>
            <DepartamentoMunicipioFields
              departamentos={departamentos}
              municipios={municipios}
            />
          </FormRow>
          <FormRow>
            <div className="flex min-w-[200px] flex-col gap-1.5">
              <label className="text-sm font-medium text-neutral-700">{COMUNA_LABEL_CREACION}</label>
              <input
                name="nombre"
                required
                placeholder="Nombre de la subdivisión"
                className="h-10 rounded-lg border border-neutral-300 bg-white px-3 text-sm text-neutral-900 outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
            <Button type="submit" className="h-10 shrink-0 px-6">
              Crear subdivisión
            </Button>
          </FormRow>
        </form>
      </Card>

      <Card title="Creadas" description={`${total} comuna(s)`}>
        <CatalogListFilter
          campaignId={campaignId}
          segment="comunas"
          q={q}
          placeholder="ID o nombre de comuna"
        />
        <DataTable
          data={list}
          rowKey={(c) => String(c.id)}
          emptyMessage={emptyMessage}
          columns={[
            {
              key: "codigo",
              header: "ID",
              cell: (c) => formatCatalogId(c.id),
            },
            {
              key: "nombre",
              header: "Nombre",
              cell: (c) => (
                <span className="font-medium text-neutral-900">{c.nombre}</span>
              ),
            },
            {
              key: "municipio",
              header: "Municipio",
              cell: (c) => (
                <span className="text-neutral-600">
                  {Array.isArray(c.municipios) ? c.municipios[0]?.nombre ?? "—" : c.municipios?.nombre ?? "—"}
                </span>
              ),
            },
            {
              key: "creado",
              header: "Creado",
              cell: (c) => new Date(c.creado_en).toLocaleDateString("es-CO"),
              className: "text-neutral-500",
            },
            {
              key: "acciones",
              header: "Acciones",
              className: "text-center",
              cell: (c) => (
                <ComunaRowActions campaignId={campaignId} comuna={c} departamentos={departamentos} municipios={municipios} />
              ),
            },
          ]}
        />
        <CatalogPagination
          campaignId={campaignId}
          segment="comunas"
          page={page}
          totalPages={totalPages}
          total={total}
          filters={filters}
          entityLabel="comuna(s)"
          ariaLabel="Paginación de comunas"
        />
      </Card>
    </>
  );
}
