import { z } from "zod";
import { demoStoreSchema, storeProductSchema } from "@/lib/api/schema";
import { proxyBackendJson } from "@/lib/api/server-proxy";


const importSchema = z.object({
  request_id: z.string().uuid(),
  store: demoStoreSchema.nullable(),
  shortlist: z.array(storeProductSchema).max(100),
});

export async function POST(request: Request) {
  const parsed = importSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return Response.json({ error: "Invalid store import.", fields: parsed.error.flatten().fieldErrors }, { status: 422 });
  }
  return proxyBackendJson("/v1/store/import", { method: "POST", body: JSON.stringify(parsed.data) });
}
