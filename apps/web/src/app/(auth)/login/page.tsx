import { Suspense } from "react";
import { loadLoginBrand } from "@/lib/platform/load-platform-brand";
import { LoginBrandLogo } from "@/components/auth/login-brand-logo";
import { LoginForm } from "./login-form";

export default async function LoginPage() {
  const brand = await loadLoginBrand();

  return (
    <div className="w-full max-w-[400px]">
      <div className="login-brand-card rounded-lg px-8 py-10 shadow-2xl shadow-black/25">
        <LoginBrandLogo config={brand} />

        {brand.title ? (
          <h1 className="mt-6 text-center text-xl font-semibold tracking-wide">
            {brand.title}
          </h1>
        ) : null}

        {brand.subtitle ? (
          <p className="login-text-muted mt-2 text-center text-sm">
            {brand.subtitle}
          </p>
        ) : null}

        <div className={brand.title || brand.subtitle ? "mt-8" : "mt-10"}>
          <Suspense fallback={<LoginFormSkeleton />}>
            <LoginForm brand={brand} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

function LoginFormSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-11 rounded-md bg-white/20" />
      <div className="h-11 rounded-md bg-white/20" />
      <div className="h-11 rounded-md bg-white/20" />
    </div>
  );
}
