"use client";

import { useState } from "react";
import {
  CampaignIntegrationEditorDialog,
  type CampaignIntegrationEditorRow,
} from "@/components/platform/campaign-integration-editor-dialog";
import { CampaignIntegrationClearButton } from "@/components/platform/campaign-integration-clear-button";
import { Button } from "@/components/ui/button";

export type CampaignIntegrationRow = CampaignIntegrationEditorRow & {
  description: string;
};

export function CampaignIntegrationRowActions({
  row,
}: {
  row: CampaignIntegrationRow;
}) {
  const [editing, setEditing] = useState(false);

  return (
    <>
      <div className="flex flex-wrap items-center justify-center gap-2">
        <Button
          type="button"
          onClick={() => setEditing(true)}
          className="h-10 shrink-0 px-6"
        >
          {row.configured ? "Editar" : "Configurar"}
        </Button>
        <CampaignIntegrationClearButton
          idCampana={row.idCampana}
          proveedor={row.proveedor}
          label={row.label}
          configured={row.configured}
        />
      </div>
      <CampaignIntegrationEditorDialog
        open={editing}
        onClose={() => setEditing(false)}
        row={row}
      />
    </>
  );
}
