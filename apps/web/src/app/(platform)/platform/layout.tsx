import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { signOutAction } from "./actions";
import { Button } from "@/components/ui/button";

export default async function PlatformLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  return (
    <div className="flex min-h-full">
      <aside className="flex w-56 flex-col border-r bg-muted/30 p-4">
        <p className="mb-4 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Plataforma
        </p>
        <nav className="flex flex-col gap-2 text-sm">
          <Link href="/platform">Inicio</Link>
          <Link href="/platform/clients">Clientes</Link>
          <Link href="/platform/campaigns">Campañas</Link>
          <Link href="/platform/e14-runs">E14 — ejecución</Link>
          <Link href="/platform/settings/brand">Branding</Link>
        </nav>
        <div className="mt-auto space-y-2 border-t pt-4">
          <p className="truncate text-xs text-muted-foreground">{user.email}</p>
          <form action={signOutAction}>
            <Button type="submit" variant="outline" size="sm" className="w-full">
              Salir
            </Button>
          </form>
        </div>
      </aside>
      <div className="flex-1 p-8">{children}</div>
    </div>
  );
}
