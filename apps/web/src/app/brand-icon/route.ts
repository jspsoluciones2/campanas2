import { headers } from "next/headers";
import { resolveFaviconUrl } from "@/lib/platform/brand";
import { loadPlatformBrand } from "@/lib/platform/load-platform-brand";

export const dynamic = "force-dynamic";
export const revalidate = 0;

async function toAbsoluteUrl(url: string): Promise<string> {
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }

  const headerList = await headers();
  const host = headerList.get("x-forwarded-host") ?? headerList.get("host");
  const proto = headerList.get("x-forwarded-proto") ?? "http";

  if (host) {
    return `${proto}://${host}${url.startsWith("/") ? url : `/${url}`}`;
  }

  const port = process.env.PORT ?? "3000";
  return `http://localhost:${port}${url.startsWith("/") ? url : `/${url}`}`;
}

export async function GET() {
  const brand = await loadPlatformBrand();
  const faviconUrl = resolveFaviconUrl(brand);

  if (!faviconUrl) {
    return new Response(null, { status: 404 });
  }

  try {
    const response = await fetch(await toAbsoluteUrl(faviconUrl), {
      cache: "no-store",
    });

    if (!response.ok) {
      return new Response(null, { status: 404 });
    }

    const bytes = await response.arrayBuffer();
    const contentType =
      response.headers.get("content-type") ?? "image/png";

    return new Response(bytes, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "no-store, no-cache, must-revalidate",
        Pragma: "no-cache",
      },
    });
  } catch {
    return new Response(null, { status: 404 });
  }
}
