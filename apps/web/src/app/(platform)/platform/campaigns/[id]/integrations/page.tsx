import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  CampaignIntegrationRowActions,
  type CampaignIntegrationRow,
} from "@/components/platform/campaign-integration-row-actions";
import {
  buildCampaignIntegrationRows,
  CAMPAIGN_BILLABLE_API_PROVIDERS,
  CAMPAIGN_TELEGRAM_INTEGRATION,
  type PlatformApiProveedor,
  type SavedCampaignIntegration,
} from "@/lib/platform/api-integrations";
import {
  Card,
  DataTable,
  PageHeader,
  StatusBadge,
} from "@/components/platform/platform-ui";

type IntegrationRow = {
  proveedor: PlatformApiProveedor;
  configuracion_cifrada: string;
  activa: boolean;
  actualizado_en: string;
};

function integrationTableColumns() {
  return [
    {
      key: "proveedor",
      header: "Proveedor",
      cell: (r: CampaignIntegrationRow & { resumen: string }) => (
        <div>
          <span className="font-medium text-neutral-900">{r.label}</span>
          <p className="mt-0.5 text-xs text-neutral-500">{r.description}</p>
        </div>
      ),
    },
    {
      key: "resumen",
      header: "Configuración",
      cell: (r: CampaignIntegrationRow & { resumen: string }) => (
        <span className="text-sm text-neutral-600">{r.resumen}</span>
      ),
    },
    {
      key: "estado",
      header: "Estado",
      className: "text-center",
      cell: (r: CampaignIntegrationRow & { resumen: string }) => (
        <StatusBadge
          variant={
            r.configured && r.activa ? "activa" : "default"
          }
        >
          {!r.configured
            ? "Sin configurar"
            : r.activa
              ? "Activa"
              : "Inactiva"}
        </StatusBadge>
      ),
    },
    {
      key: "actualizado",
      header: "Actualizado",
      cell: (r: CampaignIntegrationRow & {
        resumen: string;
        actualizado_en: string | null;
      }) =>
        r.actualizado_en
          ? new Date(r.actualizado_en).toLocaleDateString("es-CO")
          : "—",
      className: "text-neutral-500",
    },
    {
      key: "acciones",
      header: "Acciones",
      className: "text-center",
      cell: (r: CampaignIntegrationRow & { resumen: string }) => (
        <CampaignIntegrationRowActions row={r} />
      ),
    },
  ] as const;
}

export default async function CampaignIntegrationsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: campana } = await supabase
    .from("campanas")
    .select("id, nombre, clientes(nombre)")
    .eq("id", id)
    .single();

  if (!campana) notFound();

  const nombreCliente =
    (Array.isArray(campana.clientes)
      ? campana.clientes[0]?.nombre
      : (campana.clientes as { nombre: string } | null)?.nombre) ?? "—";

  const { data: integraciones } = await supabase
    .from("integraciones_campana")
    .select("proveedor, configuracion_cifrada, activa, actualizado_en")
    .eq("id_campana", id);

  const savedRows = (integraciones ?? []).map((row) => {
    const r = row as IntegrationRow;
    return {
      proveedor: r.proveedor,
      configuracion_cifrada: r.configuracion_cifrada,
      activa: r.activa,
    } satisfies SavedCampaignIntegration;
  });

  const byProveedor = new Map(
    (integraciones ?? []).map((row) => [row.proveedor, row as IntegrationRow])
  );

  const mapRows = (
    providers: ReadonlyArray<{
      id: PlatformApiProveedor;
      label: string;
      description: string;
    }>
  ) =>
    buildCampaignIntegrationRows(id, savedRows, providers).map((row) => ({
      ...row,
      actualizado_en: byProveedor.get(row.proveedor)?.actualizado_en ?? null,
    }));

  const apiRows = mapRows(CAMPAIGN_BILLABLE_API_PROVIDERS);
  const telegramRows = mapRows([CAMPAIGN_TELEGRAM_INTEGRATION]);

  return (
    <>
      <PageHeader
        title="Integraciones"
        description={`${campana.nombre} · ${nombreCliente} — APIs de pago por campaña; Telegram es canal de captura sin costo medible.`}
        backHref={`/platform/campaigns/${id}`}
        backLabel={campana.nombre}
      />

      <Card
        title="APIs con costo"
        description="Twilio, Capsolver e IA E14. El consumo se registra en Uso y gastos."
      >
        <DataTable
          data={apiRows}
          rowKey={(r) => r.proveedor}
          emptyMessage="Sin proveedores disponibles."
          columns={[...integrationTableColumns()]}
        />
      </Card>

      <Card
        title="Telegram"
        description="Bot de captura por chat. No genera costos en el panel de uso."
      >
        <DataTable
          data={telegramRows}
          rowKey={(r) => r.proveedor}
          emptyMessage="Sin configuración de Telegram."
          columns={[...integrationTableColumns()]}
        />
      </Card>
    </>
  );
}
