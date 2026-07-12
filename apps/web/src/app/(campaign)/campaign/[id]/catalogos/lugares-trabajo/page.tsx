import { redirect } from "next/navigation";
import { requireCampaignAccess } from "@/lib/campaign/access";
import { escapeIlikeTerm } from "@/lib/platform/master-list";
import { formatCatalogId, isNumericSearchTerm } from "@/lib/campaign/catalog-codigo";
import { createLugarTrabajoFormAction } from "../../actions";
import {
  CatalogListFilter,
  CatalogPagination,
  CATALOG_PAGE_SIZE,
  catalogListHref,
} from "@/components/campaign/catalog-list-controls";
import { LugarTrabajoRowActions } from "@/components/campaign/catalog-row-actions";
import { CatalogBulkUpload } from "@/components/campaign/catalog-bulk-upload";
import { Button } from "@/components/ui/button";
import {
  Card,
  DataTable,
  FormField,
  FormRow,
  PageHeader,
  platformInputClass,
  platformSelectClass,
} from "@/components/platform/platform-ui";

export default async function CatalogLugaresTrabajoPage({
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

  const { data: comunas } = await supabase
    .from("comunas")
    .select("id, nombre")
    .eq("id_campana", campaignId)
    .order("nombre");

  const comunasList = comunas ?? [];

  let query = supabase
    .from("lugares_trabajo")
    .select(
      "id, nombre, codigo, direccion, id_comuna, id_barrio, creado_en, comunas(nombre), barrios(nombre)",
      { count: "exact" }
    )
    .eq("id_campana", id)
    .order("codigo");

  const term = escapeIlikeTerm(q);
  if (term) {
    if (isNumericSearchTerm(term)) {
      query = query.eq("codigo", Number(term));
    } else {
      query = query.or(`nombre.ilike.%${term}%,direccion.ilike.%${term}%`);
    }
  }

  const { data: rows, count } = await query.range(from, to);
  const total = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / CATALOG_PAGE_SIZE));

  if (total > 0 && page > totalPages) {
    redirect(catalogListHref(campaignId, "lugares-trabajo", filters, totalPages));
  }

  const list = rows ?? [];
  const emptyMessage = q
    ? "Sin coincidencias. Prueba otro criterio de búsqueda."
    : "Sin lugares de trabajo. Crea el primero arriba.";

  return (
    <>
      <PageHeader
        title="Lugares de trabajo"
        description="Empresas, oficinas o sitios donde trabajan los votantes de la campaña."
      />

       <CatalogBulkUpload campaignId={campaignId} segment="lugares-trabajo" />

      <Card title="Nuevo lugar de trabajo">
        <form action={createLugarTrabajoFormAction.bind(null, campaignId)}>
          <FormRow className="flex-col items-stretch lg:flex-row lg:flex-wrap">
            <FormField label="Nombre">
              <input name="nombre" required className={platformInputClass} />
            </FormField>
            <FormField label="Dirección">
              <input name="direccion" className={platformInputClass} />
            </FormField>
            <FormField label="Comuna">
              <select name="id_comuna" className={platformSelectClass} defaultValue="">
                <option value="">—</option>
                {comunasList.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre}
                  </option>
                ))}
              </select>
            </FormField>
            <Button type="submit" className="h-10 shrink-0 self-end px-6">
              Crear lugar
            </Button>
          </FormRow>
        </form>
      </Card>

      <Card title="Creados" description={`${total} lugar(es)`}>
        <CatalogListFilter
          campaignId={campaignId}
          segment="lugares-trabajo"
          q={q}
          placeholder="ID, nombre o dirección"
        />
        <DataTable
          data={list}
          rowKey={(l) => String(l.id)}
          emptyMessage={emptyMessage}
          columns={[
            {
              key: "codigo",
              header: "ID",
              cell: (l) => formatCatalogId(l.codigo),
            },
            {
              key: "nombre",
              header: "Lugar",
              cell: (l) => (
                <span className="font-medium text-neutral-900">{l.nombre}</span>
              ),
            },
            {
              key: "direccion",
              header: "Dirección",
              cell: (l) => l.direccion ?? "—",
            },
            {
              key: "comuna",
              header: "Comuna",
              cell: (l) => {
                const c = Array.isArray(l.comunas) ? l.comunas[0] : l.comunas;
                return (c as { nombre: string } | null)?.nombre ?? "—";
              },
            },
            {
              key: "creado",
              header: "Creado",
              cell: (l) => new Date(l.creado_en).toLocaleDateString("es-CO"),
              className: "text-neutral-500",
            },
            {
              key: "acciones",
              header: "Acciones",
              className: "text-center",
              cell: (l) => (
                <LugarTrabajoRowActions
                  campaignId={campaignId}
                  lugar={l}
                  comunas={comunasList}
                />
              ),
            },
          ]}
        />
        <CatalogPagination
          campaignId={campaignId}
          segment="lugares-trabajo"
          page={page}
          totalPages={totalPages}
          total={total}
          filters={filters}
          entityLabel="lugar(es)"
          ariaLabel="Paginación de lugares de trabajo"
        />
      </Card>
    </>
  );
}
