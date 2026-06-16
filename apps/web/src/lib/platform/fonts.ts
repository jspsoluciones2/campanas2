export const FONT_OPTIONS = [
  "Inter",
  "system-ui",
  "Roboto",
  "Open Sans",
  "Poppins",
  "Montserrat",
  "Lato",
  "Nunito",
] as const;

export const GOOGLE_FONT_FAMILIES = new Set<string>(
  FONT_OPTIONS.filter((font) => font !== "system-ui")
);

export function fontFamilyStack(family: string): string {
  const normalized = family.trim() || "Inter";
  return normalized === "system-ui"
    ? "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    : `'${normalized}', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`;
}

export function googleFontHref(family: string): string {
  const query = family.trim().replace(/\s+/g, "+");
  return `https://fonts.googleapis.com/css2?family=${query}:wght@400;500;600;700&display=swap`;
}

export function shouldLoadGoogleFont(family: string): boolean {
  const normalized = family.trim();
  return Boolean(normalized && normalized !== "system-ui" && GOOGLE_FONT_FAMILIES.has(normalized));
}
