import type { CSSProperties } from "react";
import { fontFamilyStack } from "@/lib/platform/fonts";
import { isValidHexColor } from "@/lib/platform/brand";

export const FONT_WEIGHT_OPTIONS = [
  { value: 400, label: "Regular" },
  { value: 500, label: "Medio" },
  { value: 600, label: "Semi-negrita" },
  { value: 700, label: "Negrita" },
] as const;

export type FontWeightValue = (typeof FONT_WEIGHT_OPTIONS)[number]["value"];

export type BrandTypography = {
  fuenteTitulos: string;
  fuenteSubtitulos: string;
  fuenteCuerpo: string;
  colorTitulo: string;
  colorSubtitulo: string;
  colorTexto: string;
  colorEtiqueta: string;
  pesoTitulo: FontWeightValue;
  pesoSubtitulo: FontWeightValue;
  pesoTexto: FontWeightValue;
  pesoEtiqueta: FontWeightValue;
};

export const TYPOGRAPHY_DEFAULTS: BrandTypography = {
  fuenteTitulos: "Inter",
  fuenteSubtitulos: "Inter",
  fuenteCuerpo: "Inter",
  colorTitulo: "#111827",
  colorSubtitulo: "#6b7280",
  colorTexto: "#374151",
  colorEtiqueta: "#525252",
  pesoTitulo: 600,
  pesoSubtitulo: 400,
  pesoTexto: 400,
  pesoEtiqueta: 500,
};

const VALID_WEIGHTS = new Set<number>(FONT_WEIGHT_OPTIONS.map((w) => w.value));

export function isValidFontWeight(value: number): value is FontWeightValue {
  return VALID_WEIGHTS.has(value);
}

export function parseFontWeight(value: string | number | null | undefined, fallback: FontWeightValue): FontWeightValue {
  const parsed = typeof value === "number" ? value : Number.parseInt(String(value ?? ""), 10);
  return isValidFontWeight(parsed) ? parsed : fallback;
}

export function typographyFormDefaults(familiaFuente: string): BrandTypography {
  const base = familiaFuente.trim() || TYPOGRAPHY_DEFAULTS.fuenteCuerpo;
  return {
    ...TYPOGRAPHY_DEFAULTS,
    fuenteTitulos: base,
    fuenteSubtitulos: base,
    fuenteCuerpo: base,
  };
}

export function typographyToCssVars(typography: BrandTypography): CSSProperties {
  return {
    ["--platform-font-title" as string]: fontFamilyStack(typography.fuenteTitulos),
    ["--platform-font-subtitle" as string]: fontFamilyStack(typography.fuenteSubtitulos),
    ["--platform-font-body" as string]: fontFamilyStack(typography.fuenteCuerpo),
    ["--platform-color-title" as string]: typography.colorTitulo,
    ["--platform-color-subtitle" as string]: typography.colorSubtitulo,
    ["--platform-color-body" as string]: typography.colorTexto,
    ["--platform-color-label" as string]: typography.colorEtiqueta,
    ["--platform-weight-title" as string]: String(typography.pesoTitulo),
    ["--platform-weight-subtitle" as string]: String(typography.pesoSubtitulo),
    ["--platform-weight-body" as string]: String(typography.pesoTexto),
    ["--platform-weight-label" as string]: String(typography.pesoEtiqueta),
  };
}

export type BrandTypographyFormInput = {
  fuente_titulos: string;
  fuente_subtitulos: string;
  fuente_cuerpo: string;
  color_titulo: string;
  color_subtitulo: string;
  color_texto: string;
  color_etiqueta: string;
  peso_titulo: string;
  peso_subtitulo: string;
  peso_texto: string;
  peso_etiqueta: string;
};

export function validateTypographyFormInput(
  input: BrandTypographyFormInput
): string | null {
  const fonts: [string, string][] = [
    ["títulos", input.fuente_titulos],
    ["subtítulos", input.fuente_subtitulos],
    ["texto general", input.fuente_cuerpo],
  ];

  for (const [label, value] of fonts) {
    if (!value.trim()) return `Selecciona la tipografía de ${label}.`;
  }

  const colors: [string, string][] = [
    ["títulos", input.color_titulo],
    ["subtítulos", input.color_subtitulo],
    ["texto general", input.color_texto],
    ["etiquetas", input.color_etiqueta],
  ];

  for (const [label, value] of colors) {
    if (!isValidHexColor(value)) {
      return `El color de ${label} debe estar en formato #RRGGBB.`;
    }
  }

  const weights: [string, string][] = [
    ["títulos", input.peso_titulo],
    ["subtítulos", input.peso_subtitulo],
    ["texto general", input.peso_texto],
    ["etiquetas", input.peso_etiqueta],
  ];

  for (const [label, value] of weights) {
    if (!isValidFontWeight(Number.parseInt(value, 10))) {
      return `El grosor de ${label} no es válido.`;
    }
  }

  return null;
}

export function typographyFromFormInput(
  input: BrandTypographyFormInput,
  familiaFuenteFallback: string
): BrandTypography {
  const fallback = typographyFormDefaults(familiaFuenteFallback);
  return {
    fuenteTitulos: input.fuente_titulos.trim() || fallback.fuenteTitulos,
    fuenteSubtitulos: input.fuente_subtitulos.trim() || fallback.fuenteSubtitulos,
    fuenteCuerpo: input.fuente_cuerpo.trim() || fallback.fuenteCuerpo,
    colorTitulo: input.color_titulo.trim() || fallback.colorTitulo,
    colorSubtitulo: input.color_subtitulo.trim() || fallback.colorSubtitulo,
    colorTexto: input.color_texto.trim() || fallback.colorTexto,
    colorEtiqueta: input.color_etiqueta.trim() || fallback.colorEtiqueta,
    pesoTitulo: parseFontWeight(input.peso_titulo, fallback.pesoTitulo),
    pesoSubtitulo: parseFontWeight(input.peso_subtitulo, fallback.pesoSubtitulo),
    pesoTexto: parseFontWeight(input.peso_texto, fallback.pesoTexto),
    pesoEtiqueta: parseFontWeight(input.peso_etiqueta, fallback.pesoEtiqueta),
  };
}

export function typographyToFormInput(typography: BrandTypography): BrandTypographyFormInput {
  return {
    fuente_titulos: typography.fuenteTitulos,
    fuente_subtitulos: typography.fuenteSubtitulos,
    fuente_cuerpo: typography.fuenteCuerpo,
    color_titulo: typography.colorTitulo,
    color_subtitulo: typography.colorSubtitulo,
    color_texto: typography.colorTexto,
    color_etiqueta: typography.colorEtiqueta,
    peso_titulo: String(typography.pesoTitulo),
    peso_subtitulo: String(typography.pesoSubtitulo),
    peso_texto: String(typography.pesoTexto),
    peso_etiqueta: String(typography.pesoEtiqueta),
  };
}

export function collectTypographyFontFamilies(typography: BrandTypography): string[] {
  return [...new Set([
    typography.fuenteTitulos,
    typography.fuenteSubtitulos,
    typography.fuenteCuerpo,
  ].map((f) => f.trim()).filter(Boolean))];
}
