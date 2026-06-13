import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import {
  createCampaignFormAction,
  createElectoralProcessFormAction,
} from "../actions";
import { Button } from "@/components/ui/button";

const STATUS_LABELS: Record<string, string> = {
  active: "Activa",
  paused: "Pausada",
  ended: "Finalizada",
  purged: "Purgada",
};

export default async function PlatformCampaignsPage() {
  const supabase = await createClient();

  const [{ data: campaigns }, { data: clients }, { data: processes }] =
    await Promise.all([
      supabase
        .from("campaigns")
        .select(
          "id, name, status, created_at, clients(name), electoral_processes(name)"
        )
        .order("created_at", { ascending: false }),
      supabase.from("clients").select("id, name").order("name"),
      supabase
        .from("electoral_processes")
        .select("id, name")
        .order("name"),
    ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-semibold">Campañas</h1>
        <p className="text-sm text-muted-foreground">
          Cada campaña es un silo aislado para una elección.
        </p>
      </div>

      <section className="space-y-3 rounded-lg border p-4">
        <h2 className="text-sm font-medium">Proceso electoral</h2>
        <form
          action={createElectoralProcessFormAction}
          className="flex flex-wrap gap-3"
        >
          <input
            name="name"
            placeholder="Ej. Presidencia 2026"
            required
            className="rounded-md border px-3 py-2 text-sm"
          />
          <input
            name="election_date"
            type="date"
            className="rounded-md border px-3 py-2 text-sm"
          />
          <Button type="submit" variant="outline">
            Crear proceso
          </Button>
        </form>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-medium">Nueva campaña</h2>
        <form action={createCampaignFormAction} className="flex flex-wrap gap-3">
          <input
            name="name"
            placeholder="Nombre de campaña"
            required
            className="rounded-md border px-3 py-2 text-sm"
          />
          <select
            name="client_id"
            required
            className="rounded-md border px-3 py-2 text-sm"
            defaultValue=""
          >
            <option value="" disabled>
              Cliente
            </option>
            {clients?.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <select
            name="electoral_process_id"
            required
            className="rounded-md border px-3 py-2 text-sm"
            defaultValue=""
          >
            <option value="" disabled>
              Proceso electoral
            </option>
            {processes?.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
          <Button type="submit">Crear campaña</Button>
        </form>
      </section>

      <div className="rounded-lg border">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/40 text-left">
            <tr>
              <th className="p-3 font-medium">Campaña</th>
              <th className="p-3 font-medium">Cliente</th>
              <th className="p-3 font-medium">Proceso</th>
              <th className="p-3 font-medium">Estado</th>
              <th className="p-3 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {campaigns?.length ? (
              campaigns.map((c) => {
                const clientName =
                  (Array.isArray(c.clients)
                    ? c.clients[0]?.name
                    : (c.clients as { name: string } | null)?.name) ?? "—";
                const processName =
                  (Array.isArray(c.electoral_processes)
                    ? c.electoral_processes[0]?.name
                    : (c.electoral_processes as { name: string } | null)
                        ?.name) ?? "—";
                return (
                <tr key={c.id} className="border-b last:border-0">
                  <td className="p-3">{c.name}</td>
                  <td className="p-3 text-muted-foreground">{clientName}</td>
                  <td className="p-3 text-muted-foreground">{processName}</td>
                  <td className="p-3">
                    <span className="rounded-full bg-muted px-2 py-0.5 text-xs">
                      {STATUS_LABELS[c.status] ?? c.status}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <Link
                      href={`/platform/campaigns/${c.id}`}
                      className="text-primary hover:underline"
                    >
                      Gestionar
                    </Link>
                  </td>
                </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={5} className="p-6 text-center text-muted-foreground">
                  Sin campañas.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
