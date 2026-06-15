import Link from "next/link";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { loadPlatformBrand } from "@/lib/platform/load-platform-brand";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default async function HomePage() {
  const supabaseReady = isSupabaseConfigured();
  const brand = await loadPlatformBrand();

  return (
    <main className="mx-auto flex min-h-full max-w-2xl flex-col justify-center gap-8 p-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">
          {brand.nombrePlataforma}
        </h1>
        <p className="mt-2 text-muted-foreground">
          {brand.etiquetaPanel} · Interfaz Next.js (puerto 3000) · API Flask
          (puerto 5000).
        </p>
      </div>

      {!supabaseReady && (
        <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 p-4 text-sm">
          <p className="font-medium">Supabase no configurado</p>
          <p className="mt-1 text-muted-foreground">
            Crea <code className="text-xs">apps/web/.env.local</code> con{" "}
            <code className="text-xs">NEXT_PUBLIC_SUPABASE_URL</code> y{" "}
            <code className="text-xs">NEXT_PUBLIC_SUPABASE_ANON_KEY</code>.
            Copia la anon key desde{" "}
            <a
              href="https://supabase.com/dashboard/project/kadhnauhghzyhfhsomif/settings/api"
              className="underline"
              target="_blank"
              rel="noreferrer"
            >
              Supabase → Settings → API
            </a>
            , reinicia <code className="text-xs">npm run dev</code> y vuelve a cargar.
          </p>
        </div>
      )}

      <nav className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <Link href="/login" className={cn(buttonVariants())}>
          Login
        </Link>
        <Link
          href="/platform"
          className={cn(buttonVariants({ variant: "secondary" }))}
        >
          Plataforma (dueños)
        </Link>
        <a
          href="http://localhost:5000/api/health"
          target="_blank"
          rel="noreferrer"
          className={cn(buttonVariants({ variant: "outline" }))}
        >
          API Flask (health)
        </a>
      </nav>
    </main>
  );
}
