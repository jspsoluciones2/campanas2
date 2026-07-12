import { requireCampaignAccess } from "@/lib/campaign/access";
import { Card, EmptyState, PageHeader } from "@/components/platform/platform-ui";

export default async function CampaignE14Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const campaignId = Number(id);
  await requireCampaignAccess(campaignId);

  return (
    <>
      <PageHeader
        title="E14"
        description="Auditoría electoral compartida — solo lectura para la campaña."
      />
      <Card>
        <EmptyState
          title="Fase 8 — en construcción"
          description="Verás aquí el resultado del análisis E14 cuando el módulo esté contratado y ejecutado por la plataforma."
        />
      </Card>
    </>
  );
}
