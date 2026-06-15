"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  ChevronDown,
  Database,
  FileSearch,
  LayoutDashboard,
  Megaphone,
  Palette,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { signOutAction } from "@/app/(platform)/platform/actions";

const NAV = [
  { href: "/platform", label: "Inicio", icon: LayoutDashboard, exact: true },
  { href: "/platform/e14-runs", label: "E14", icon: FileSearch },
  { href: "/platform/settings/brand", label: "Branding", icon: Palette },
] as const;

const MAESTRAS_MENU = [
  { href: "/platform/maestras/apis", label: "APIs" },
  { href: "/platform/campaigns", label: "Campañas" },
  { href: "/platform/maestras/clientes", label: "Clientes" },
  {
    href: "/platform/maestras/proceso-electoral",
    label: "Proceso electoral",
  },
] as const;

const MAESTRAS_PATHS = [
  "/platform/maestras",
  "/platform/maestras/apis",
  "/platform/maestras/proceso-electoral",
  "/platform/maestras/clientes",
  "/platform/campaigns",
];

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

  function isMaestrasActive() {
    return MAESTRAS_PATHS.some(
      (href) => pathname === href || pathname.startsWith(`${href}/`)
    );
  }

  const [maestrasOpen, setMaestrasOpen] = useState(false);
  const prevPathname = useRef(pathname);

  useEffect(() => {
    const wasMaestras = MAESTRAS_PATHS.some(
      (href) =>
        prevPathname.current === href ||
        prevPathname.current.startsWith(`${href}/`)
    );
    const isMaestras = isMaestrasActive();

    if (isMaestras && !wasMaestras) {
      setMaestrasOpen(true);
    }
    if (!isMaestras) {
      setMaestrasOpen(false);
    }

    prevPathname.current = pathname;
  }, [pathname]);

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
          <p className="truncate text-xs text-neutral-400">Panel Administrador</p>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-1 p-3">
        <Link
          href="/platform"
          data-active={isActive("/platform", true)}
          className="platform-nav-link flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors"
        >
          <LayoutDashboard className="size-4 shrink-0 opacity-80" />
          Inicio
        </Link>

        <div>
          <div
            data-active={isMaestrasActive()}
            className="platform-nav-link flex items-center gap-1 rounded-lg py-1 pr-1 pl-0 text-sm font-medium transition-colors"
          >
            <Link
              href="/platform/maestras/proceso-electoral"
              className="flex min-w-0 flex-1 items-center gap-3 rounded-lg px-3 py-1.5 transition-colors hover:bg-transparent"
            >
              <Database className="size-4 shrink-0 opacity-80" />
              <span className="flex-1">Maestras</span>
            </Link>
            <button
              type="button"
              onClick={() => setMaestrasOpen((open) => !open)}
              aria-expanded={maestrasOpen}
              aria-label={
                maestrasOpen
                  ? "Cerrar menú Maestras"
                  : "Abrir menú Maestras"
              }
              className="flex size-9 shrink-0 items-center justify-center rounded-lg text-neutral-400 transition-colors hover:bg-white/10 hover:text-white"
            >
              <ChevronDown
                className={cn(
                  "size-4 transition-transform duration-200",
                  maestrasOpen && "rotate-180"
                )}
              />
            </button>
          </div>

          <div
            className={cn(
              "grid transition-[grid-template-rows,opacity] duration-200 ease-out",
              maestrasOpen
                ? "grid-rows-[1fr] opacity-100"
                : "grid-rows-[0fr] opacity-0"
            )}
          >
            <div className="overflow-hidden">
              <ul className="platform-nav-submenu mt-1 mb-0.5 space-y-0.5 pl-4">
                {MAESTRAS_MENU.map(({ href, label }) => (
                  <li key={href}>
                    <Link
                      href={href}
                      data-active={isActive(href)}
                      className="platform-nav-sublink block rounded-md px-3 py-2 text-[13px] font-medium transition-colors"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {NAV.slice(1).map(({ href, label, icon: Icon }) => (
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
