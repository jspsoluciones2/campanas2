export function normalizarDocumento(documento: string) {
  return documento.replace(/\D/g, "");
}

export function normalizarTelefono(telefono: string | null | undefined) {
  if (!telefono?.trim()) return null;
  const digits = telefono.replace(/\D/g, "");
  if (!digits) return null;
  if (digits.startsWith("57") && digits.length >= 12) return `+${digits}`;
  if (digits.length === 10) return `+57${digits}`;
  if (digits.length === 11 && digits.startsWith("3")) return `+57${digits}`;
  return `+${digits}`;
}

function nombreCompleto(nombres: string, apellidos: string) {
  return `${apellidos} ${nombres}`.trim().toLowerCase();
}

function levenshtein(a: string, b: string) {
  const rows = a.length + 1;
  const cols = b.length + 1;
  const matrix = Array.from({ length: rows }, () =>
    Array<number>(cols).fill(0)
  );

  for (let i = 0; i < rows; i++) matrix[i][0] = i;
  for (let j = 0; j < cols; j++) matrix[0][j] = j;

  for (let i = 1; i < rows; i++) {
    for (let j = 1; j < cols; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }

  return matrix[a.length][b.length];
}

export function similitudNombre(
  nombresA: string,
  apellidosA: string,
  nombresB: string,
  apellidosB: string
) {
  const a = nombreCompleto(nombresA, apellidosA);
  const b = nombreCompleto(nombresB, apellidosB);
  if (!a || !b) return 0;
  const maxLen = Math.max(a.length, b.length);
  if (maxLen === 0) return 0;
  return 1 - levenshtein(a, b) / maxLen;
}
