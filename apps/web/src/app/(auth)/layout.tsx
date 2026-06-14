import "./login-theme.css";
import {
  getLoginBrandConfig,
  loginBrandToStyle,
} from "@/lib/config/login-brand";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const brand = getLoginBrandConfig();

  return (
    <div
      className="login-brand-root login-brand-page relative flex min-h-svh flex-col items-center justify-center px-4 py-10"
      style={loginBrandToStyle(brand)}
    >
      {children}
    </div>
  );
}
