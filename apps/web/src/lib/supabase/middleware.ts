import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { userMustChangePassword } from "@/lib/platform/client-auth";

function isSupabaseConfigured() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

export async function updateSession(request: NextRequest) {
  const path = request.nextUrl.pathname;

  if (!isSupabaseConfigured()) {
    const response = NextResponse.next({ request });
    response.headers.set("x-supabase-config", "missing");
    return response;
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user && (path.startsWith("/platform") || path.startsWith("/campaign"))) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", path);
    return NextResponse.redirect(url);
  }

  const mustChangePassword =
    user && userMustChangePassword(user.user_metadata ?? undefined);

  if (mustChangePassword && !path.startsWith("/cambiar-contrasena")) {
    const url = request.nextUrl.clone();
    url.pathname = "/cambiar-contrasena";
    return NextResponse.redirect(url);
  }

  if (user && path === "/login") {
    const url = request.nextUrl.clone();
    url.pathname = mustChangePassword ? "/cambiar-contrasena" : "/platform";
    return NextResponse.redirect(url);
  }

  if (user && path.startsWith("/platform") && !mustChangePassword) {
    const { data: member } = await supabase
      .from("miembros_plataforma")
      .select("rol")
      .eq("id_usuario", user.id)
      .maybeSingle();

    if (!member) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("error", "no_platform_access");
      return NextResponse.redirect(url);
    }
  }

  if (user && path.startsWith("/campaign/") && !mustChangePassword) {
    const match = path.match(/^\/campaign\/([^/]+)/);
    const campaignId = match?.[1];
    if (campaignId && campaignId !== "undefined") {
      const [{ data: platform }, { data: member }] = await Promise.all([
        supabase
          .from("miembros_plataforma")
          .select("rol")
          .eq("id_usuario", user.id)
          .maybeSingle(),
        supabase
          .from("miembros_campana")
          .select("id")
          .eq("id_usuario", user.id)
          .eq("id_campana", campaignId)
          .maybeSingle(),
      ]);

      if (!platform && !member) {
        const url = request.nextUrl.clone();
        url.pathname = "/login";
        url.searchParams.set("error", "no_campaign_access");
        return NextResponse.redirect(url);
      }
    }
  }

  return supabaseResponse;
}
