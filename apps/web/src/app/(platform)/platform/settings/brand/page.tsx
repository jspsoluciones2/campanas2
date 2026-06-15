import { BrandSettingsForm } from "@/components/platform/brand-settings-form";
import { Card, PageHeader } from "@/components/platform/platform-ui";
import { brandFormFromConfig } from "@/lib/platform/brand";
import { loadPlatformBrand } from "@/lib/platform/load-platform-brand";

export default async function PlatformBrandPage() {
  const config = await loadPlatformBrand();
  const initial = brandFormFromConfig(config);

  return (
    <>
      <PageHeader
        title="Branding"
        description="Personaliza logo, colores y pantalla de acceso. Sube imágenes con un clic y revisa el resultado al instante."
      />

      <Card title="Tu marca en la plataforma">
        <BrandSettingsForm initial={initial} />
      </Card>
    </>
  );
}
