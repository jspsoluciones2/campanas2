import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { escapeIlikeTerm, MASTER_PAGE_SIZE } from "@/lib/platform/master-list";
import { formatCatalogId, isNumericSearchTerm } from "@/lib/campaign/catalog-codigo";
import { createComunaMaestraAction } from "@/app/(platform)/platform/actions";
import { ComunaMaestraRowActions } from "@/components/platform/comuna-maestra-row-actions";
import {
  ComunasListFilter,
  ComunasPagination,
  comunaListHref,
} from "@/components/platform/comunas-list-controls";
import {
  Card,
  DataTable,
  FormField,
  FormRow,
  PageHeader,
  platformInputClass,
  platformSelectClass,
} from "@/components/platform/platform-ui";
import { Button } from "@/components/ui/button";
import { MaestrasBulkUpload } from "@/components/platform/maestras-bulk-upload";
import { MAESTRAS_BULK_DEFS } from "@/lib/platform/maestras-bulk-config";

export default async function MaestrasComunasPage({
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

  const { data: municipios } = await supabase
    .from("municipios")
    .select("id, nombre")
    .order("nombre", { ascending: true });

  let query = supabase
    .from("comunas")
    .select("id, nombre, id_municipio, creado_en", { count: "exact" })
    .order("id", { ascending: true });

  const term = escapeIlikeTerm(q);
  if (term) {
    if (isNumericSearchTerm(term)) {
      query = query.eq("id", term);
    } else {
      query = query.ilike("nombre", `%${term}%`);
    }
  }

  const { data: comunas, count } = await query.range(from, to);

  const total = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / MASTER_PAGE_SIZE));

  if (total > 0 && page > totalPages) {
    redirect(comunaListHref(filters, totalPages));
  }

  const rows = comunas ?? [];
  const municipioMap = new Map(
    (municipios ?? []).map((m) => [m.id, m.nombre])
  );
  const emptyMessage = q
    ? "Sin coincidencias. Prueba otro criterio de búsqueda."
    : "Sin comunas. Crea la primera arriba.";

  return (
    <>
      <PageHeader title="Comunas" />

      <Card
        title="Nueva comuna"
        description="Agrega una comuna dentro de un municipio."
      >
        <form
          action={createComunaMaestraAction as unknown as (formData: FormData) => void}
          id="create-comuna-form"
        >
          <FormRow>
            <FormField label="Municipio">
              <select
                name="id_municipio"
                required
                className={platformSelectClass}
              >
                <option value="">Seleccionar municipio</option>
                {(municipios ?? []).map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.nombre}
                  </option>
                ))}
              </select>
            </FormField>
            <FormField label="Nombre">
              <input
                name="nombre"
                placeholder="Ej. Comuna 1"
                required
                className={platformInputClass}
              />
            </FormField>
            <Button type="submit" className="h-10 shrink-0 px-6">
              Crear comuna
            </Button>
          </FormRow>
        </form>
      </Card>

      <MaestrasBulkUpload
        tipo="comunas"
        templateHref="/api/maestras/plantilla/comunas"
        instructions={MAESTRAS_BULK_DEFS.comunas.instructions}
        columnas={MAESTRAS_BULK_DEFS.comunas.columns.map((c) => c.header).join(", ")}
        entityLabel="comunas"
      />

      <Card title="Creadas" description={`${total} comuna(s)`}>
        <ComunasListFilter q={q} />
        <DataTable
          data={rows}
          rowKey={(c) => String(c.id)}
          emptyMessage={emptyMessage}
          columns={[
            {
              key: "codigo",
              header: "ID",
              cell: (c) => formatCatalogId(c.id),
            },
            {
              key: "nombre",
              header: "Nombre",
              cell: (c) => (
                <span className="font-medium text-neutral-900">{c.nombre}</span>
              ),
            },
            {
              key: "municipio",
              header: "Municipio",
              cell: (c) => (
                <span className="text-neutral-600">
                  {municipioMap.get(c.id_municipio ?? "") ?? "—"}
                </span>
              ),
            },
            {
              key: "creado",
              header: "Creado",
              cell: (c) =>
                new Date(c.creado_en).toLocaleDateString("es-CO"),
              className: "text-neutral-500",
            },
            {
              key: "acciones",
              header: "Acciones",
              className: "text-center",
              cell: (c) => (
                <ComunaMaestraRowActions
                  comuna={c}
                  municipios={municipios ?? []}
                />
              ),
            },
          ]}
        />
        <ComunasPagination
          page={page}
          totalPages={totalPages}
          total={total}
          filters={filters}
        />
      </Card>
    </>
  );
}
