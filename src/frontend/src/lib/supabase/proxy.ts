import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseEnv } from "./env";

const publicRoutes = ["/login", "/register", "/forgot-password", "/reset-password", "/auth/confirm"];

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });
  let env: ReturnType<typeof getSupabaseEnv>;
  try {
    env = getSupabaseEnv();
  } catch {
    return response;
  }

  const supabase = createServerClient(env.url, env.key, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  const { data } = await supabase.auth.getClaims();
  const authenticated = Boolean(data?.claims?.sub);
  const isPublic = publicRoutes.some((route) => request.nextUrl.pathname.startsWith(route));
  const isApi = request.nextUrl.pathname.startsWith("/api/");

  if (!authenticated && !isPublic && !isApi) {
    const login = request.nextUrl.clone();
    login.pathname = "/login";
    login.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(login);
  }
  if (authenticated && ["/login", "/register"].includes(request.nextUrl.pathname)) {
    const dashboard = request.nextUrl.clone();
    dashboard.pathname = "/analyze";
    dashboard.search = "";
    return NextResponse.redirect(dashboard);
  }
  return response;
}
