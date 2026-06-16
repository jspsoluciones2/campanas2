import {
  fontFamilyStack,
  googleFontHref,
  shouldLoadGoogleFont,
} from "@/lib/platform/fonts";

export { fontFamilyStack } from "@/lib/platform/fonts";

export function BrandFont({ families }: { families: string[] }) {
  const unique = [...new Set(families.map((f) => f.trim()).filter(Boolean))];

  return (
    <>
      {unique.filter(shouldLoadGoogleFont).map((family) => (
        <link key={family} rel="stylesheet" href={googleFontHref(family)} />
      ))}
    </>
  );
}

export function brandFontFamilyStyle(family: string): { fontFamily: string } {
  return { fontFamily: fontFamilyStack(family) };
}
