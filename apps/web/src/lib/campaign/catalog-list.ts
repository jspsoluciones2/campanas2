import { masterListHref } from "@/lib/platform/master-list";
import { catalogSegmentPath } from "@/lib/campaign/catalog-nav";

export type CatalogListFilters = {
  q: string;
};

export function catalogListHref(
  campaignId: string,
  segment: string,
  filters: CatalogListFilters,
  page: number
): string {
  return masterListHref(
    catalogSegmentPath(campaignId, segment),
    filters,
    page,
    ["q"]
  );
}
