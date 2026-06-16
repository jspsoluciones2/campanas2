import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import {
  BrandFont,
  brandFontFamilyStyle,
} from "@/components/platform/brand-font";
import {
  buildAppMetadata,
} from "@/lib/platform/brand-metadata";
import { resolveFaviconUrl, collectTypographyFontFamilies } from "@/lib/platform/brand";
import { loadPlatformBrand } from "@/lib/platform/load-platform-brand";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const brand = await loadPlatformBrand();
  return buildAppMetadata(brand);
}

export const dynamic = "force-dynamic";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const brand = await loadPlatformBrand();
  const faviconUrl = resolveFaviconUrl(brand);

  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      style={brandFontFamilyStyle(brand.fuenteCuerpo)}
    >
      <head>
        <BrandFont families={collectTypographyFontFamilies(brand)} />
        {faviconUrl ? (
          <>
            <link rel="icon" href={faviconUrl} />
            <link rel="shortcut icon" href={faviconUrl} />
          </>
        ) : null}
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
