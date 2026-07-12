import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { escapeIlikeTerm, MASTER_PAGE_SIZE } from "@/lib/platform/master-list";
import { formatCatalogId, isNumericSearchTerm } from "@/lib/campaign/catalog-codigo";
import { CreateElectoralProcessForm } from "@/components/platform/create-electoral-process-form";
import { ElectoralProcessRowActions } from "@/components/platform/electoral-process-row-actions";
import {
  ProcesoElectoralListFilter,
  ProcesoElectoralPagination,
  procesoElectoralListHref,
} from "@/components/platform/proceso-electoral-list-controls";
import { Card, DataTable, PageHeader } from "@/components/platform/platform-ui";

export default async function MaestrasProcesoElectoralPage({
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

  let query = supabase
    .from("procesos_electorales")
    .select("id, nombre, fecha_eleccion, creado_en", { count: "exact" })
    .order("id", { ascending: true });

  const term = escapeIlikeTerm(q);
  if (term) {
    if (isNumericSearchTerm(term)) {
      query = query.eq("id", Number(term));
    } else {
      query = query.ilike("nombre", `%${term}%`);
    }
  }

  const { data: procesos, count } = await query.range(from, to);

  const total = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / MASTER_PAGE_SIZE));

  if (total > 0 && page > totalPages) {
    redirect(procesoElectoralListHref(filters, totalPages));
  }

  const rows = procesos ?? [];
  const emptyMessage = q
    ? "Sin coincidencias. Prueba otro criterio de búsqueda."
    : "Sin procesos electorales. Crea el primero arriba.";

  return (
    <>
      <PageHeader title="Proceso electoral" />

      <Card
        title="Nuevo proceso electoral"
        description="Define la elección antes de crear campañas."
      >
        <CreateElectoralProcessForm />
      </Card>

      <Card title="Creados" description={`${total} proceso(s)`}>
        <ProcesoElectoralListFilter q={q} />
        <DataTable
          data={rows}
          rowKey={(p) => p.id}
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
              key: "fecha",
              header: "Fecha elección",
              cell: (p) =>
                p.fecha_eleccion
                  ? new Date(`${p.fecha_eleccion}T12:00:00`).toLocaleDateString(
                      "es-CO"
                    )
                  : "—",
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
              cell: (p) => <ElectoralProcessRowActions proceso={p} />,
            },
          ]}
        />
        <ProcesoElectoralPagination
          page={page}
          totalPages={totalPages}
          total={total}
          filters={filters}
        />
      </Card>
    </>
  );
}
