import {
  MASTER_PAGE_SIZE,
  masterListHref,
} from "@/lib/platform/master-list";
import {
  MasterListPagination,
  MasterListSearch,
} from "@/components/platform/master-list-controls";

const PAGE_SIZE = MASTER_PAGE_SIZE;

export { PAGE_SIZE };

export type ClientListFilters = {
  q: string;
  documento: string;
};

export const CLIENTS_LIST_PATH = "/platform/maestras/clientes";

const FILTER_KEYS = ["q", "documento"] as const;

export function clientsListHref(
  filters: ClientListFilters,
  page: number
): string {
  return masterListHref(CLIENTS_LIST_PATH, filters, page, [...FILTER_KEYS]);
}

function hasActiveFilters(filters: ClientListFilters): boolean {
  return Boolean(filters.q.trim() || filters.documento.trim());
}

type ClientsListFilterProps = ClientListFilters;

export function ClientsListFilter({ q, documento }: ClientsListFilterProps) {
  const filters = { q, documento };

  return (
    <MasterListSearch
      action={CLIENTS_LIST_PATH}
      q={q}
      placeholder="Nombre, correo o teléfono"
      clearHref={CLIENTS_LIST_PATH}
      hasFilters={hasActiveFilters(filters)}
    >
      <label className="flex w-full min-w-[140px] max-w-[200px] flex-col gap-1.5">
        <span className="text-xs font-medium text-neutral-600">Documento</span>
        <input
          name="documento"
          type="search"
          defaultValue={documento}
          placeholder="CC / NIT"
          className="platform-input h-10 w-full rounded-lg px-3 text-sm text-neutral-800 placeholder:text-neutral-400"
        />
      </label>
    </MasterListSearch>
  );
}

type ClientsPaginationProps = {
  page: number;
  totalPages: number;
  total: number;
  filters: ClientListFilters;
};

export function ClientsPagination({
  page,
  totalPages,
  total,
  filters,
}: ClientsPaginationProps) {
  return (
    <MasterListPagination
      basePath={CLIENTS_LIST_PATH}
      filterKeys={[...FILTER_KEYS]}
      filters={filters}
      page={page}
      totalPages={totalPages}
      total={total}
      entityLabel="cliente(s)"
      filterLabels={{ q: "texto", documento: "documento" }}
      ariaLabel="Paginación de clientes"
    />
  );
}
