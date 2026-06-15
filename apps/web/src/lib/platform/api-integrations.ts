export type PlatformApiProveedor =
  | "twilio"
  | "resolutor_captcha"
  | "ia_e14";

export type TwilioConfig = {
  account_sid?: string;
  auth_token?: string;
  messaging_service_sid?: string;
  whatsapp_from?: string;
};

export type CapsolverProxyType = "http" | "https" | "socks5";

export type CapsolverConfig = {
  api_key?: string;
  base_url?: string;
  website_url?: string;
  website_key?: string;
  usar_proxy?: boolean;
  proxy_type?: CapsolverProxyType;
  proxy_address?: string;
  proxy_port?: number;
  proxy_login?: string;
  proxy_password?: string;
};

export const CAPSOLVER_PROXY_TYPES: {
  value: CapsolverProxyType;
  label: string;
}[] = [
  { value: "http", label: "HTTP" },
  { value: "https", label: "HTTPS" },
  { value: "socks5", label: "SOCKS5" },
];

export const CAPSOLVER_DEFAULT_WEBSITE_URL =
  "https://eleccionescolombia.registraduria.gov.co/identificacion";

export type IaE14Config = {
  api_key?: string;
  modelo?: string;
  base_url?: string;
};

export type PlatformApiConfig = TwilioConfig | CapsolverConfig | IaE14Config;

export const PLATFORM_API_PROVIDERS: {
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
    id: "resolutor_captcha",
    label: "Capsolver",
    description: "reCAPTCHA registraduría + proxy residencial",
  },
  {
    id: "ia_e14",
    label: "IA E14",
    description: "Análisis de actas con inteligencia artificial",
  },
];

export function providerLabel(proveedor: string): string {
  return (
    PLATFORM_API_PROVIDERS.find((p) => p.id === proveedor)?.label ?? proveedor
  );
}

export function maskSecret(value: string | undefined): string {
  if (!value) return "—";
  if (value.length <= 4) return "••••";
  return `••••${value.slice(-4)}`;
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
    if (authToken) next.auth_token = authToken;
    next.messaging_service_sid = messagingSid || undefined;
    next.whatsapp_from = whatsappFrom || undefined;
  }

  if (proveedor === "resolutor_captcha") {
    const apiKey = str("api_key");
    const baseUrl = str("base_url");
    const websiteUrl = str("website_url");
    const websiteKey = str("website_key");
    const usarProxy = formData.get("usar_proxy") === "on";
    const proxyType = str("proxy_type");
    const proxyAddress = str("proxy_address");
    const proxyPortRaw = str("proxy_port");
    const proxyLogin = str("proxy_login");
    const proxyPassword = str("proxy_password");

    if (apiKey) next.api_key = apiKey;
    next.base_url = baseUrl || undefined;
    next.website_url = websiteUrl || undefined;
    next.website_key = websiteKey || undefined;
    next.usar_proxy = usarProxy;

    if (usarProxy) {
      if (proxyType) next.proxy_type = proxyType as CapsolverProxyType;
      if (proxyAddress) next.proxy_address = proxyAddress;
      if (proxyPortRaw) {
        const port = Number.parseInt(proxyPortRaw, 10);
        if (!Number.isNaN(port)) next.proxy_port = port;
      }
      if (proxyLogin) next.proxy_login = proxyLogin;
      if (proxyPassword) next.proxy_password = proxyPassword;
    } else {
      delete next.proxy_type;
      delete next.proxy_address;
      delete next.proxy_port;
      delete next.proxy_login;
      delete next.proxy_password;
    }
  }

  if (proveedor === "ia_e14") {
    const apiKey = str("api_key");
    const modelo = str("modelo");
    const baseUrl = str("base_url");
    if (apiKey) next.api_key = apiKey;
    next.modelo = modelo || undefined;
    next.base_url = baseUrl || undefined;
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
  if (proveedor === "resolutor_captcha") {
    if (!config.api_key) return "La API key de CapSolver es obligatoria.";
    if (config.usar_proxy) {
      const c = config as CapsolverConfig;
      if (!c.proxy_type) return "Selecciona el tipo de proxy.";
      if (!c.proxy_address) return "La dirección del proxy es obligatoria.";
      if (!c.proxy_port) return "El puerto del proxy es obligatorio.";
    }
    return null;
  }
  if (proveedor === "ia_e14" && !config.api_key) {
    return "La API key es obligatoria.";
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
    case "resolutor_captcha": {
      const c = config as CapsolverConfig;
      const parts: string[] = [];
      if (c.api_key) parts.push(`API ${maskSecret(c.api_key)}`);
      if (c.usar_proxy && c.proxy_address) {
        parts.push(`Proxy ${c.proxy_type ?? "http"}://${c.proxy_address}`);
      } else if (c.usar_proxy === false) {
        parts.push("ProxyLess");
      }
      return parts.length ? parts.join(" · ") : "Sin configurar";
    }
    case "ia_e14": {
      const c = config as IaE14Config;
      const parts: string[] = [];
      if (c.api_key) parts.push(`API ${maskSecret(c.api_key)}`);
      if (c.modelo) parts.push(c.modelo);
      return parts.length ? parts.join(" · ") : "Sin API key";
    }
    default:
      return "—";
  }
}

const PLATFORM_API_SET = new Set<string>(
  PLATFORM_API_PROVIDERS.map((p) => p.id)
);

export function isPlatformApiProveedor(
  value: string
): value is PlatformApiProveedor {
  return PLATFORM_API_SET.has(value);
}

/** Payload createTask de CapSolver listo para enviar a la API. */
export function buildCapsolverCreateTask(
  config: CapsolverConfig,
  websiteKey?: string
): Record<string, unknown> | null {
  if (!config.api_key) return null;

  const key = websiteKey || config.website_key;
  if (!key) return null;

  const websiteURL = config.website_url || CAPSOLVER_DEFAULT_WEBSITE_URL;
  const usarProxy = config.usar_proxy !== false;

  const task: Record<string, unknown> = {
    type: usarProxy ? "ReCaptchaV2Task" : "ReCaptchaV2TaskProxyLess",
    websiteURL,
    websiteKey: key,
  };

  if (usarProxy && config.proxy_address && config.proxy_port) {
    task.proxyType = config.proxy_type ?? "http";
    task.proxyAddress = config.proxy_address;
    task.proxyPort = config.proxy_port;
    if (config.proxy_login) task.proxyLogin = config.proxy_login;
    if (config.proxy_password) task.proxyPassword = config.proxy_password;
  }

  return {
    clientKey: config.api_key,
    task,
  };
}
