import type { TelegramConfig } from "@/lib/platform/telegram-integration";
import {
  generarCodigoVinculacion,
  generarWebhookSecret,
} from "@/lib/platform/telegram-integration";

export type { TelegramConfig };

export type PlatformApiProveedor =
  | "twilio"
  | "ia_e14"
  | "telegram";

export type TwilioConfig = {
  account_sid?: string;
  auth_token?: string;
  messaging_service_sid?: string;
  whatsapp_from?: string;
};

export type IaE14Config = {
  api_key?: string;
  modelo?: string;
  base_url?: string;
};

export type PlatformApiConfig =
  | TwilioConfig
  | IaE14Config
  | TelegramConfig;

export const CAMPAIGN_BILLABLE_API_PROVIDERS: {
  id: PlatformApiProveedor;
  label: string;
  description: string;
}[] = [
  {
    id: "twilio",
    label: "Twilio",
    description: "WhatsApp y mensajería",
  },
  {
    id: "ia_e14",
    label: "IA E14",
    description: "Análisis de actas con inteligencia artificial",
  },
];

export const CAMPAIGN_TELEGRAM_INTEGRATION = {
  id: "telegram" as const,
  label: "Telegram",
  description: "Canal de captura por chat (sin costo por uso)",
};

/** APIs de pago + Telegram (canal sin costo medible). */
export const CAMPAIGN_ALL_INTEGRATION_PROVIDERS = [
  ...CAMPAIGN_BILLABLE_API_PROVIDERS,
  CAMPAIGN_TELEGRAM_INTEGRATION,
];

/** @deprecated Usar CAMPAIGN_BILLABLE_API_PROVIDERS o CAMPAIGN_ALL_INTEGRATION_PROVIDERS */
export const CAMPAIGN_API_PROVIDERS = CAMPAIGN_ALL_INTEGRATION_PROVIDERS;

/** @deprecated Usar CAMPAIGN_ALL_INTEGRATION_PROVIDERS */
export const CAMPAIGN_INTEGRATION_PROVIDERS = CAMPAIGN_ALL_INTEGRATION_PROVIDERS;

/** @deprecated Usar CAMPAIGN_BILLABLE_API_PROVIDERS */
export const PLATFORM_API_PROVIDERS = CAMPAIGN_BILLABLE_API_PROVIDERS;

export function isBillableIntegrationProvider(
  proveedor: string
): proveedor is Exclude<PlatformApiProveedor, "telegram"> {
  return proveedor !== "telegram";
}

export function providerLabel(proveedor: string): string {
  return (
    CAMPAIGN_ALL_INTEGRATION_PROVIDERS.find((p) => p.id === proveedor)?.label ??
    proveedor
  );
}

export function maskSecret(value: string | undefined): string {
  if (!value) return "—";
  if (value.length <= 4) return "••••";
  return `••••${value.slice(-4)}`;
}

/** Valor mostrado en formularios cuando el secreto ya está guardado. */
export const CONFIGURED_SECRET_MASK = "********";

export function isConfiguredSecretPlaceholder(value: string): boolean {
  return value.trim() === CONFIGURED_SECRET_MASK;
}

export function sanitizeIntegrationConfigForClient(
  config: Record<string, unknown>
): Record<string, unknown> {
  const safe = { ...config };
  delete safe.bot_token;
  delete safe.auth_token;
  delete safe.api_key;
  delete safe.proxy_password;
  delete safe.webhook_secret;
  return safe;
}

