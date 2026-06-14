/**
 * Apariencia del login — configurable por variables de entorno.
 * Más adelante puede leerse de `configuracion_marca_plataforma` en Supabase.
 *
 * Variables opcionales en apps/web/.env.local:
 * - NEXT_PUBLIC_LOGIN_LOGO_URL   → URL del logo (círculo superior)
 * - NEXT_PUBLIC_LOGIN_TITLE        → Título bajo el logo (vacío = oculto)
 * - NEXT_PUBLIC_LOGIN_BUTTON_LABEL → Texto del botón (default: INICIAR SESIÓN)
 * - NEXT_PUBLIC_LOGIN_BG           → Fondo exterior
 * - NEXT_PUBLIC_LOGIN_CARD_BG      → Panel del formulario
 * - NEXT_PUBLIC_LOGIN_BUTTON_BG    → Botón principal
 */

export type LoginBrandColors = {
  pageBackground: string;
  pageBackgroundCenter: string;
  cardBackground: string;
  cardBorder: string;
  textPrimary: string;
  textMuted: string;
  iconBoxBackground: string;
  iconColor: string;
  inputBackground: string;
  inputText: string;
  inputPlaceholder: string;
  buttonBackground: string;
  buttonText: string;
  buttonHover: string;
  linkColor: string;
  checkboxBackground: string;
  checkboxChecked: string;
};

export type LoginBrandConfig = {
  logoUrl: string | null;
  logoAlt: string;
  title: string;
  subtitle: string;
  buttonLabel: string;
  colors: LoginBrandColors;
};

const DEFAULT_COLORS: LoginBrandColors = {
  pageBackground: "#4b5563",
  pageBackgroundCenter: "#9ca3af",
  cardBackground: "rgba(31, 41, 55, 0.55)",
  cardBorder: "rgba(255, 255, 255, 0.12)",
  textPrimary: "#f9fafb",
  textMuted: "rgba(249, 250, 251, 0.75)",
  iconBoxBackground: "#1f2937",
  iconColor: "#e5e7eb",
  inputBackground: "#f3f4f6",
  inputText: "#374151",
  inputPlaceholder: "#6b7280",
  buttonBackground: "#111827",
  buttonText: "#ffffff",
  buttonHover: "#030712",
  linkColor: "#f9fafb",
  checkboxBackground: "#1f2937",
  checkboxChecked: "#9ca3af",
};

function env(key: string): string | undefined {
  const value = process.env[key]?.trim();
  return value || undefined;
}

export function getLoginBrandConfig(): LoginBrandConfig {
  return {
    logoUrl: env("NEXT_PUBLIC_LOGIN_LOGO_URL") ?? null,
    logoAlt: env("NEXT_PUBLIC_LOGIN_LOGO_ALT") ?? "Plataforma de campañas",
    title: env("NEXT_PUBLIC_LOGIN_TITLE") ?? "",
    subtitle:
      env("NEXT_PUBLIC_LOGIN_SUBTITLE") ??
      "Accede con tu usuario y contraseña",
    buttonLabel: env("NEXT_PUBLIC_LOGIN_BUTTON_LABEL") ?? "INICIAR SESIÓN",
    colors: {
      ...DEFAULT_COLORS,
      ...(env("NEXT_PUBLIC_LOGIN_BG") && {
        pageBackground: env("NEXT_PUBLIC_LOGIN_BG")!,
      }),
      ...(env("NEXT_PUBLIC_LOGIN_BG_CENTER") && {
        pageBackgroundCenter: env("NEXT_PUBLIC_LOGIN_BG_CENTER")!,
      }),
      ...(env("NEXT_PUBLIC_LOGIN_CARD_BG") && {
        cardBackground: env("NEXT_PUBLIC_LOGIN_CARD_BG")!,
      }),
      ...(env("NEXT_PUBLIC_LOGIN_BUTTON_BG") && {
        buttonBackground: env("NEXT_PUBLIC_LOGIN_BUTTON_BG")!,
      }),
    },
  };
}

export function loginBrandToStyle(
  config: LoginBrandConfig
): Record<string, string> {
  const { colors: c } = config;
  return {
    ["--login-page-bg" as string]: c.pageBackground,
    ["--login-page-bg-center" as string]: c.pageBackgroundCenter,
    ["--login-card-bg" as string]: c.cardBackground,
    ["--login-card-border" as string]: c.cardBorder,
    ["--login-text" as string]: c.textPrimary,
    ["--login-text-muted" as string]: c.textMuted,
    ["--login-icon-box" as string]: c.iconBoxBackground,
    ["--login-icon" as string]: c.iconColor,
    ["--login-input-bg" as string]: c.inputBackground,
    ["--login-input-text" as string]: c.inputText,
    ["--login-input-placeholder" as string]: c.inputPlaceholder,
    ["--login-button-bg" as string]: c.buttonBackground,
    ["--login-button-text" as string]: c.buttonText,
    ["--login-button-hover" as string]: c.buttonHover,
    ["--login-link" as string]: c.linkColor,
    ["--login-checkbox-bg" as string]: c.checkboxBackground,
    ["--login-checkbox-checked" as string]: c.checkboxChecked,
  };
}
