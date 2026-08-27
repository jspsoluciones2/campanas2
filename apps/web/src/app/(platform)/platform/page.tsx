import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import {
  costosPorCampana,
  formatCosto,
} from "@/lib/platform/campaign-costs";
import {
  Card,
  DataTable,
  PageHeader,
  StatCard,
} from "@/components/platform/platform-ui";
import { GsapReveal } from "@/components/ui/gsap-reveal";

type CampanaRow = {
  id: number;
  nombre: string;
  clientes: { nombre: string } | { nombre: string }[] | null;
};

function nombreCliente(
  rel: CampanaRow["clientes"]
): string {
  if (!rel) return "—";
  if (Array.isArray(rel)) return rel[0]?.nombre ?? "—";
  return rel.nombre;
}

export default async function PlatformHomePage() {
  const supabase = await createClient();

  const [
    { count: totalClientes },
    { count: totalCampanas },
    { data: campanas },
    { data: uso },
  ] = await Promise.all([
    supabase.from("clientes").select("*", { count: "exact", head: true }),
    supabase.from("campanas").select("*", { count: "exact", head: true }),
    supabase
      .from("campanas")
      .select("id, nombre, creado_en, clientes(nombre)")
      .order("creado_en", { ascending: false }),
    supabase
      .from("uso_campana")
      .select("id_campana, proveedor, metrica, cantidad"),
  ]);

  const filas = (campanas ?? []) as CampanaRow[];

  return (
    <>
      <PageHeader
        title="Panel Principal"
        description="Dueño de plataforma - Administrador"
      />

      <GsapReveal
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        stagger={0.08}
      >
        <StatCard
          label="Clientes"
          value={totalClientes ?? 0}
          href="/platform/maestras/clientes"
        />
        <StatCard
          label="Campañas"
          value={totalCampanas ?? 0}
          href="/platform/campaigns"
        />
        <StatCard label="Usuarios activos" value="—" />
      </GsapReveal>

      <Card
        variant="accent"
        title="Costos por campaña"
        description="Detalle de los costos asociados a cada campaña"
      >
        <DataTable
          data={filas}
          rowKey={(c) => String(c.id)}
          emptyMessage="Sin campañas. Créalas en Maestras → Campañas."
          columns={[
            {
              key: "cliente",
              header: "Cliente",
              cell: (c) => (
                <span className="font-medium text-neutral-900">
                  {nombreCliente(c.clientes)}
                </span>
              ),
            },
            {
              key: "campana",
              header: "Campaña",
              cell: (c) => (
                <Link
                  href={`/platform/campaigns/${c.id}?from=inicio`}
                  className="text-neutral-800 hover:underline"
                >
                  {c.nombre}
                </Link>
              ),
            },
            {
              key: "ia",
              header: "Costo IA",
              cell: (c) => formatCosto(costosPorCampana(c.id, uso).ia),
              className: "tabular-nums text-neutral-600",
            },
            {
              key: "total",
              header: "Costo Total",
              cell: (c) => {
                const costos = costosPorCampana(c.id, uso);
                return (
                  <span className="font-semibold text-neutral-900">
                    {formatCosto(costos.total)}
                  </span>
                );
              },
              className: "tabular-nums",
            },
          ]}
        />
      </Card>
    </>
  );
}
