import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { userMustChangePassword } from "@/lib/platform/client-auth";
import { loadLoginBrand } from "@/lib/platform/load-platform-brand";
import { LoginBrandLogo } from "@/components/auth/login-brand-logo";
import { ChangePasswordForm } from "./change-password-form";

export default async function ChangePasswordPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  if (!userMustChangePassword(user.user_metadata)) {
    redirect("/platform");
  }

  const brand = await loadLoginBrand();

  return (
    <div className="w-full max-w-md">
      <div className="login-brand-card rounded-lg px-8 py-10 shadow-2xl shadow-black/25">
        <LoginBrandLogo config={brand} />
        <h1 className="mt-6 text-center text-xl font-semibold login-text">
          Cambiar contraseña
        </h1>
        <p className="mt-2 text-center text-sm login-text-muted">
          Por seguridad debes definir una nueva contraseña antes de continuar.
        </p>
        <div className="mt-6">
          <ChangePasswordForm />
        </div>
      </div>
    </div>
  );
}
