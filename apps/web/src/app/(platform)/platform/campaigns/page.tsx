import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import {
  createCampaignFormAction,
  createElectoralProcessFormAction,
} from "../actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  DataTable,
  FormField,
  FormRow,
  PageHeader,
  platformInputClass,
  platformSelectClass,
  StatusBadge,
} from "@/components/platform/platform-ui";

const ETIQUETAS_ESTADO: Record<string, string> = {
  activa: "Activa",
  pausada: "Pausada",
  finalizada: "Finalizada",
  purgada: "Purgada",
};

type CampanaRow = {
  id: string;
  nombre: string;
  estado: string;
  clientes: { nombre: string } | { nombre: string }[] | null;
  procesos_electorales: { nombre: string } | { nombre: string }[] | null;
};

function nombreRelacion(
  rel: { nombre: string } | { nombre: string }[] | null
): string {
  if (!rel) return "—";
  if (Array.isArray(rel)) return rel[0]?.nombre ?? "—";
  return rel.nombre;
}

export default async function PlatformCampaignsPage() {
  const supabase = await createClient();

  const [{ data: campanas }, { data: clientes }, { data: procesos }] =
    await Promise.all([
      supabase
        .from("campanas")
        .select(
          "id, nombre, estado, creado_en, clientes(nombre), procesos_electorales(nombre)"
        )
        .order("creado_en", { ascending: false }),
      supabase.from("clientes").select("id, nombre").order("nombre"),
      supabase
        .from("procesos_electorales")
        .select("id, nombre")
        .order("nombre"),
    ]);

  const rows = (campanas ?? []) as CampanaRow[];

  return (
    <>
      <PageHeader
        title="Campañas"
        description="Cada campaña es un silo aislado para una elección."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card
          title="Proceso electoral"
          description="Agrupa campañas de la misma elección (E14 compartido)."
        >
          <form action={createElectoralProcessFormAction}>
            <FormRow>
              <FormField label="Nombre">
                <input
                  name="nombre"
                  placeholder="Ej. Presidencia 2026"
                  required
                  className={platformInputClass}
                />
              </FormField>
              <FormField label="Fecha elección">
                <input
                  name="fecha_eleccion"
                  type="date"
                  className={platformInputClass}
                />
              </FormField>
              <Button type="submit" variant="outline" className="h-10 shrink-0">
                Crear proceso
              </Button>
            </FormRow>
          </form>
        </Card>

        <Card title="Nueva campaña" description="Requiere cliente y proceso electoral.">
          <form action={createCampaignFormAction}>
            <FormRow className="flex-col items-stretch">
              <FormField label="Nombre de campaña">
                <input
                  name="nombre"
                  placeholder="Nombre de campaña"
                  required
                  className={platformInputClass}
                />
              </FormField>
              <FormField label="Cliente">
                <select
                  name="id_cliente"
                  required
                  className={platformSelectClass}
                  defaultValue=""
                >
                  <option value="" disabled>
                    Seleccionar cliente
                  </option>
                  {clientes?.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nombre}
                    </option>
                  ))}
                </select>
              </FormField>
              <FormField label="Proceso electoral">
                <select
                  name="id_proceso_electoral"
                  required
                  className={platformSelectClass}
                  defaultValue=""
                >
                  <option value="" disabled>
                    Seleccionar proceso
                  </option>
                  {procesos?.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nombre}
                    </option>
                  ))}
                </select>
              </FormField>
              <Button type="submit" className="h-10 w-full sm:w-auto">
                Crear campaña
              </Button>
            </FormRow>
          </form>
        </Card>
      </div>

      <Card title="Campañas activas" description={`${rows.length} campaña(s)`}>
        <DataTable
          data={rows}
          rowKey={(c) => c.id}
          emptyMessage="Sin campañas. Crea un cliente y un proceso electoral primero."
          columns={[
            {
              key: "nombre",
              header: "Campaña",
              cell: (c) => (
                <span className="font-medium text-neutral-900">{c.nombre}</span>
              ),
            },
            {
              key: "cliente",
              header: "Cliente",
              cell: (c) => nombreRelacion(c.clientes),
            },
            {
              key: "proceso",
              header: "Proceso",
              cell: (c) => nombreRelacion(c.procesos_electorales),
            },
            {
              key: "estado",
              header: "Estado",
              cell: (c) => (
                <StatusBadge
                  variant={
                    c.estado as "activa" | "pausada" | "finalizada" | "purgada"
                  }
                >
                  {ETIQUETAS_ESTADO[c.estado] ?? c.estado}
                </StatusBadge>
              ),
            },
            {
              key: "accion",
              header: "",
              className: "text-right",
              cell: (c) => (
                <Link
                  href={`/platform/campaigns/${c.id}`}
                  className="text-sm font-medium text-neutral-900 hover:underline"
                >
                  Gestionar →
                </Link>
              ),
            },
          ]}
        />
      </Card>
    </>
  );
}
