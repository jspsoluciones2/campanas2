import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  Card,
  DataTable,
  PageHeader,
  StatusBadge,
} from "@/components/platform/platform-ui";

const ETIQUETAS_PROVEEDOR: Record<string, string> = {
  twilio: "Twilio / WhatsApp",
  resolutor_captcha: "CAPTCHA Solver",
  telegram: "Telegram",
  ia_e14: "IA E14",
  supabase: "Supabase",
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
    .select("id, nombre")
    .eq("id", id)
    .single();

  if (!campana) notFound();

  const { data: integraciones } = await supabase
    .from("integraciones_campana")
    .select("id, proveedor, activa, actualizado_en")
    .eq("id_campana", id)
    .order("proveedor");

  const rows = integraciones ?? [];

  return (
    <>
      <PageHeader
        title="Integraciones"
        description="Credenciales por campaña — solo visible para dueños de plataforma."
        backHref={`/platform/campaigns/${id}`}
        backLabel={campana.nombre}
      />

      <Card title="Proveedores configurados">
        <DataTable
          data={rows}
          rowKey={(i) => i.id}
          emptyMessage="Sin integraciones configuradas."
          columns={[
            {
              key: "proveedor",
              header: "Proveedor",
              cell: (i) => (
                <span className="font-medium text-neutral-900">
                  {ETIQUETAS_PROVEEDOR[i.proveedor] ?? i.proveedor}
                </span>
              ),
            },
            {
              key: "estado",
              header: "Estado",
              cell: (i) => (
                <StatusBadge variant={i.activa ? "activa" : "default"}>
                  {i.activa ? "Activa" : "Inactiva"}
                </StatusBadge>
              ),
            },
            {
              key: "fecha",
              header: "Actualizado",
              cell: (i) =>
                new Date(i.actualizado_en).toLocaleDateString("es-CO"),
              className: "text-neutral-500",
            },
          ]}
        />
      </Card>
    </>
  );
}
