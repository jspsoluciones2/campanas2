import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { providerLabel, isBillableIntegrationProvider } from "@/lib/platform/api-integrations";
import { Card, DataTable, PageHeader } from "@/components/platform/platform-ui";

export default async function CampaignUsagePage({
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

  const { data: uso } = await supabase
    .from("uso_campana")
    .select("proveedor, metrica, cantidad, registrado_en")
    .eq("id_campana", id)
    .order("registrado_en", { ascending: false })
    .limit(50);

  const rows = (uso ?? []).filter((u) =>
    isBillableIntegrationProvider(u.proveedor)
  );

  return (
    <>
      <PageHeader
        title="Uso y gastos"
        description="Panel interno — no visible para equipos de campaña."
        backHref={`/platform/campaigns/${id}`}
        backLabel={campana.nombre}
      />

      <Card
        title="Consumo reciente"
        description="Solo Twilio, Capsolver e IA E14. Telegram no genera costos medibles aquí."
      >
        <DataTable
          data={rows}
          rowKey={(u) => `${u.proveedor}-${u.metrica}-${u.registrado_en}`}
          emptyMessage="Sin registros de consumo aún."
          columns={[
            {
              key: "proveedor",
              header: "Proveedor",
              cell: (u) => (
                <span className="font-medium text-neutral-900">
                  {providerLabel(u.proveedor)}
                </span>
              ),
            },
            { key: "metrica", header: "Métrica", cell: (u) => u.metrica },
            {
              key: "cantidad",
              header: "Cantidad",
              cell: (u) => (
                <span className="tabular-nums">{u.cantidad}</span>
              ),
            },
            {
              key: "fecha",
              header: "Fecha",
              cell: (u) =>
                new Date(u.registrado_en).toLocaleDateString("es-CO"),
              className: "text-neutral-500",
            },
          ]}
        />
      </Card>
    </>
  );
}
