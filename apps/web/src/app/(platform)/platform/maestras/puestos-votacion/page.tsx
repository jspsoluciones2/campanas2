import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { escapeIlikeTerm, MASTER_PAGE_SIZE } from "@/lib/platform/master-list";
import { formatCatalogId, isNumericSearchTerm } from "@/lib/campaign/catalog-codigo";
import { PuestoMaestraRowActions } from "@/components/platform/puesto-maestra-row-actions";
import { PuestoCreateForm } from "@/components/platform/puesto-create-form";
import {
  PuestosListFilter,
  PuestosPagination,
  puestoListHref,
} from "@/components/platform/puestos-list-controls";
import {
  Card,
  DataTable,
  PageHeader,
} from "@/components/platform/platform-ui";
import { MaestrasBulkUpload } from "@/components/platform/maestras-bulk-upload";
import { MAESTRAS_BULK_DEFS } from "@/lib/platform/maestras-bulk-config";

function nombreRelacion(
  rel: { nombre: string } | { nombre: string }[] | null | undefined
) {
  if (!rel) return "—";
  if (Array.isArray(rel)) return rel[0]?.nombre ?? "—";
  return rel.nombre;
}

export default async function MaestrasPuestosVotacionPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const { q: qRaw = "", page: pageRaw = "1" } = await searchParams;
  const q = qRaw.trim();
  const filters = { q };
  const page = Math.max(1, Number.parseInt(pageRaw, 10) || 1);
  const from = (page - 1) * MASTER_PAGE_SIZE;
  const to = from + MASTER_PAGE_SIZE - 1;

  const supabase = await createClient();

  const [departamentos, municipios, comunas, barriosList] = await Promise.all([
    supabase.from("departamentos").select("id, nombre").order("nombre"),
    supabase.from("municipios").select("id, nombre, id_departamento").order("nombre"),
    supabase.from("comunas").select("id, nombre, id_municipio").order("nombre"),
    supabase.from("barrios").select("id, nombre, id_comuna").order("nombre"),
  ]);

  let query = supabase
    .from("puestos_votacion")
    .select(
      "id, nombre, direccion, id_comuna, id_barrio, votantes_hombres_admite, votantes_mujeres_admite, cantidad_mesas, creado_en, comunas!left(nombre), barrios!left(nombre)",
      { count: "exact" }
    )
    .order("id", { ascending: true });

  const term = escapeIlikeTerm(q);
  if (term) {
    if (isNumericSearchTerm(term)) {
      query = query.eq("id", term);
    } else {
      query = query.or(`nombre.ilike.%${term}%,direccion.ilike.%${term}%`);
    }
  }

  const { data: puestos, count } = await query.range(from, to);

  const total = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / MASTER_PAGE_SIZE));

  if (total > 0 && page > totalPages) {
    redirect(puestoListHref(filters, totalPages));
  }

  const rows = puestos ?? [];
  const emptyMessage = q
    ? "Sin coincidencias. Prueba otro criterio de búsqueda."
    : "Sin puestos de votación. Crea el primero arriba.";

  return (
    <>
      <PageHeader title="Puestos de votación" />

      <Card
        title="Nuevo puesto"
        description="Selecciona departamento, municipio, comuna, barrio y completa los datos."
      >
        <PuestoCreateForm
          departamentos={departamentos.data ?? []}
          municipios={municipios.data ?? []}
          comunas={comunas.data ?? []}
          barrios={barriosList.data ?? []}
        />
      </Card>

      <MaestrasBulkUpload
        tipo="puestos-votacion"
        templateHref="/api/maestras/plantilla/puestos-votacion"
        instructions={MAESTRAS_BULK_DEFS["puestos-votacion"].instructions}
        columnas={MAESTRAS_BULK_DEFS["puestos-votacion"].columns.map((c) => c.header).join(", ")}
        entityLabel="puestos de votación"
      />

      <Card title="Creados" description={`${total} puesto(s)`}>
        <PuestosListFilter q={q} />
        <DataTable
          data={rows}
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
              header: "Nombre",
              cell: (p) => (
                <span className="font-medium text-neutral-900">{p.nombre}</span>
              ),
            },
            {
              key: "direccion",
              header: "Dirección",
              cell: (p) => (
                <span className="text-neutral-600">{p.direccion ?? "—"}</span>
              ),
            },
            {
              key: "comuna",
              header: "Comuna",
              cell: (p) => (
                <span className="text-neutral-600">
                  {nombreRelacion(p.comunas)}
                </span>
              ),
            },
            {
              key: "barrio",
              header: "Barrio",
              cell: (p) => (
                <span className="text-neutral-600">
                  {nombreRelacion(p.barrios)}
                </span>
              ),
            },
            {
              key: "cupos_h",
              header: "Cupos H",
              cell: (p) => p.votantes_hombres_admite,
              className: "text-neutral-600",
            },
            {
              key: "cupos_m",
              header: "Cupos M",
              cell: (p) => p.votantes_mujeres_admite,
              className: "text-neutral-600",
            },
            {
              key: "mesas",
              header: "Mesas",
              cell: (p) => p.cantidad_mesas,
              className: "text-neutral-600",
            },
            {
              key: "creado",
              header: "Creado",
              cell: (p) =>
                new Date(p.creado_en).toLocaleDateString("es-CO"),
              className: "text-neutral-500",
            },
            {
              key: "acciones",
              header: "Acciones",
              className: "text-center",
              cell: (p) => (
                <PuestoMaestraRowActions
                  puesto={p}
                  departamentos={departamentos.data ?? []}
                  municipios={municipios.data ?? []}
                  comunas={comunas.data ?? []}
                  barrios={barriosList.data ?? []}
                />
              ),
            },
          ]}
        />
        <PuestosPagination
          page={page}
          totalPages={totalPages}
          total={total}
          filters={filters}
        />
      </Card>
    </>
  );
}
