import "./login-theme.css";
import { loginBrandToStyle } from "@/lib/config/login-brand";
import { loadLoginBrand } from "@/lib/platform/load-platform-brand";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const brand = await loadLoginBrand();

  return (
    <div
      className="login-brand-root login-brand-page relative flex min-h-svh flex-col items-center justify-center px-4 py-10"
      style={loginBrandToStyle(brand)}
    >
      {children}
    </div>
  );
}
