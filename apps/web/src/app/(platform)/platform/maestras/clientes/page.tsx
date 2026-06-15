import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { CreateClientForm } from "@/components/platform/create-client-form";
import { ClientRowActions } from "@/components/platform/client-row-actions";
import {
  ClientsListFilter,
  ClientsPagination,
  PAGE_SIZE,
  clientsListHref,
} from "@/components/platform/clients-list-controls";
import { escapeIlikeTerm } from "@/lib/platform/master-list";
import {
  Card,
  DataTable,
  PageHeader,
  StatusBadge,
} from "@/components/platform/platform-ui";

export default async function MaestrasClientesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; documento?: string; page?: string }>;
}) {
  const {
    q: qRaw = "",
    documento: documentoRaw = "",
    page: pageRaw = "1",
  } = await searchParams;
  const q = qRaw.trim();
  const documento = documentoRaw.trim();
  const filters = { q, documento };
  const page = Math.max(1, Number.parseInt(pageRaw, 10) || 1);
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const supabase = await createClient();

  let query = supabase
    .from("clientes")
    .select(
      "id, nombre, documento, telefono, correo_contacto, id_usuario, creado_en",
      { count: "exact" }
    )
    .order("creado_en", { ascending: false });

  const term = escapeIlikeTerm(q);
  if (term) {
    const pattern = `%${term}%`;
    query = query.or(
      `nombre.ilike.${pattern},correo_contacto.ilike.${pattern},telefono.ilike.${pattern}`
    );
  }

  const docTerm = escapeIlikeTerm(documento);
  if (docTerm) {
    query = query.ilike("documento", `%${docTerm}%`);
  }

  const { data: clientes, count } = await query.range(from, to);

  const total = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  if (total > 0 && page > totalPages) {
    redirect(clientsListHref(filters, totalPages));
  }

  const rows = clientes ?? [];

  const emptyMessage =
    q || documento
      ? "Sin coincidencias. Prueba otro criterio de búsqueda."
      : "Sin clientes. Crea el primero arriba.";

  return (
    <>
      <PageHeader title="Clientes" />

      <Card
        title="Nuevo cliente"
        description="El correo y la contraseña crean el acceso. Guárdalas al crear: no se pueden consultar después."
      >
        <CreateClientForm />
      </Card>

      <Card title="Creados" description={`${total} cliente(s)`}>
        <ClientsListFilter q={q} documento={documento} />
        <DataTable
          data={rows}
          rowKey={(c) => c.id}
          emptyMessage={emptyMessage}
          columns={[
            {
              key: "nombre",
              header: "Nombre",
              cell: (c) => (
                <span className="font-medium text-neutral-900">{c.nombre}</span>
              ),
            },
            {
              key: "documento",
              header: "Documento",
              cell: (c) => c.documento ?? "—",
            },
            {
              key: "telefono",
              header: "Teléfono",
              cell: (c) => c.telefono ?? "—",
            },
            {
              key: "correo",
              header: "Correo",
              cell: (c) => c.correo_contacto ?? "—",
            },
            {
              key: "acceso",
              header: "Acceso",
              className: "text-center",
              cell: (c) => (
                <StatusBadge variant={c.id_usuario ? "activa" : "default"}>
                  {c.id_usuario ? "Activo" : "Sin cuenta"}
                </StatusBadge>
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
              cell: (c) => <ClientRowActions cliente={c} />,
            },
          ]}
        />
        <ClientsPagination
          page={page}
          totalPages={totalPages}
          total={total}
          filters={filters}
        />
      </Card>
    </>
  );
}
