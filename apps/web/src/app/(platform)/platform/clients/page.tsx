import { createClient } from "@/lib/supabase/server";
import { createClientFormAction } from "../actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  DataTable,
  FormField,
  FormRow,
  PageHeader,
  platformInputClass,
} from "@/components/platform/platform-ui";

export default async function PlatformClientsPage() {
  const supabase = await createClient();
  const { data: clientes } = await supabase
    .from("clientes")
    .select("id, nombre, documento, telefono, correo_contacto, creado_en")
    .order("creado_en", { ascending: false });

  const rows = clientes ?? [];

  return (
    <>
      <PageHeader
        title="Clientes"
        description="Políticos recurrentes — historial de campañas por cliente."
      />

      <Card
        title="Nuevo cliente"
        description="Datos básicos del político o entidad."
      >
        <form action={createClientFormAction}>
          <FormRow>
            <FormField label="Nombre">
              <input
                name="nombre"
                placeholder="Nombre completo"
                required
                className={platformInputClass}
              />
            </FormField>
            <FormField label="Documento">
              <input
                name="documento"
                placeholder="CC / NIT"
                className={platformInputClass}
              />
            </FormField>
            <FormField label="Teléfono">
              <input
                name="telefono"
                placeholder="+57 …"
                className={platformInputClass}
              />
            </FormField>
            <FormField label="Correo de contacto">
              <input
                name="correo_contacto"
                type="email"
                placeholder="correo@ejemplo.com"
                className={platformInputClass}
              />
            </FormField>
            <Button type="submit" className="h-10 shrink-0 px-6">
              Crear cliente
            </Button>
          </FormRow>
        </form>
      </Card>

      <Card title="Listado" description={`${rows.length} cliente(s) registrado(s)`}>
        <DataTable
          data={rows}
          rowKey={(c) => c.id}
          emptyMessage="Sin clientes. Crea el primero arriba."
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
              key: "creado",
              header: "Creado",
              cell: (c) =>
                new Date(c.creado_en).toLocaleDateString("es-CO"),
              className: "text-neutral-500",
            },
          ]}
        />
      </Card>
    </>
  );
}
