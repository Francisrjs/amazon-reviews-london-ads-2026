import { redirect } from "next/navigation";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DotField } from "@/components/shared/DotField";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  let claims: Record<string, unknown> | undefined;
  try {
    const supabase = await createClient();
    const result = await supabase.auth.getClaims();
    claims = result.data?.claims as Record<string, unknown> | undefined;
  } catch {
    redirect("/login?error=configuration");
  }
  if (!claims?.sub) redirect("/login");
  return <div className="page-shell"><DotField /><DashboardHeader email={typeof claims.email === "string" ? claims.email : undefined} /><div className="page-wrap"><main>{children}</main><footer>Priori, made with evidence and a healthy respect for uncertainty.</footer></div></div>;
}
