import {
  MASTER_PAGE_SIZE,
  masterListHref,
} from "@/lib/platform/master-list";
import {
  MasterListPagination,
  MasterListSearch,
} from "@/components/platform/master-list-controls";

export const COMUNAS_LIST_PATH =
  "/platform/maestras/comunas";

export type ComunasListFilters = {
  q: string;
};

export function comunaListHref(
  filters: ComunasListFilters,
  page: number
): string {
  return masterListHref(COMUNAS_LIST_PATH, filters, page, ["q"]);
}

export function ComunasListFilter({ q }: ComunasListFilters) {
  const hasFilters = Boolean(q.trim());

  return (
    <MasterListSearch
      action={COMUNAS_LIST_PATH}
      q={q}
      placeholder="Nombre de la comuna"
      clearHref={COMUNAS_LIST_PATH}
      hasFilters={hasFilters}
    />
  );
}

export function ComunasPagination({
  page,
  totalPages,
  total,
  filters,
}: {
  page: number;
  totalPages: number;
  total: number;
  filters: ComunasListFilters;
}) {
  return (
    <MasterListPagination
      basePath={COMUNAS_LIST_PATH}
      filterKeys={["q"]}
      filters={filters}
      page={page}
      totalPages={totalPages}
      total={total}
      entityLabel="comuna(s)"
      filterLabels={{ q: "texto" }}
      ariaLabel="Paginación de comunas"
    />
  );
}

export { MASTER_PAGE_SIZE as PAGE_SIZE };
