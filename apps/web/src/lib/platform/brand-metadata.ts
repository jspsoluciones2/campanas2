import type { Metadata } from "next";
import {
  resolveFaviconUrl,
  type PlatformBrandConfig,
} from "@/lib/platform/brand";
import { loadPlatformBrand } from "@/lib/platform/load-platform-brand";

const DEFAULT_DESCRIPTION = "Gestión de campañas políticas — Colombia";

/** Versión para romper caché del navegador al cambiar el favicon. */
export function faviconCacheVersion(url: string): string {
  try {
    const parsed = new URL(url);
    return parsed.searchParams.get("v") ?? parsed.pathname;
  } catch {
    return url;
  }
}

export function buildAppMetadata(config: PlatformBrandConfig): Metadata {
  const faviconUrl = resolveFaviconUrl(config);
  const metadata: Metadata = {
    title: config.nombrePlataforma,
    description: DEFAULT_DESCRIPTION,
  };

  if (faviconUrl) {
    metadata.icons = {
      icon: faviconUrl,
      shortcut: faviconUrl,
      apple: faviconUrl,
    };
  }

  return metadata;
}

export async function getAppMetadata(): Promise<Metadata> {
  const config = await loadPlatformBrand();
  return buildAppMetadata(config);
}
