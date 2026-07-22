import Link from "next/link";
import { updatePassword } from "@/app/actions/auth";
import { AuthForm } from "@/components/auth/AuthForm";
import { AuthShell } from "@/components/auth/AuthShell";

export default function ResetPasswordPage() {
  return <AuthShell eyebrow="Choose a new key" title="Set a new password" description="Use at least 10 characters and avoid reusing an old password.">
    <AuthForm action={updatePassword} fields={[{ name: "password", label: "New password", type: "password", autoComplete: "new-password" }, { name: "confirmPassword", label: "Confirm new password", type: "password", autoComplete: "new-password" }]} submitLabel="Update password" footer={<Link href="/login">Return to sign in</Link>} />
  </AuthShell>;
}
