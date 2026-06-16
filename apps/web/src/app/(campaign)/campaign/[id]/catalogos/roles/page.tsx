import { redirect } from "next/navigation";
import { requireCampaignAccess } from "@/lib/campaign/access";
import { escapeIlikeTerm } from "@/lib/platform/master-list";
import { formatCatalogId, isNumericSearchTerm } from "@/lib/campaign/catalog-codigo";
import {
  etiquetaJerarquia,
  siguienteNivelJerarquia,
} from "@/lib/campaign/roles";
import { createRolFormAction } from "../../actions";
import {
  CatalogListFilter,
  CatalogPagination,
  CATALOG_PAGE_SIZE,
  catalogListHref,
} from "@/components/campaign/catalog-list-controls";
import { RolRowActions } from "@/components/campaign/catalog-row-actions";
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

export default async function CatalogRolesPage({
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
    .from("roles")
    .select("id, nombre, codigo, nivel_jerarquia, creado_en", { count: "exact" })
    .eq("id_campana", id)
    .order("codigo");

  const term = escapeIlikeTerm(q);
  if (term) {
    if (isNumericSearchTerm(term)) {
      query = query.eq("codigo", Number(term));
    } else {
      query = query.ilike("nombre", `%${term}%`);
    }
  }

  const { data: rows, count } = await query.range(from, to);
  const total = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / CATALOG_PAGE_SIZE));

  if (total > 0 && page > totalPages) {
    redirect(catalogListHref(id, "roles", filters, totalPages));
  }

  const list = rows ?? [];

  const { data: nivelesRows } = await supabase
    .from("roles")
    .select("nivel_jerarquia")
    .eq("id_campana", id);
  const nivelesExistentes = (nivelesRows ?? []).map((r) => r.nivel_jerarquia);
  const nivelSugerido = siguienteNivelJerarquia(nivelesExistentes);

  const emptyMessage = q
    ? "Sin coincidencias. Prueba otro criterio de búsqueda."
    : "Sin roles. Crea el primero arriba.";

  return (
    <>
      <PageHeader title="Roles" />

      <CatalogBulkUpload campaignId={id} segment="roles" />

      <Card title="Nuevo rol">
        <form action={createRolFormAction.bind(null, id)}>
          <FormRow>
            <FormField label="Nombre">
              <input name="nombre" required className={platformInputClass} />
            </FormField>
            <FormField label="Jerarquía">
              <input
                type="number"
                name="nivel_jerarquia"
                min={1}
                step={1}
                required
                defaultValue={nivelSugerido}
                className={platformInputClass}
              />
            </FormField>
            <Button type="submit" className="h-10 shrink-0 px-6">
              Crear rol
            </Button>
          </FormRow>
        </form>
      </Card>

      <Card title="Creados" description={`${total} rol(es)`}>
        <CatalogListFilter
          campaignId={id}
          segment="roles"
          q={q}
          placeholder="ID o nombre del rol"
        />
        <DataTable
          data={list}
          rowKey={(r) => r.id}
          emptyMessage={emptyMessage}
          columns={[
            {
              key: "codigo",
              header: "ID",
              cell: (r) => formatCatalogId(r.codigo),
            },
            {
              key: "nombre",
              header: "Rol",
              cell: (r) => (
                <span className="font-medium text-neutral-900">{r.nombre}</span>
              ),
            },
            {
              key: "nivel",
              header: "Jerarquía",
              cell: (r) => etiquetaJerarquia(r.nivel_jerarquia),
            },
            {
              key: "creado",
              header: "Creado",
              cell: (r) => new Date(r.creado_en).toLocaleDateString("es-CO"),
              className: "text-neutral-500",
            },
            {
              key: "acciones",
              header: "Acciones",
              className: "text-center",
              cell: (r) => <RolRowActions campaignId={id} rol={r} />,
            },
          ]}
        />
        <CatalogPagination
          campaignId={id}
          segment="roles"
          page={page}
          totalPages={totalPages}
          total={total}
          filters={filters}
          entityLabel="rol(es)"
          ariaLabel="Paginación de roles"
        />
      </Card>
    </>
  );
}
