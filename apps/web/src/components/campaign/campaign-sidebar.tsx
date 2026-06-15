"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  ArrowLeft,
  BookOpen,
  ChevronDown,
  FileSearch,
  LayoutDashboard,
  Megaphone,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { signOutAction } from "@/app/(platform)/platform/actions";
import {
  CATALOG_DEFAULT_SEGMENT,
  CATALOG_MENU,
  catalogSegmentPath,
  isCatalogPath,
} from "@/lib/campaign/catalog-nav";

type CampaignSidebarProps = {
  campaignId: string;
  campaignName: string;
  clientName: string | null;
  userEmail: string;
  logoUrl: string | null;
  logoAlt: string;
  isPlatformOwner: boolean;
};

type CampaignNavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  exact?: boolean;
};

const otherNavItems = (id: string): CampaignNavItem[] => [
  { href: `/campaign/${id}/votantes`, label: "Votantes", icon: Users },
  { href: `/campaign/${id}/quarantine`, label: "Cuarentena", icon: AlertTriangle },
  { href: `/campaign/${id}/e14`, label: "E14", icon: FileSearch },
];

export function CampaignSidebar({
  campaignId,
  campaignName,
  clientName,
  userEmail,
  logoUrl,
  logoAlt,
  isPlatformOwner,
}: CampaignSidebarProps) {
  const pathname = usePathname();
  const catalogDefaultHref = catalogSegmentPath(
    campaignId,
    CATALOG_DEFAULT_SEGMENT
  );

  function isActive(href: string, exact?: boolean) {
    if (exact) return pathname === href;
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  const catalogActive = isCatalogPath(pathname, campaignId);
  const [menuState, setMenuState] = useState<{
    forPath: string;
    open: boolean;
  } | null>(null);
  const catalogOpen =
    menuState?.forPath === pathname ? menuState.open : catalogActive;

  function toggleCatalogMenu() {
    const current =
      menuState?.forPath === pathname ? menuState.open : catalogActive;
    setMenuState({ forPath: pathname, open: !current });
  }

  return (
    <aside className="platform-sidebar flex h-svh w-64 shrink-0 flex-col border-r border-white/5">
      <div className="flex shrink-0 items-center gap-3 border-b border-white/10 px-5 py-5">
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
          <p className="truncate text-xs text-neutral-400">
            {clientName ?? "—"}
          </p>
        </div>
      </div>

      <nav className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto p-3">
        <Link
          href={`/campaign/${campaignId}`}
          data-active={isActive(`/campaign/${campaignId}`, true)}
          className="platform-nav-link flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors"
        >
          <LayoutDashboard className="size-4 shrink-0 opacity-80" />
          Inicio
        </Link>

        <div>
          <div
            data-active={catalogActive}
            className="platform-nav-link flex items-center gap-1 rounded-lg py-1 pr-1 pl-0 text-sm font-medium transition-colors"
          >
            <Link
              href={catalogDefaultHref}
              className="flex min-w-0 flex-1 items-center gap-3 rounded-lg px-3 py-1.5 transition-colors hover:bg-transparent"
            >
              <BookOpen className="size-4 shrink-0 opacity-80" />
              <span className="flex-1">Catálogos</span>
            </Link>
            <button
              type="button"
              onClick={toggleCatalogMenu}
              aria-expanded={catalogOpen}
              aria-label={
                catalogOpen ? "Cerrar menú Catálogos" : "Abrir menú Catálogos"
              }
              className="flex size-9 shrink-0 items-center justify-center rounded-lg text-neutral-400 transition-colors hover:bg-white/10 hover:text-white"
            >
              <ChevronDown
                className={cn(
                  "size-4 transition-transform duration-200",
                  catalogOpen && "rotate-180"
                )}
              />
            </button>
          </div>

          <div
            className={cn(
              "grid transition-[grid-template-rows,opacity] duration-200 ease-out",
              catalogOpen
                ? "grid-rows-[1fr] opacity-100"
                : "grid-rows-[0fr] opacity-0"
            )}
          >
            <div className="overflow-hidden">
              <ul className="platform-nav-submenu mt-1 mb-0.5 space-y-0.5 pl-4">
                {CATALOG_MENU.map(({ segment, label }) => {
                  const href = catalogSegmentPath(campaignId, segment);
                  return (
                    <li key={segment}>
                      <Link
                        href={href}
                        data-active={isActive(href)}
                        className="platform-nav-sublink block rounded-md px-3 py-2 text-[13px] font-medium transition-colors"
                      >
                        {label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </div>

        {otherNavItems(campaignId).map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            data-active={isActive(href)}
            className="platform-nav-link flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors"
          >
            <Icon className="size-4 shrink-0 opacity-80" />
            {label}
          </Link>
        ))}
      </nav>

      <div className="shrink-0 border-t border-white/10 p-4 pb-10">
        <div className="flex flex-col gap-4">
          {isPlatformOwner && (
            <Link
              href={`/platform/campaigns/${campaignId}`}
              className="flex items-center gap-2 rounded-lg px-2 py-2 text-xs text-neutral-400 transition-colors hover:bg-white/5 hover:text-white"
            >
              <ArrowLeft className="size-3.5 shrink-0" />
              <span>Administración plataforma</span>
            </Link>
          )}
          <div className="space-y-3">
            <p
              className="break-all text-xs leading-relaxed text-neutral-400"
              title={userEmail}
            >
              {userEmail}
            </p>
            <form action={signOutAction}>
              <Button
                type="submit"
                variant="outline"
                size="sm"
                className="h-9 w-full border-white/20 bg-transparent text-neutral-200 hover:bg-white/10 hover:text-white"
              >
                Cerrar sesión
              </Button>
            </form>
          </div>
        </div>
      </div>
    </aside>
  );
}
