import {
  MASTER_PAGE_SIZE,
  masterListHref,
} from "@/lib/platform/master-list";
import {
  MasterListPagination,
  MasterListSearch,
} from "@/components/platform/master-list-controls";

export const MAESTRAS_CAMPAIGNS_LIST_PATH = "/platform/maestras/campanas";
export const GESTION_CAMPAIGNS_LIST_PATH = "/platform/campaigns";

/** @deprecated Usar MAESTRAS_CAMPAIGNS_LIST_PATH o GESTION_CAMPAIGNS_LIST_PATH */
export const CAMPAIGNS_LIST_PATH = GESTION_CAMPAIGNS_LIST_PATH;

export type CampaignListFilters = {
  q: string;
};

export function campaignsListHref(
  listPath: string,
  filters: CampaignListFilters,
  page: number
): string {
  return masterListHref(listPath, filters, page, ["q"]);
}

export function CampaignsListFilter({
  q,
  listPath = GESTION_CAMPAIGNS_LIST_PATH,
}: CampaignListFilters & { listPath?: string }) {
  const hasFilters = Boolean(q.trim());

  return (
    <MasterListSearch
      action={listPath}
      q={q}
      placeholder="Campaña, cliente o proceso electoral"
      clearHref={listPath}
      hasFilters={hasFilters}
    />
  );
}

export function CampaignsPagination({
  page,
  totalPages,
  total,
  filters,
  listPath = GESTION_CAMPAIGNS_LIST_PATH,
}: {
  page: number;
  totalPages: number;
  total: number;
  filters: CampaignListFilters;
  listPath?: string;
}) {
  return (
    <MasterListPagination
      basePath={listPath}
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
