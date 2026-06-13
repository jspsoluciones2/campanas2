import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function CampaignUsagePage({
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

  const { data: usage } = await supabase
    .from("campaign_usage")
    .select("provider, metric, quantity, recorded_at")
    .eq("campaign_id", id)
    .order("recorded_at", { ascending: false })
    .limit(50);

  return (
    <div className="space-y-6">
      <div>
        <Link
          href={`/platform/campaigns/${id}`}
          className="text-sm text-muted-foreground hover:underline"
        >
          ← {campaign.name}
        </Link>
        <h1 className="mt-2 text-xl font-semibold">Uso y gastos</h1>
        <p className="text-sm text-muted-foreground">
          Panel interno — no visible para equipos de campaña.
        </p>
      </div>

      <div className="rounded-lg border">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/40 text-left">
            <tr>
              <th className="p-3 font-medium">Proveedor</th>
              <th className="p-3 font-medium">Métrica</th>
              <th className="p-3 font-medium">Cantidad</th>
              <th className="p-3 font-medium">Fecha</th>
            </tr>
          </thead>
          <tbody>
            {usage?.length ? (
              usage.map((u, idx) => (
                <tr key={idx} className="border-b last:border-0">
                  <td className="p-3">{u.provider}</td>
                  <td className="p-3">{u.metric}</td>
                  <td className="p-3">{u.quantity}</td>
                  <td className="p-3 text-muted-foreground">
                    {new Date(u.recorded_at).toLocaleDateString("es-CO")}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="p-6 text-center text-muted-foreground">
                  Sin registros de consumo aún.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
