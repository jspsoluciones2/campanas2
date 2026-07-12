"use client";

import { useSyncExternalStore } from "react";
import { ConfiguredSecretInput } from "@/components/platform/configured-secret-input";
import {
  FormField,
  platformInputClass,
} from "@/components/platform/platform-ui";
import { TelegramWebhookRegisterButton } from "@/components/platform/telegram-webhook-register-button";
import {
  isHttpsAppOrigin,
  telegramWebhookUrl,
  type TelegramConfig,
} from "@/lib/platform/telegram-integration";

function readBrowserOrigin() {
  return window.location.origin;
}

export function TelegramIntegrationFormFields({
  configuracion,
  configured,
  idCampana,
}: {
  configuracion: Record<string, unknown>;
  configured: boolean;
  idCampana?: number;
}) {
  const tgConfig = configuracion as TelegramConfig;
  const appOrigin = useSyncExternalStore(
    () => () => {},
    readBrowserOrigin,
    () => ""
  );

  const webhookUrl =
    idCampana && appOrigin ? telegramWebhookUrl(idCampana, appOrigin) : "";
  const httpsReady = isHttpsAppOrigin(appOrigin);

  return (
    <>
      <FormField label="Token del bot">
        <ConfiguredSecretInput name="bot_token" configured={configured} />
        {configured ? (
          <p className="mt-1.5 text-xs text-neutral-500">
            Si el token falla, pégalo de nuevo en el campo de abajo y pulsa{" "}
            <strong>Guardar</strong> antes de registrar el webhook.
          </p>
        ) : null}
        {configured && tgConfig.bot_username ? (
          <p className="mt-1 text-xs text-neutral-500">
            Bot: @{String(tgConfig.bot_username)}
          </p>
        ) : null}
      </FormField>
      {configured ? (
        <p className="mt-1.5 text-xs text-neutral-500">
          La primera vez que alguien use el bot, elegirá su cargo entre los
          roles de la campaña (Catálogos → Roles). Solo podrá registrar personas
          con jerarquía inferior a la suya.
        </p>
      ) : null}
      {webhookUrl ? (
        <FormField label="URL webhook">
          <input readOnly value={webhookUrl} className={platformInputClass} />
          {!httpsReady ? (
            <p className="mt-1.5 text-xs text-amber-700">
              Abre la plataforma por HTTPS (p. ej. tu URL de ngrok) para registrar
              el webhook. La misma configuración sirve en producción: solo vuelve a
              registrar desde el dominio final.
            </p>
          ) : null}
        </FormField>
      ) : null}
      {idCampana && configured ? (
        <>
          {tgConfig.webhook_registrado_en ? (
            <p className="text-xs text-green-700">
              Webhook registrado el{" "}
              {new Date(String(tgConfig.webhook_registrado_en)).toLocaleString(
                "es-CO"
              )}
              .
            </p>
          ) : httpsReady ? (
            <p className="text-xs text-amber-700">
              Token guardado, pero el webhook aún no está registrado en Telegram.
              Usa el botón «Registrar webhook».
            </p>
          ) : null}
          <TelegramWebhookRegisterButton
            idCampana={idCampana}
            httpsReady={httpsReady}
          />
        </>
      ) : null}
      <label className="flex cursor-pointer items-center gap-2 text-sm text-neutral-700">
        <input
          type="checkbox"
          name="registrar_webhook"
          defaultChecked={httpsReady}
          className="size-4 rounded border-neutral-300"
        />
        Registrar webhook al guardar
      </label>
    </>
  );
}
