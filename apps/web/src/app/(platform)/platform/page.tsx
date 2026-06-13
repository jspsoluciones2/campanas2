import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function PlatformHomePage() {
  const supabase = await createClient();

  const [{ count: clientsCount }, { count: campaignsCount }] =
    await Promise.all([
      supabase.from("clients").select("*", { count: "exact", head: true }),
      supabase.from("campaigns").select("*", { count: "exact", head: true }),
    ]);

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Panel de plataforma</h1>
      <p className="text-sm text-muted-foreground">
        Administración central del SaaS — clientes, campañas e integraciones.
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        <Link
          href="/platform/clients"
          className="rounded-lg border p-4 hover:bg-muted/30"
        >
          <p className="text-2xl font-semibold">{clientsCount ?? 0}</p>
          <p className="text-sm text-muted-foreground">Clientes</p>
        </Link>
        <Link
          href="/platform/campaigns"
          className="rounded-lg border p-4 hover:bg-muted/30"
        >
          <p className="text-2xl font-semibold">{campaignsCount ?? 0}</p>
          <p className="text-sm text-muted-foreground">Campañas</p>
        </Link>
      </div>
    </div>
  );
}
