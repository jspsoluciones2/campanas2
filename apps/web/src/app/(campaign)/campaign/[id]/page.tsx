import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { requireCampaignAccess } from "@/lib/campaign/access";
import {
  Card,
  PageHeader,
  StatCard,
  StatusBadge,
} from "@/components/platform/platform-ui";

const ETIQUETAS_ESTADO: Record<string, string> = {
  activa: "Activa",
  pausada: "Pausada",
  finalizada: "Finalizada",
  purgada: "Purgada",
};

export default async function CampaignDashboardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { supabase, campana } = await requireCampaignAccess(id);

  const [
    { count: totalVotantes },
    { count: totalComunas },
    { count: totalRoles },
    { count: enCuarentena },
  ] = await Promise.all([
    supabase
      .from("votantes")
      .select("*", { count: "exact", head: true })
      .eq("id_campana", id),
    supabase
      .from("comunas")
      .select("*", { count: "exact", head: true })
      .eq("id_campana", id),
    supabase
      .from("roles")
      .select("*", { count: "exact", head: true })
      .eq("id_campana", id),
    supabase
      .from("votantes")
      .select("*", { count: "exact", head: true })
      .eq("id_campana", id)
      .eq("estado", "en_cuarentena"),
  ]);

  return (
    <>
      <PageHeader
        title={campana.nombre}
        description="Espacio operativo de la campaña — votantes y catálogos."
      >
        <StatusBadge
          variant={
            campana.estado as "activa" | "pausada" | "finalizada" | "purgada"
          }
        >
          {ETIQUETAS_ESTADO[campana.estado] ?? campana.estado}
        </StatusBadge>
      </PageHeader>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Votantes"
          value={totalVotantes ?? 0}
          href={`/campaign/${id}/votantes`}
        />
        <StatCard
          label="Comunas"
          value={totalComunas ?? 0}
          href={`/campaign/${id}/catalogos`}
        />
        <StatCard label="Roles" value={totalRoles ?? 0} />
        <StatCard
          label="En cuarentena"
          value={enCuarentena ?? 0}
          href={`/campaign/${id}/quarantine`}
        />
      </div>

      <Card title="Empezar aquí">
        <ol className="space-y-4 text-sm text-neutral-600">
          <li className="flex gap-3">
            <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-neutral-800 text-xs font-semibold text-white">
              1
            </span>
            <div>
              <p className="font-medium text-neutral-900">
                Configura catálogos territoriales
              </p>
              <p className="mt-0.5">Comunas, barrios, puestos, roles y tipos de novedad.</p>
              <Link
                href={`/campaign/${id}/catalogos`}
                className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-neutral-800 hover:underline"
              >
                Ir a catálogos
                <ArrowRight className="size-3.5" />
              </Link>
            </div>
          </li>
          <li className="flex gap-3">
            <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-neutral-800 text-xs font-semibold text-white">
              2
            </span>
            <div>
              <p className="font-medium text-neutral-900">Registra votantes</p>
              <p className="mt-0.5">Carga manual desde el panel (captura web en Fase 3).</p>
              <Link
                href={`/campaign/${id}/votantes`}
                className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-neutral-800 hover:underline"
              >
                Ir a votantes
                <ArrowRight className="size-3.5" />
              </Link>
            </div>
          </li>
        </ol>
      </Card>
    </>
  );
}
