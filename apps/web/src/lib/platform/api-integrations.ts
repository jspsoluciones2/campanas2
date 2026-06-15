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

export type CapsolverConfig = {
  api_key?: string;
  base_url?: string;
};

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
    description: "Resolución de captchas (registraduría)",
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
      if (c.api_key) return `API ${maskSecret(c.api_key)}`;
      return "Sin API key";
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

export function isPlatformApiProveedor(value: string): value is PlatformApiProveedor {
  return PLATFORM_API_SET.has(value);
}
