export const MASTER_PAGE_SIZE = 6;

export function escapeIlikeTerm(value: string): string {
  return value.replace(/[%_\\]/g, "").trim();
}

export function masterListHref(
  basePath: string,
  filters: Record<string, string>,
  page: number,
  keys: string[] = ["q"]
): string {
  const params = new URLSearchParams();
  for (const key of keys) {
    const value = (filters[key] ?? "").trim();
    if (value) params.set(key, value);
  }
  if (page > 1) params.set("page", String(page));
  const qs = params.toString();
  return `${basePath}${qs ? `?${qs}` : ""}`;
}

export function filterSummaryText(
  filters: Record<string, string>,
  labels: Record<string, string>
): string {
  const parts: string[] = [];
  for (const [key, label] of Object.entries(labels)) {
    const value = (filters[key] ?? "").trim();
    if (value) parts.push(`${label}: “${value}”`);
  }
  return parts.length ? ` · ${parts.join(" · ")}` : "";
}
