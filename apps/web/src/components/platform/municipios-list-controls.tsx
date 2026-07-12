import {
  MASTER_PAGE_SIZE,
  masterListHref,
} from "@/lib/platform/master-list";
import {
  MasterListPagination,
  MasterListSearch,
} from "@/components/platform/master-list-controls";

export const MUNICIPIOS_LIST_PATH =
  "/platform/maestras/municipios";

export type MunicipiosListFilters = {
  q: string;
};

export function municipioListHref(
  filters: MunicipiosListFilters,
  page: number
): string {
  return masterListHref(MUNICIPIOS_LIST_PATH, filters, page, ["q"]);
}

export function MunicipiosListFilter({ q }: MunicipiosListFilters) {
  const hasFilters = Boolean(q.trim());

  return (
    <MasterListSearch
      action={MUNICIPIOS_LIST_PATH}
      q={q}
      placeholder="Nombre del municipio"
      clearHref={MUNICIPIOS_LIST_PATH}
      hasFilters={hasFilters}
    />
  );
}

export function MunicipiosPagination({
  page,
  totalPages,
  total,
  filters,
}: {
  page: number;
  totalPages: number;
  total: number;
  filters: MunicipiosListFilters;
}) {
  return (
    <MasterListPagination
      basePath={MUNICIPIOS_LIST_PATH}
      filterKeys={["q"]}
      filters={filters}
      page={page}
      totalPages={totalPages}
      total={total}
      entityLabel="municipio(s)"
      filterLabels={{ q: "texto" }}
      ariaLabel="Paginación de municipios"
    />
  );
}

export { MASTER_PAGE_SIZE as PAGE_SIZE };
