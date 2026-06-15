import { redirect } from "next/navigation";

export default async function PlatformClientsRedirect({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; documento?: string; page?: string }>;
}) {
  const params = await searchParams;
  const qs = new URLSearchParams();
  if (params.q) qs.set("q", params.q);
  if (params.documento) qs.set("documento", params.documento);
  if (params.page) qs.set("page", params.page);
  const query = qs.toString();
  redirect(`/platform/maestras/clientes${query ? `?${query}` : ""}`);
}
