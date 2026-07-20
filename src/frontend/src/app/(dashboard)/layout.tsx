import { redirect } from "next/navigation";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
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
  return <div className="page-shell"><div className="top-accent" /><div className="page-wrap"><DashboardHeader email={typeof claims.email === "string" ? claims.email : undefined} /><main>{children}</main><footer>Launchly, made with evidence and a healthy respect for uncertainty.</footer></div></div>;
}
