import { requireCampaignAccess } from "@/lib/campaign/access";
import { VotanteRegisterForm } from "@/components/campaign/votante-register-form";
import {
  Card,
  DataTable,
  PageHeader,
  StatusBadge,
} from "@/components/platform/platform-ui";

const ETIQUETAS_ESTADO: Record<string, string> = {
  activo: "Activo",
  pendiente_verificacion: "Pendiente",
  en_cuarentena: "Cuarentena",
  rechazado: "Rechazado",
};

export default async function CampaignVotantesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { supabase } = await requireCampaignAccess(id);

  const [
    { data: votantes },
    { data: roles },
    { data: puestos },
    { data: lugaresTrabajo },
    { data: zonas },
    { data: lideres },
  ] = await Promise.all([
    supabase
      .from("votantes")
      .select(
        `id, nombres, apellidos, documento, tipo_documento, sexo, telefono,
         fecha_nacimiento, direccion, estado, creado_en,
         roles(nombre), zonas(nombre), lugares_trabajo(nombre)`
      )
      .eq("id_campana", id)
      .order("creado_en", { ascending: false })
      .limit(100),
    supabase
      .from("roles")
      .select("id, nombre, nivel_jerarquia")
      .eq("id_campana", id)
      .order("nivel_jerarquia"),
    supabase
      .from("puestos_votacion")
      .select("id, nombre")
      .eq("id_campana", id)
      .order("nombre"),
    supabase
      .from("lugares_trabajo")
      .select("id, nombre")
      .eq("id_campana", id)
      .order("nombre"),
    supabase
      .from("zonas")
      .select("id, nombre")
      .eq("id_campana", id)
      .order("nombre"),
    supabase
      .from("votantes")
      .select("id, nombres, apellidos, documento")
      .eq("id_campana", id)
      .in("estado", ["activo", "pendiente_verificacion"])
      .order("apellidos")
      .limit(200),
  ]);

  const rows = votantes ?? [];

  function nombreRelacion(
    rel: { nombre: string } | { nombre: string }[] | null | undefined
  ) {
    if (!rel) return "—";
    if (Array.isArray(rel)) return rel[0]?.nombre ?? "—";
    return rel.nombre;
  }

  return (
    <>
      <PageHeader
        title="Votantes"
        description="Registro manual de votantes de esta campaña."
        backHref={`/campaign/${id}`}
        backLabel="Inicio campaña"
      />

      <VotanteRegisterForm
        campaignId={id}
        roles={roles ?? []}
        puestos={puestos ?? []}
        lugaresTrabajo={lugaresTrabajo ?? []}
        zonas={zonas ?? []}
        lideres={lideres ?? []}
      />

      <Card title="Listado" description={`${rows.length} votante(s) mostrados (máx. 100)`}>
        <DataTable
          data={rows}
          rowKey={(v) => v.id}
          emptyMessage="Sin votantes. Configura catálogos y registra el primero arriba."
          columns={[
            {
              key: "nombre",
              header: "Nombre",
              cell: (v) => (
                <span className="font-medium text-neutral-900">
                  {v.apellidos} {v.nombres}
                </span>
              ),
            },
            {
              key: "doc",
              header: "Documento",
              cell: (v) => `${v.tipo_documento} ${v.documento}`,
            },
            {
              key: "zona",
              header: "Zona",
              cell: (v) => nombreRelacion(v.zonas),
            },
            {
              key: "trabajo",
              header: "Trabajo",
              cell: (v) => nombreRelacion(v.lugares_trabajo),
            },
            {
              key: "direccion",
              header: "Dirección",
              cell: (v) => v.direccion ?? "—",
            },
            {
              key: "rol",
              header: "Rol",
              cell: (v) => nombreRelacion(v.roles),
            },
            {
              key: "estado",
              header: "Estado",
              cell: (v) => (
                <StatusBadge variant="default">
                  {ETIQUETAS_ESTADO[v.estado] ?? v.estado}
                </StatusBadge>
              ),
            },
            {
              key: "fecha",
              header: "Registro",
              cell: (v) =>
                new Date(v.creado_en).toLocaleDateString("es-CO"),
              className: "text-neutral-500",
            },
          ]}
        />
      </Card>
    </>
  );
}
