import { redirect } from "next/navigation";
import { requireCampaignAccess } from "@/lib/campaign/access";
import { escapeIlikeTerm } from "@/lib/platform/master-list";
import { createComunaFormAction } from "../../actions";
import {
  CatalogListFilter,
  CatalogPagination,
  CATALOG_PAGE_SIZE,
  catalogListHref,
} from "@/components/campaign/catalog-list-controls";
import { ComunaRowActions } from "@/components/campaign/catalog-row-actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  DataTable,
  FormField,
  FormRow,
  PageHeader,
  platformInputClass,
} from "@/components/platform/platform-ui";

export default async function CatalogComunasPage({
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
    .from("comunas")
    .select("id, nombre, numero, creado_en", { count: "exact" })
    .eq("id_campana", id)
    .order("nombre");

  const term = escapeIlikeTerm(q);
  if (term) {
    query = query.or(`nombre.ilike.%${term}%,numero.ilike.%${term}%`);
  }

  const { data: rows, count } = await query.range(from, to);
  const total = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / CATALOG_PAGE_SIZE));

  if (total > 0 && page > totalPages) {
    redirect(catalogListHref(id, "comunas", filters, totalPages));
  }

  const list = rows ?? [];
  const emptyMessage = q
    ? "Sin coincidencias. Prueba otro criterio de búsqueda."
    : "Sin comunas. Crea la primera arriba.";

  return (
    <>
      <PageHeader
        title="Comunas"
        description="Catálogo territorial de la campaña."
        backHref={`/campaign/${id}`}
        backLabel="Inicio campaña"
      />

      <Card title="Nueva comuna">
        <form action={createComunaFormAction.bind(null, id)}>
          <FormRow>
            <FormField label="Nombre">
              <input name="nombre" required className={platformInputClass} />
            </FormField>
            <FormField label="Número">
              <input name="numero" className={platformInputClass} />
            </FormField>
            <Button type="submit" className="h-10 shrink-0 px-6">
              Crear comuna
            </Button>
          </FormRow>
        </form>
      </Card>

      <Card title="Creadas" description={`${total} comuna(s)`}>
        <CatalogListFilter
          campaignId={id}
          segment="comunas"
          q={q}
          placeholder="Nombre o número de comuna"
        />
        <DataTable
          data={list}
          rowKey={(c) => c.id}
          emptyMessage={emptyMessage}
          columns={[
            {
              key: "nombre",
              header: "Nombre",
              cell: (c) => (
                <span className="font-medium text-neutral-900">{c.nombre}</span>
              ),
            },
            {
              key: "numero",
              header: "Nº",
              cell: (c) => c.numero ?? "—",
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
                <ComunaRowActions campaignId={id} comuna={c} />
              ),
            },
          ]}
        />
        <CatalogPagination
          campaignId={id}
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
