import { requireCampaignAccess } from "@/lib/campaign/access";
import { QuarantineResolveButtons } from "@/components/campaign/quarantine-resolve-buttons";
import {
  Card,
  DataTable,
  EmptyState,
  PageHeader,
  StatusBadge,
} from "@/components/platform/platform-ui";

const ETIQUETAS_COINCIDENCIA: Record<string, string> = {
  cedula_exacta: "Cédula exacta",
  telefono_similitud_nombre: "Teléfono + nombre similar",
};

const ETIQUETAS_ESTADO: Record<string, string> = {
  pendiente: "Pendiente",
  resuelto: "Resuelto",
  descartado: "Descartado",
  escalado: "Escalado",
};

type CuarentenaRow = {
  id: number;
  nombres: string;
  apellidos: string;
  documento: string;
  tipo_documento: string;
  telefono: string | null;
  tipo_coincidencia: string;
  similitud_nombre: number | null;
  estado: string;
  canal_origen: string;
  creado_en: string;
  votante_conflicto:
    | { nombres: string; apellidos: string; documento: string; tipo_documento: string }
    | { nombres: string; apellidos: string; documento: string; tipo_documento: string }[]
    | null;
};

export default async function QuarantinePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const campaignId = Number(id);
  const { supabase } = await requireCampaignAccess(campaignId);

  const { data: rows } = await supabase
    .from("cuarentena_votantes")
    .select(
      `
      id,
      nombres,
      apellidos,
      documento,
      tipo_documento,
      telefono,
      tipo_coincidencia,
      similitud_nombre,
      estado,
      canal_origen,
      creado_en,
      votante_conflicto:votantes!cuarentena_votantes_id_votante_conflicto_fkey (
        nombres,
        apellidos,
        documento,
        tipo_documento
      )
    `
    )
    .eq("id_campana", campaignId)
    .order("creado_en", { ascending: false })
    .limit(100);

  const pendientes = (rows ?? []).filter(
    (r) => r.estado === "pendiente" || r.estado === "escalado"
  );
  const historial = (rows ?? []).filter(
    (r) => r.estado !== "pendiente" && r.estado !== "escalado"
  );

  function conflictoLabel(row: CuarentenaRow) {
    const v = Array.isArray(row.votante_conflicto)
      ? row.votante_conflicto[0]
      : row.votante_conflicto;
    if (!v) return "—";
    return `${v.apellidos} ${v.nombres} (${v.tipo_documento} ${v.documento})`;
  }

  return (
    <>
      <PageHeader
        title="Cuarentena"
        description="Duplicados y conflictos detectados entre recolectores de esta campaña."
      />

      <Card
        title="Pendientes de resolución"
        description={`${pendientes.length} registro(s) requieren acción de supervisor.`}
      >
        {pendientes.length === 0 ? (
          <EmptyState
            title="Sin conflictos pendientes"
            description="Los duplicados detectados al registrar votantes aparecerán aquí."
          />
        ) : (
          <DataTable
            data={pendientes as CuarentenaRow[]}
            rowKey={(r) => String(r.id)}
            emptyMessage="Sin registros."
            columns={[
              {
                key: "propuesto",
                header: "Registro propuesto",
                cell: (r) => (
                  <span className="font-medium text-neutral-900">
                    {r.apellidos} {r.nombres}
                    <span className="mt-0.5 block text-xs font-normal text-neutral-500">
                      {r.tipo_documento} {r.documento}
                      {r.telefono ? ` · ${r.telefono}` : ""}
                    </span>
                  </span>
                ),
              },
              {
                key: "conflicto",
                header: "Conflicto con",
                cell: (r) => conflictoLabel(r),
              },
              {
                key: "tipo",
                header: "Coincidencia",
                cell: (r) => (
                  <span>
                    {ETIQUETAS_COINCIDENCIA[r.tipo_coincidencia] ??
                      r.tipo_coincidencia}
                    {r.similitud_nombre != null ? (
                      <span className="block text-xs text-neutral-500">
                        Similitud {(r.similitud_nombre * 100).toFixed(0)}%
                      </span>
                    ) : null}
                  </span>
                ),
              },
              {
                key: "estado",
                header: "Estado",
                cell: (r) => (
                  <StatusBadge variant="default">
                    {ETIQUETAS_ESTADO[r.estado] ?? r.estado}
                  </StatusBadge>
                ),
              },
              {
                key: "acciones",
                header: "Acciones",
                cell: (r) => (
                  <QuarantineResolveButtons
                    campaignId={campaignId}
                    quarantineId={r.id}
                  />
                ),
              },
            ]}
          />
        )}
      </Card>

      {historial.length > 0 ? (
        <Card title="Historial resuelto" description={`${historial.length} registro(s)`}>
          <DataTable
            data={historial as CuarentenaRow[]}
            rowKey={(r) => String(r.id)}
            emptyMessage="Sin historial."
            columns={[
              {
                key: "propuesto",
                header: "Registro propuesto",
                cell: (r) => `${r.apellidos} ${r.nombres}`,
              },
              {
                key: "tipo",
                header: "Coincidencia",
                cell: (r) =>
                  ETIQUETAS_COINCIDENCIA[r.tipo_coincidencia] ??
                  r.tipo_coincidencia,
              },
              {
                key: "estado",
                header: "Resolución",
                cell: (r) => (
                  <StatusBadge variant="default">
                    {ETIQUETAS_ESTADO[r.estado] ?? r.estado}
                  </StatusBadge>
                ),
              },
              {
                key: "fecha",
                header: "Fecha",
                cell: (r) => new Date(r.creado_en).toLocaleDateString("es-CO"),
                className: "text-neutral-500",
              },
            ]}
          />
        </Card>
      ) : null}
    </>
  );
}
