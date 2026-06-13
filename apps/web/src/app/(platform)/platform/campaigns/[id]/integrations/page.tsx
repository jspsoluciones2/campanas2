import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const PROVIDER_LABELS: Record<string, string> = {
  twilio: "Twilio / WhatsApp",
  captcha_solver: "CAPTCHA Solver",
  telegram: "Telegram",
  e14_ai: "IA E14",
};

export default async function CampaignIntegrationsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: campaign } = await supabase
    .from("campaigns")
    .select("id, name")
    .eq("id", id)
    .single();

  if (!campaign) notFound();

  const { data: integrations } = await supabase
    .from("campaign_integrations")
    .select("id, provider, is_active, updated_at")
    .eq("campaign_id", id)
    .order("provider");

  return (
    <div className="space-y-6">
      <div>
        <Link
          href={`/platform/campaigns/${id}`}
          className="text-sm text-muted-foreground hover:underline"
        >
          ← {campaign.name}
        </Link>
        <h1 className="mt-2 text-xl font-semibold">Integraciones</h1>
        <p className="text-sm text-muted-foreground">
          Credenciales por campaña — solo visible para dueños de plataforma.
        </p>
      </div>

      <div className="rounded-lg border">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/40 text-left">
            <tr>
              <th className="p-3 font-medium">Proveedor</th>
              <th className="p-3 font-medium">Estado</th>
              <th className="p-3 font-medium">Actualizado</th>
            </tr>
          </thead>
          <tbody>
            {integrations?.length ? (
              integrations.map((i) => (
                <tr key={i.id} className="border-b last:border-0">
                  <td className="p-3">
                    {PROVIDER_LABELS[i.provider] ?? i.provider}
                  </td>
                  <td className="p-3">
                    {i.is_active ? "Activa" : "Inactiva"}
                  </td>
                  <td className="p-3 text-muted-foreground">
                    {new Date(i.updated_at).toLocaleDateString("es-CO")}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={3} className="p-6 text-center text-muted-foreground">
                  Sin integraciones configuradas. UI de edición en Phase 7.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
