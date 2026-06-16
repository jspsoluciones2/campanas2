import "@/app/(platform)/platform/platform-theme.css";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { loadPlatformBrand } from "@/lib/platform/load-platform-brand";
import { platformBrandToStyle } from "@/lib/platform/brand";
import { requireCampaignAccess, userCanManageCampaignTeam } from "@/lib/campaign/access";
import { formatAuthLoginDisplay } from "@/lib/auth/identity";
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

  const platformBrand = await loadPlatformBrand();
  const canManageTeam = await userCanManageCampaignTeam(user.id, id);

  return (
    <div
      className="platform-shell flex h-svh overflow-hidden"
      style={platformBrandToStyle(platformBrand)}
    >
      <CampaignSidebar
        campaignId={id}
        campaignName={campana.nombre}
        clientName={campana.nombreCliente}
        userEmail={
          formatAuthLoginDisplay(user.email, user.user_metadata) ??
          user.email ??
          "Usuario"
        }
        logoUrl={platformBrand.logoUrl}
        logoAlt={platformBrand.textoAltLogo}
        isPlatformOwner={Boolean(platformMember)}
        canManageTeam={canManageTeam}
      />
      <div className="platform-main flex min-h-0 min-w-0 flex-1 flex-col">
        <main className="min-h-0 flex-1 overflow-y-auto p-6 md:p-8">
          <div className="mx-auto max-w-6xl space-y-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
