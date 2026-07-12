import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { escapeIlikeTerm, MASTER_PAGE_SIZE } from "@/lib/platform/master-list";
import { formatCatalogId, isNumericSearchTerm } from "@/lib/campaign/catalog-codigo";
import { createMunicipioAction } from "@/app/(platform)/platform/actions";
import { MunicipioRowActions } from "@/components/platform/municipio-row-actions";
import {
  MunicipiosListFilter,
  MunicipiosPagination,
  municipioListHref,
} from "@/components/platform/municipios-list-controls";
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

export default async function MaestrasMunicipiosPage({
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

  const { data: departamentos } = await supabase
    .from("departamentos")
    .select("id, nombre")
    .order("nombre", { ascending: true });

  let query = supabase
    .from("municipios")
    .select("id, nombre, id_departamento, latitud, longitud, creado_en", { count: "exact" })
    .order("id", { ascending: true });

  const term = escapeIlikeTerm(q);
  if (term) {
    if (isNumericSearchTerm(term)) {
      query = query.eq("id", Number(term));
    } else {
      query = query.ilike("nombre", `%${term}%`);
    }
  }

  const { data: municipios, count } = await query.range(from, to);

  const total = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / MASTER_PAGE_SIZE));

  if (total > 0 && page > totalPages) {
    redirect(municipioListHref(filters, totalPages));
  }

  const rows = municipios ?? [];
  const deptMap = new Map(
    (departamentos ?? []).map((d) => [d.id, d.nombre])
  );
  const emptyMessage = q
    ? "Sin coincidencias. Prueba otro criterio de búsqueda."
    : "Sin municipios. Crea el primero arriba.";

  return (
    <>
      <PageHeader title="Municipios" />

      <Card
        title="Nuevo municipio"
        description="Agrega un municipio dentro de un departamento."
      >
        <form
          action={createMunicipioAction as unknown as (formData: FormData) => void}
          id="create-municipio-form"
        >
          <FormRow>
            <FormField label="Departamento">
              <select
                name="id_departamento"
                required
                className={platformSelectClass}
              >
                <option value="">Seleccionar departamento</option>
                {(departamentos ?? []).map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.nombre}
                  </option>
                ))}
              </select>
            </FormField>
            <FormField label="Nombre">
              <input
                name="nombre"
                placeholder="Ej. Medellín"
                required
                className={platformInputClass}
              />
            </FormField>
            <FormField label="Latitud">
              <input
                name="latitud"
                type="number"
                step="any"
                placeholder="Ej. 6.251"
                className={platformInputClass}
              />
            </FormField>
            <FormField label="Longitud">
              <input
                name="longitud"
                type="number"
                step="any"
                placeholder="Ej. -75.563"
                className={platformInputClass}
              />
            </FormField>
            <Button type="submit" className="h-10 shrink-0 px-6">
              Crear municipio
            </Button>
          </FormRow>
        </form>
      </Card>

      <Card title="Creados" description={`${total} municipio(s)`}>
        <MunicipiosListFilter q={q} />
        <DataTable
          data={rows}
          rowKey={(m) => String(m.id)}
          emptyMessage={emptyMessage}
          columns={[
            {
              key: "codigo",
              header: "ID",
              cell: (m) => formatCatalogId(m.id),
            },
            {
              key: "nombre",
              header: "Nombre",
              cell: (m) => (
                <span className="font-medium text-neutral-900">{m.nombre}</span>
              ),
            },
            {
              key: "departamento",
              header: "Departamento",
              cell: (m) => (
                <span className="text-neutral-600">
                  {deptMap.get(m.id_departamento) ?? "—"}
                </span>
              ),
            },
            {
              key: "latitud",
              header: "Latitud",
              cell: (m) =>
                m.latitud != null ? m.latitud : "—",
              className: "text-neutral-600",
            },
            {
              key: "longitud",
              header: "Longitud",
              cell: (m) =>
                m.longitud != null ? m.longitud : "—",
              className: "text-neutral-600",
            },
            {
              key: "creado",
              header: "Creado",
              cell: (m) =>
                new Date(m.creado_en).toLocaleDateString("es-CO"),
              className: "text-neutral-500",
            },
            {
              key: "acciones",
              header: "Acciones",
              className: "text-center",
              cell: (m) => (
                <MunicipioRowActions
                  municipio={m}
                  departamentos={departamentos ?? []}
                />
              ),
            },
          ]}
        />
        <MunicipiosPagination
          page={page}
          totalPages={totalPages}
          total={total}
          filters={filters}
        />
      </Card>
    </>
  );
}
