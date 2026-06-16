import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import {
  campaignIdsForQuery,
  matchingCampaignIds,
} from "@/lib/platform/campaign-list-query";
import { MASTER_PAGE_SIZE } from "@/lib/platform/master-list";
import {
  CampaignsListFilter,
  CampaignsPagination,
  GESTION_CAMPAIGNS_LIST_PATH,
  campaignsListHref,
} from "@/components/platform/campaigns-list-controls";
import {
  Card,
  DataTable,
  PageHeader,
  platformButtonClass,
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

export default async function GestionCampanasPage({
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

  const { data: campanas, count } = await campanasQuery.range(from, to);

  const total = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / MASTER_PAGE_SIZE));

  if (total > 0 && page > totalPages) {
    redirect(campaignsListHref(GESTION_CAMPAIGNS_LIST_PATH, filters, totalPages));
  }

  const rows = (campanas ?? []) as CampanaRow[];
  const emptyMessage = q
    ? "Sin coincidencias. Prueba otro criterio de búsqueda."
    : "Sin campañas. Créalas en Maestras → Campañas.";

  return (
    <>
      <PageHeader
        title="Gestión campañas"
        description="Equipo, integraciones, uso de APIs y estado operativo. Alta y baja en Maestras → Campañas."
      />

      <Card title="Campañas activas" description={`${total} campaña(s)`}>
        <CampaignsListFilter
          q={q}
          listPath={GESTION_CAMPAIGNS_LIST_PATH}
        />
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
              cell: (c) => (
                <div className="flex flex-wrap items-center justify-end gap-2">
                  <Link
                    href={`/platform/campaigns/${c.id}/integrations`}
                    className={platformButtonClass}
                  >
                    APIs
                  </Link>
                  <Link
                    href={`/platform/campaigns/${c.id}`}
                    className={platformButtonClass}
                  >
                    Gestionar
                  </Link>
                  <Link
                    href={`/campaign/${c.id}`}
                    className={platformButtonClass}
                  >
                    Abrir campaña
                  </Link>
                </div>
              ),
            },
          ]}
        />
        <CampaignsPagination
          page={page}
          totalPages={totalPages}
          total={total}
          filters={filters}
          listPath={GESTION_CAMPAIGNS_LIST_PATH}
        />
      </Card>
    </>
  );
}
