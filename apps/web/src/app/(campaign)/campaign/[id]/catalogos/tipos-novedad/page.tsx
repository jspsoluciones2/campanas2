import { redirect } from "next/navigation";
import { requireCampaignAccess } from "@/lib/campaign/access";
import { escapeIlikeTerm } from "@/lib/platform/master-list";
import { formatCatalogId, isNumericSearchTerm } from "@/lib/campaign/catalog-codigo";
import { createTipoNovedadFormAction } from "../../actions";
import {
  CatalogListFilter,
  CatalogPagination,
  CATALOG_PAGE_SIZE,
  catalogListHref,
} from "@/components/campaign/catalog-list-controls";
import { TipoNovedadRowActions } from "@/components/campaign/catalog-row-actions";
import { CatalogBulkUpload } from "@/components/campaign/catalog-bulk-upload";
import { Button } from "@/components/ui/button";
import {
  Card,
  DataTable,
  FormField,
  FormRow,
  PageHeader,
  platformInputClass,
} from "@/components/platform/platform-ui";

export default async function CatalogTiposNovedadPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const { id } = await params;
  const campaignId = Number(id);
  const { q: qRaw = "", page: pageRaw = "1" } = await searchParams;
  const q = qRaw.trim();
  const filters = { q };
  const page = Math.max(1, Number.parseInt(pageRaw, 10) || 1);
  const from = (page - 1) * CATALOG_PAGE_SIZE;
  const to = from + CATALOG_PAGE_SIZE - 1;

  const { supabase } = await requireCampaignAccess(campaignId);

  let query = supabase
    .from("tipos_novedad")
    .select("id, novedad, creado_en", { count: "exact" })
    .eq("id_campana", campaignId)
    .order("id");

  const term = escapeIlikeTerm(q);
  if (term) {
    if (isNumericSearchTerm(term)) {
      query = query.eq("id", Number(term));
    } else {
      query = query.ilike("novedad", `%${term}%`);
    }
  }

  const { data: rows, count } = await query.range(from, to);
  const total = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / CATALOG_PAGE_SIZE));

  if (total > 0 && page > totalPages) {
    redirect(catalogListHref(campaignId, "tipos-novedad", filters, totalPages));
  }

  const list = rows ?? [];
  const emptyMessage = q
    ? "Sin coincidencias. Prueba otro criterio de búsqueda."
    : "Sin tipos de novedad. Crea el primero arriba.";

  return (
    <>
      <PageHeader
        title="Tipos de novedad"
        description="Catálogo de novedades aplicables a votantes."
      />

       <CatalogBulkUpload campaignId={campaignId} segment="tipos-novedad" />

      <Card title="Nuevo tipo de novedad">
        <form action={createTipoNovedadFormAction.bind(null, campaignId)}>
          <FormRow>
            <FormField label="Descripción" className="flex-[2]">
              <input name="novedad" required className={platformInputClass} />
            </FormField>
            <Button type="submit" className="h-10 shrink-0 px-6">
              Crear tipo
            </Button>
          </FormRow>
        </form>
      </Card>

      <Card title="Creados" description={`${total} tipo(s)`}>
        <CatalogListFilter
          campaignId={campaignId}
          segment="tipos-novedad"
          q={q}
          placeholder="ID o descripción de la novedad"
        />
        <DataTable
          data={list}
          rowKey={(t) => String(t.id)}
          emptyMessage={emptyMessage}
          columns={[
            {
              key: "codigo",
              header: "ID",
              cell: (t) => formatCatalogId(t.id),
            },
            {
              key: "novedad",
              header: "Novedad",
              cell: (t) => (
                <span className="font-medium text-neutral-900">{t.novedad}</span>
              ),
            },
            {
              key: "creado",
              header: "Creado",
              cell: (t) => new Date(t.creado_en).toLocaleDateString("es-CO"),
              className: "text-neutral-500",
            },
            {
              key: "acciones",
              header: "Acciones",
              className: "text-center",
              cell: (t) => (
                <TipoNovedadRowActions campaignId={campaignId} tipo={t} />
              ),
            },
          ]}
        />
        <CatalogPagination
          campaignId={campaignId}
          segment="tipos-novedad"
          page={page}
          totalPages={totalPages}
          total={total}
          filters={filters}
          entityLabel="tipo(s)"
          ariaLabel="Paginación de tipos de novedad"
        />
      </Card>
    </>
  );
}
