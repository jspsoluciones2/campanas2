import { unstable_noStore as noStore } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import {
  getLoginBrandConfig,
  type LoginBrandConfig,
} from "@/lib/config/login-brand";
import {
  getPlatformBrandConfig,
  getPlatformBrandConfigOffline,
  platformBrandToLoginConfig,
  type PlatformBrandConfig,
} from "@/lib/platform/brand";

export async function loadPlatformBrand(): Promise<PlatformBrandConfig> {
  noStore();

  if (!isSupabaseConfigured()) {
    return getPlatformBrandConfigOffline();
  }

  // La marca es configuración pública: leerla con el client anónimo del
  // servidor para no depender de una service role key mal registrada
  // (una key no registrada devuelve 401 y el fallback a defaults grises).
  try {
    const supabase = await createClient();
    return await getPlatformBrandConfig(supabase);
  } catch {
    const admin = createAdminClient();
    if (admin) {
      return getPlatformBrandConfig(admin);
    }
    return getPlatformBrandConfigOffline();
  }
}

export async function loadLoginBrand(): Promise<LoginBrandConfig> {
  if (!isSupabaseConfigured()) {
    return getLoginBrandConfig();
  }

  try {
    const platform = await loadPlatformBrand();
    return platformBrandToLoginConfig(platform);
  } catch {
    return getLoginBrandConfig();
  }
}
