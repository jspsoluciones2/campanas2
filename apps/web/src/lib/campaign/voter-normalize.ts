export function normalizarDocumento(documento: string) {
  return documento.replace(/\D/g, "");
}

export function edadEnAnos(
  fechaNacimiento: string,
  referencia: Date = new Date()
): number | null {
  const partes = fechaNacimiento.slice(0, 10).split("-").map(Number);
  if (partes.length !== 3 || partes.some((n) => Number.isNaN(n))) {
    return null;
  }
  const [year, month, day] = partes;
  const nacimiento = new Date(year, month - 1, day);
  if (Number.isNaN(nacimiento.getTime())) return null;

  let edad = referencia.getFullYear() - nacimiento.getFullYear();
  const mesRef = referencia.getMonth();
  const diaRef = referencia.getDate();
  if (
    mesRef < nacimiento.getMonth() ||
    (mesRef === nacimiento.getMonth() && diaRef < nacimiento.getDate())
  ) {
    edad -= 1;
  }
  return edad;
}

export function esMayorOIgual18(
  fechaNacimiento: string,
  referencia: Date = new Date()
): boolean {
  const edad = edadEnAnos(fechaNacimiento, referencia);
  return edad !== null && edad >= 18;
}

export function errorCcMenorEdad(
  tipoDocumento: string | null | undefined,
  fechaNacimiento: string | null | undefined
): string | null {
  if ((tipoDocumento || "CC").toUpperCase() !== "CC") return null;
  if (!fechaNacimiento) return null;
  if (esMayorOIgual18(fechaNacimiento)) return null;
  return (
    "Menores de 18 años no pueden tener cédula de ciudadanía (CC). " +
    "Use tarjeta de identidad (TI)."
  );
}

export function normalizarTelefono(telefono: string | null | undefined) {
  if (!telefono?.trim()) return null;
  const digits = telefono.replace(/\D/g, "");
  if (!digits) return null;

  let mobile: string | null = null;
  if (digits.startsWith("57") && digits.length === 12) {
    mobile = digits.slice(2);
  } else if (digits.length === 10) {
    mobile = digits;
  } else {
    return null;
  }

  if (mobile.length !== 10 || mobile[0] !== "3") return null;
  return `+57${mobile}`;
}

export function errorTelefonoInvalido(telefono: string | null | undefined) {
  if (!telefono?.trim()) return null;
  if (!normalizarTelefono(telefono)) {
    return "Celular inválido. Use 10 dígitos que empiecen por 3 (ej: 3001234567).";
  }
  return null;
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
