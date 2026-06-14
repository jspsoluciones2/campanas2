import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import {
  Card,
  PageHeader,
  StatCard,
} from "@/components/platform/platform-ui";

export default async function PlatformHomePage() {
  const supabase = await createClient();

  const [{ count: totalClientes }, { count: totalCampanas }] = await Promise.all([
    supabase.from("clientes").select("*", { count: "exact", head: true }),
    supabase.from("campanas").select("*", { count: "exact", head: true }),
  ]);

  return (
    <>
      <PageHeader
        title="Panel de plataforma"
        description="Administración central del SaaS — clientes, campañas e integraciones."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          label="Clientes"
          value={totalClientes ?? 0}
          href="/platform/clients"
        />
        <StatCard
          label="Campañas"
          value={totalCampanas ?? 0}
          href="/platform/campaigns"
        />
        <StatCard label="Usuarios activos" value="—" />
      </div>

      <Card title="Primeros pasos">
        <ol className="space-y-4 text-sm text-neutral-600">
          <li className="flex gap-3">
            <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-neutral-800 text-xs font-semibold text-white">
              1
            </span>
            <div>
              <p className="font-medium text-neutral-900">Crea un cliente</p>
              <p className="mt-0.5 text-neutral-500">
                Registra al político o entidad recurrente.
              </p>
              <Link
                href="/platform/clients"
                className="mt-2 inline-flex h-7 items-center gap-1.5 rounded-lg border border-border bg-background px-2.5 text-[0.8rem] font-medium hover:bg-muted"
              >
                Ir a clientes
                <ArrowRight className="size-3.5" />
              </Link>
            </div>
          </li>
          <li className="flex gap-3">
            <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-neutral-800 text-xs font-semibold text-white">
              2
            </span>
            <div>
              <p className="font-medium text-neutral-900">
                Crea proceso electoral y campaña
              </p>
              <p className="mt-0.5 text-neutral-500">
                Cada campaña es un silo aislado para una elección.
              </p>
              <Link
                href="/platform/campaigns"
                className="mt-2 inline-flex h-7 items-center gap-1.5 rounded-lg border border-border bg-background px-2.5 text-[0.8rem] font-medium hover:bg-muted"
              >
                Ir a campañas
                <ArrowRight className="size-3.5" />
              </Link>
            </div>
          </li>
          <li className="flex gap-3">
            <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-neutral-300 text-xs font-semibold text-neutral-700">
              3
            </span>
            <div>
              <p className="font-medium text-neutral-900">
                Asigna equipo y módulos
              </p>
              <p className="mt-0.5 text-neutral-500">
                Desde el detalle de cada campaña (Fase 2: votantes y catálogos).
              </p>
            </div>
          </li>
        </ol>
      </Card>
    </>
  );
}
