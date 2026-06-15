import type { SupabaseClient } from "@supabase/supabase-js";
import type { CSSProperties } from "react";
import type { LoginBrandConfig } from "@/lib/config/login-brand";

export type PlatformBrandConfig = {
  logoUrl: string | null;
  faviconUrl: string | null;
  colorPrimario: string;
  colorSecundario: string;
  colorAcento: string;
  colorFondoSidebar: string;
  colorFondoPagina: string;
  familiaFuente: string;
  nombrePlataforma: string;
  etiquetaPanel: string;
  textoAltLogo: string;
  subtituloLogin: string;
  textoBotonLogin: string;
  loginFondoExterior: string;
  loginFondoCentro: string;
  loginPanelFondo: string;
  loginBotonFondo: string;
};

export const FONT_OPTIONS = [
  "Inter",
  "system-ui",
  "Roboto",
  "Open Sans",
  "Poppins",
  "Montserrat",
  "Lato",
  "Nunito",
] as const;

const DEFAULTS: PlatformBrandConfig = {
  logoUrl: null,
  faviconUrl: null,
  colorPrimario: "#374151",
  colorSecundario: "#6b7280",
  colorAcento: "#1e40af",
  colorFondoSidebar: "#111827",
  colorFondoPagina: "#f3f4f6",
  familiaFuente: "Inter",
  nombrePlataforma: "Plataforma",
  etiquetaPanel: "Panel Administrador",
  textoAltLogo: "Plataforma de campañas",
  subtituloLogin: "Accede con tu usuario y contraseña",
  textoBotonLogin: "INICIAR SESIÓN",
  loginFondoExterior: "#4b5563",
  loginFondoCentro: "#9ca3af",
  loginPanelFondo: "rgba(31, 41, 55, 0.55)",
  loginBotonFondo: "#111827",
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

function strOr<T extends string>(value: string | null | undefined, fallback: T): T {
  const trimmed = value?.trim();
  return (trimmed || fallback) as T;
}

/** Icono de pestaña del navegador (solo favicon; no usa el logo del sidebar). */
export function resolveFaviconUrl(config: PlatformBrandConfig): string | null {
  return config.faviconUrl?.trim() || null;
}

type BrandRow = {
  url_logo: string | null;
  url_favicon: string | null;
  color_primario: string | null;
  color_secundario: string | null;
  color_acento: string | null;
  color_fondo_sidebar: string | null;
  color_fondo_pagina: string | null;
  familia_fuente: string | null;
  nombre_plataforma: string | null;
  etiqueta_panel: string | null;
  texto_alt_logo: string | null;
  subtitulo_login: string | null;
  texto_boton_login: string | null;
  login_fondo_exterior: string | null;
  login_fondo_centro: string | null;
  login_panel_fondo: string | null;
  login_boton_fondo: string | null;
};

function mergeBrandRow(data: BrandRow | null | undefined): PlatformBrandConfig {
  const envLogo = env("NEXT_PUBLIC_LOGIN_LOGO_URL") ?? null;

  return {
    logoUrl: data?.url_logo ?? envLogo ?? DEFAULTS.logoUrl,
    faviconUrl: data?.url_favicon ?? DEFAULTS.faviconUrl,
    colorPrimario: data?.color_primario ?? envColor(
      "NEXT_PUBLIC_PLATFORM_COLOR_PRIMARY",
      DEFAULTS.colorPrimario
    ),
    colorSecundario: data?.color_secundario ?? envColor(
      "NEXT_PUBLIC_PLATFORM_COLOR_SECONDARY",
      DEFAULTS.colorSecundario
    ),
    colorAcento: strOr(data?.color_acento, DEFAULTS.colorAcento),
    colorFondoSidebar: strOr(
      data?.color_fondo_sidebar,
      DEFAULTS.colorFondoSidebar
    ),
    colorFondoPagina: strOr(data?.color_fondo_pagina, DEFAULTS.colorFondoPagina),
    familiaFuente: strOr(data?.familia_fuente, DEFAULTS.familiaFuente),
    nombrePlataforma: strOr(data?.nombre_plataforma, DEFAULTS.nombrePlataforma),
    etiquetaPanel: strOr(data?.etiqueta_panel, DEFAULTS.etiquetaPanel),
    textoAltLogo: strOr(data?.texto_alt_logo, DEFAULTS.textoAltLogo),
    subtituloLogin: strOr(data?.subtitulo_login, DEFAULTS.subtituloLogin),
    textoBotonLogin: strOr(data?.texto_boton_login, DEFAULTS.textoBotonLogin),
    loginFondoExterior: strOr(
      data?.login_fondo_exterior,
      DEFAULTS.loginFondoExterior
    ),
    loginFondoCentro: strOr(data?.login_fondo_centro, DEFAULTS.loginFondoCentro),
    loginPanelFondo: strOr(data?.login_panel_fondo, DEFAULTS.loginPanelFondo),
    loginBotonFondo: strOr(data?.login_boton_fondo, DEFAULTS.loginBotonFondo),
  };
}

/** Valores de marca sin consultar la base de datos (solo entorno y defaults). */
export function getPlatformBrandConfigOffline(): PlatformBrandConfig {
  return mergeBrandRow(null);
}

export async function getPlatformBrandConfig(
  supabase: SupabaseClient
): Promise<PlatformBrandConfig> {
  const { data } = await supabase
    .from("configuracion_marca_plataforma")
    .select(
      "url_logo, url_favicon, color_primario, color_secundario, color_acento, color_fondo_sidebar, color_fondo_pagina, familia_fuente, nombre_plataforma, etiqueta_panel, texto_alt_logo, subtitulo_login, texto_boton_login, login_fondo_exterior, login_fondo_centro, login_panel_fondo, login_boton_fondo"
    )
    .eq("id", 1)
    .maybeSingle();

  return mergeBrandRow(data);
}

export function platformBrandToStyle(
  config: PlatformBrandConfig
): CSSProperties {
  const primary = hexToRgb(config.colorPrimario);
  const secondary = hexToRgb(config.colorSecundario);
  const accent = hexToRgb(
    HEX_COLOR.test(config.colorAcento) ? config.colorAcento : config.colorPrimario
  );

  return {
    ["--platform-sidebar" as string]: config.colorFondoSidebar,
    ["--platform-sidebar-hover" as string]: `color-mix(in srgb, ${config.colorFondoSidebar} 85%, white)`,
    ["--platform-sidebar-active" as string]: config.colorPrimario,
    ["--platform-main" as string]: config.colorFondoPagina,
    ["--platform-accent" as string]: config.colorPrimario,
    ["--platform-accent-secondary" as string]: config.colorSecundario,
    ["--platform-accent-highlight" as string]: config.colorAcento,
    ["--platform-accent-soft" as string]: `rgba(${primary.r}, ${primary.g}, ${primary.b}, 0.12)`,
    ["--platform-accent-border" as string]: `rgba(${primary.r}, ${primary.g}, ${primary.b}, 0.24)`,
    ["--platform-accent-muted-soft" as string]: `rgba(${secondary.r}, ${secondary.g}, ${secondary.b}, 0.1)`,
    ["--platform-accent-glow" as string]: `rgba(${accent.r}, ${accent.g}, ${accent.b}, 0.2)`,
    fontFamily: config.familiaFuente,
  };
}

export function platformBrandToLoginConfig(
  platform: PlatformBrandConfig
): LoginBrandConfig {
  return {
    logoUrl: platform.logoUrl,
    logoAlt: platform.textoAltLogo,
    title: platform.nombrePlataforma,
    subtitle: platform.subtituloLogin,
    buttonLabel: platform.textoBotonLogin,
    colors: {
      pageBackground: platform.loginFondoExterior,
      pageBackgroundCenter: platform.loginFondoCentro,
      cardBackground: platform.loginPanelFondo,
      cardBorder: "rgba(255, 255, 255, 0.12)",
      textPrimary: "#f9fafb",
      textMuted: "rgba(249, 250, 251, 0.75)",
      iconBoxBackground: "#1f2937",
      iconColor: "#e5e7eb",
      inputBackground: "#f3f4f6",
      inputText: "#374151",
      inputPlaceholder: "#6b7280",
      buttonBackground: platform.loginBotonFondo,
      buttonText: "#ffffff",
      buttonHover: platform.colorFondoSidebar,
      linkColor: "#f9fafb",
      checkboxBackground: "#1f2937",
      checkboxChecked: platform.colorSecundario,
    },
  };
}

export function isValidHexColor(value: string): boolean {
  return HEX_COLOR.test(value);
}

export type BrandFormInput = {
  color_primario: string;
  color_secundario: string;
  color_acento: string;
  color_fondo_sidebar: string;
  color_fondo_pagina: string;
  url_logo: string;
  url_favicon: string;
  familia_fuente: string;
  nombre_plataforma: string;
  etiqueta_panel: string;
  texto_alt_logo: string;
  subtitulo_login: string;
  texto_boton_login: string;
  login_fondo_exterior: string;
  login_fondo_centro: string;
  login_panel_fondo: string;
  login_boton_fondo: string;
};

export function validateBrandFormInput(
  input: BrandFormInput
): string | null {
  const hexFields: [string, string][] = [
    ["color primario", input.color_primario],
    ["color secundario", input.color_secundario],
    ["color de acento", input.color_acento],
    ["fondo del sidebar", input.color_fondo_sidebar],
    ["fondo de página", input.color_fondo_pagina],
    ["fondo exterior del login", input.login_fondo_exterior],
    ["fondo central del login", input.login_fondo_centro],
    ["botón del login", input.login_boton_fondo],
  ];

  for (const [label, value] of hexFields) {
    if (!isValidHexColor(value)) {
      return `El ${label} debe estar en formato #RRGGBB.`;
    }
  }

  if (!input.nombre_plataforma.trim()) {
    return "El nombre de la plataforma es obligatorio.";
  }
  if (!input.familia_fuente.trim()) {
    return "Selecciona una tipografía.";
  }
  if (!input.login_panel_fondo.trim()) {
    return "El fondo del panel de login es obligatorio.";
  }

  return null;
}

export function brandFormFromConfig(
  config: PlatformBrandConfig
): BrandFormInput {
  return {
    color_primario: config.colorPrimario,
    color_secundario: config.colorSecundario,
    color_acento: config.colorAcento,
    color_fondo_sidebar: config.colorFondoSidebar,
    color_fondo_pagina: config.colorFondoPagina,
    url_logo: config.logoUrl ?? "",
    url_favicon: config.faviconUrl ?? "",
    familia_fuente: config.familiaFuente,
    nombre_plataforma: config.nombrePlataforma,
    etiqueta_panel: config.etiquetaPanel,
    texto_alt_logo: config.textoAltLogo,
    subtitulo_login: config.subtituloLogin,
    texto_boton_login: config.textoBotonLogin,
    login_fondo_exterior: config.loginFondoExterior,
    login_fondo_centro: config.loginFondoCentro,
    login_panel_fondo: config.loginPanelFondo,
    login_boton_fondo: config.loginBotonFondo,
  };
}

export function configFromBrandFormInput(
  input: BrandFormInput
): PlatformBrandConfig {
  return {
    logoUrl: input.url_logo.trim() || null,
    faviconUrl: input.url_favicon.trim() || null,
    colorPrimario: input.color_primario.trim(),
    colorSecundario: input.color_secundario.trim(),
    colorAcento: input.color_acento.trim(),
    colorFondoSidebar: input.color_fondo_sidebar.trim(),
    colorFondoPagina: input.color_fondo_pagina.trim(),
    familiaFuente: input.familia_fuente.trim(),
    nombrePlataforma: input.nombre_plataforma.trim(),
    etiquetaPanel: input.etiqueta_panel.trim(),
    textoAltLogo: input.texto_alt_logo.trim(),
    subtituloLogin: input.subtitulo_login.trim(),
    textoBotonLogin: input.texto_boton_login.trim(),
    loginFondoExterior: input.login_fondo_exterior.trim(),
    loginFondoCentro: input.login_fondo_centro.trim(),
    loginPanelFondo: input.login_panel_fondo.trim(),
    loginBotonFondo: input.login_boton_fondo.trim(),
  };
}
