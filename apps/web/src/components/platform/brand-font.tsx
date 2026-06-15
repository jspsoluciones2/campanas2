import { FONT_OPTIONS } from "@/lib/platform/brand";

const GOOGLE_FONT_FAMILIES = new Set<string>(
  FONT_OPTIONS.filter((font) => font !== "system-ui")
);

function googleFontHref(family: string): string {
  const query = family.trim().replace(/\s+/g, "+");
  return `https://fonts.googleapis.com/css2?family=${query}:wght@400;500;600;700&display=swap`;
}

type BrandFontProps = {
  family: string;
};

export function BrandFont({ family }: BrandFontProps) {
  const normalized = family.trim();
  if (!normalized || normalized === "system-ui" || !GOOGLE_FONT_FAMILIES.has(normalized)) {
    return null;
  }

  return <link rel="stylesheet" href={googleFontHref(normalized)} />;
}

export function brandFontFamilyStyle(family: string): { fontFamily: string } {
  const normalized = family.trim() || "Inter";
  const stack =
    normalized === "system-ui"
      ? "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
      : `'${normalized}', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`;

  return { fontFamily: stack };
}
