import { redirect } from "next/navigation";
import { requireCampaignAccess } from "@/lib/campaign/access";
import { escapeIlikeTerm } from "@/lib/platform/master-list";
import { formatCatalogId, isNumericSearchTerm } from "@/lib/campaign/catalog-codigo";
import { createZonaFormAction } from "../../actions";
import {
  CatalogListFilter,
  CatalogPagination,
  CATALOG_PAGE_SIZE,
  catalogListHref,
} from "@/components/campaign/catalog-list-controls";
import { ZonaRowActions } from "@/components/campaign/catalog-row-actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  DataTable,
  FormField,
  FormRow,
  PageHeader,
  platformInputClass,
} from "@/components/platform/platform-ui";

export default async function CatalogZonasPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const { id } = await params;
  const { q: qRaw = "", page: pageRaw = "1" } = await searchParams;
  const q = qRaw.trim();
  const filters = { q };
  const page = Math.max(1, Number.parseInt(pageRaw, 10) || 1);
  const from = (page - 1) * CATALOG_PAGE_SIZE;
  const to = from + CATALOG_PAGE_SIZE - 1;

  const { supabase } = await requireCampaignAccess(id);

  let query = supabase
    .from("zonas")
    .select("id, nombre, codigo, descripcion, creado_en", { count: "exact" })
    .eq("id_campana", id)
    .order("codigo");

  const term = escapeIlikeTerm(q);
  if (term) {
    if (isNumericSearchTerm(term)) {
      query = query.eq("codigo", Number(term));
    } else {
      query = query.or(`nombre.ilike.%${term}%,descripcion.ilike.%${term}%`);
    }
  }

  const { data: rows, count } = await query.range(from, to);
  const total = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / CATALOG_PAGE_SIZE));

  if (total > 0 && page > totalPages) {
    redirect(catalogListHref(id, "zonas", filters, totalPages));
  }

  const list = rows ?? [];
  const emptyMessage = q
    ? "Sin coincidencias. Prueba otro criterio de búsqueda."
    : "Sin zonas. Crea la primera arriba.";

  return (
    <>
      <PageHeader
        title="Zonas asignadas"
        description="Territorios operativos de la campaña para asignar votantes y equipos."
        backHref={`/campaign/${id}`}
        backLabel="Inicio campaña"
      />

      <Card title="Nueva zona">
        <form action={createZonaFormAction.bind(null, id)}>
          <FormRow className="flex-col items-stretch sm:flex-row sm:flex-wrap">
            <FormField label="Nombre">
              <input name="nombre" required className={platformInputClass} />
            </FormField>
            <FormField label="Descripción (opcional)">
              <input name="descripcion" className={platformInputClass} />
            </FormField>
            <Button type="submit" className="h-10 shrink-0 self-end px-6">
              Crear zona
            </Button>
          </FormRow>
        </form>
      </Card>

      <Card title="Creadas" description={`${total} zona(s)`}>
        <CatalogListFilter
          campaignId={id}
          segment="zonas"
          q={q}
          placeholder="ID o nombre de zona"
        />
        <DataTable
          data={list}
          rowKey={(z) => z.id}
          emptyMessage={emptyMessage}
          columns={[
            {
              key: "codigo",
              header: "ID",
              cell: (z) => formatCatalogId(z.codigo),
            },
            {
              key: "nombre",
              header: "Zona",
              cell: (z) => (
                <span className="font-medium text-neutral-900">{z.nombre}</span>
              ),
            },
            {
              key: "descripcion",
              header: "Descripción",
              cell: (z) => z.descripcion ?? "—",
            },
            {
              key: "creado",
              header: "Creado",
              cell: (z) => new Date(z.creado_en).toLocaleDateString("es-CO"),
              className: "text-neutral-500",
            },
            {
              key: "acciones",
              header: "Acciones",
              className: "text-center",
              cell: (z) => <ZonaRowActions campaignId={id} zona={z} />,
            },
          ]}
        />
        <CatalogPagination
          campaignId={id}
          segment="zonas"
          page={page}
          totalPages={totalPages}
          total={total}
          filters={filters}
          entityLabel="zona(s)"
          ariaLabel="Paginación de zonas"
        />
      </Card>
    </>
  );
}