export function parseIntegrationConfig(
  raw: string | Record<string, unknown> | null | undefined
): Record<string, unknown> {
  if (!raw) return {};
  if (typeof raw === "object") return { ...raw };
  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

export function serializeIntegrationConfig(
  config: Record<string, unknown>
): string {
  return JSON.stringify(config);
}

export type SavedCampaignIntegration = {
  proveedor: PlatformApiProveedor;
  configuracion_cifrada: string;
  activa: boolean;
};

export type CampaignFeatureFlag =
  | "whatsapp"
  | "resolutor_captcha"
  | "auditoria_e14"
  | "telegram";

/** Campo en `caracteristicas_campana` para el módulo de verificación (worker externo). */
export const CAMPAIGN_FEATURE_VERIFICACION_REGISTRADURIA = "resolutor_captcha" as const;

/** Campo en `caracteristicas_campana` que refleja si el módulo está activo. */
export function campaignFeatureFlagForProvider(
  proveedor: PlatformApiProveedor
): CampaignFeatureFlag | null {
  switch (proveedor) {
    case "twilio":
      return "whatsapp";
    case "ia_e14":
      return "auditoria_e14";
    case "telegram":
      return "telegram";
    default:
      return null;
  }
}

export function buildCampaignIntegrationRows(
  idCampana: string,
  savedRows: SavedCampaignIntegration[],
  providers: ReadonlyArray<{
    id: PlatformApiProveedor;
    label: string;
    description: string;
  }> = CAMPAIGN_ALL_INTEGRATION_PROVIDERS
) {
  const byProveedor = new Map(
    savedRows.map((row) => [row.proveedor, row] as const)
  );

  return providers.map((provider) => {
    const saved = byProveedor.get(provider.id);
    const configuracion = sanitizeIntegrationConfigForClient(
      parseIntegrationConfig(saved?.configuracion_cifrada)
    );
    return {
      idCampana,
      proveedor: provider.id,
      label: provider.label,
      description: provider.description,
      activa: saved?.activa ?? false,
      configured: Boolean(saved),
      configuracion,
      resumen: configSummary(provider.id, configuracion),
    };
  });
}

export function mergeApiConfig(
  proveedor: PlatformApiProveedor,
  existing: Record<string, unknown>,
  formData: FormData
): Record<string, unknown> {
  const next = { ...existing };
  const str = (key: string) => String(formData.get(key) ?? "").trim();

  if (proveedor === "twilio") {
    const accountSid = str("account_sid");
    const authToken = str("auth_token");
    const messagingSid = str("messaging_service_sid");
    const whatsappFrom = str("whatsapp_from");
    if (accountSid) next.account_sid = accountSid;
    if (authToken && !isConfiguredSecretPlaceholder(authToken)) {
      next.auth_token = authToken;
    }
    next.messaging_service_sid = messagingSid || undefined;
    next.whatsapp_from = whatsappFrom || undefined;
  }

  if (proveedor === "ia_e14") {
    const apiKey = str("api_key");
    const modelo = str("modelo");
    const baseUrl = str("base_url");
    if (apiKey && !isConfiguredSecretPlaceholder(apiKey)) next.api_key = apiKey;
    next.modelo = modelo || undefined;
    next.base_url = baseUrl || undefined;
  }

  if (proveedor === "telegram") {
    const botToken = str("bot_token");
    if (botToken && !isConfiguredSecretPlaceholder(botToken)) {
      next.bot_token = botToken;
    }
    if (!next.codigo_vinculacion) {
      next.codigo_vinculacion = generarCodigoVinculacion();
    }
    if (!next.webhook_secret) {
      next.webhook_secret = generarWebhookSecret();
    }
  }

  for (const key of Object.keys(next)) {
    if (next[key] === undefined) delete next[key];
  }

  return next;
}

export function validateApiConfig(
  proveedor: PlatformApiProveedor,
  config: Record<string, unknown>
): string | null {
  if (proveedor === "twilio") {
    if (!config.account_sid) return "El Account SID es obligatorio.";
    if (!config.auth_token) return "El Auth Token es obligatorio.";
  }
  if (proveedor === "ia_e14" && !config.api_key) {
    return "La API key es obligatoria.";
  }
  if (proveedor === "telegram" && !config.bot_token) {
    return "El token del bot de Telegram es obligatorio.";
  }
  return null;
}

export function configSummary(
  proveedor: PlatformApiProveedor,
  config: Record<string, unknown>
): string {
  switch (proveedor) {
    case "twilio": {
      const c = config as TwilioConfig;
      const parts: string[] = [];
      if (c.account_sid) parts.push(`SID ${maskSecret(c.account_sid)}`);
      if (c.whatsapp_from) parts.push(c.whatsapp_from);
      return parts.length ? parts.join(" · ") : "Sin credenciales";
    }
    case "ia_e14": {
      const c = config as IaE14Config;
      const parts: string[] = [];
      if (c.api_key) parts.push(`API ${maskSecret(c.api_key)}`);
      if (c.modelo) parts.push(c.modelo);
      return parts.length ? parts.join(" · ") : "Sin API key";
    }
    case "telegram": {
      const c = config as TelegramConfig;
      const parts: string[] = [];
      if (c.bot_username) parts.push(`@${c.bot_username}`);
      else if (c.bot_token) parts.push(`Bot ${maskSecret(c.bot_token)}`);
      if (c.codigo_vinculacion) parts.push(`Código ${c.codigo_vinculacion}`);
      return parts.length ? parts.join(" · ") : "Sin configurar";
    }
    default:
      return "—";
  }
}

const CAMPAIGN_API_SET = new Set<string>(
  CAMPAIGN_ALL_INTEGRATION_PROVIDERS.map((p) => p.id)
);

export function isPlatformApiProveedor(
  value: string
): value is PlatformApiProveedor {
  return CAMPAIGN_API_SET.has(value);
}
