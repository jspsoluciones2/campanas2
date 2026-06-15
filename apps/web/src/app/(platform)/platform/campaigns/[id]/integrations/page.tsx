import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  CampaignIntegrationRowActions,
  type CampaignIntegrationRow,
} from "@/components/platform/campaign-integration-row-actions";
import {
  configSummary,
  parseIntegrationConfig,
  PLATFORM_API_PROVIDERS,
  type PlatformApiProveedor,
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

  const byProveedor = new Map(
    (integraciones ?? []).map((row) => [row.proveedor, row as IntegrationRow])
  );

  const rows: (CampaignIntegrationRow & {
    resumen: string;
    actualizado_en: string | null;
  })[] = PLATFORM_API_PROVIDERS.map((p) => {
    const saved = byProveedor.get(p.id);
    const configuracion = parseIntegrationConfig(saved?.configuracion_cifrada);
    return {
      idCampana: id,
      proveedor: p.id,
      label: p.label,
      description: p.description,
      activa: saved?.activa ?? false,
      configured: Boolean(saved),
      configuracion,
      resumen: configSummary(p.id, configuracion),
      actualizado_en: saved?.actualizado_en ?? null,
    };
  });

  return (
    <>
      <PageHeader
        title="Integraciones"
        description={`${campana.nombre} · ${nombreCliente} — cada campaña usa APIs propias para atribuir costos al cliente.`}
        backHref={`/platform/campaigns/${id}`}
        backLabel={campana.nombre}
      />

      <Card
        title="APIs de la campaña"
        description="Twilio, Capsolver e IA con credenciales independientes. El consumo registrado en Uso se asocia a esta campaña."
      >
        <DataTable
          data={rows}
          rowKey={(r) => r.proveedor}
          emptyMessage="Sin proveedores disponibles."
          columns={[
            {
              key: "proveedor",
              header: "Proveedor",
              cell: (r) => (
                <div>
                  <span className="font-medium text-neutral-900">{r.label}</span>
                  <p className="mt-0.5 text-xs text-neutral-500">{r.description}</p>
                </div>
              ),
            },
            {
              key: "resumen",
              header: "Configuración",
              cell: (r) => (
                <span className="text-sm text-neutral-600">{r.resumen}</span>
              ),
            },
            {
              key: "estado",
              header: "Estado",
              className: "text-center",
              cell: (r) => (
                <StatusBadge
                  variant={
                    r.configured && r.activa
                      ? "activa"
                      : r.configured
                        ? "default"
                        : "default"
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
              cell: (r) =>
                r.actualizado_en
                  ? new Date(r.actualizado_en).toLocaleDateString("es-CO")
                  : "—",
              className: "text-neutral-500",
            },
            {
              key: "acciones",
              header: "Acciones",
              className: "text-center",
              cell: (r) => <CampaignIntegrationRowActions row={r} />,
            },
          ]}
        />
      </Card>
    </>
  );
}
