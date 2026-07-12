import { redirect } from "next/navigation";
import { requireCampaignAccess } from "@/lib/campaign/access";
import { escapeIlikeTerm } from "@/lib/platform/master-list";
import { formatCatalogId, isNumericSearchTerm } from "@/lib/campaign/catalog-codigo";
import { createBarrioFormAction } from "../../actions";
import {
  CatalogListFilter,
  CatalogPagination,
  CATALOG_PAGE_SIZE,
  catalogListHref,
} from "@/components/campaign/catalog-list-controls";
import { BarrioRowActions } from "@/components/campaign/catalog-row-actions";
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
import { fetchTerritorioAlcance } from "@/lib/campaign/comunas";

export default async function CatalogBarriosPage({
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

  const alcance = await fetchTerritorioAlcance(supabase, campaignId);

  let comunasQuery = supabase
    .from("comunas")
    .select("id, nombre")
    .order("nombre");

  if (alcance.departamentos.length > 0) {
    comunasQuery = comunasQuery.in("municipios.id_departamento", alcance.departamentos);
  }
  if (alcance.municipios.length > 0) {
    comunasQuery = comunasQuery.in("id_municipio", alcance.municipios);
  }

  const { data: comunas } = await comunasQuery;
  const comunasList = comunas ?? [];

  let query = supabase
    .from("barrios")
    .select(
      "id, nombre, id_comuna, creado_en, comunas!inner(nombre, municipios!inner(id_departamento))",
      { count: "exact" }
    )
    .order("id");

  if (alcance.departamentos.length > 0) {
    query = query.in("comunas.municipios.id_departamento", alcance.departamentos);
  }
  if (alcance.municipios.length > 0) {
    query = query.in("comunas.id_municipio", alcance.municipios);
  }

  const term = escapeIlikeTerm(q);
  if (term) {
    if (isNumericSearchTerm(term)) {
      query = query.eq("id", Number(term));
    } else {
      query = query.ilike("nombre", `%${term}%`);
    }
  }

  const { data: rows, count } = await query.range(from, to);
  const total = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / CATALOG_PAGE_SIZE));

  if (total > 0 && page > totalPages) {
    redirect(catalogListHref(campaignId, "barrios", filters, totalPages));
  }

  const list = rows ?? [];
  const emptyMessage = q
    ? "Sin coincidencias. Prueba otro criterio de búsqueda."
    : comunasList.length === 0
      ? "Crea comunas primero, luego agrega barrios."
      : "Sin barrios. Crea el primero arriba.";

  return (
    <>
      <PageHeader
        title="Barrios"
        description="Barrios asociados a cada comuna de la campaña."
      />

       <CatalogBulkUpload campaignId={campaignId} segment="barrios" />

      <Card title="Nuevo barrio">
        <form action={createBarrioFormAction.bind(null, campaignId)}>
          <FormRow className="flex-col items-stretch sm:flex-row sm:flex-wrap">
            <FormField label="Comuna">
              <select
                name="id_comuna"
                required
                className={platformSelectClass}
                defaultValue=""
                disabled={comunasList.length === 0}
              >
                <option value="" disabled>
                  {comunasList.length === 0 ? "Sin comunas" : "Seleccionar"}
                </option>
                {comunasList.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre}
                  </option>
                ))}
              </select>
            </FormField>
            <FormField label="Nombre">
              <input name="nombre" required className={platformInputClass} />
            </FormField>
            <Button
              type="submit"
              disabled={comunasList.length === 0}
              className="h-10 shrink-0 self-end px-6"
            >
              Crear barrio
            </Button>
          </FormRow>
        </form>
      </Card>

      <Card title="Creados" description={`${total} barrio(s)`}>
        <CatalogListFilter
          campaignId={campaignId}
          segment="barrios"
          q={q}
          placeholder="ID o nombre del barrio"
        />
        <DataTable
          data={list}
          rowKey={(b) => String(b.id)}
          emptyMessage={emptyMessage}
          columns={[
            {
              key: "codigo",
              header: "ID",
              cell: (b) => formatCatalogId(b.id),
            },
            {
              key: "nombre",
              header: "Barrio",
              cell: (b) => (
                <span className="font-medium text-neutral-900">{b.nombre}</span>
              ),
            },
            {
              key: "comuna",
              header: "Comuna",
              cell: (b) => {
                const comuna = Array.isArray(b.comunas)
                  ? b.comunas[0]
                  : b.comunas;
                return (comuna as { nombre: string } | null)?.nombre ?? "—";
              },
            },
            {
              key: "creado",
              header: "Creado",
              cell: (b) => new Date(b.creado_en).toLocaleDateString("es-CO"),
              className: "text-neutral-500",
            },
            {
              key: "acciones",
              header: "Acciones",
              className: "text-center",
              cell: (b) => (
                <BarrioRowActions
                  campaignId={campaignId}
                  barrio={b}
                  comunas={comunasList}
                />
              ),
            },
          ]}
        />
        <CatalogPagination
          campaignId={campaignId}
          segment="barrios"
          page={page}
          totalPages={totalPages}
          total={total}
          filters={filters}
          entityLabel="barrio(s)"
          ariaLabel="Paginación de barrios"
        />
      </Card>
    </>
  );
}
