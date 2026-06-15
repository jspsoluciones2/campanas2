"use client";

import { useState } from "react";
import {
  CampaignIntegrationEditorDialog,
  type CampaignIntegrationEditorRow,
} from "@/components/platform/campaign-integration-editor-dialog";
import { CampaignIntegrationClearButton } from "@/components/platform/campaign-integration-clear-button";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/platform/platform-ui";
import {
  isBillableIntegrationProvider,
  type PlatformApiProveedor,
} from "@/lib/platform/api-integrations";

export type CampaignApisManagerProps = {
  campaignId: string;
  campaignName: string;
  integrations: CampaignIntegrationEditorRow[];
  variant?: "row" | "cell";
  scope?: "all" | "billable";
  provider?: PlatformApiProveedor;
  configured?: boolean;
  activa?: boolean;
};

function integrationBadge(configured: boolean, activa: boolean) {
  if (!configured) return { label: "—", variant: "default" as const };
  if (activa) return { label: "Activa", variant: "activa" as const };
  return { label: "Inactiva", variant: "default" as const };
}

export function CampaignApisManager({
  campaignName,
  integrations,
  variant = "row",
  scope = "all",
  provider,
  configured = false,
  activa = false,
}: CampaignApisManagerProps) {
  const [panelOpen, setPanelOpen] = useState(false);
  const [editingProvider, setEditingProvider] =
    useState<PlatformApiProveedor | null>(null);

  const editingRow = integrations.find((i) => i.proveedor === editingProvider);

  const openProvider = (proveedor: PlatformApiProveedor) => {
    setEditingProvider(proveedor);
    setPanelOpen(false);
  };

  const billableIntegrations = integrations.filter((row) =>
    isBillableIntegrationProvider(row.proveedor)
  );
  const telegramIntegrations = integrations.filter(
    (row) => row.proveedor === "telegram"
  );
  const panelIntegrations =
    scope === "billable" ? billableIntegrations : integrations;

  const renderIntegrationList = (
    rows: CampaignIntegrationEditorRow[],
    title: string,
    subtitle: string
  ) => (
    <div className="px-6 py-2">
      <p className="py-3 text-sm font-medium text-neutral-800">{title}</p>
      <p className="-mt-2 pb-2 text-xs text-neutral-500">{subtitle}</p>
      <ul className="divide-y divide-neutral-100">
        {rows.map((row) => {
          const badge = integrationBadge(row.configured, row.activa);
          return (
            <li
              key={row.proveedor}
              className="flex flex-wrap items-center justify-between gap-3 py-4"
            >
              <div className="min-w-0">
                <p className="font-medium text-neutral-900">{row.label}</p>
                <div className="mt-1">
                  <StatusBadge variant={badge.variant}>
                    {row.configured ? badge.label : "Sin configurar"}
                  </StatusBadge>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  size="sm"
                  className="h-9 px-4"
                  onClick={() => openProvider(row.proveedor)}
                >
                  {row.configured ? "Editar" : "Configurar"}
                </Button>
                <CampaignIntegrationClearButton
                  idCampana={row.idCampana}
                  proveedor={row.proveedor}
                  label={row.label}
                  campaignName={campaignName}
                  configured={row.configured}
                  className="h-9 px-4"
                />
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );

  if (variant === "cell" && provider) {
    const row = integrations.find((i) => i.proveedor === provider);
    if (!row) return null;
    const badge = integrationBadge(configured, activa);

    return (
      <>
        <div className="inline-flex items-center justify-center gap-2">
          {configured ? (
            <StatusBadge variant={badge.variant}>{badge.label}</StatusBadge>
          ) : null}
          <Button
            type="button"
            size="sm"
            className="h-9 shrink-0 px-4"
            onClick={() => setEditingProvider(provider)}
            title={`Configurar ${row.label}`}
          >
            {configured ? "Editar" : "Configurar"}
          </Button>
        </div>
        {editingRow ? (
          <CampaignIntegrationEditorDialog
            open={editingProvider === provider}
            onClose={() => setEditingProvider(null)}
            row={editingRow}
            campaignName={campaignName}
          />
        ) : null}
      </>
    );
  }

  return (
    <>
      <Button
        type="button"
        onClick={() => setPanelOpen(true)}
        className="h-9 shrink-0 px-4"
      >
        Configurar
      </Button>

      {panelOpen ? (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-neutral-900/50 p-4 backdrop-blur-[1px]"
          role="presentation"
          onClick={(e) => {
            if (e.target === e.currentTarget) setPanelOpen(false);
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-xl border border-neutral-200 bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="border-b border-neutral-100 px-6 py-4">
              <h3 className="text-base font-semibold text-neutral-900">
                Integraciones · {campaignName}
              </h3>
              <p className="mt-1 text-sm text-neutral-500">
                APIs de pago y canal Telegram por campaña.
              </p>
            </div>
            {scope === "billable"
              ? renderIntegrationList(
                  panelIntegrations,
                  "APIs con costo",
                  "Twilio, Capsolver e IA E14 — consumo en Uso y gastos."
                )
              : (
                <>
                  {renderIntegrationList(
                    billableIntegrations,
                    "APIs con costo",
                    "Twilio, Capsolver e IA E14 — consumo en Uso y gastos."
                  )}
                  {renderIntegrationList(
                    telegramIntegrations,
                    "Telegram",
                    "Canal de captura. No genera costos medibles."
                  )}
                </>
              )}
            <div className="flex justify-end border-t border-neutral-100 px-6 py-4">
              <Button
                type="button"
                variant="outline"
                className="h-10 px-6"
                onClick={() => setPanelOpen(false)}
              >
                Cerrar
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      {editingRow ? (
        <CampaignIntegrationEditorDialog
          open={Boolean(editingProvider)}
          onClose={() => setEditingProvider(null)}
          row={editingRow}
          campaignName={campaignName}
        />
      ) : null}
    </>
  );
}
