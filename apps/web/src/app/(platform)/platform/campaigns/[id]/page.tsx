import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  assignCampaignMemberFormAction,
  submitCampaignStatusUpdate,
  type CampaignStatus,
} from "../../actions";
import { Button } from "@/components/ui/button";

const STATUS_LABELS: Record<string, string> = {
  active: "Activa",
  paused: "Pausada",
  ended: "Finalizada",
  purged: "Purgada",
};

const NEXT_STATUS: Partial<Record<CampaignStatus, CampaignStatus[]>> = {
  active: ["paused", "ended"],
  paused: ["active", "ended"],
  ended: ["purged"],
};

const ROLE_LABELS: Record<string, string> = {
  campaign_admin: "Admin campaña",
  supervisor: "Supervisor",
  collector: "Recolector",
  lawyer: "Abogado",
};

export default async function CampaignDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: campaign } = await supabase
    .from("campaigns")
    .select(
      "id, name, status, started_at, ended_at, purged_at, clients(name), electoral_processes(name)"
    )
    .eq("id", id)
    .single();

  if (!campaign) notFound();

  const { data: members } = await supabase
    .from("campaign_members")
    .select("id, user_id, role, created_at")
    .eq("campaign_id", id)
    .order("created_at");

  const { data: features } = await supabase
    .from("campaign_features")
    .select("*")
    .eq("campaign_id", id)
    .single();

  const status = campaign.status as CampaignStatus;
  const transitions = NEXT_STATUS[status] ?? [];

  const clientName =
    (Array.isArray(campaign.clients)
      ? campaign.clients[0]?.name
      : (campaign.clients as { name: string } | null)?.name) ?? "—";
  const processName =
    (Array.isArray(campaign.electoral_processes)
      ? campaign.electoral_processes[0]?.name
      : (campaign.electoral_processes as { name: string } | null)?.name) ??
    "—";

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/platform/campaigns"
          className="text-sm text-muted-foreground hover:underline"
        >
          ← Campañas
        </Link>
        <h1 className="mt-2 text-xl font-semibold">{campaign.name}</h1>
        <p className="text-sm text-muted-foreground">
          {clientName} · {processName}
        </p>
      </div>

      <section className="rounded-lg border p-4">
        <h2 className="text-sm font-medium">Estado</h2>
        <p className="mt-1">
          <span className="rounded-full bg-muted px-2 py-0.5 text-sm">
            {STATUS_LABELS[status]}
          </span>
        </p>
        {transitions.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {transitions.map((next) => (
              <form
                key={next}
                action={submitCampaignStatusUpdate.bind(null, id, next)}
              >
                <Button type="submit" variant="outline" size="sm">
                  Marcar como {STATUS_LABELS[next].toLowerCase()}
                </Button>
              </form>
            ))}
          </div>
        )}
        {status === "ended" && (
          <p className="mt-3 text-sm text-muted-foreground">
            Export disponible (Phase 1.6). Purga manual solo cuando el dueño lo
            decida.
          </p>
        )}
      </section>

      <section className="rounded-lg border p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium">Equipo asignado</h2>
          <div className="flex gap-3 text-sm">
            <Link
              href={`/platform/campaigns/${id}/integrations`}
              className="text-primary hover:underline"
            >
              Integraciones
            </Link>
            <Link
              href={`/platform/campaigns/${id}/usage`}
              className="text-primary hover:underline"
            >
              Uso
            </Link>
          </div>
        </div>

        <form
          action={assignCampaignMemberFormAction}
          className="mt-3 flex flex-wrap gap-3"
        >
          <input type="hidden" name="campaign_id" value={id} />
          <input
            name="user_id"
            placeholder="UUID de usuario Supabase"
            required
            className="min-w-[280px] rounded-md border px-3 py-2 text-sm font-mono"
          />
          <select name="role" className="rounded-md border px-3 py-2 text-sm">
            {Object.entries(ROLE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <Button type="submit" variant="outline">
            Asignar
          </Button>
        </form>

        <ul className="mt-4 space-y-2 text-sm">
          {members?.length ? (
            members.map((m) => (
              <li
                key={m.id}
                className="flex justify-between rounded-md bg-muted/30 px-3 py-2"
              >
                <span className="font-mono text-xs">{m.user_id}</span>
                <span>{ROLE_LABELS[m.role] ?? m.role}</span>
              </li>
            ))
          ) : (
            <li className="text-muted-foreground">Sin miembros asignados.</li>
          )}
        </ul>
      </section>

      {features && (
        <section className="rounded-lg border p-4">
          <h2 className="text-sm font-medium">Módulos contratados</h2>
          <ul className="mt-2 grid grid-cols-2 gap-2 text-sm">
            <li>CAPTCHA Solver: {features.captcha_solver ? "Sí" : "No"}</li>
            <li>E14 auditoría: {features.e14_audit ? "Sí" : "No"}</li>
            <li>WhatsApp: {features.whatsapp ? "Sí" : "No"}</li>
            <li>Telegram: {features.telegram ? "Sí" : "No"}</li>
            <li>Captura web: {features.web_capture ? "Sí" : "No"}</li>
          </ul>
        </section>
      )}
    </div>
  );
}
