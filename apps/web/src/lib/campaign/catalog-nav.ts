export const CATALOG_DEFAULT_SEGMENT = "roles";

export function catalogBasePath(campaignId: number) {
  return `/campaign/${campaignId}/catalogos`;
}

export function catalogSegmentPath(campaignId: number, segment: string) {
  return `${catalogBasePath(campaignId)}/${segment}`;
}

const CATALOG_MENU_ENTRIES = [
  { segment: "roles", label: "Roles" },
  { segment: "tipos-novedad", label: "Tipos de novedad" },
  { segment: "lugares-trabajo", label: "Lugares de trabajo" },
] as const;

export const CATALOG_MENU = CATALOG_MENU_ENTRIES;

export type CatalogSegment =
  | (typeof CATALOG_MENU_ENTRIES)[number]["segment"]
  | "puestos";

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
