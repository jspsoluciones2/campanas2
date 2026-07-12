import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { escapeIlikeTerm, MASTER_PAGE_SIZE } from "@/lib/platform/master-list";
import { formatCatalogId, isNumericSearchTerm } from "@/lib/campaign/catalog-codigo";
import { createDepartamentoAction } from "@/app/(platform)/platform/actions";
import { DepartamentoRowActions } from "@/components/platform/departamento-row-actions";
import {
  DepartamentosListFilter,
  DepartamentosPagination,
  departamentoListHref,
} from "@/components/platform/departamentos-list-controls";
import {
  Card,
  DataTable,
  FormField,
  FormRow,
  PageHeader,
  platformInputClass,
} from "@/components/platform/platform-ui";
import { Button } from "@/components/ui/button";
import { MaestrasBulkUpload } from "@/components/platform/maestras-bulk-upload";
import { bulkUploadDepartamentosAction } from "@/app/(platform)/platform/actions";
import { MAESTRAS_BULK_DEFS } from "@/lib/platform/maestras-bulk-config";

export default async function MaestrasDepartamentosPage({
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
    .from("departamentos")
    .select("id, nombre, latitud, longitud, creado_en", { count: "exact" })
    .order("id", { ascending: true });

  const term = escapeIlikeTerm(q);
  if (term) {
    if (isNumericSearchTerm(term)) {
      query = query.eq("id", Number(term));
    } else {
      query = query.ilike("nombre", `%${term}%`);
    }
  }

  const { data: departamentos, count } = await query.range(from, to);

  const total = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / MASTER_PAGE_SIZE));

  if (total > 0 && page > totalPages) {
    redirect(departamentoListHref(filters, totalPages));
  }

  const rows = departamentos ?? [];
  const emptyMessage = q
    ? "Sin coincidencias. Prueba otro criterio de búsqueda."
    : "Sin departamentos. Crea el primero arriba.";

  return (
    <>
      <PageHeader title="Departamentos" />

      <Card
        title="Nuevo departamento"
        description="Agrega un departamento para organizar municipios."
      >
        <form
          action={createDepartamentoAction as unknown as (formData: FormData) => void}
          id="create-departamento-form"
        >
          <FormRow>
            <FormField label="Nombre">
              <input
                name="nombre"
                placeholder="Ej. Antioquia"
                required
                className={platformInputClass}
              />
            </FormField>
            <FormField label="Latitud">
              <input
                name="latitud"
                type="number"
                step="any"
                placeholder="Ej. 6.244"
                className={platformInputClass}
              />
            </FormField>
            <FormField label="Longitud">
              <input
                name="longitud"
                type="number"
                step="any"
                placeholder="Ej. -75.574"
                className={platformInputClass}
              />
            </FormField>
            <Button type="submit" className="h-10 shrink-0 px-6">
              Crear departamento
            </Button>
          </FormRow>
        </form>
      </Card>

      <MaestrasBulkUpload
        action={bulkUploadDepartamentosAction}
        templateHref="/api/maestras/plantilla/departamentos"
        instructions={MAESTRAS_BULK_DEFS.departamentos.instructions}
        columnas={MAESTRAS_BULK_DEFS.departamentos.columns.map((c) => c.header).join(", ")}
        entityLabel="departamentos"
      />

      <Card title="Creados" description={`${total} departamento(s)`}>
        <DepartamentosListFilter q={q} />
        <DataTable
          data={rows}
          rowKey={(d) => String(d.id)}
          emptyMessage={emptyMessage}
          columns={[
            {
              key: "codigo",
              header: "ID",
              cell: (d) => formatCatalogId(d.id),
            },
            {
              key: "nombre",
              header: "Nombre",
              cell: (d) => (
                <span className="font-medium text-neutral-900">{d.nombre}</span>
              ),
            },
            {
              key: "latitud",
              header: "Latitud",
              cell: (d) =>
                d.latitud != null ? d.latitud : "—",
              className: "text-neutral-600",
            },
            {
              key: "longitud",
              header: "Longitud",
              cell: (d) =>
                d.longitud != null ? d.longitud : "—",
              className: "text-neutral-600",
            },
            {
              key: "creado",
              header: "Creado",
              cell: (d) =>
                new Date(d.creado_en).toLocaleDateString("es-CO"),
              className: "text-neutral-500",
            },
            {
              key: "acciones",
              header: "Acciones",
              className: "text-center",
              cell: (d) => <DepartamentoRowActions departamento={d} />,
            },
          ]}
        />
        <DepartamentosPagination
          page={page}
          totalPages={totalPages}
          total={total}
          filters={filters}
        />
      </Card>
    </>
  );
}
