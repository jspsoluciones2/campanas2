export type TelegramConfig = {
  bot_token?: string;
  bot_username?: string;
  webhook_secret?: string;
  codigo_vinculacion?: string;
  webhook_registrado_en?: string;
};

function normalizeAppOrigin(raw: string): string {
  const trimmed = raw.trim().replace(/\/$/, "");
  if (!trimmed) return "http://localhost:3000";
  return trimmed.startsWith("http") ? trimmed : `https://${trimmed}`;
}

/** Origen público de la app según la petición actual o variables de entorno. */
export function resolveAppPublicUrl(options?: {
  headers?: Headers;
}): string {
  if (options?.headers) {
    const host =
      options.headers.get("x-forwarded-host")?.split(",")[0]?.trim() ??
      options.headers.get("host")?.trim();
    if (host) {
      const proto =
        options.headers.get("x-forwarded-proto")?.split(",")[0]?.trim() ??
        (host.includes("localhost") || host.startsWith("127.0.0.1")
          ? "http"
          : "https");
      return normalizeAppOrigin(`${proto}://${host}`);
    }
  }

  const fromEnv =
    process.env.NEXT_PUBLIC_APP_URL?.trim() ||
    (process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "");

  return normalizeAppOrigin(fromEnv || "http://localhost:3000");
}

export function telegramWebhookUrl(campaignId: string, appOrigin?: string) {
  const base = normalizeAppOrigin(appOrigin ?? resolveAppPublicUrl());
  return `${base}/api/webhooks/telegram/${campaignId}`;
}

export function isHttpsAppOrigin(appOrigin: string): boolean {
  return appOrigin.startsWith("https://");
}

export function generarCodigoVinculacion() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export function generarWebhookSecret() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID().replace(/-/g, "");
  }
  return `tg_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 12)}`;
}

export async function registrarWebhookTelegram(
  botToken: string,
  webhookUrl: string,
  secretToken: string
): Promise<{ ok: true } | { error: string }> {
  try {
    const response = await fetch(
      `https://api.telegram.org/bot${botToken}/setWebhook`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: webhookUrl,
          secret_token: secretToken,
          allowed_updates: ["message"],
          drop_pending_updates: true,
        }),
      }
    );
    const data = (await response.json()) as {
      ok?: boolean;
      description?: string;
    };
    if (!data.ok) {
      const description = data.description ?? "No se pudo registrar el webhook en Telegram.";
      if (description === "Not Found") {
        return {
          error:
            "Token del bot inválido. Verifica el token en @BotFather, pégalo en el formulario y guarda.",
        };
      }
      return { error: description };
    }
    return { ok: true };
  } catch {
    return { error: "Error de red al contactar la API de Telegram." };
  }
}

export async function obtenerUsuarioBotTelegram(
  botToken: string
): Promise<{ username: string } | null> {
  try {
    const response = await fetch(`https://api.telegram.org/bot${botToken}/getMe`);
    const data = (await response.json()) as {
      ok?: boolean;
      result?: { username?: string };
    };
    if (!data.ok || !data.result?.username) return null;
    return { username: data.result.username };
  } catch {
    return null;
  }
}
