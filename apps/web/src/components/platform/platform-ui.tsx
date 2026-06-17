import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { textoTitulo } from "@/lib/normalize-text";

export const platformInputClass =
  "platform-input h-10 w-full rounded-lg px-3 text-sm text-neutral-800 placeholder:text-neutral-400";

export const platformSelectClass =
  "platform-input h-10 w-full min-w-0 rounded-lg px-3 text-sm text-neutral-800";

/** Enlaces y acciones con apariencia de botón (mismo color que branding). */
export const platformButtonClass =
  "platform-btn h-10 px-6 whitespace-nowrap";

type PageHeaderProps = {
  title: string;
  description?: string;
  status?: React.ReactNode;
  backHref?: string;
  backLabel?: string;
  children?: React.ReactNode;
};

export function PageHeader({
  title,
  description,
  status,
  backHref,
  backLabel,
  children,
}: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0 flex-1">
        <h1 className="platform-page-title text-2xl tracking-tight">
          {title}
        </h1>
        {description && (
          <p className="platform-page-subtitle mt-1 max-w-2xl text-sm">
            {description}
          </p>
        )}
        {status ? <div className="mt-2">{status}</div> : null}
      </div>
      {(backHref || children) && (
        <div className="flex shrink-0 flex-wrap items-center justify-end gap-2 self-end sm:pt-0.5">
          {backHref && (
            <Link
              href={backHref}
              className={cn(platformButtonClass, "gap-2")}
            >
              <ArrowLeft className="size-4 shrink-0" aria-hidden />
              {backLabel ?? "Volver"}
            </Link>
          )}
          {children}
        </div>
      )}
    </div>
  );
}

type CardProps = {
  title?: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "accent";
};

export function Card({
  title,
  description,
  action,
  children,
  className,
  variant = "default",
}: CardProps) {
  const isAccent = variant === "accent";

  return (
    <section
      className={cn(
        "platform-card rounded-xl shadow-sm shadow-neutral-200/60",
        isAccent && "platform-card-accent",
        className
      )}
    >
      {(title || action) && (
        <div
          className={cn(
            "flex items-start justify-between gap-4 px-6 py-4",
            isAccent
              ? "platform-card-accent-header"
              : "border-b border-neutral-100"
          )}
        >
          <div>
            {title && (
              <h2
                className={cn(
                  isAccent
                    ? "platform-card-accent-title platform-card-title text-base tracking-tight"
                    : "platform-card-title text-sm"
                )}
              >
                {isAccent ? (
                  <span className="inline-flex items-center gap-2.5">
                    <span
                      className="platform-card-accent-marker inline-block h-2 w-2 shrink-0 rounded-full"
                      aria-hidden
                    />
                    {title}
                  </span>
                ) : (
                  title
                )}
              </h2>
            )}
            {description && (
              <p className="platform-card-desc mt-0.5 text-xs">
                {description}
              </p>
            )}
          </div>
          {action}
        </div>
      )}
      <div className="p-6">{children}</div>
    </section>
  );
}

type StatCardProps = {
  label: string;
  value: number | string;
  href?: string;
};

export function StatCard({ label, value, href }: StatCardProps) {
  const inner = (
    <>
      <p className="platform-stat-value text-3xl tabular-nums">{value}</p>
      <p className="platform-stat-label mt-1 text-sm">{label}</p>
    </>
  );

  const className =
    "platform-card group rounded-xl p-6 shadow-sm shadow-neutral-200/60 transition-shadow hover:shadow-md";

  if (href) {
    return (
      <Link href={href} className={className}>
        {inner}
      </Link>
    );
  }

  return <div className={className}>{inner}</div>;
}

type BadgeVariant = "activa" | "pausada" | "finalizada" | "purgada" | "default";

const BADGE_STYLES: Record<BadgeVariant, string> = {
  activa: "bg-neutral-800 text-white",
  pausada: "bg-neutral-500 text-white",
  finalizada: "bg-neutral-200 text-neutral-800",
  purgada: "bg-neutral-100 text-neutral-500",
  default: "bg-neutral-100 text-neutral-700",
};

export function StatusBadge({
  children,
  variant = "default",
}: {
  children: React.ReactNode;
  variant?: BadgeVariant;
}) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium",
        BADGE_STYLES[variant] ?? BADGE_STYLES.default
      )}
    >
      {children}
    </span>
  );
}

type Column<T> = {
  key: string;
  header: string;
  cell: (row: T) => React.ReactNode;
  className?: string;
};

type DataTableProps<T> = {
  columns: Column<T>[];
  data: T[];
  emptyMessage: string;
  rowKey: (row: T) => string;
};

export function DataTable<T>({
  columns,
  data,
  emptyMessage,
  rowKey,
}: DataTableProps<T>) {
  return (
    <div className="overflow-hidden rounded-lg border border-neutral-100">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-neutral-100 bg-neutral-50/80 text-left">
            {columns.map((col) => (
              <th
                key={col.key}
                className={cn(
                  "platform-table-head px-4 py-3 text-xs tracking-wide",
                  col.className
                )}
              >
                {textoTitulo(col.header)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-100">
          {data.length ? (
            data.map((row) => (
              <tr
                key={rowKey(row)}
                className="bg-white transition-colors hover:bg-neutral-50/50"
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={cn("platform-body-text px-4 py-3", col.className)}
                  >
                    {col.cell(row)}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan={columns.length}
                className="platform-page-subtitle px-4 py-12 text-center text-sm"
              >
                {emptyMessage}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export function EmptyState({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="rounded-lg border border-dashed border-neutral-200 bg-neutral-50/50 px-6 py-10 text-center">
      <p className="platform-card-title text-sm">{title}</p>
      {description && (
        <p className="platform-card-desc mt-1 text-sm">{description}</p>
      )}
    </div>
  );
}

export function FormRow({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-wrap items-end gap-3", className)}>
      {children}
    </div>
  );
}

export function FormField({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={cn("flex min-w-[140px] flex-1 flex-col gap-1.5", className)}>
      <span className="platform-label-text text-xs">{label}</span>
      {children}
    </label>
  );
}
