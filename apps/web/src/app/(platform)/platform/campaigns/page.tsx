import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import {
  campaignIdsForQuery,
  matchingCampaignIds,
} from "@/lib/platform/campaign-list-query";
import { MASTER_PAGE_SIZE } from "@/lib/platform/master-list";
import { CreateCampaignForm } from "@/components/platform/create-campaign-form";
import { CampaignRowActions } from "@/components/platform/campaign-row-actions";
import {
  CampaignsListFilter,
  CampaignsPagination,
  campaignsListHref,
} from "@/components/platform/campaigns-list-controls";
import {
  Card,
  DataTable,
  PageHeader,
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

export default async function PlatformCampaignsPage({
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

  const matchingIds = campaignIdsForQuery(
    await matchingCampaignIds(supabase, q)
  );

  let campanasQuery = supabase
    .from("campanas")
    .select(
      "id, nombre, estado, creado_en, clientes(nombre), procesos_electorales(nombre)",
      { count: "exact" }
    )
    .order("creado_en", { ascending: false });

  if (matchingIds) {
    campanasQuery = campanasQuery.in("id", matchingIds);
  }

  const [
    { data: campanas, count },
    { data: clientes },
    { data: procesos },
  ] = await Promise.all([
    campanasQuery.range(from, to),
    supabase.from("clientes").select("id, nombre").order("nombre"),
    supabase.from("procesos_electorales").select("id, nombre").order("nombre"),
  ]);

  const total = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / MASTER_PAGE_SIZE));

  if (total > 0 && page > totalPages) {
    redirect(campaignsListHref(filters, totalPages));
  }

  const rows = (campanas ?? []) as CampanaRow[];
  const emptyMessage = q
    ? "Sin coincidencias. Prueba otro criterio de búsqueda."
    : "Sin campañas. Crea la primera arriba (necesitas cliente y proceso en Maestras).";

  return (
    <>
      <PageHeader title="Campañas" />

      <Card
        title="Nueva campaña"
        description="Un cliente solo puede tener una campaña por proceso electoral. Crea clientes y procesos en Maestras si faltan."
      >
        <CreateCampaignForm
          clientes={clientes ?? []}
          procesos={procesos ?? []}
        />
      </Card>

      <Card title="Creadas" description={`${total} campaña(s)`}>
        <CampaignsListFilter q={q} />
        <DataTable
          data={rows}
          rowKey={(c) => c.id}
          emptyMessage={emptyMessage}
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
              key: "acciones",
              header: "Acciones",
              className: "text-right",
              cell: (c) => <CampaignRowActions campana={c} />,
            },
          ]}
        />
        <CampaignsPagination
          page={page}
          totalPages={totalPages}
          total={total}
          filters={filters}
        />
      </Card>
    </>
  );
}
