import { AssignTeamMemberForm } from "@/components/campaign/assign-team-member-form";
import { CampaignTeamMemberList } from "@/components/campaign/campaign-team-member-list";
import { Card, PageHeader } from "@/components/platform/platform-ui";
import { requireCampaignTeamManager } from "@/lib/campaign/access";
import { listCampaignMembersWithProfiles } from "@/lib/campaign/team";
import { assignCampaignTeamMemberAction } from "./actions";

export default async function CampaignTeamPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const campaignId = Number(id);
  const { supabase } = await requireCampaignTeamManager(campaignId);
  const miembros = await listCampaignMembersWithProfiles(supabase, campaignId);

  return (
    <>
      <PageHeader
        title="Equipo"
        description="Usuarios con acceso a esta campaña. Crea credenciales con nombre de usuario o correo."
      />

      <Card title="Agregar integrante">
        <AssignTeamMemberForm
          campaignId={id}
          action={assignCampaignTeamMemberAction}
        />
      </Card>

      <Card title="Integrantes asignados">
        <ul className="space-y-2">
          <CampaignTeamMemberList members={miembros} />
        </ul>
      </Card>
    </>
  );
}
