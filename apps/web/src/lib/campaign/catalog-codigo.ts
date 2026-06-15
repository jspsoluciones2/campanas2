export function formatCatalogId(codigo: number | null | undefined) {
  if (codigo == null) return "—";
  return String(codigo);
}

export function isActionError(
  result: { error: string } | { ok: boolean } | undefined
): result is { error: string } {
  return Boolean(result && "error" in result);
}

export function catalogSaveError(
  error: { code?: string; message: string } | null,
  entityLabel: string
) {
  if (!error) return null;
  if (error.code === "23505") {
    if (/nombre|novedad/i.test(error.message)) {
      return {
        error: `Ya existe un ${entityLabel} con ese nombre en este catálogo.`,
      };
    }
    return { error: `Ya existe un ${entityLabel} con ese ID.` };
  }
  return { error: error.message };
}

export function isNumericSearchTerm(term: string) {
  return /^\d+$/.test(term);
}
