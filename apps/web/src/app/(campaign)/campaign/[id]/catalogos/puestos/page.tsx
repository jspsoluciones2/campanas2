import { redirect } from "next/navigation";
import { requireCampaignAccess } from "@/lib/campaign/access";
import { escapeIlikeTerm } from "@/lib/platform/master-list";
import { createPuestoFormAction } from "../../actions";
import {
  CatalogListFilter,
  CatalogPagination,
  CATALOG_PAGE_SIZE,
  catalogListHref,
} from "@/components/campaign/catalog-list-controls";
import { PuestoRowActions } from "@/components/campaign/catalog-row-actions";
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

export default async function CatalogPuestosPage({
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

  const { data: comunas } = await supabase
    .from("comunas")
    .select("id, nombre")
    .eq("id_campana", id)
    .order("nombre");

  const comunasList = comunas ?? [];

  let query = supabase
    .from("puestos_votacion")
    .select(
      "id, nombre, municipio, direccion, codigo_registraduria, id_comuna, votantes_hombres_admite, votantes_mujeres_admite, cantidad_mesas, creado_en",
      { count: "exact" }
    )
    .eq("id_campana", id)
    .order("nombre");

  const term = escapeIlikeTerm(q);
  if (term) {
    query = query.or(
      `nombre.ilike.%${term}%,municipio.ilike.%${term}%,codigo_registraduria.ilike.%${term}%`
    );
  }

  const { data: rows, count } = await query.range(from, to);
  const total = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / CATALOG_PAGE_SIZE));

  if (total > 0 && page > totalPages) {
    redirect(catalogListHref(id, "puestos", filters, totalPages));
  }

  const list = rows ?? [];
  const emptyMessage = q
    ? "Sin coincidencias. Prueba otro criterio de búsqueda."
    : "Sin puestos. Crea el primero arriba.";

  return (
    <>
      <PageHeader
        title="Puestos de votación"
        description="Cupos H/M según registraduría."
        backHref={`/campaign/${id}`}
        backLabel="Inicio campaña"
      />

      <Card title="Nuevo puesto de votación">
        <form action={createPuestoFormAction.bind(null, id)}>
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
            <FormField label="Código registraduría">
              <input name="codigo_registraduria" className={platformInputClass} />
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
            <Button type="submit" className="h-10 shrink-0 self-end px-6">
              Crear puesto
            </Button>
          </FormRow>
        </form>
      </Card>

      <Card title="Creados" description={`${total} puesto(s)`}>
        <CatalogListFilter
          campaignId={id}
          segment="puestos"
          q={q}
          placeholder="Nombre, municipio o código"
        />
        <DataTable
          data={list}
          rowKey={(p) => p.id}
          emptyMessage={emptyMessage}
          columns={[
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
                  campaignId={id}
                  puesto={p}
                  comunas={comunasList}
                />
              ),
            },
          ]}
        />
        <CatalogPagination
          campaignId={id}
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
