import { Card, EmptyState, PageHeader } from "@/components/platform/platform-ui";

export default function PlatformE14RunsPage() {
  return (
    <>
      <PageHeader
        title="E14 — ejecución"
        description="Descarga registraduría + análisis IA compartido entre campañas del mismo proceso."
      />
      <Card>
        <EmptyState
          title="Disponible en Fase 8"
          description="Aquí la dueña de plataforma disparará una sola vez el análisis E14 por proceso electoral."
        />
      </Card>
    </>
  );
}
