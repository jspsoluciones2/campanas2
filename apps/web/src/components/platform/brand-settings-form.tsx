"use client";

import Image from "next/image";
import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, Palette, Sparkles, Type } from "lucide-react";
import { updatePlatformBrandAction } from "@/app/(platform)/platform/actions";
import { BrandImageUpload } from "@/components/platform/brand-image-upload";
import { Button } from "@/components/ui/button";
import {
  FormField,
  FormRow,
  platformInputClass,
  platformSelectClass,
} from "@/components/platform/platform-ui";
import { BRAND_COLOR_PRESETS } from "@/lib/platform/brand-assets";
import {
  FONT_OPTIONS,
  type BrandFormInput,
  configFromBrandFormInput,
  platformBrandToLoginConfig,
  platformBrandToStyle,
} from "@/lib/platform/brand";
import { loginBrandToStyle } from "@/lib/config/login-brand";
import { cn } from "@/lib/utils";

const TABS = [
  { id: "identidad", label: "Logo y nombre", icon: Sparkles },
  { id: "apariencia", label: "Colores", icon: Palette },
  { id: "login", label: "Pantalla de acceso", icon: Type },
] as const;

type TabId = (typeof TABS)[number]["id"];

function ColorField({
  label,
  name,
  value,
  onChange,
  hint,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (name: string, value: string) => void;
  hint?: string;
}) {
  return (
    <FormField label={label}>
      <div className="flex items-center gap-3">
        <input
          type="color"
          name={name}
          value={value}
          onChange={(e) => onChange(name, e.target.value)}
          className="platform-input size-11 shrink-0 cursor-pointer rounded-lg border border-neutral-200 bg-white p-1"
        />
        <div className="min-w-0 flex-1">
          <input
            value={value}
            onChange={(e) => onChange(name, e.target.value)}
            className={cn(platformInputClass, "font-mono text-xs")}
            pattern="^#[0-9A-Fa-f]{6}$"
          />
          {hint ? <p className="mt-1 text-xs text-neutral-500">{hint}</p> : null}
        </div>
      </div>
    </FormField>
  );
}

