import {
  MASTER_PAGE_SIZE,
  masterListHref,
} from "@/lib/platform/master-list";
import { catalogSegmentPath } from "@/lib/campaign/catalog-nav";
import {
  MasterListPagination,
  MasterListSearch,
} from "@/components/platform/master-list-controls";
import type { CatalogListFilters } from "@/lib/campaign/catalog-list";

type CatalogListFilterProps = {
  campaignId: number;
  segment: string;
  q: string;
  placeholder: string;
};

export function CatalogListFilter({
  campaignId,
  segment,
  q,
  placeholder,
}: CatalogListFilterProps) {
  const basePath = catalogSegmentPath(campaignId, segment);
  const hasFilters = Boolean(q.trim());

  return (
    <MasterListSearch
      action={basePath}
      q={q}
      placeholder={placeholder}
      clearHref={basePath}
      hasFilters={hasFilters}
    />
  );
}

type CatalogPaginationProps = {
  campaignId: number;
  segment: string;
  page: number;
  totalPages: number;
  total: number;
  filters: CatalogListFilters;
  entityLabel: string;
  ariaLabel: string;
};

export function CatalogPagination({
  campaignId,
  segment,
  page,
  totalPages,
  total,
  filters,
  entityLabel,
  ariaLabel,
}: CatalogPaginationProps) {
  const basePath = catalogSegmentPath(campaignId, segment);

  return (
    <MasterListPagination
      basePath={basePath}
      filterKeys={["q"]}
      filters={filters}
      page={page}
      totalPages={totalPages}
      total={total}
      entityLabel={entityLabel}
      filterLabels={{ q: "texto" }}
      ariaLabel={ariaLabel}
    />
  );
}

export { MASTER_PAGE_SIZE as CATALOG_PAGE_SIZE };

export function catalogListHref(
  campaignId: number,
  segment: string,
  filters: CatalogListFilters,
  page: number
) {
  return masterListHref(
    catalogSegmentPath(campaignId, segment),
    filters,
    page,
    ["q"]
  );
}
