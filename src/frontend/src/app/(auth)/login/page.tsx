import { login } from "@/app/actions/auth";
import { AuthForm, LoginFooter } from "@/components/auth/AuthForm";
import { AuthShell } from "@/components/auth/AuthShell";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string; error?: string }> }) {
  const params = await searchParams;
  return <AuthShell eyebrow="Welcome back" title="Sign in to your launch lab" description="Your product ideas and decision console are one step away.">
    {params.error ? <p className="form-message error">That confirmation link is invalid or expired.</p> : null}
    <AuthForm action={login} fields={[{ name: "email", label: "Email", type: "email", autoComplete: "email" }, { name: "password", label: "Password", type: "password", autoComplete: "current-password" }]} submitLabel="Open my dashboard" next={params.next} footer={<LoginFooter />} />
  </AuthShell>;
}
