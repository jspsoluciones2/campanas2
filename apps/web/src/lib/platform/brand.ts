import type { SupabaseClient } from "@supabase/supabase-js";
import type { CSSProperties } from "react";

export type PlatformBrandConfig = {
  logoUrl: string | null;
  colorPrimario: string;
  colorSecundario: string;
  familiaFuente: string;
};

const DEFAULTS: PlatformBrandConfig = {
  logoUrl: null,
  colorPrimario: "#374151",
  colorSecundario: "#6b7280",
  familiaFuente: "Inter",
};

const HEX_COLOR = /^#[0-9A-Fa-f]{6}$/;

function env(key: string): string | undefined {
  const value = process.env[key]?.trim();
  return value || undefined;
}

function envColor(key: string, fallback: string): string {
  const value = env(key);
  return value && HEX_COLOR.test(value) ? value : fallback;
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const h = hex.replace("#", "");
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  };
}

export async function getPlatformBrandConfig(
  supabase: SupabaseClient
): Promise<PlatformBrandConfig> {
  const { data } = await supabase
    .from("configuracion_marca_plataforma")
    .select("url_logo, color_primario, color_secundario, familia_fuente")
    .eq("id", 1)
    .maybeSingle();

  const envLogo = env("NEXT_PUBLIC_LOGIN_LOGO_URL") ?? null;

  return {
    logoUrl: data?.url_logo ?? envLogo ?? DEFAULTS.logoUrl,
    colorPrimario: data?.color_primario ?? envColor(
      "NEXT_PUBLIC_PLATFORM_COLOR_PRIMARY",
      DEFAULTS.colorPrimario
    ),
    colorSecundario: data?.color_secundario ?? envColor(
      "NEXT_PUBLIC_PLATFORM_COLOR_SECONDARY",
      DEFAULTS.colorSecundario
    ),
    familiaFuente: data?.familia_fuente ?? DEFAULTS.familiaFuente,
  };
}

export function platformBrandToStyle(
  config: PlatformBrandConfig
): CSSProperties {
  const primary = hexToRgb(config.colorPrimario);
  const secondary = hexToRgb(config.colorSecundario);

  return {
    ["--platform-accent" as string]: config.colorPrimario,
    ["--platform-accent-secondary" as string]: config.colorSecundario,
    ["--platform-accent-soft" as string]: `rgba(${primary.r}, ${primary.g}, ${primary.b}, 0.12)`,
    ["--platform-accent-border" as string]: `rgba(${primary.r}, ${primary.g}, ${primary.b}, 0.24)`,
    ["--platform-accent-muted-soft" as string]: `rgba(${secondary.r}, ${secondary.g}, ${secondary.b}, 0.1)`,
    fontFamily: config.familiaFuente,
  };
}

export function isValidHexColor(value: string): boolean {
  return HEX_COLOR.test(value);
}
