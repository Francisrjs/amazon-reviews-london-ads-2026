import { demoStoreSchema } from "@/lib/api/schema";
import { proxyBackendJson } from "@/lib/api/server-proxy";


export async function GET() {
  return proxyBackendJson("/v1/store");
}

export async function PUT(request: Request) {
  const parsed = demoStoreSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Invalid store data." }, { status: 422 });
  return proxyBackendJson("/v1/store", { method: "PUT", body: JSON.stringify(parsed.data) });
}

export async function DELETE() {
  return proxyBackendJson("/v1/store", { method: "DELETE" });
}
