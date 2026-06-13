import Link from "next/link";

export default async function CampaignLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="flex min-h-full">
      <aside className="w-56 border-r bg-muted/30 p-4">
        <p className="mb-4 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Campaña {id}
        </p>
        <nav className="flex flex-col gap-2 text-sm">
          <Link href={`/campaign/${id}`}>Dashboard</Link>
          <Link href={`/campaign/${id}/quarantine`}>Cuarentena</Link>
          <Link href={`/campaign/${id}/e14`}>E14</Link>
        </nav>
      </aside>
      <div className="flex-1 p-8">{children}</div>
    </div>
  );
}
