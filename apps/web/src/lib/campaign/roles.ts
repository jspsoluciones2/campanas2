export const JERARQUIA_MIN = 1;

export function etiquetaJerarquia(nivel: number) {
  return `Jerarquía ${nivel}`;
}

export function maxNivelJerarquia(niveles: Array<number | string>): number {
  if (niveles.length === 0) return 0;
  return Math.max(...niveles.map((n) => Number(n)));
}

/** Siguiente nivel sugerido al crear un rol (1 si no hay roles aún). */
export function siguienteNivelJerarquia(nivelesExistentes: Array<number | string>): number {
  const max = maxNivelJerarquia(nivelesExistentes);
  return max === 0 ? JERARQUIA_MIN : max + 1;
}

export function validarNivelJerarquia(nivel: number): string | null {
  if (!Number.isInteger(nivel) || nivel < JERARQUIA_MIN) {
    return "La jerarquía debe ser un número entero mayor o igual a 1.";
  }
  return null;
}

/** Jerarquía 1 = más alto. El líder debe estar por encima del votante. */
export function liderJerarquiaValida(
  nivelLider: number,
  nivelVotante: number
): boolean {
  return nivelLider < nivelVotante;
}

export function rolesBajoJerarquia<T extends { nivel_jerarquia: number }>(
  roles: T[],
  nivelLider: number
): T[] {
  return roles.filter((rol) => rol.nivel_jerarquia > nivelLider);
}

export function rolesJerarquiaMaxima<T extends { nivel_jerarquia: number }>(
  roles: T[]
): T[] {
  return roles.filter((rol) => rol.nivel_jerarquia === JERARQUIA_MIN);
}
