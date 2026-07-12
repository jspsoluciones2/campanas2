export const CATALOG_DEFAULT_SEGMENT = "comunas";

export function catalogBasePath(campaignId: number) {
  return `/campaign/${campaignId}/catalogos`;
}

export function catalogSegmentPath(campaignId: number, segment: string) {
  return `${catalogBasePath(campaignId)}/${segment}`;
}

export const CATALOG_MENU = [
  { segment: "comunas", label: "Comunas" },
  { segment: "barrios", label: "Barrios" },
  { segment: "puestos", label: "Puestos de votación" },
  { segment: "roles", label: "Roles" },
  { segment: "tipos-novedad", label: "Tipos de novedad" },
  { segment: "lugares-trabajo", label: "Lugares de trabajo" },
] as const;

export type CatalogSegment = (typeof CATALOG_MENU)[number]["segment"];

export function catalogPathsForCampaign(campaignId: number): string[] {
  return [
    catalogBasePath(campaignId),
    ...CATALOG_MENU.map(({ segment }) => catalogSegmentPath(campaignId, segment)),
  ];
}

export function isCatalogPath(pathname: string, campaignId: number) {
  const base = catalogBasePath(campaignId);
  return pathname === base || pathname.startsWith(`${base}/`);
}
