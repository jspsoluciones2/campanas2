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
  const campaignId = Number(id);
  const { supabase, campana } = await requireCampaignAccess(campaignId);

  const [
    { count: totalVotantes },
    { count: totalComunas },
    { count: totalRoles },
    { count: enCuarentena },
  ] = await Promise.all([
    supabase
      .from("votantes")
      .select("*", { count: "exact", head: true })
      .eq("id_campana", campaignId),
    supabase
      .from("comunas")
      .select("*", { count: "exact", head: true })
      .eq("id_campana", campaignId),
    supabase
      .from("roles")
      .select("*", { count: "exact", head: true })
      .eq("id_campana", campaignId),
    supabase
      .from("votantes")
      .select("*", { count: "exact", head: true })
      .eq("id_campana", campaignId)
      .eq("estado", "en_cuarentena"),
  ]);

  return (
    <>
      <PageHeader
        title={campana.nombre}
        description="Espacio operativo de la campaña — votantes y catálogos."
        status={
          <StatusBadge
            variant={
              campana.estado as "activa" | "pausada" | "finalizada" | "purgada"
            }
          >
            {ETIQUETAS_ESTADO[campana.estado] ?? campana.estado}
          </StatusBadge>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Votantes"
          value={totalVotantes ?? 0}
          href={`/campaign/${id}/votantes`}
        />
        <StatCard
          label="Comunas"
          value={totalComunas ?? 0}
          href={`/campaign/${id}/catalogos/comunas`}
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
              <p className="font-medium text-neutral-900">Comunas</p>
              <Link
                href={`/campaign/${id}/catalogos/comunas`}
                className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-neutral-800 hover:underline"
              >
                Ir a comunas
                <ArrowRight className="size-3.5" />
              </Link>
            </div>
          </li>
          <li className="flex gap-3">
            <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-neutral-800 text-xs font-semibold text-white">
              2
            </span>
            <div>
              <p className="font-medium text-neutral-900">Barrios</p>
              <Link
                href={`/campaign/${id}/catalogos/barrios`}
                className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-neutral-800 hover:underline"
              >
                Ir a barrios
                <ArrowRight className="size-3.5" />
              </Link>
            </div>
          </li>
          <li className="flex gap-3">
            <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-neutral-800 text-xs font-semibold text-white">
              3
            </span>
            <div>
              <p className="font-medium text-neutral-900">Puestos de votación</p>
              <Link
                href={`/campaign/${id}/catalogos/puestos`}
                className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-neutral-800 hover:underline"
              >
                Ir a puestos
                <ArrowRight className="size-3.5" />
              </Link>
            </div>
          </li>
          <li className="flex gap-3">
            <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-neutral-800 text-xs font-semibold text-white">
              4
            </span>
            <div>
              <p className="font-medium text-neutral-900">Roles</p>
              <Link
                href={`/campaign/${id}/catalogos/roles`}
                className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-neutral-800 hover:underline"
              >
                Ir a roles
                <ArrowRight className="size-3.5" />
              </Link>
            </div>
          </li>
          <li className="flex gap-3">
            <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-neutral-800 text-xs font-semibold text-white">
              5
            </span>
            <div>
              <p className="font-medium text-neutral-900">Tipos de novedad</p>
              <Link
                href={`/campaign/${id}/catalogos/tipos-novedad`}
                className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-neutral-800 hover:underline"
              >
                Ir a tipos de novedad
                <ArrowRight className="size-3.5" />
              </Link>
            </div>
          </li>
          <li className="flex gap-3">
            <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-neutral-800 text-xs font-semibold text-white">
              6
            </span>
            <div>
              <p className="font-medium text-neutral-900">Lugares de trabajo</p>
              <Link
                href={`/campaign/${id}/catalogos/lugares-trabajo`}
                className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-neutral-800 hover:underline"
              >
                Ir a lugares de trabajo
                <ArrowRight className="size-3.5" />
              </Link>
            </div>
          </li>
          <li className="flex gap-3">
            <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-neutral-800 text-xs font-semibold text-white">
              7
            </span>
            <div>
              <p className="font-medium text-neutral-900">Registra votantes</p>
              <p className="mt-0.5">Cuando los catálogos estén listos.</p>
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
