import {
  MASTER_PAGE_SIZE,
  masterListHref,
} from "@/lib/platform/master-list";
import {
  MasterListPagination,
  MasterListSearch,
} from "@/components/platform/master-list-controls";

export const PUESTOS_LIST_PATH =
  "/platform/maestras/puestos-votacion";

export type PuestosListFilters = {
  q: string;
};

export function puestoListHref(
  filters: PuestosListFilters,
  page: number
): string {
  return masterListHref(PUESTOS_LIST_PATH, filters, page, ["q"]);
}

export function PuestosListFilter({ q }: PuestosListFilters) {
  const hasFilters = Boolean(q.trim());

  return (
    <MasterListSearch
      action={PUESTOS_LIST_PATH}
      q={q}
      placeholder="Nombre del puesto"
      clearHref={PUESTOS_LIST_PATH}
      hasFilters={hasFilters}
    />
  );
}

export function PuestosPagination({
  page,
  totalPages,
  total,
  filters,
}: {
  page: number;
  totalPages: number;
  total: number;
  filters: PuestosListFilters;
}) {
  return (
    <MasterListPagination
      basePath={PUESTOS_LIST_PATH}
      filterKeys={["q"]}
      filters={filters}
      page={page}
      totalPages={totalPages}
      total={total}
      entityLabel="puesto(s)"
      filterLabels={{ q: "texto" }}
      ariaLabel="Paginación de puestos de votación"
    />
  );
}

export { MASTER_PAGE_SIZE as PAGE_SIZE };
