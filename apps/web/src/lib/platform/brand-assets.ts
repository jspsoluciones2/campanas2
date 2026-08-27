export const PLATFORM_ASSETS_BUCKET = "platform-assets";

export const BRAND_ASSET_MAX_BYTES = 2 * 1024 * 1024;

export const BRAND_IMAGE_MIME_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/svg+xml",
]);

export const FAVICON_MIME_TYPES = new Set([
  ...BRAND_IMAGE_MIME_TYPES,
  "image/x-icon",
  "image/vnd.microsoft.icon",
]);

export type BrandAssetKind = "logo" | "favicon";

const EXT_BY_MIME: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/svg+xml": "svg",
  "image/x-icon": "ico",
  "image/vnd.microsoft.icon": "ico",
};

export function brandAssetStoragePath(kind: BrandAssetKind, mime: string): string {
  const ext = EXT_BY_MIME[mime] ?? "png";
  return `brand/${kind}.${ext}`;
}

export function validateBrandAssetFile(
  file: File,
  kind: BrandAssetKind
): string | null {
  const allowed =
    kind === "favicon" ? FAVICON_MIME_TYPES : BRAND_IMAGE_MIME_TYPES;

  if (!allowed.has(file.type)) {
    return kind === "logo"
      ? "Formato no válido. Usa PNG, JPG, WebP o SVG."
      : "Formato no válido. Usa PNG, JPG, WebP, SVG o ICO.";
  }

  if (file.size > BRAND_ASSET_MAX_BYTES) {
    return "El archivo supera el límite de 2 MB.";
  }

  return null;
}

export const BRAND_COLOR_PRESETS = [
  {
    id: "el-nodo",
    label: "El Nodo",
    colors: {
      color_primario: "#6439F8",
      color_secundario: "#0091E7",
      color_acento: "#00DDB2",
      color_fondo_sidebar: "#0E1422",
      color_fondo_pagina: "#EDEEEF",
      login_fondo_exterior: "#0E1422",
      login_fondo_centro: "#6439F8",
      login_boton_fondo: "#6439F8",
    },
  },
  {
    id: "gris",
    label: "Gris profesional",
    colors: {
      color_primario: "#374151",
      color_secundario: "#6b7280",
      color_acento: "#1f2937",
      color_fondo_sidebar: "#111827",
      color_fondo_pagina: "#f3f4f6",
      login_fondo_exterior: "#4b5563",
      login_fondo_centro: "#9ca3af",
      login_boton_fondo: "#111827",
    },
  },
  {
    id: "azul",
    label: "Azul institucional",
    colors: {
      color_primario: "#1e40af",
      color_secundario: "#64748b",
      color_acento: "#2563eb",
      color_fondo_sidebar: "#0f172a",
      color_fondo_pagina: "#f1f5f9",
      login_fondo_exterior: "#1e3a8a",
      login_fondo_centro: "#60a5fa",
      login_boton_fondo: "#1d4ed8",
    },
  },
  {
    id: "verde",
    label: "Verde campaña",
    colors: {
      color_primario: "#166534",
      color_secundario: "#6b7280",
      color_acento: "#22c55e",
      color_fondo_sidebar: "#14532d",
      color_fondo_pagina: "#f0fdf4",
      login_fondo_exterior: "#166534",
      login_fondo_centro: "#86efac",
      login_boton_fondo: "#15803d",
    },
  },
] as const;
