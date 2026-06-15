import {
  MASTER_PAGE_SIZE,
  masterListHref,
} from "@/lib/platform/master-list";
import {
  MasterListPagination,
  MasterListSearch,
} from "@/components/platform/master-list-controls";

export const APIS_LIST_PATH = "/platform/maestras/apis";

export type ApisListFilters = {
  q: string;
};

export function apisListHref(filters: ApisListFilters, page: number): string {
  return masterListHref(APIS_LIST_PATH, filters, page, ["q"]);
}

export function ApisListFilter({ q }: ApisListFilters) {
  return (
    <MasterListSearch
      action={APIS_LIST_PATH}
      q={q}
      placeholder="Twilio, Capsolver o IA"
      clearHref={APIS_LIST_PATH}
      hasFilters={Boolean(q.trim())}
    />
  );
}

export function ApisPagination({
  page,
  totalPages,
  total,
  filters,
}: {
  page: number;
  totalPages: number;
  total: number;
  filters: ApisListFilters;
}) {
  return (
    <MasterListPagination
      basePath={APIS_LIST_PATH}
      filterKeys={["q"]}
      filters={filters}
      page={page}
      totalPages={totalPages}
      total={total}
      entityLabel="integración(es)"
      filterLabels={{ q: "texto" }}
      ariaLabel="Paginación de integraciones API"
    />
  );
}

export { MASTER_PAGE_SIZE as PAGE_SIZE };
