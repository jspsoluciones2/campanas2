import "@/app/(platform)/platform/platform-theme.css";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getLoginBrandConfig } from "@/lib/config/login-brand";
import { requireCampaignAccess } from "@/lib/campaign/access";
import { CampaignSidebar } from "@/components/campaign/campaign-sidebar";

export default async function CampaignLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  if (!isSupabaseConfigured()) {
    return (
      <main className="flex min-h-svh items-center justify-center bg-neutral-100 p-8">
        <p className="text-sm text-neutral-600">Configura Supabase en .env.local</p>
      </main>
    );
  }

  const { user, campana } = await requireCampaignAccess(id);
  const supabase = await createClient();

  const { data: platformMember } = await supabase
    .from("miembros_plataforma")
    .select("rol")
    .eq("id_usuario", user.id)
    .maybeSingle();

  const brand = getLoginBrandConfig();

  return (
    <div className="platform-shell flex min-h-svh">
      <CampaignSidebar
        campaignId={id}
        campaignName={campana.nombre}
        userEmail={user.email ?? "Usuario"}
        logoUrl={brand.logoUrl}
        logoAlt={brand.logoAlt}
        isPlatformOwner={Boolean(platformMember)}
      />
      <div className="platform-main flex min-w-0 flex-1 flex-col">
        <main className="flex-1 overflow-auto p-6 md:p-8">
          <div className="mx-auto max-w-6xl space-y-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
