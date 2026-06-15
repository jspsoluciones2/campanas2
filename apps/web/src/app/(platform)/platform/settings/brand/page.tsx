import { createClient } from "@/lib/supabase/server";
import { updatePlatformBrandFormAction } from "../../actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  FormField,
  FormRow,
  PageHeader,
  platformInputClass,
} from "@/components/platform/platform-ui";

export default async function PlatformBrandPage() {
  const supabase = await createClient();
  const { data: marca } = await supabase
    .from("configuracion_marca_plataforma")
    .select("url_logo, color_primario, color_secundario, familia_fuente")
    .eq("id", 1)
    .maybeSingle();

  const colorPrimario = marca?.color_primario ?? "#374151";
  const colorSecundario = marca?.color_secundario ?? "#6b7280";

  return (
    <>
      <PageHeader
        title="Branding de plataforma"
        description="Colores y logo del panel — se aplican en todo el administrador."
      />

      <Card
        variant="accent"
        title="Vista previa"
        description="Así se verán las secciones destacadas, como Costos por campaña."
      >
        <p className="text-sm text-neutral-600">
          Los cambios se guardan en la base de datos y se reflejan al recargar el
          panel.
        </p>
      </Card>

      <Card title="Configuración de marca">
        <form action={updatePlatformBrandFormAction} className="space-y-6">
          <FormRow>
            <FormField label="Color primario">
              <input
                type="color"
                name="color_primario"
                defaultValue={colorPrimario}
                required
                className="platform-input h-10 w-full min-w-[4.5rem] cursor-pointer rounded-lg border border-neutral-200 bg-white p-1"
              />
              <span className="mt-1 font-mono text-xs text-neutral-500">
                {colorPrimario}
              </span>
            </FormField>
            <FormField label="Color secundario">
              <input
                type="color"
                name="color_secundario"
                defaultValue={colorSecundario}
                required
                className="platform-input h-10 w-full min-w-[4.5rem] cursor-pointer rounded-lg border border-neutral-200 bg-white p-1"
              />
              <span className="mt-1 font-mono text-xs text-neutral-500">
                {colorSecundario}
              </span>
            </FormField>
          </FormRow>

          <FormRow>
            <FormField label="URL del logo" className="min-w-[240px] flex-[2]">
              <input
                name="url_logo"
                defaultValue={marca?.url_logo ?? ""}
                placeholder="/brand/logo.png"
                className={platformInputClass}
              />
            </FormField>
            <FormField label="Fuente" className="max-w-[200px]">
              <input
                name="familia_fuente"
                defaultValue={marca?.familia_fuente ?? "Inter"}
                className={platformInputClass}
              />
            </FormField>
          </FormRow>

          <p className="text-xs text-neutral-500">
            También puedes usar variables en{" "}
            <code className="text-neutral-700">.env.local</code>:{" "}
            <code className="text-neutral-700">NEXT_PUBLIC_PLATFORM_COLOR_PRIMARY</code>{" "}
            y{" "}
            <code className="text-neutral-700">NEXT_PUBLIC_PLATFORM_COLOR_SECONDARY</code>{" "}
            (la base de datos tiene prioridad).
          </p>

          <Button type="submit" className="bg-neutral-900 text-white hover:bg-neutral-800">
            Guardar cambios
          </Button>
        </form>
      </Card>
    </>
  );
}
