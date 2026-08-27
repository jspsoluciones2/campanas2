// Query current platform brand from Supabase (read-only).
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("Missing Supabase env vars");
  process.exit(1);
}

const supabase = createClient(url, key, { auth: { persistSession: false } });

const { data, error } = await supabase
  .from("configuracion_marca_plataforma")
  .select("*")
  .eq("id", 1)
  .maybeSingle();

if (error) {
  console.error("ERROR:", error.message);
  process.exit(1);
}

if (!data) {
  console.log("NO ROW FOUND — brand table empty (id=1)");
  process.exit(0);
}

const keys = Object.keys(data).filter((k) => k !== "actualizado_en");
for (const k of keys) {
  console.log(`${k} = ${JSON.stringify(data[k])}`);
}
