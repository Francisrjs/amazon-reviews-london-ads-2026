import { createClient } from "@/lib/supabase/server";


export async function authenticatedBackendRequest(path: string, init: RequestInit = {}) {
  const supabase = await createClient();
  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims();
  if (claimsError || !claimsData?.claims?.sub) {
    return new Response(JSON.stringify({ error: "Authentication required." }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }
  const { data: sessionData } = await supabase.auth.getSession();
  const accessToken = sessionData.session?.access_token;
  if (!accessToken) {
    return new Response(JSON.stringify({ error: "Authentication session is unavailable." }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }
  const apiBase = process.env.FASTAPI_URL ?? "http://127.0.0.1:8000";
  const headers = new Headers(init.headers);
  headers.set("Authorization", `Bearer ${accessToken}`);
  headers.set("Content-Type", "application/json");
  headers.set("X-Request-ID", crypto.randomUUID());
  return fetch(`${apiBase.replace(/\/$/, "")}${path}`, {
    ...init,
    headers,
    cache: "no-store",
    signal: AbortSignal.timeout(15_000),
  });
}


export async function proxyBackendJson(path: string, init: RequestInit = {}) {
  try {
    const response = await authenticatedBackendRequest(path, init);
    if (response.status === 204) return new Response(null, { status: 204 });
    const body = await response.json().catch(() => null);
    return Response.json(body, { status: response.status });
  } catch (error) {
    const timeout = error instanceof Error && error.name === "TimeoutError";
    return Response.json(
      { error: timeout ? "The backend took too long to respond." : "The backend is unavailable." },
      { status: 503 },
    );
  }
}
