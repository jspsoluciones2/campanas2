import {
  MASTER_PAGE_SIZE,
  masterListHref,
} from "@/lib/platform/master-list";
import {
  MasterListPagination,
  MasterListSearch,
} from "@/components/platform/master-list-controls";

export const CAMPAIGNS_LIST_PATH = "/platform/campaigns";

export type CampaignListFilters = {
  q: string;
};

export function campaignsListHref(
  filters: CampaignListFilters,
  page: number
): string {
  return masterListHref(CAMPAIGNS_LIST_PATH, filters, page, ["q"]);
}

export function CampaignsListFilter({ q }: CampaignListFilters) {
  const hasFilters = Boolean(q.trim());

  return (
    <MasterListSearch
      action={CAMPAIGNS_LIST_PATH}
      q={q}
      placeholder="Campaña, cliente o proceso electoral"
      clearHref={CAMPAIGNS_LIST_PATH}
      hasFilters={hasFilters}
    />
  );
}

export function CampaignsPagination({
  page,
  totalPages,
  total,
  filters,
}: {
  page: number;
  totalPages: number;
  total: number;
  filters: CampaignListFilters;
}) {
  return (
    <MasterListPagination
      basePath={CAMPAIGNS_LIST_PATH}
      filterKeys={["q"]}
      filters={filters}
      page={page}
      totalPages={totalPages}
      total={total}
      entityLabel="campaña(s)"
      filterLabels={{ q: "texto" }}
      ariaLabel="Paginación de campañas"
    />
  );
}

export { MASTER_PAGE_SIZE as PAGE_SIZE };
