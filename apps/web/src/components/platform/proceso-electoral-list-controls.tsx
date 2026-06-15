import {
  MASTER_PAGE_SIZE,
  masterListHref,
} from "@/lib/platform/master-list";
import {
  MasterListPagination,
  MasterListSearch,
} from "@/components/platform/master-list-controls";

export const PROCESO_ELECTORAL_LIST_PATH =
  "/platform/maestras/proceso-electoral";

export type ProcesoElectoralListFilters = {
  q: string;
};

export function procesoElectoralListHref(
  filters: ProcesoElectoralListFilters,
  page: number
): string {
  return masterListHref(PROCESO_ELECTORAL_LIST_PATH, filters, page, ["q"]);
}

export function ProcesoElectoralListFilter({ q }: ProcesoElectoralListFilters) {
  const filters = { q };
  const hasFilters = Boolean(q.trim());

  return (
    <MasterListSearch
      action={PROCESO_ELECTORAL_LIST_PATH}
      q={q}
      placeholder="Nombre del proceso electoral"
      clearHref={PROCESO_ELECTORAL_LIST_PATH}
      hasFilters={hasFilters}
    />
  );
}

export function ProcesoElectoralPagination({
  page,
  totalPages,
  total,
  filters,
}: {
  page: number;
  totalPages: number;
  total: number;
  filters: ProcesoElectoralListFilters;
}) {
  return (
    <MasterListPagination
      basePath={PROCESO_ELECTORAL_LIST_PATH}
      filterKeys={["q"]}
      filters={filters}
      page={page}
      totalPages={totalPages}
      total={total}
      entityLabel="proceso(s)"
      filterLabels={{ q: "texto" }}
      ariaLabel="Paginación de procesos electorales"
    />
  );
}

export { MASTER_PAGE_SIZE as PAGE_SIZE };
