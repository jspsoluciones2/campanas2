import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  assignCampaignMemberFormAction,
  submitCampaignStatusUpdate,
  type EstadoCampana,
} from "../../actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  FormField,
  FormRow,
  PageHeader,
  platformInputClass,
  platformSelectClass,
  StatusBadge,
} from "@/components/platform/platform-ui";

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

const ETIQUETAS_ROL: Record<string, string> = {
  lector: "Lector",
  editor: "Editor",
  administrador_campana: "Administrador campaña",
};

export default async function CampaignDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: campana } = await supabase
    .from("campanas")
    .select(
      "id, nombre, estado, iniciado_en, finalizado_en, purgado_en, clientes(nombre), procesos_electorales(nombre)"
    )
    .eq("id", id)
    .single();

  if (!campana) notFound();

  const { data: miembros } = await supabase
    .from("miembros_campana")
    .select("id, id_usuario, rol, creado_en")
    .eq("id_campana", id)
    .order("creado_en");

  const { data: caracteristicas } = await supabase
    .from("caracteristicas_campana")
    .select("*")
    .eq("id_campana", id)
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

  return (
    <>
      <PageHeader
        title={campana.nombre}
        description={`${nombreCliente} · ${nombreProceso}`}
        backHref="/platform/campaigns"
        backLabel="Campañas"
      >
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge variant={estado}>{ETIQUETAS_ESTADO[estado]}</StatusBadge>
          <Link
            href={`/campaign/${id}`}
            className="inline-flex h-9 items-center rounded-lg bg-neutral-900 px-4 text-sm font-medium text-white hover:bg-neutral-800"
          >
            Abrir campaña →
          </Link>
        </div>
      </PageHeader>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Estado de la campaña">
          {transiciones.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {transiciones.map((siguiente) => (
                <form
                  key={siguiente}
                  action={submitCampaignStatusUpdate.bind(null, id, siguiente)}
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

        {caracteristicas && (
          <Card title="Módulos contratados">
            <ul className="grid grid-cols-2 gap-3 text-sm">
              {[
                ["CAPTCHA Solver", caracteristicas.resolutor_captcha],
                ["E14 auditoría", caracteristicas.auditoria_e14],
                ["WhatsApp", caracteristicas.whatsapp],
                ["Telegram", caracteristicas.telegram],
                ["Captura web", caracteristicas.captura_web],
              ].map(([label, activo]) => (
                <li
                  key={label as string}
                  className="flex items-center justify-between rounded-lg border border-neutral-100 bg-neutral-50/50 px-3 py-2"
                >
                  <span className="text-neutral-700">{label}</span>
                  <StatusBadge variant={activo ? "activa" : "default"}>
                    {activo ? "Sí" : "No"}
                  </StatusBadge>
                </li>
              ))}
            </ul>
          </Card>
        )}
      </div>

      <Card
        title="Equipo asignado"
        description="Usuarios con acceso a esta campaña."
        action={
          <div className="flex gap-4 text-sm">
            <Link
              href={`/platform/campaigns/${id}/integrations`}
              className="font-medium text-neutral-700 hover:text-neutral-900 hover:underline"
            >
              Integraciones (APIs y costos)
            </Link>
            <Link
              href={`/platform/campaigns/${id}/usage`}
              className="font-medium text-neutral-700 hover:text-neutral-900 hover:underline"
            >
              Uso
            </Link>
          </div>
        }
      >
        <form action={assignCampaignMemberFormAction}>
          <input type="hidden" name="id_campana" value={id} />
          <FormRow>
            <FormField label="UUID usuario Supabase" className="min-w-[280px]">
              <input
                name="id_usuario"
                type="text"
                placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                required
                className={`${platformInputClass} font-mono text-xs`}
              />
            </FormField>
            <FormField label="Rol">
              <select name="rol" className={platformSelectClass}>
                {Object.entries(ETIQUETAS_ROL).map(([valor, etiqueta]) => (
                  <option key={valor} value={valor}>
                    {etiqueta}
                  </option>
                ))}
              </select>
            </FormField>
            <Button type="submit" variant="outline" className="h-10 shrink-0">
              Asignar
            </Button>
          </FormRow>
        </form>

        <ul className="mt-6 space-y-2">
          {miembros?.length ? (
            miembros.map((m) => (
              <li
                key={m.id}
                className="flex items-center justify-between rounded-lg border border-neutral-100 bg-neutral-50/50 px-4 py-3 text-sm"
              >
                <span className="font-mono text-xs text-neutral-600">
                  {m.id_usuario}
                </span>
                <StatusBadge variant="default">
                  {ETIQUETAS_ROL[m.rol] ?? m.rol}
                </StatusBadge>
              </li>
            ))
          ) : (
            <li className="rounded-lg border border-dashed border-neutral-200 py-8 text-center text-sm text-neutral-500">
              Sin miembros asignados.
            </li>
          )}
        </ul>
      </Card>
    </>
  );
}
