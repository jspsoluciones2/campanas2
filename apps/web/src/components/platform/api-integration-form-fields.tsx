import {
  FormField,
  FormRow,
  platformInputClass,
} from "@/components/platform/platform-ui";
import { ConfiguredSecretInput } from "@/components/platform/configured-secret-input";
import { TelegramIntegrationFormFields } from "@/components/platform/telegram-integration-form-fields";
import type { PlatformApiProveedor } from "@/lib/platform/api-integrations";

export function ApiIntegrationFormFields({
  proveedor,
  configuracion,
  configured,
  idCampana,
}: {
  proveedor: PlatformApiProveedor;
  configuracion: Record<string, unknown>;
  configured: boolean;
  idCampana?: string;
}) {
  const c = configuracion;

  switch (proveedor) {
    case "twilio":
      return (
        <>
          <FormField label="Account SID">
            <input
              name="account_sid"
              defaultValue={String(c.account_sid ?? "")}
              placeholder="ACxxxxxxxx"
              className={platformInputClass}
            />
          </FormField>
          <FormField label="Auth Token">
            <ConfiguredSecretInput name="auth_token" configured={configured} />
          </FormField>
          <FormRow>
            <FormField label="Messaging Service SID">
              <input
                name="messaging_service_sid"
                defaultValue={String(c.messaging_service_sid ?? "")}
                placeholder="MGxxxxxxxx (opcional)"
                className={platformInputClass}
              />
            </FormField>
            <FormField label="WhatsApp From">
              <input
                name="whatsapp_from"
                defaultValue={String(c.whatsapp_from ?? "")}
                placeholder="whatsapp:+57… (opcional)"
                className={platformInputClass}
              />
            </FormField>
          </FormRow>
        </>
      );
    case "ia_e14":
      return (
        <>
          <FormField label="API Key">
            <ConfiguredSecretInput name="api_key" configured={configured} />
          </FormField>
          <FormRow>
            <FormField label="Modelo">
              <input
                name="modelo"
                defaultValue={String(c.modelo ?? "")}
                placeholder="gpt-4o (opcional)"
                className={platformInputClass}
              />
            </FormField>
            <FormField label="URL base">
              <input
                name="base_url"
                defaultValue={String(c.base_url ?? "")}
                placeholder="https://api.openai.com/v1 (opcional)"
                className={platformInputClass}
              />
            </FormField>
          </FormRow>
        </>
      );
    case "telegram":
      return (
        <TelegramIntegrationFormFields
          configuracion={c}
          configured={configured}
          idCampana={idCampana}
        />
      );
    default:
      return null;
  }
}
