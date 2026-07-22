import { register } from "@/app/actions/auth";
import { AuthForm, RegisterFooter } from "@/components/auth/AuthForm";
import { AuthShell } from "@/components/auth/AuthShell";

export default function RegisterPage() {
  return <AuthShell eyebrow="Start with evidence" title="Create your Priori account" description="No promises of overnight success—just a clearer, more defensible next move.">
    <AuthForm action={register} fields={[{ name: "email", label: "Email", type: "email", autoComplete: "email" }, { name: "password", label: "Password", type: "password", autoComplete: "new-password" }, { name: "confirmPassword", label: "Confirm password", type: "password", autoComplete: "new-password" }]} submitLabel="Create my account" footer={<RegisterFooter />} />
  </AuthShell>;
}
