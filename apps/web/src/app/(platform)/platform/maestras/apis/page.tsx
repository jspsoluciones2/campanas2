import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { CampaignApisManager } from "@/components/platform/campaign-apis-manager";
import {
  ApisListFilter,
  ApisPagination,
  apisListHref,
  PAGE_SIZE,
} from "@/components/platform/apis-list-controls";
import {
  buildCampaignIntegrationRows,
  CAMPAIGN_BILLABLE_API_PROVIDERS,
  CAMPAIGN_TELEGRAM_INTEGRATION,
  type SavedCampaignIntegration,
} from "@/lib/platform/api-integrations";
import {
  campaignIdsForQuery,
  matchingCampaignIds,
} from "@/lib/platform/campaign-list-query";
import {
  Card,
  DataTable,
  PageHeader,
} from "@/components/platform/platform-ui";

type CampanaRow = {
  id: string;
  nombre: string;
  clientes: { nombre: string } | { nombre: string }[] | null;
};

function nombreCliente(
  rel: { nombre: string } | { nombre: string }[] | null
): string {
  if (!rel) return "—";
  if (Array.isArray(rel)) return rel[0]?.nombre ?? "—";
  return rel.nombre;
}

export default async function MaestrasApisPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const { q: qRaw = "", page: pageRaw = "1" } = await searchParams;
  const q = qRaw.trim();
  const filters = { q };
  const page = Math.max(1, Number.parseInt(pageRaw, 10) || 1);
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const supabase = await createClient();

  const matchingIds = campaignIdsForQuery(
    await matchingCampaignIds(supabase, q)
  );

  let campanasQuery = supabase
    .from("campanas")
    .select("id, nombre, clientes(nombre)", { count: "exact" })
    .order("nombre", { ascending: true });

  if (matchingIds) {
    campanasQuery = campanasQuery.in("id", matchingIds);
  }

  const { data: campanas, count } = await campanasQuery.range(from, to);
  const total = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  if (total > 0 && page > totalPages) {
    redirect(apisListHref(filters, totalPages));
  }

  const campaignRows = (campanas ?? []) as CampanaRow[];
  const campaignIds = campaignRows.map((c) => c.id);

  const integracionesByCampana = new Map<string, SavedCampaignIntegration[]>();

  if (campaignIds.length > 0) {
    const { data: integraciones } = await supabase
      .from("integraciones_campana")
      .select("id_campana, proveedor, configuracion_cifrada, activa")
      .in("id_campana", campaignIds);

    for (const row of (integraciones ?? []) as (SavedCampaignIntegration & {
      id_campana: string;
    })[]) {
      const list = integracionesByCampana.get(row.id_campana) ?? [];
      list.push({
        proveedor: row.proveedor,
        configuracion_cifrada: row.configuracion_cifrada,
        activa: row.activa,
      });
      integracionesByCampana.set(row.id_campana, list);
    }
  }

  const billableRowsByCampana = new Map(
    campaignRows.map((c) => [
      c.id,
      buildCampaignIntegrationRows(
        c.id,
        integracionesByCampana.get(c.id) ?? [],
        CAMPAIGN_BILLABLE_API_PROVIDERS
      ),
    ])
  );

  const telegramRowsByCampana = new Map(
    campaignRows.map((c) => [
      c.id,
      buildCampaignIntegrationRows(
        c.id,
        integracionesByCampana.get(c.id) ?? [],
        [CAMPAIGN_TELEGRAM_INTEGRATION]
      ),
    ])
  );

  const allRowsByCampana = new Map(
    campaignRows.map((c) => [
      c.id,
      buildCampaignIntegrationRows(
        c.id,
        integracionesByCampana.get(c.id) ?? []
      ),
    ])
  );

  const emptyMessage = q
    ? "Sin campañas que coincidan con la búsqueda."
    : "Sin campañas. Créalas en Maestras → Campañas.";

  return (
    <>
      <PageHeader
        title="APIs por campaña"
        description="Twilio e IA E14 con control de gastos por campaña. Telegram se configura aparte como canal sin costo."
      />

      <Card
        title="APIs con costo"
        description="Credenciales de servicios de pago. El consumo se ve en Uso y gastos."
      >
        <ApisListFilter q={q} />
        <DataTable
          data={campaignRows}
          rowKey={(c) => c.id}
          emptyMessage={emptyMessage}
          columns={[
            {
              key: "campana",
              header: "Campaña",
              cell: (c) => (
                <div>
                  <span className="font-medium text-neutral-900">{c.nombre}</span>
                  <p className="mt-0.5 text-xs text-neutral-500">
                    {nombreCliente(c.clientes)}
                  </p>
                </div>
              ),
            },
            ...CAMPAIGN_BILLABLE_API_PROVIDERS.map((provider) => ({
              key: provider.id,
              header: provider.label,
              className: "text-center",
              cell: (c: CampanaRow) => {
                const rows = billableRowsByCampana.get(c.id) ?? [];
                const row = rows.find((r) => r.proveedor === provider.id);
                if (!row) return "—";

                return (
                  <CampaignApisManager
                    campaignId={c.id}
                    campaignName={c.nombre}
                    integrations={allRowsByCampana.get(c.id) ?? []}
                    variant="cell"
                    provider={provider.id}
                    configured={row.configured}
                    activa={row.activa}
                  />
                );
              },
            })),
            {
              key: "acciones",
              header: "Acciones",
              className: "text-center",
              cell: (c) => (
                <CampaignApisManager
                  campaignId={c.id}
                  campaignName={c.nombre}
                  integrations={allRowsByCampana.get(c.id) ?? []}
                  variant="row"
                  scope="billable"
                />
              ),
            },
          ]}
        />
        <ApisPagination
          page={page}
          totalPages={totalPages}
          total={total}
          filters={filters}
        />
      </Card>

      <Card
        title="Telegram (canal)"
        description="Bot de captura. No participa en Uso ni en gastos."
      >
        <DataTable
          data={campaignRows}
          rowKey={(c) => `tg-${c.id}`}
          emptyMessage={emptyMessage}
          columns={[
            {
              key: "campana",
              header: "Campaña",
              cell: (c) => (
                <span className="font-medium text-neutral-900">{c.nombre}</span>
              ),
            },
            {
              key: "telegram",
              header: "Telegram",
              className: "text-center",
              cell: (c) => {
                const rows = telegramRowsByCampana.get(c.id) ?? [];
                const row = rows[0];
                if (!row) return "—";

                return (
                  <CampaignApisManager
                    campaignId={c.id}
                    campaignName={c.nombre}
                    integrations={allRowsByCampana.get(c.id) ?? []}
                    variant="cell"
                    provider="telegram"
                    configured={row.configured}
                    activa={row.activa}
                  />
                );
              },
            },
          ]}
        />
      </Card>
    </>
  );
}
