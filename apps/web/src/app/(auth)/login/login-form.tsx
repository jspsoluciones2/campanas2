"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  AlertCircle,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  User,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { userMustChangePassword } from "@/lib/platform/client-auth";
import type { LoginBrandConfig } from "@/lib/config/login-brand";
import { SplitAuthInput } from "@/components/auth/split-auth-input";
import { cn } from "@/lib/utils";

const REMEMBER_EMAIL_KEY = "login_remember_email";

type LoginFormProps = {
  brand: LoginBrandConfig;
};

export function LoginForm({ brand }: LoginFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/platform";
  const errorParam = searchParams.get("error");

  const supabaseReady = isSupabaseConfigured();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(
    errorParam === "no_platform_access"
      ? "No tienes acceso al módulo de plataforma."
      : errorParam === "no_campaign_access"
        ? "No tienes acceso a esta campaña."
        : ""
  );
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(REMEMBER_EMAIL_KEY);
      if (saved) {
        setEmail(saved);
        setRememberMe(true);
      }
    } catch {
      /* ignore */
    }
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!supabaseReady) {
      setError("Configura apps/web/.env.local con las credenciales de Supabase.");
      return;
    }

    setLoading(true);
    setError("");
    setInfo("");

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (authError) {
      setError(
        authError.message === "Invalid login credentials"
          ? "Usuario o contraseña incorrectos."
          : authError.message
      );
      setLoading(false);
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    try {
      if (rememberMe) {
        localStorage.setItem(REMEMBER_EMAIL_KEY, email.trim());
      } else {
        localStorage.removeItem(REMEMBER_EMAIL_KEY);
      }
    } catch {
      /* ignore */
    }

    if (user && userMustChangePassword(user.user_metadata)) {
      router.push("/cambiar-contraseña");
      router.refresh();
      return;
    }

    const { data: platformMember } = await supabase
      .from("miembros_plataforma")
      .select("rol")
      .eq("id_usuario", user?.id ?? "")
      .maybeSingle();

    if (platformMember) {
      router.push(next.startsWith("/platform") ? next : "/platform");
      router.refresh();
      return;
    }

    const { data: campaignMember } = await supabase
      .from("miembros_campana")
      .select("id_campana")
      .eq("id_usuario", user?.id ?? "")
      .order("creado_en", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (campaignMember?.id_campana) {
      router.push(`/campaign/${campaignMember.id_campana}`);
      router.refresh();
      return;
    }

    await supabase.auth.signOut();
    setError("No tienes acceso a ningún módulo.");
    setLoading(false);
  }

  async function handleForgotPassword() {
    const trimmed = email.trim();
    if (!trimmed) {
      setError("Escribe tu usuario (correo) para recuperar la contraseña.");
      setInfo("");
      return;
    }

    if (!supabaseReady) return;

    setResetLoading(true);
    setError("");
    setInfo("");

    const supabase = createClient();
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      trimmed,
      { redirectTo: `${window.location.origin}/login` }
    );

    setResetLoading(false);

    if (resetError) {
      setError(resetError.message);
      return;
    }

    setInfo("Te enviamos un enlace para restablecer la contraseña.");
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {!supabaseReady && (
        <div className="flex gap-2 rounded-md border border-white/20 bg-black/20 px-3 py-2 text-sm">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <p>
            Falta configurar Supabase en{" "}
            <code className="text-xs">apps/web/.env.local</code>.
          </p>
        </div>
      )}

      {error && (
        <div
          role="alert"
          className="flex gap-2 rounded-md border border-red-400/30 bg-red-950/30 px-3 py-2 text-sm text-red-100"
        >
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {info && (
        <p className="rounded-md border border-white/20 bg-white/10 px-3 py-2 text-sm login-text-muted">
          {info}
        </p>
      )}

      <SplitAuthInput
        id="email"
        name="email"
        type="email"
        icon={User}
        placeholder="Usuario"
        autoComplete="username"
        disabled={loading}
        value={email}
        onChange={setEmail}
      />

      <SplitAuthInput
        id="password"
        name="password"
        type={showPassword ? "text" : "password"}
        icon={Lock}
        placeholder="Contraseña"
        autoComplete="current-password"
        disabled={loading}
        value={password}
        onChange={setPassword}
        trailing={
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-800"
            aria-label={
              showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
            }
          >
            {showPassword ? (
              <EyeOff className="size-4" />
            ) : (
              <Eye className="size-4" />
            )}
          </button>
        }
      />

      <div className="flex items-center justify-between gap-3 pt-1 text-sm">
        <label className="flex cursor-pointer items-center gap-2 select-none">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            disabled={loading}
            className="login-checkbox size-4 rounded-sm border-0"
          />
          <span>Recordarme</span>
        </label>
        <button
          type="button"
          onClick={handleForgotPassword}
          disabled={loading || resetLoading}
          className="login-link text-sm italic underline-offset-2 hover:underline disabled:opacity-50"
        >
          {resetLoading ? "Enviando…" : "¿Olvidaste tu contraseña?"}
        </button>
      </div>

      <button
        type="submit"
        disabled={loading || !supabaseReady}
        className={cn(
          "login-submit mt-2 flex h-12 w-full items-center justify-center gap-2 rounded-md text-sm font-bold tracking-[0.2em] uppercase shadow-lg shadow-black/30 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
        )}
      >
        {loading ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            Entrando…
          </>
        ) : (
          brand.buttonLabel
        )}
      </button>
    </form>
  );
}
