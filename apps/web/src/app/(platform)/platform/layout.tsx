import "./platform-theme.css";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getLoginBrandConfig } from "@/lib/config/login-brand";
import { PlatformSidebar } from "@/components/platform/platform-sidebar";

export default async function PlatformLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!isSupabaseConfigured()) {
    return (
      <main className="flex min-h-svh items-center justify-center bg-neutral-100 p-8">
        <div className="platform-card max-w-md rounded-xl p-8 text-center shadow-lg">
          <h1 className="text-xl font-semibold text-neutral-900">
            Configura Supabase primero
          </h1>
          <p className="mt-2 text-sm text-neutral-500">
            Crea <code className="text-xs">apps/web/.env.local</code> con tu URL
            y anon key.
          </p>
          <Link
            href="/"
            className="mt-6 inline-block text-sm font-medium text-neutral-800 hover:underline"
          >
            ← Volver al inicio
          </Link>
        </div>
      </main>
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const brand = getLoginBrandConfig();

  return (
    <div className="platform-shell flex min-h-svh">
      <PlatformSidebar
        userEmail={user.email ?? "Usuario"}
        logoUrl={brand.logoUrl}
        logoAlt={brand.logoAlt}
      />
      <div className="platform-main flex min-w-0 flex-1 flex-col">
        <main className="flex-1 overflow-auto p-6 md:p-8">
          <div className="mx-auto max-w-6xl space-y-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
