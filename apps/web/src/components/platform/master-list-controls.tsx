"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { platformButtonClass } from "@/components/platform/platform-ui";
import {
  MASTER_PAGE_SIZE,
  filterSummaryText,
  masterListHref,
} from "@/lib/platform/master-list";

type MasterListSearchProps = {
  action: string;
  q: string;
  placeholder?: string;
  clearHref: string;
  hasFilters: boolean;
  children?: React.ReactNode;
};

export function MasterListSearch({
  action,
  q,
  placeholder = "Buscar por nombre…",
  clearHref,
  hasFilters,
  children,
}: MasterListSearchProps) {
  return (
    <form
      method="get"
      action={action}
      className="mb-4 flex flex-wrap items-end gap-3"
    >
      <label className="flex min-w-[200px] flex-1 flex-col gap-1.5">
        <span className="text-xs font-medium text-neutral-600">Buscar</span>
        <input
          name="q"
          type="search"
          defaultValue={q}
          placeholder={placeholder}
          className="platform-input h-10 w-full rounded-lg px-3 text-sm text-neutral-800 placeholder:text-neutral-400"
        />
      </label>
      {children}
      <button type="submit" className={platformButtonClass}>
        Buscar
      </button>
      {hasFilters ? (
        <Link
          href={clearHref}
          className="inline-flex h-10 shrink-0 items-center text-sm text-neutral-600 hover:text-neutral-900 hover:underline"
        >
          Limpiar
        </Link>
      ) : null}
    </form>
  );
}

type MasterListPaginationProps = {
  basePath: string;
  filterKeys: string[];
  filters: Record<string, string>;
  page: number;
  totalPages: number;
  total: number;
  entityLabel: string;
  filterLabels?: Record<string, string>;
  ariaLabel: string;
  siblingCount?: number;
};

function buildPaginationRange(page: number, total: number, sibling: number) {
  const totalNumbers = sibling * 2 + 5;
  if (totalNumbers >= total) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const leftSibling = Math.max(page - sibling, 1);
  const rightSibling = Math.min(page + sibling, total);

  const showLeftEllipsis = leftSibling > 2;
  const showRightEllipsis = rightSibling < total - 1;

  if (!showLeftEllipsis && !showRightEllipsis) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const items: (number | "...")[] = [];

  items.push(1);

  if (showLeftEllipsis) {
    items.push("...");
  }

  const loopStart = showLeftEllipsis ? leftSibling : 2;
  const loopEnd = showRightEllipsis ? rightSibling : total - 1;
  for (let i = loopStart; i <= loopEnd; i++) {
    items.push(i);
  }

  if (showRightEllipsis) {
    items.push("...");
  }

  if (total > 1) {
    items.push(total);
  }

  return items;
}

export function MasterListPagination({
  basePath,
  filterKeys,
  filters,
  page,
  totalPages,
  total,
  entityLabel,
  filterLabels = { q: "texto" },
  ariaLabel,
  siblingCount = 3,
}: MasterListPaginationProps) {
  if (total === 0) return null;

  const from = (page - 1) * MASTER_PAGE_SIZE + 1;
  const to = Math.min(page * MASTER_PAGE_SIZE, total);
  const pages = buildPaginationRange(page, totalPages, siblingCount);

  const href = (p: number) => masterListHref(basePath, filters, p, filterKeys);

  return (
    <div className="mt-4 flex flex-col items-center gap-3 border-t border-neutral-100 pt-4 sm:flex-row sm:justify-between">
      <p className="text-sm text-neutral-500">
        Mostrando {from}–{to} de {total} {entityLabel}
        {filterSummaryText(filters, filterLabels)}
      </p>

      {totalPages > 1 ? (
        <nav
          className="flex flex-wrap items-center justify-center gap-1"
          aria-label={ariaLabel}
        >
          {page > 1 ? (
            <Link
              href={href(page - 1)}
              className="inline-flex h-9 min-w-9 items-center justify-center rounded-lg border border-neutral-200 bg-white px-3 text-sm text-neutral-700 hover:bg-neutral-50"
            >
              ←
            </Link>
          ) : (
            <span className="inline-flex h-9 min-w-9 items-center justify-center rounded-lg border border-neutral-100 px-3 text-sm text-neutral-300">
              ←
            </span>
          )}

          {pages.map((p) =>
            p === "..." ? (
              <span
                key={`ellipsis-${Math.random()}`}
                className="inline-flex h-9 w-9 items-center justify-center text-sm text-neutral-400"
              >
                …
              </span>
            ) : (
              <Link
                key={p}
                href={href(p)}
                aria-current={p === page ? "page" : undefined}
                className={cn(
                  "inline-flex h-9 min-w-9 items-center justify-center rounded-lg border px-3 text-sm tabular-nums",
                  p === page
                    ? "border-neutral-800 bg-neutral-800 text-white"
                    : "border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50"
                )}
              >
                {p}
              </Link>
            )
          )}

          {page < totalPages ? (
            <Link
              href={href(page + 1)}
              className="inline-flex h-9 min-w-9 items-center justify-center rounded-lg border border-neutral-200 bg-white px-3 text-sm text-neutral-700 hover:bg-neutral-50"
            >
              →
            </Link>
          ) : (
            <span className="inline-flex h-9 min-w-9 items-center justify-center rounded-lg border border-neutral-100 px-3 text-sm text-neutral-300">
              →
            </span>
          )}

          <form
            method="get"
            action={basePath}
            className="ml-2 flex items-center gap-1"
            onSubmit={(e) => {
              const input = (e.target as HTMLFormElement).querySelector("input[name='page']") as HTMLInputElement;
              const val = Number(input.value);
              if (val < 1 || val > totalPages || Number.isNaN(val)) {
                e.preventDefault();
              }
            }}
          >
            {filterKeys.map((key) => {
              const val = filters[key];
              if (!val) return null;
              return <input key={key} type="hidden" name={key} value={val} />;
            })}
            <span className="text-xs text-neutral-400">Ir a</span>
            <input
              name="page"
              type="number"
              min={1}
              max={totalPages}
              placeholder=""
              className="h-9 w-14 rounded-lg border border-neutral-200 px-2 text-center text-sm tabular-nums text-neutral-700 outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            />
            <button
              type="submit"
              className="inline-flex h-9 min-w-9 items-center justify-center rounded-lg border border-neutral-200 bg-white text-sm text-neutral-700 hover:bg-neutral-50"
            >
              Ir
            </button>
          </form>
        </nav>
      ) : null}
    </div>
  );
}

export { MASTER_PAGE_SIZE };
