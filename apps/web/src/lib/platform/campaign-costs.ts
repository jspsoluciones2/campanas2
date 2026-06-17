type UsoRow = {
  id_campana: string;
  proveedor: string;
  metrica: string;
  cantidad: number | string;
};

export type CostosCampana = {
  twilio: number;
  ia: number;
  total: number;
};

const METRICA_COSTO = /costo|gasto|usd|cop/i;

function sumarCosto(rows: UsoRow[]): number {
  if (!rows.length) return 0;
  const costRows = rows.filter((r) => METRICA_COSTO.test(r.metrica));
  if (!costRows.length) return 0;
  return costRows.reduce((acc, r) => acc + Number(r.cantidad || 0), 0);
}

export function costosPorCampana(
  campaignId: string,
  uso: UsoRow[] | null | undefined
): CostosCampana {
  const rows = (uso ?? []).filter((u) => u.id_campana === campaignId);

  const porProveedor = (proveedor: string) =>
    sumarCosto(rows.filter((r) => r.proveedor === proveedor));

  const twilio = porProveedor("twilio");
  const ia = porProveedor("ia_e14");

  return {
    twilio,
    ia,
    total: twilio + ia,
  };
}

export function formatCosto(value: number): string {
  if (value === 0) return "$0";
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(value);
}
