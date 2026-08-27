// Apply EL NODO brand palette to the platform brand singleton row (id=1).
// Idempotent: run any number of times.
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("Missing Supabase env vars");
  process.exit(1);
}

const supabase = createClient(url, key, { auth: { persistSession: false } });

const palette = {
  color_primario: "#6439f8", // purple — primary
  color_secundario: "#0091e7", // blue — secondary
  color_acento: "#00ddb2", // teal — accent
  color_fondo_sidebar: "#0e1422", // navy — dark sidebar
  color_fondo_pagina: "#edeeef", // light gray — page bg
  login_fondo_exterior: "#0e1422", // navy outer login radial
  login_fondo_centro: "#6439f8", // purple center login radial
  login_panel_fondo: "rgba(14, 20, 34, 0.55)", // navy glass panel
  login_boton_fondo: "#6439f8", // purple login button
};

const { data: existing, error: readError } = await supabase
  .from("configuracion_marca_plataforma")
  .select("id, color_primario, color_secundario, color_acento, color_fondo_sidebar")
  .eq("id", 1)
  .maybeSingle();

if (readError) {
  console.error("READ ERROR:", readError.message);
  process.exit(1);
}
if (!existing) {
  console.error("NO ROW id=1 — insert a row first or run migrations");
  process.exit(1);
}

console.log("BEFORE:", JSON.stringify(existing));

const { data, error } = await supabase
  .from("configuracion_marca_plataforma")
  .update({ ...palette, actualizado_en: new Date().toISOString() })
  .eq("id", 1)
  .select("id, color_primario, color_secundario, color_acento, color_fondo_sidebar, color_fondo_pagina, login_fondo_exterior, login_fondo_centro, login_panel_fondo, login_boton_fondo");

if (error) {
  console.error("UPDATE ERROR:", error.message);
  process.exit(1);
}
console.log("AFTER:", JSON.stringify(data?.[0], null, 2));
console.log("OK — EL NODO palette applied to configuracion_marca_plataforma (id=1)");
