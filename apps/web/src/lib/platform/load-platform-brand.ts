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

  const admin = createAdminClient();
  if (admin) {
    return getPlatformBrandConfig(admin);
  }

  const supabase = await createClient();
  return getPlatformBrandConfig(supabase);
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
