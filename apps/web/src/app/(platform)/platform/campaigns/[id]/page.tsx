import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  assignCampaignMemberAction,
  submitCampaignStatusUpdate,
  type EstadoCampana,
} from "../../actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  PageHeader,
  platformButtonClass,
  StatusBadge,
} from "@/components/platform/platform-ui";
import {
  CampaignModulesForm,
  type CampaignModules,
} from "@/components/platform/campaign-modules-form";
import { AssignTeamMemberForm } from "@/components/campaign/assign-team-member-form";
import { CampaignTeamMemberList } from "@/components/campaign/campaign-team-member-list";
import { listCampaignMembersWithProfiles } from "@/lib/campaign/team";
import { type AlcanceValue } from "@/components/platform/territorio-alcance-editor";
import { CampaignAlcanceFormClient } from "@/components/platform/campaign-alcance-form-client";

const ETIQUETAS_ESTADO: Record<EstadoCampana, string> = {
  activa: "Activa",
  pausada: "Pausada",
  finalizada: "Finalizada",
  purgada: "Purgada",
};

const SIGUIENTE_ESTADO: Partial<Record<EstadoCampana, EstadoCampana[]>> = {
  activa: ["pausada", "finalizada"],
  pausada: ["activa", "finalizada"],
  finalizada: ["purgada"],
};

export default async function CampaignDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ from?: string }>;
}) {
  const { id } = await params;
  const { from } = await searchParams;
  const supabase = await createClient();

  const volverHref = from === "inicio" ? "/platform" : "/platform/campaigns";

  const { data: campana } = await supabase
    .from("campanas")
    .select(
      "id, nombre, estado, iniciado_en, finalizado_en, purgado_en, clientes(nombre), procesos_electorales(nombre)"
    )
    .eq("id", Number(id))
    .single();

  if (!campana) notFound();

  const miembros = await listCampaignMembersWithProfiles(supabase, Number(id));

  const { data: caracteristicas } = await supabase
    .from("caracteristicas_campana")
    .select("*")
    .eq("id_campana", Number(id))
    .single();

  const estado = campana.estado as EstadoCampana;
  const transiciones = SIGUIENTE_ESTADO[estado] ?? [];

  const nombreCliente =
    (Array.isArray(campana.clientes)
      ? campana.clientes[0]?.nombre
      : (campana.clientes as { nombre: string } | null)?.nombre) ?? "—";
  const nombreProceso =
    (Array.isArray(campana.procesos_electorales)
      ? campana.procesos_electorales[0]?.nombre
      : (campana.procesos_electorales as { nombre: string } | null)?.nombre) ??
    "—";

  const modulos: CampaignModules = {
    resolutor_captcha: caracteristicas?.resolutor_captcha ?? false,
    auditoria_e14: caracteristicas?.auditoria_e14 ?? false,
    whatsapp: caracteristicas?.whatsapp ?? false,
    telegram: caracteristicas?.telegram ?? false,
    captura_web: caracteristicas?.captura_web ?? true,
  };

  const [alcanceData, departamentos, municipios] = await Promise.all([
    supabase
      .from("campana_territorio")
      .select("id_departamento, id_municipio")
      .eq("id_campana", Number(id))
      .maybeSingle(),
    supabase.from("departamentos").select("id, nombre").order("nombre"),
    supabase
      .from("municipios")
      .select("id, nombre, id_departamento")
      .order("nombre"),
  ]);
  const currentAlcance: AlcanceValue = alcanceData.data
    ? alcanceData.data.id_municipio
      ? { tipo: "municipal", id_municipio: String(alcanceData.data.id_municipio) }
      : { tipo: "departamental", id_departamento: String(alcanceData.data.id_departamento!) }
    : { tipo: "nacional" };

  return (
    <>
      <PageHeader
        title={campana.nombre}
        description={`${nombreCliente} · ${nombreProceso}`}
        status={
          <StatusBadge variant={estado}>
            {ETIQUETAS_ESTADO[estado]}
          </StatusBadge>
        }
        backHref={volverHref}
        backLabel="Volver"
      >
        <Link href={`/campaign/${id}?from=gestion`} className={platformButtonClass}>
          Abrir campaña →
        </Link>
      </PageHeader>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Estado de la campaña">
          {transiciones.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {transiciones.map((siguiente) => (
                <form
                  key={siguiente}
                  action={submitCampaignStatusUpdate.bind(null, Number(id), siguiente)}
                >
                  <Button type="submit" variant="outline" size="sm">
                    Marcar como {ETIQUETAS_ESTADO[siguiente].toLowerCase()}
                  </Button>
                </form>
              ))}
            </div>
          ) : (
            <p className="text-sm text-neutral-500">
              No hay más transiciones disponibles para este estado.
            </p>
          )}
          {estado === "finalizada" && (
            <p className="mt-4 rounded-lg bg-neutral-50 px-3 py-2 text-sm text-neutral-600">
              Export ZIP disponible en Fase 1.6. La purga es manual y solo la
              decide la dueña de plataforma.
            </p>
          )}
        </Card>

        <CampaignModulesForm campaignId={Number(id)} modules={modulos} />
      </div>

      <Card title="Territorio" description="Departamentos y municipios que cubre esta campaña.">
        <CampaignAlcanceFormClient
          campaignId={id}
          departamentos={departamentos.data ?? []}
          municipios={municipios.data ?? []}
          initialAlcance={currentAlcance}
        />
      </Card>

      <Card
        title="Equipo asignado"
        description="Crea usuarios con nombre de usuario o correo y contraseña inicial."
        action={
          <Link
            href={`/platform/campaigns/${id}/integrations?from=campana`}
            className="text-sm font-medium text-neutral-700 hover:text-neutral-900 hover:underline"
          >
            Integraciones
          </Link>
        }
      >
        <AssignTeamMemberForm
          campaignId={id}
          action={assignCampaignMemberAction}
        />

        <ul className="mt-6 space-y-2">
          <CampaignTeamMemberList members={miembros} />
        </ul>
      </Card>
    </>
  );
}
