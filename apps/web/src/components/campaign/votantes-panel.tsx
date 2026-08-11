"use client";

import { useState } from "react";
import { Plus, UserPlus, Users } from "lucide-react";
import { VotanteRegisterForm } from "@/components/campaign/votante-register-form";
import {
  VotantesTable,
  type VotanteListRow,
} from "@/components/campaign/votantes-table";
import { Card, PageHeader, platformButtonClass } from "@/components/platform/platform-ui";
import { cn } from "@/lib/utils";

type Rol = { id: number; nombre: string; nivel_jerarquia: number };
type Puesto = {
  id: number;
  nombre: string;
  municipio: string | null;
  comunas: { nombre: string } | { nombre: string }[] | null;
};
type LugarTrabajo = { id: number; nombre: string };
type Lider = {
  id: number;
  nombres: string;
  apellidos: string;
  documento: string;
  nivel_jerarquia: number | null;
};
type Departamento = { id: string; nombre: string };
type Municipio = { id: string; nombre: string; id_departamento: string };
type BarrioConComuna = {
  id: number;
  nombre: string;
  id_comuna: number;
  id_municipio: string;
};
type TipoNovedad = { id: number; novedad: string };

type Props = {
  campaignId: number;
  votantes: VotanteListRow[];
  tiposNovedad: TipoNovedad[];
  roles: Rol[];
  puestos: Puesto[];
  lugaresTrabajo: LugarTrabajo[];
  lideres: Lider[];
  departamentos: Departamento[];
  municipios: Municipio[];
  barrios: BarrioConComuna[];
};

type TabId = "listado" | "crear";

const TABS: { id: TabId; label: string; icon: typeof Users }[] = [
  { id: "listado", label: "Listado", icon: Users },
  { id: "crear", label: "Crear votante", icon: UserPlus },
];

export function VotantesPanel({
  campaignId,
  votantes,
  tiposNovedad,
  roles,
  puestos,
  lugaresTrabajo,
  lideres,
  departamentos,
  municipios,
  barrios,
}: Props) {
  const [activeTab, setActiveTab] = useState<TabId>(
    votantes.length === 0 ? "crear" : "listado"
  );

  return (
    <>
      <PageHeader
        title="Votantes"
        description="Registro manual de votantes. Las novedades las completa el equipo al detectar irregularidades."
      >
        <button
          type="button"
          onClick={() => setActiveTab("crear")}
          className={cn(platformButtonClass, "gap-2")}
        >
          <Plus className="size-4 shrink-0" aria-hidden />
          Nuevo votante
        </button>
      </PageHeader>

      <div className="flex flex-wrap gap-1 rounded-xl border border-neutral-200 bg-neutral-50/50 p-1.5">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200",
                active
                  ? "bg-white text-neutral-900 shadow-sm"
                  : "text-neutral-500 hover:text-neutral-700",
                tab.id === "crear" && active && "bg-blue-50"
              )}
            >
              <Icon className="size-4 shrink-0" aria-hidden />
              {tab.label}
              {tab.id === "listado" ? (
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-xs font-semibold",
                    active
                      ? "bg-neutral-900 text-white"
                      : "bg-neutral-200 text-neutral-600"
                  )}
                >
                  {votantes.length}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>

      {activeTab === "listado" ? (
        <Card
          title="Listado"
          description={`${votantes.length} votante(s) mostrados (máx. 100)`}
        >
          <VotantesTable
            campaignId={campaignId}
            rows={votantes}
            tiposNovedad={tiposNovedad}
            emptyMessage="Sin votantes. Configura catálogos y registra el primero en la pestaña Crear votante."
            showEstadoEditor
          />
        </Card>
      ) : (
        <VotanteRegisterForm
          campaignId={campaignId}
          roles={roles}
          puestos={puestos}
          lugaresTrabajo={lugaresTrabajo}
          lideres={lideres}
          departamentos={departamentos}
          municipios={municipios}
          barrios={barrios}
        />
      )}
    </>
  );
}