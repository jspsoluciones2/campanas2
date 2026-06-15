import { requireCampaignAccess } from "@/lib/campaign/access";
import { Card, EmptyState, PageHeader } from "@/components/platform/platform-ui";

export default async function QuarantinePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await requireCampaignAccess(id);

  return (
    <>
      <PageHeader
        title="Cuarentena"
        description="Duplicados y conflictos dentro de esta campaña."
        backHref={`/campaign/${id}`}
        backLabel="Inicio campaña"
      />
      <Card>
        <EmptyState
          title="Fase 2.3 — en construcción"
          description="Aquí revisarás votantes en conflicto detectados entre recolectores de la misma campaña."
        />
      </Card>
    </>
  );
}
