"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  AlertTriangle,
  BookOpen,
  FileSearch,
  LayoutDashboard,
  Megaphone,
  Users,
  ArrowLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { signOutAction } from "@/app/(platform)/platform/actions";

type CampaignSidebarProps = {
  campaignId: string;
  campaignName: string;
  userEmail: string;
  logoUrl: string | null;
  logoAlt: string;
  isPlatformOwner: boolean;
};

const navItems = (id: string) =>
  [
    { href: `/campaign/${id}`, label: "Inicio", icon: LayoutDashboard, exact: true },
    { href: `/campaign/${id}/votantes`, label: "Votantes", icon: Users },
    { href: `/campaign/${id}/catalogos`, label: "Catálogos", icon: BookOpen },
    { href: `/campaign/${id}/quarantine`, label: "Cuarentena", icon: AlertTriangle },
    { href: `/campaign/${id}/e14`, label: "E14", icon: FileSearch },
  ] as const;

export function CampaignSidebar({
  campaignId,
  campaignName,
  userEmail,
  logoUrl,
  logoAlt,
  isPlatformOwner,
}: CampaignSidebarProps) {
  const pathname = usePathname();
  const items = navItems(campaignId);

  function isActive(href: string, exact?: boolean) {
    if (exact) return pathname === href;
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <aside className="platform-sidebar flex w-64 shrink-0 flex-col border-r border-white/5">
      <div className="flex items-center gap-3 border-b border-white/10 px-5 py-5">
        <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white">
          {logoUrl ? (
            <Image
              src={logoUrl}
              alt={logoAlt}
              width={32}
              height={32}
              className="size-8 object-contain"
            />
          ) : (
            <Megaphone className="size-5 text-neutral-600" />
          )}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-white">
            {campaignName}
          </p>
          <p className="truncate text-xs text-neutral-400">Campaña</p>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-1 p-3">
        {items.map(({ href, label, icon: Icon, exact }) => (
          <Link
            key={href}
            href={href}
            data-active={isActive(href, exact)}
            className={cn(
              "platform-nav-link flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors"
            )}
          >
            <Icon className="size-4 shrink-0 opacity-80" />
            {label}
          </Link>
        ))}
      </nav>

      <div className="space-y-2 border-t border-white/10 p-4">
        {isPlatformOwner && (
          <Link
            href={`/platform/campaigns/${campaignId}`}
            className="flex items-center gap-2 text-xs text-neutral-400 transition-colors hover:text-white"
          >
            <ArrowLeft className="size-3.5" />
            Administración plataforma
          </Link>
        )}
        <p className="truncate text-xs text-neutral-500">{userEmail}</p>
        <form action={signOutAction}>
          <Button
            type="submit"
            variant="outline"
            size="sm"
            className="w-full border-white/20 bg-transparent text-neutral-200 hover:bg-white/10 hover:text-white"
          >
            Cerrar sesión
          </Button>
        </form>
      </div>
    </aside>
  );
}
