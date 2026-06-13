import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-full max-w-2xl flex-col justify-center gap-8 p-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">
          Plataforma de campañas
        </h1>
        <p className="mt-2 text-muted-foreground">
          MVP — Phase 0 bootstrap. Selecciona un área para continuar.
        </p>
      </div>
      <nav className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <Link href="/login" className={cn(buttonVariants())}>
          Auth
        </Link>
        <Link href="/platform" className={cn(buttonVariants({ variant: "secondary" }))}>
          Plataforma (dueños)
        </Link>
        <Link href="/campaign/demo" className={cn(buttonVariants({ variant: "outline" }))}>
          Campaña (demo)
        </Link>
        <Link href="/capture/demo" className={cn(buttonVariants({ variant: "outline" }))}>
          Captura (demo)
        </Link>
      </nav>
    </main>
  );
}
