import {
  CAMPAIGN_MEMBER_ROLE_LABELS,
  type CampaignMemberRole,
} from "@/lib/campaign/member-auth";
import type { CampaignMemberWithProfile } from "@/lib/campaign/team";
import { StatusBadge } from "@/components/platform/platform-ui";

export function CampaignTeamMemberList({
  members,
}: {
  members: CampaignMemberWithProfile[];
}) {
  if (!members.length) {
    return (
      <li className="rounded-lg border border-dashed border-neutral-200 py-8 text-center text-sm text-neutral-500">
        Sin miembros asignados.
      </li>
    );
  }

  return (
    <>
      {members.map((member) => (
        <li
          key={member.id}
          className="flex items-center justify-between gap-4 rounded-lg border border-neutral-100 bg-neutral-50/50 px-4 py-3 text-sm"
        >
          <div className="min-w-0">
            <p className="truncate font-medium text-neutral-900">
              {member.nombre ?? member.usuario ?? "Usuario sin nombre"}
            </p>
            {member.usuario && member.nombre ? (
              <p className="truncate text-xs text-neutral-500">{member.usuario}</p>
            ) : null}
          </div>
          <StatusBadge variant="default">
            {CAMPAIGN_MEMBER_ROLE_LABELS[member.rol as CampaignMemberRole] ??
              member.rol}
          </StatusBadge>
        </li>
      ))}
    </>
  );
}
