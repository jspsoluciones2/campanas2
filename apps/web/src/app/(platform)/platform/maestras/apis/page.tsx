import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import {
  ApiIntegrationRowActions,
  type ApiIntegrationRow,
} from "@/components/platform/api-integration-row-actions";
import {
  ApisListFilter,
  ApisPagination,
  apisListHref,
  PAGE_SIZE,
} from "@/components/platform/apis-list-controls";
import {
  configSummary,
  PLATFORM_API_PROVIDERS,
  type PlatformApiProveedor,
} from "@/lib/platform/api-integrations";
import { escapeIlikeTerm } from "@/lib/platform/master-list";
import {
  Card,
  DataTable,
  PageHeader,
  StatusBadge,
} from "@/components/platform/platform-ui";

type ConfigRow = {
  proveedor: PlatformApiProveedor;
  configuracion: Record<string, unknown>;
  activa: boolean;
  actualizado_en: string;
};

export default async function MaestrasApisPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const { q: qRaw = "", page: pageRaw = "1" } = await searchParams;
  const q = qRaw.trim();
  const filters = { q };
  const page = Math.max(1, Number.parseInt(pageRaw, 10) || 1);

  const supabase = await createClient();
  const { data: guardadas } = await supabase
    .from("configuracion_integracion_plataforma")
    .select("proveedor, configuracion, activa, actualizado_en");

  const byProveedor = new Map(
    (guardadas ?? []).map((row) => [row.proveedor, row as ConfigRow])
  );

  const term = escapeIlikeTerm(q).toLowerCase();
  const allRows: ApiIntegrationRow[] = PLATFORM_API_PROVIDERS.filter((p) => {
    if (!term) return true;
    const haystack = `${p.label} ${p.description} ${p.id}`.toLowerCase();
    return haystack.includes(term);
  }).map((p) => {
    const saved = byProveedor.get(p.id);
    const configuracion = (saved?.configuracion ?? {}) as Record<string, unknown>;
    return {
      proveedor: p.id,
      label: p.label,
      description: p.description,
      activa: saved?.activa ?? false,
      configured: Boolean(saved),
      configuracion,
      resumen: configSummary(p.id, configuracion),
      actualizado_en: saved?.actualizado_en ?? null,
    };
  });

  const total = allRows.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  if (total > 0 && page > totalPages) {
    redirect(apisListHref(filters, totalPages));
  }

  const from = (page - 1) * PAGE_SIZE;
  const rows = allRows.slice(from, from + PAGE_SIZE);

  const emptyMessage = q
    ? "Sin coincidencias. Prueba otro criterio de búsqueda."
    : "Sin integraciones en esta página.";

  return (
    <>
      <PageHeader title="APIs" />

      <Card
        title="Integraciones globales"
        description="Referencia o entorno de pruebas. El control de costos por cliente se configura en cada campaña: Gestionar campaña → Integraciones."
      >
        <ApisListFilter q={q} />
        <DataTable
          data={rows}
          rowKey={(r) => r.proveedor}
          emptyMessage={emptyMessage}
          columns={[
            {
              key: "proveedor",
              header: "Proveedor",
              cell: (r) => (
                <div>
                  <span className="font-medium text-neutral-900">{r.label}</span>
                  <p className="mt-0.5 text-xs text-neutral-500">{r.description}</p>
                </div>
              ),
            },
            {
              key: "resumen",
              header: "Configuración",
              cell: (r) => (
                <span className="text-sm text-neutral-600">{r.resumen}</span>
              ),
            },
            {
              key: "estado",
              header: "Estado",
              className: "text-center",
              cell: (r) => (
                <StatusBadge
                  variant={
                    r.configured && r.activa
                      ? "activa"
                      : r.configured
                        ? "default"
                        : "default"
                  }
                >
                  {!r.configured
                    ? "Sin configurar"
                    : r.activa
                      ? "Activa"
                      : "Inactiva"}
                </StatusBadge>
              ),
            },
            {
              key: "actualizado",
              header: "Actualizado",
              cell: (r) =>
                r.actualizado_en
                  ? new Date(r.actualizado_en).toLocaleDateString("es-CO")
                  : "—",
              className: "text-neutral-500",
            },
            {
              key: "acciones",
              header: "Acciones",
              className: "text-center",
              cell: (r) => <ApiIntegrationRowActions row={r} />,
            },
          ]}
        />
        <ApisPagination
          page={page}
          totalPages={totalPages}
          total={total}
          filters={filters}
        />
      </Card>
    </>
  );
}
