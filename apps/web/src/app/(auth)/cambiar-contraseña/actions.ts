"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { validateInitialPassword } from "@/lib/platform/client-auth";

export async function changePasswordAction(formData: FormData) {
  const supabase = await createClient();
  const nueva = String(formData.get("nueva_contrasena") ?? "").trim();
  const confirmar = String(formData.get("confirmar_contrasena") ?? "").trim();

  const passwordError = validateInitialPassword(nueva);
  if (passwordError) return { error: passwordError };

  if (nueva !== confirmar) {
    return { error: "Las contraseñas no coinciden." };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Sesión no válida." };
  }

  const { error } = await supabase.auth.updateUser({
    password: nueva,
    data: { must_change_password: false },
  });

  if (error) return { error: error.message };

  const { data: platform } = await supabase
    .from("miembros_plataforma")
    .select("rol")
    .eq("id_usuario", user.id)
    .maybeSingle();

  if (platform) {
    redirect("/platform");
  }

  const { data: campana } = await supabase
    .from("miembros_campana")
    .select("id_campana")
    .eq("id_usuario", user.id)
    .order("creado_en", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (campana?.id_campana) {
    redirect(`/campaign/${campana.id_campana}`);
  }

  redirect("/login");
}