function PreviewPanel({ values }: { values: BrandFormInput }) {
  const config = useMemo(() => configFromBrandFormInput(values), [values]);
  const panelStyle = useMemo(() => platformBrandToStyle(config), [config]);
  const loginStyle = useMemo(
    () => loginBrandToStyle(platformBrandToLoginConfig(config)),
    [config]
  );
  const logoUrl = values.url_logo.trim();

  return (
    <div className="space-y-4 lg:sticky lg:top-6">
      <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">
        Vista previa en tiempo real
      </p>

      <div
        className="overflow-hidden rounded-xl border border-neutral-200 shadow-sm"
        style={panelStyle}
      >
        <p className="border-b border-neutral-200 bg-white px-4 py-2 text-xs font-medium text-neutral-600">
          Panel administrador
        </p>
        <div className="flex min-h-[150px]">
          <div
            className="w-32 shrink-0 p-3 text-xs"
            style={{ background: "var(--platform-sidebar)", color: "#e5e7eb" }}
          >
            <div className="mb-2 flex size-9 items-center justify-center overflow-hidden rounded-lg bg-white">
              {logoUrl ? (
                <Image
                  src={logoUrl}
                  alt=""
                  width={28}
                  height={28}
                  className="object-contain"
                  unoptimized
                />
              ) : (
                <span className="text-[10px] font-bold text-neutral-500">Logo</span>
              )}
            </div>
            <p className="truncate font-semibold">{config.nombrePlataforma}</p>
            <p className="truncate text-[10px] opacity-70">{config.etiquetaPanel}</p>
            <div
              className="mt-3 rounded-md px-2 py-1.5 text-[10px] font-medium"
              style={{ background: "var(--platform-sidebar-active)" }}
            >
              Inicio
            </div>
          </div>
          <div className="flex-1 p-4" style={{ background: "var(--platform-main)" }}>
            <div
              className="rounded-lg border bg-white p-3"
              style={{
                borderColor: "var(--platform-accent-border)",
                boxShadow: "0 4px 12px var(--platform-accent-soft)",
              }}
            >
              <p
                className="text-sm font-semibold"
                style={{ color: "var(--platform-accent)" }}
              >
                Costos por campaña
              </p>
              <p className="mt-2 text-xs text-neutral-500">
                Fuente: {config.familiaFuente}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div
        className="overflow-hidden rounded-xl border border-neutral-200 shadow-sm"
        style={loginStyle}
      >
        <p
          className="border-b px-4 py-2 text-xs font-medium"
          style={{
            borderColor: "var(--login-card-border)",
            color: "var(--login-text-muted)",
          }}
        >
          Pantalla de acceso
        </p>
        <div
          className="flex items-center justify-center p-6"
          style={{
            background: `linear-gradient(180deg, var(--login-page-bg) 0%, var(--login-page-bg-center) 100%)`,
          }}
        >
          <div
            className="w-full max-w-[240px] rounded-xl px-5 py-6 text-center"
            style={{
              background: "var(--login-card-bg)",
              border: "1px solid var(--login-card-border)",
            }}
          >
            <div
              className="mx-auto mb-3 flex size-14 items-center justify-center overflow-hidden rounded-full"
              style={{
                background: "var(--login-icon-box)",
              }}
            >
              {logoUrl ? (
                <Image
                  src={logoUrl}
                  alt=""
                  width={40}
                  height={40}
                  className="object-contain"
                  unoptimized
                />
              ) : (
                <span
                  className="text-xs font-bold"
                  style={{ color: "var(--login-icon)" }}
                >
                  Logo
                </span>
              )}
            </div>
            <p
              className="text-sm font-semibold"
              style={{ color: "var(--login-text)" }}
            >
              {config.nombrePlataforma}
            </p>
            <p
              className="mt-1 text-xs"
              style={{ color: "var(--login-text-muted)" }}
            >
              {config.subtituloLogin}
            </p>
            <div
              className="mt-4 rounded-lg py-2.5 text-xs font-semibold tracking-wide"
              style={{
                background: "var(--login-button-bg)",
                color: "var(--login-button-text)",
              }}
            >
              {config.textoBotonLogin}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function BrandSettingsForm({ initial }: { initial: BrandFormInput }) {
  const [values, setValues] = useState(initial);
  const [tab, setTab] = useState<TabId>("identidad");
  const [advancedLogin, setAdvancedLogin] = useState(false);
  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const router = useRouter();

  const setField = (name: string, value: string) => {
    setValues((prev) => ({ ...prev, [name]: value }));
    setSaved(false);
  };

  const applyPreset = (presetId: string) => {
    const preset = BRAND_COLOR_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;
    setValues((prev) => ({ ...prev, ...preset.colors }));
    setSaved(false);
  };

  const syncLoginFromPanel = () => {
    setValues((prev) => ({
      ...prev,
      login_fondo_exterior: prev.color_fondo_sidebar,
      login_fondo_centro: prev.color_secundario,
      login_boton_fondo: prev.color_primario,
      login_panel_fondo: "rgba(31, 41, 55, 0.55)",
    }));
    setSaved(false);
  };

  const handleSave = () => {
    startTransition(async () => {
      const formData = new FormData();
      for (const [key, value] of Object.entries(values)) {
        formData.append(key, value);
      }

      const result = await updatePlatformBrandAction(formData);
      if (result?.error) {
        window.alert(result.error);
        return;
      }
      setSaved(true);
      router.refresh();
    });
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handleSave();
      }}
      className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_320px]"
    >
      <div className="space-y-6">
        <div className="flex flex-wrap gap-2 rounded-xl border border-neutral-200 bg-neutral-50/80 p-1.5">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={cn(
                "inline-flex h-10 flex-1 min-w-[140px] items-center justify-center gap-2 rounded-lg px-4 text-sm font-medium transition-colors",
                tab === id
                  ? "bg-white text-neutral-900 shadow-sm"
                  : "text-neutral-600 hover:bg-white/60 hover:text-neutral-900"
              )}
            >
              <Icon className="size-4 shrink-0 opacity-70" />
              {label}
            </button>
          ))}
        </div>

        {tab === "identidad" ? (
          <section className="space-y-6 rounded-xl border border-neutral-200 bg-white p-6">
            <div>
              <h3 className="text-base font-semibold text-neutral-900">
                Imágenes de marca
              </h3>
              <p className="mt-1 text-sm text-neutral-500">
                Sube el logo y el favicon. Se guardan al instante en Supabase
                Storage.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-[1fr_auto]">
              <BrandImageUpload
                kind="logo"
                label="Logo principal"
                hint="PNG, JPG, WebP o SVG · máximo 2 MB"
                currentUrl={values.url_logo}
                onChange={(url) => setField("url_logo", url)}
                variant="logo"
              />
              <div className="md:w-48">
                <BrandImageUpload
                  kind="favicon"
                  label="Favicon"
                  hint="Solo pestaña del navegador · ICO o imagen cuadrada"
                  currentUrl={values.url_favicon}
                  onChange={(url) => setField("url_favicon", url)}
                  variant="favicon"
                />
              </div>
            </div>

            <input type="hidden" name="url_logo" value={values.url_logo} readOnly />
            <input type="hidden" name="url_favicon" value={values.url_favicon} readOnly />

            <div className="border-t border-neutral-100 pt-6">
              <h3 className="text-sm font-semibold text-neutral-900">
                Textos visibles
              </h3>
              <FormRow className="mt-4">
                <FormField label="Nombre de la plataforma">
                  <input
                    name="nombre_plataforma"
                    value={values.nombre_plataforma}
                    onChange={(e) => setField("nombre_plataforma", e.target.value)}
                    placeholder="Ej. Campañas Pro"
                    required
                    className={platformInputClass}
                  />
                </FormField>
                <FormField label="Subtítulo del panel">
                  <input
                    name="etiqueta_panel"
                    value={values.etiqueta_panel}
                    onChange={(e) => setField("etiqueta_panel", e.target.value)}
                    placeholder="Panel Administrador"
                    className={platformInputClass}
                  />
                </FormField>
              </FormRow>
              <FormField label="Descripción del logo (accesibilidad)">
                <input
                  name="texto_alt_logo"
                  value={values.texto_alt_logo}
                  onChange={(e) => setField("texto_alt_logo", e.target.value)}
                  placeholder="Logo de mi plataforma"
                  className={platformInputClass}
                />
              </FormField>
            </div>
          </section>
        ) : null}

        {tab === "apariencia" ? (
          <section className="space-y-6 rounded-xl border border-neutral-200 bg-white p-6">
            <div>
              <h3 className="text-base font-semibold text-neutral-900">
                Paletas rápidas
              </h3>
              <p className="mt-1 text-sm text-neutral-500">
                Elige un estilo base y ajusta los colores si lo necesitas.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {BRAND_COLOR_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => applyPreset(preset.id)}
                    className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-neutral-50 px-4 py-2 text-sm font-medium text-neutral-800 transition-colors hover:border-neutral-300 hover:bg-white"
                  >
                    <span
                      className="size-3 rounded-full border border-white shadow-sm"
                      style={{ background: preset.colors.color_primario }}
                    />
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <ColorField
                label="Color principal"
                name="color_primario"
                value={values.color_primario}
                onChange={setField}
                hint="Botones activos y destacados"
              />
              <ColorField
                label="Color secundario"
                name="color_secundario"
                value={values.color_secundario}
                onChange={setField}
                hint="Textos y detalles suaves"
              />
              <ColorField
                label="Color de acento"
                name="color_acento"
                value={values.color_acento}
                onChange={setField}
              />
              <ColorField
                label="Fondo del menú lateral"
                name="color_fondo_sidebar"
                value={values.color_fondo_sidebar}
                onChange={setField}
              />
              <ColorField
                label="Fondo del contenido"
                name="color_fondo_pagina"
                value={values.color_fondo_pagina}
                onChange={setField}
              />
            </div>

            <FormField label="Tipografía">
              <select
                name="familia_fuente"
                value={values.familia_fuente}
                onChange={(e) => setField("familia_fuente", e.target.value)}
                className={platformSelectClass}
                style={{ fontFamily: values.familia_fuente }}
              >
                {FONT_OPTIONS.map((font) => (
                  <option key={font} value={font} style={{ fontFamily: font }}>
                    {font}
                  </option>
                ))}
              </select>
              <p
                className="mt-2 rounded-lg border border-neutral-100 bg-neutral-50 px-3 py-2 text-sm text-neutral-700"
                style={{ fontFamily: values.familia_fuente }}
              >
                Vista previa: Gestión de campañas y votantes
              </p>
            </FormField>
          </section>
        ) : null}

        {tab === "login" ? (
          <section className="space-y-6 rounded-xl border border-neutral-200 bg-white p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h3 className="text-base font-semibold text-neutral-900">
                  Pantalla de inicio de sesión
                </h3>
                <p className="mt-1 text-sm text-neutral-500">
                  Personaliza el mensaje y los colores que ven tus usuarios al
                  entrar.
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={syncLoginFromPanel}
                className="h-10 shrink-0 px-4"
              >
                Usar colores del panel
              </Button>
            </div>

            <FormField label="Mensaje de bienvenida">
              <input
                name="subtitulo_login"
                value={values.subtitulo_login}
                onChange={(e) => setField("subtitulo_login", e.target.value)}
                placeholder="Accede con tu usuario y contraseña"
                className={platformInputClass}
              />
            </FormField>
            <FormField label="Texto del botón">
              <input
                name="texto_boton_login"
                value={values.texto_boton_login}
                onChange={(e) => setField("texto_boton_login", e.target.value)}
                placeholder="INICIAR SESIÓN"
                className={platformInputClass}
              />
            </FormField>

            <div className="grid gap-4 sm:grid-cols-2">
              <ColorField
                label="Fondo superior"
                name="login_fondo_exterior"
                value={values.login_fondo_exterior}
                onChange={setField}
              />
              <ColorField
                label="Fondo inferior (degradado)"
                name="login_fondo_centro"
                value={values.login_fondo_centro}
                onChange={setField}
              />
              <ColorField
                label="Botón de acceso"
                name="login_boton_fondo"
                value={values.login_boton_fondo}
                onChange={setField}
              />
            </div>

            <button
              type="button"
              onClick={() => setAdvancedLogin((open) => !open)}
              className="flex w-full items-center justify-between rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-3 text-left text-sm font-medium text-neutral-700"
            >
              Opciones avanzadas
              <ChevronDown
                className={cn(
                  "size-4 transition-transform",
                  advancedLogin && "rotate-180"
                )}
              />
            </button>

            {advancedLogin ? (
              <FormField label="Transparencia del panel (CSS)">
                <input
                  name="login_panel_fondo"
                  value={values.login_panel_fondo}
                  onChange={(e) => setField("login_panel_fondo", e.target.value)}
                  placeholder="rgba(31, 41, 55, 0.55)"
                  className={platformInputClass}
                />
              </FormField>
            ) : (
              <input
                type="hidden"
                name="login_panel_fondo"
                value={values.login_panel_fondo}
              />
            )}
          </section>
        ) : null}

        <div className="flex flex-wrap items-center gap-3 rounded-xl border border-neutral-200 bg-neutral-50 px-5 py-4">
          <Button
            type="submit"
            disabled={pending}
            className="h-10 bg-neutral-900 px-8 text-white hover:bg-neutral-800"
          >
            {pending ? "Guardando…" : "Guardar configuración"}
          </Button>
          {saved ? (
            <span className="text-sm text-green-700">Cambios guardados</span>
          ) : (
            <span className="text-sm text-neutral-500">
              El logo se guarda al subirlo. El resto requiere guardar.
            </span>
          )}
        </div>
      </div>

      <PreviewPanel values={values} />
    </form>
  );
}
