export const JERARQUIA_MIN = 1;
export const JERARQUIA_MAX = 3;

export const JERARQUIA_OPCIONES = [1, 2, 3] as const;

export function etiquetaJerarquia(nivel: number) {
  return `Jerarquía ${nivel}`;
}
