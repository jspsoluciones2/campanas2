/** Primera letra de cada palabra en mayúscula (clientes, votantes, catálogos). */
function capitalizarPalabra(word: string): string {
  if (!word) return word;
  return (
    word.charAt(0).toLocaleUpperCase("es-CO") +
    word.slice(1).toLocaleLowerCase("es-CO")
  );
}

function capitalizarSegmento(segment: string): string {
  return segment
    .split("-")
    .map((part) => capitalizarPalabra(part))
    .join("-");
}

export function textoTitulo(value: string): string {
  return value
    .trim()
    .split(/\s+/)
    .map(capitalizarSegmento)
    .join(" ");
}

export function textoTituloOpcional(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  return textoTitulo(trimmed);
}

/** Correos siempre en minúsculas. */
export function correoNormalizado(value: string): string | null {
  const trimmed = value.trim().toLowerCase();
  if (!trimmed) return null;
  return trimmed;
}
