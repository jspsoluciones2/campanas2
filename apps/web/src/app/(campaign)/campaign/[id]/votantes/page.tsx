import { requireCampaignAccess } from "@/lib/campaign/access";
import { createVotanteFormAction } from "../actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  DataTable,
  FormField,
  FormRow,
  PageHeader,
  platformInputClass,
  platformSelectClass,
  StatusBadge,
} from "@/components/platform/platform-ui";

const TIPOS_DOCUMENTO = ["CC", "TI", "CE", "PA", "PEP", "PPT"] as const;

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

  const [{ data: votantes }, { data: roles }, { data: puestos }, { data: lideres }] =
    await Promise.all([
      supabase
        .from("votantes")
        .select(
          "id, nombres, apellidos, documento, tipo_documento, sexo, telefono, estado, creado_en, roles(nombre)"
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
        .from("votantes")
        .select("id, nombres, apellidos, documento")
        .eq("id_campana", id)
        .in("estado", ["activo", "pendiente_verificacion"])
        .order("apellidos")
        .limit(200),
    ]);

  const rows = votantes ?? [];

  return (
    <>
      <PageHeader
        title="Votantes"
        description="Registro manual de votantes de esta campaña."
        backHref={`/campaign/${id}`}
        backLabel="Inicio campaña"
      />

      <Card title="Nuevo votante" description="Estado inicial: pendiente de verificación.">
        <form action={createVotanteFormAction.bind(null, id)}>
          <FormRow className="flex-col items-stretch lg:flex-row lg:flex-wrap">
            <FormField label="Nombres">
              <input name="nombres" required className={platformInputClass} />
            </FormField>
            <FormField label="Apellidos">
              <input name="apellidos" required className={platformInputClass} />
            </FormField>
            <FormField label="Tipo documento">
              <select name="tipo_documento" className={platformSelectClass} defaultValue="CC">
                {TIPOS_DOCUMENTO.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </FormField>
            <FormField label="Documento">
              <input name="documento" required className={platformInputClass} />
            </FormField>
            <FormField label="Sexo">
              <select name="sexo" className={platformSelectClass} defaultValue="">
                <option value="">—</option>
                <option value="Masculino">Masculino</option>
                <option value="Femenino">Femenino</option>
              </select>
            </FormField>
            <FormField label="Teléfono">
              <input name="telefono" className={platformInputClass} />
            </FormField>
            <FormField label="Rol organizacional">
              <select name="id_rol" className={platformSelectClass} defaultValue="">
                <option value="">—</option>
                {roles?.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.nombre} (nivel {r.nivel_jerarquia})
                  </option>
                ))}
              </select>
            </FormField>
            <FormField label="Líder directo">
              <select
                name="id_lider_directo"
                className={platformSelectClass}
                defaultValue=""
              >
                <option value="">—</option>
                {lideres?.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.apellidos} {l.nombres} — {l.documento}
                  </option>
                ))}
              </select>
            </FormField>
            <FormField label="Puesto de votación">
              <select
                name="id_puesto_votacion"
                className={platformSelectClass}
                defaultValue=""
              >
                <option value="">—</option>
                {puestos?.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nombre}
                  </option>
                ))}
              </select>
            </FormField>
            <FormField label="Mesa">
              <input name="mesa" className={platformInputClass} />
            </FormField>
            <Button type="submit" className="h-10 shrink-0 self-end">
              Registrar votante
            </Button>
          </FormRow>
        </form>
      </Card>

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
              key: "rol",
              header: "Rol",
              cell: (v) => {
                const rol = Array.isArray(v.roles)
                  ? v.roles[0]?.nombre
                  : (v.roles as { nombre: string } | null)?.nombre;
                return rol ?? "—";
              },
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
