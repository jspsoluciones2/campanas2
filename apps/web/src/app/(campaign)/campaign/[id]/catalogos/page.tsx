import { redirect } from "next/navigation";
import {
  CATALOG_DEFAULT_SEGMENT,
  catalogSegmentPath,
} from "@/lib/campaign/catalog-nav";

export default async function CampaignCatalogosIndexPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(catalogSegmentPath(id, CATALOG_DEFAULT_SEGMENT));
}
