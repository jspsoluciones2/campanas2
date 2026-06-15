import {
  FormField,
  FormRow,
  platformInputClass,
  platformSelectClass,
} from "@/components/platform/platform-ui";
import {
  CAPSOLVER_DEFAULT_WEBSITE_URL,
  CAPSOLVER_PROXY_TYPES,
  type PlatformApiProveedor,
} from "@/lib/platform/api-integrations";

export function ApiIntegrationFormFields({
  proveedor,
  configuracion,
  configured,
}: {
  proveedor: PlatformApiProveedor;
  configuracion: Record<string, unknown>;
  configured: boolean;
}) {
  const c = configuracion;
  const secretPlaceholder = configured ? "Dejar vacío para no cambiar" : "";

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
            <input
              name="auth_token"
              type="password"
              placeholder={secretPlaceholder}
              autoComplete="off"
              className={platformInputClass}
            />
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
    case "resolutor_captcha": {
      const usarProxy = c.usar_proxy !== false;
      const proxyType = String(c.proxy_type ?? "http");

      return (
        <>
          <p className="text-sm font-medium text-neutral-800">CapSolver</p>
          <FormField label="API Key (clientKey)">
            <input
              name="api_key"
              type="password"
              placeholder={secretPlaceholder}
              autoComplete="off"
              className={platformInputClass}
            />
          </FormField>
          <FormField label="URL base API">
            <input
              name="base_url"
              defaultValue={String(c.base_url ?? "")}
              placeholder="https://api.capsolver.com (opcional)"
              className={platformInputClass}
            />
          </FormField>
          <FormRow>
            <FormField label="URL del sitio (websiteURL)">
              <input
                name="website_url"
                defaultValue={String(
                  c.website_url ?? CAPSOLVER_DEFAULT_WEBSITE_URL
                )}
                placeholder={CAPSOLVER_DEFAULT_WEBSITE_URL}
                className={platformInputClass}
              />
            </FormField>
            <FormField label="SiteKey reCAPTCHA (websiteKey)">
              <input
                name="website_key"
                defaultValue={String(c.website_key ?? "")}
                placeholder="Opcional: el scraper puede extraerlo del iframe"
                className={platformInputClass}
              />
            </FormField>
          </FormRow>

          <p className="pt-2 text-sm font-medium text-neutral-800">
            Proxy residencial CapSolver
          </p>
          <p className="text-xs text-neutral-500">
            Obligatorio para Registraduría: usa ReCaptchaV2Task con la misma IP
            del scraping. Desactiva solo para pruebas ProxyLess.
          </p>
          <label className="flex cursor-pointer items-center gap-2 text-sm text-neutral-700">
            <input
              type="checkbox"
              name="usar_proxy"
              defaultChecked={usarProxy}
              className="size-4 rounded border-neutral-300"
            />
            Usar proxy en createTask (ReCaptchaV2Task)
          </label>

          <FormRow>
            <FormField label="Tipo (proxyType)">
              <select
                name="proxy_type"
                defaultValue={proxyType}
                className={platformSelectClass}
              >
                {CAPSOLVER_PROXY_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </FormField>
            <FormField label="Puerto (proxyPort)">
              <input
                name="proxy_port"
                type="number"
                min={1}
                max={65535}
                defaultValue={c.proxy_port != null ? String(c.proxy_port) : ""}
                placeholder="12345"
                className={platformInputClass}
              />
            </FormField>
          </FormRow>
          <FormField label="Host (proxyAddress)">
            <input
              name="proxy_address"
              defaultValue={String(c.proxy_address ?? "")}
              placeholder="proxy.capsolver.com o IP del endpoint"
              className={platformInputClass}
            />
          </FormField>
          <FormRow>
            <FormField label="Usuario (proxyLogin)">
              <input
                name="proxy_login"
                defaultValue={String(c.proxy_login ?? "")}
                placeholder="Residential-…-zone-custom"
                className={platformInputClass}
              />
            </FormField>
            <FormField label="Contraseña (proxyPassword)">
              <input
                name="proxy_password"
                type="password"
                placeholder={secretPlaceholder}
                autoComplete="off"
                className={platformInputClass}
              />
            </FormField>
          </FormRow>
        </>
      );
    }
    case "ia_e14":
      return (
        <>
          <FormField label="API Key">
            <input
              name="api_key"
              type="password"
              placeholder={secretPlaceholder}
              autoComplete="off"
              className={platformInputClass}
            />
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
    default:
      return null;
  }
}
