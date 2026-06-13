import { createClient } from "@/lib/supabase/server";
import { createClientFormAction } from "../actions";
import { Button } from "@/components/ui/button";

export default async function PlatformClientsPage() {
  const supabase = await createClient();
  const { data: clients } = await supabase
    .from("clients")
    .select("id, name, contact_email, created_at")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-semibold">Clientes</h1>
        <p className="text-sm text-muted-foreground">
          Políticos recurrentes — historial de campañas por cliente.
        </p>
      </div>

      <form action={createClientFormAction} className="flex max-w-lg flex-wrap gap-3">
        <input
          name="name"
          placeholder="Nombre del cliente"
          required
          className="flex-1 rounded-md border px-3 py-2 text-sm"
        />
        <input
          name="contact_email"
          type="email"
          placeholder="Correo de contacto"
          className="flex-1 rounded-md border px-3 py-2 text-sm"
        />
        <Button type="submit">Crear cliente</Button>
      </form>

      <div className="rounded-lg border">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/40 text-left">
            <tr>
              <th className="p-3 font-medium">Nombre</th>
              <th className="p-3 font-medium">Correo</th>
              <th className="p-3 font-medium">Creado</th>
            </tr>
          </thead>
          <tbody>
            {clients?.length ? (
              clients.map((c) => (
                <tr key={c.id} className="border-b last:border-0">
                  <td className="p-3">{c.name}</td>
                  <td className="p-3 text-muted-foreground">
                    {c.contact_email ?? "—"}
                  </td>
                  <td className="p-3 text-muted-foreground">
                    {new Date(c.created_at).toLocaleDateString("es-CO")}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={3} className="p-6 text-center text-muted-foreground">
                  Sin clientes. Crea el primero arriba.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
