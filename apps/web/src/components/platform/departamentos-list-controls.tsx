import {
  MASTER_PAGE_SIZE,
  masterListHref,
} from "@/lib/platform/master-list";
import {
  MasterListPagination,
  MasterListSearch,
} from "@/components/platform/master-list-controls";

export const DEPARTAMENTOS_LIST_PATH =
  "/platform/maestras/departamentos";

export type DepartamentosListFilters = {
  q: string;
};

export function departamentoListHref(
  filters: DepartamentosListFilters,
  page: number
): string {
  return masterListHref(DEPARTAMENTOS_LIST_PATH, filters, page, ["q"]);
}

export function DepartamentosListFilter({ q }: DepartamentosListFilters) {
  const hasFilters = Boolean(q.trim());

  return (
    <MasterListSearch
      action={DEPARTAMENTOS_LIST_PATH}
      q={q}
      placeholder="Nombre del departamento"
      clearHref={DEPARTAMENTOS_LIST_PATH}
      hasFilters={hasFilters}
    />
  );
}

export function DepartamentosPagination({
  page,
  totalPages,
  total,
  filters,
}: {
  page: number;
  totalPages: number;
  total: number;
  filters: DepartamentosListFilters;
}) {
  return (
    <MasterListPagination
      basePath={DEPARTAMENTOS_LIST_PATH}
      filterKeys={["q"]}
      filters={filters}
      page={page}
      totalPages={totalPages}
      total={total}
      entityLabel="departamento(s)"
      filterLabels={{ q: "texto" }}
      ariaLabel="Paginación de departamentos"
    />
  );
}

export { MASTER_PAGE_SIZE as PAGE_SIZE };
