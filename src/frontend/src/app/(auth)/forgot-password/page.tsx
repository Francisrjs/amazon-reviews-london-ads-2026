import Link from "next/link";
import { requestReset } from "@/app/actions/auth";
import { AuthForm } from "@/components/auth/AuthForm";
import { AuthShell } from "@/components/auth/AuthShell";

export default function ForgotPasswordPage() {
  return <AuthShell eyebrow="Account recovery" title="Reset your password" description="Enter your email and we will send a secure recovery link.">
    <AuthForm action={requestReset} fields={[{ name: "email", label: "Email", type: "email", autoComplete: "email" }]} submitLabel="Send reset link" footer={<Link href="/login">Back to sign in</Link>} />
  </AuthShell>;
}
