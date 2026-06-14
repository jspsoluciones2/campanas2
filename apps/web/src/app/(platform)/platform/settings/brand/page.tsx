import { Card, EmptyState, PageHeader } from "@/components/platform/platform-ui";

export default function PlatformBrandPage() {
  return (
    <>
      <PageHeader
        title="Branding de plataforma"
        description="Logo, colores y apariencia global — Fase 4."
      />
      <Card>
        <EmptyState
          title="Módulo en construcción"
          description="Aquí configurarás marca, colores del login y del panel. Por ahora usa las variables en .env.local (ver login-brand.ts)."
        />
      </Card>
    </>
  );
}
