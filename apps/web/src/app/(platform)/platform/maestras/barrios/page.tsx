import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { escapeIlikeTerm, MASTER_PAGE_SIZE } from "@/lib/platform/master-list";
import { formatCatalogId, isNumericSearchTerm } from "@/lib/campaign/catalog-codigo";
import { BarrioMaestraRowActions } from "@/components/platform/barrio-maestra-row-actions";
import { BarrioCreateForm } from "@/components/platform/barrio-create-form";
import {
  BarriosListFilter,
  BarriosPagination,
  barrioListHref,
} from "@/components/platform/barrios-list-controls";
import {
  Card,
  DataTable,
  PageHeader,
} from "@/components/platform/platform-ui";
import { MaestrasBulkUpload } from "@/components/platform/maestras-bulk-upload";
import { MAESTRAS_BULK_DEFS } from "@/lib/platform/maestras-bulk-config";

export default async function MaestrasBarriosPage({
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

  const [departamentos, municipios, comunas] = await Promise.all([
    supabase.from("departamentos").select("id, nombre").order("nombre"),
    supabase.from("municipios").select("id, nombre, id_departamento").order("nombre"),
    supabase.from("comunas").select("id, nombre, id_municipio").order("nombre"),
  ]);

  let query = supabase
    .from("barrios")
    .select("id, nombre, id_comuna, creado_en", { count: "exact" })
    .order("id", { ascending: true });

  const term = escapeIlikeTerm(q);
  if (term) {
    if (isNumericSearchTerm(term)) {
      query = query.eq("id", term);
    } else {
      query = query.ilike("nombre", `%${term}%`);
    }
  }

  const { data: barrios, count } = await query.range(from, to);

  const total = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / MASTER_PAGE_SIZE));

  if (total > 0 && page > totalPages) {
    redirect(barrioListHref(filters, totalPages));
  }

  const rows = barrios ?? [];
  const comunaMap = new Map(
    (comunas.data ?? []).map((c) => [c.id, c.nombre])
  );
  const emptyMessage = q
    ? "Sin coincidencias. Prueba otro criterio de búsqueda."
    : "Sin barrios. Crea el primero arriba.";

  return (
    <>
      <PageHeader title="Barrios" />

      <Card
        title="Nuevo barrio"
        description="Selecciona departamento, municipio, comuna y nombra el barrio."
      >
        <BarrioCreateForm
          departamentos={departamentos.data ?? []}
          municipios={municipios.data ?? []}
          comunas={comunas.data ?? []}
        />
      </Card>

      <MaestrasBulkUpload
        tipo="barrios"
        templateHref="/api/maestras/plantilla/barrios"
        instructions={MAESTRAS_BULK_DEFS.barrios.instructions}
        columnas={MAESTRAS_BULK_DEFS.barrios.columns.map((c) => c.header).join(", ")}
        entityLabel="barrios"
      />

      <Card title="Creados" description={`${total} barrio(s)`}>
        <BarriosListFilter q={q} />
        <DataTable
          data={rows}
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
              header: "Nombre",
              cell: (b) => (
                <span className="font-medium text-neutral-900">{b.nombre}</span>
              ),
            },
            {
              key: "comuna",
              header: "Comuna",
              cell: (b) => (
                <span className="text-neutral-600">
                  {comunaMap.get(b.id_comuna) ?? "—"}
                </span>
              ),
            },
            {
              key: "creado",
              header: "Creado",
              cell: (b) =>
                new Date(b.creado_en).toLocaleDateString("es-CO"),
              className: "text-neutral-500",
            },
            {
              key: "acciones",
              header: "Acciones",
              className: "text-center",
              cell: (b) => (
                <BarrioMaestraRowActions
                  barrio={b}
                  comunas={comunas.data ?? []}
                  departamentos={departamentos.data ?? []}
                  municipios={municipios.data ?? []}
                />
              ),
            },
          ]}
        />
        <BarriosPagination
          page={page}
          totalPages={totalPages}
          total={total}
          filters={filters}
        />
      </Card>
    </>
  );
}
