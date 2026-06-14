"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FileSearch,
  LayoutDashboard,
  Megaphone,
  Palette,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { signOutAction } from "@/app/(platform)/platform/actions";

const NAV = [
  { href: "/platform", label: "Inicio", icon: LayoutDashboard, exact: true },
  { href: "/platform/clients", label: "Clientes", icon: Users },
  { href: "/platform/campaigns", label: "Campañas", icon: Megaphone },
  { href: "/platform/e14-runs", label: "E14", icon: FileSearch },
  { href: "/platform/settings/brand", label: "Branding", icon: Palette },
] as const;

type PlatformSidebarProps = {
  userEmail: string;
  logoUrl: string | null;
  logoAlt: string;
};

export function PlatformSidebar({
  userEmail,
  logoUrl,
  logoAlt,
}: PlatformSidebarProps) {
  const pathname = usePathname();

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
            Plataforma
          </p>
          <p className="truncate text-xs text-neutral-400">Panel dueña</p>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-1 p-3">
        {NAV.map(({ href, label, icon: Icon, exact }) => (
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

      <div className="border-t border-white/10 p-4">
        <p className="truncate text-xs text-neutral-400">{userEmail}</p>
        <form action={signOutAction} className="mt-3">
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
