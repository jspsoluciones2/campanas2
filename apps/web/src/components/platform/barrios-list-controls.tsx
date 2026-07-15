import {
  MASTER_PAGE_SIZE,
  masterListHref,
} from "@/lib/platform/master-list";
import {
  MasterListPagination,
  MasterListSearch,
} from "@/components/platform/master-list-controls";

export const BARRIOS_LIST_PATH =
  "/platform/maestras/barrios";

export type BarriosListFilters = {
  q: string;
};

export function barrioListHref(
  filters: BarriosListFilters,
  page: number
): string {
  return masterListHref(BARRIOS_LIST_PATH, filters, page, ["q"]);
}

export function BarriosListFilter({ q }: BarriosListFilters) {
  const hasFilters = Boolean(q.trim());

  return (
    <MasterListSearch
      action={BARRIOS_LIST_PATH}
      q={q}
      placeholder="Nombre del barrio"
      clearHref={BARRIOS_LIST_PATH}
      hasFilters={hasFilters}
    />
  );
}

export function BarriosPagination({
  page,
  totalPages,
  total,
  filters,
}: {
  page: number;
  totalPages: number;
  total: number;
  filters: BarriosListFilters;
}) {
  return (
    <MasterListPagination
      basePath={BARRIOS_LIST_PATH}
      filterKeys={["q"]}
      filters={filters}
      page={page}
      totalPages={totalPages}
      total={total}
      entityLabel="barrio(s)"
      filterLabels={{ q: "texto" }}
      ariaLabel="Paginación de barrios"
    />
  );
}

export { MASTER_PAGE_SIZE as PAGE_SIZE };
