"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { Eye, EyeOff, LoaderCircle, LockKeyhole, Mail } from "lucide-react";
import type { AuthState } from "@/app/actions/auth";

interface Field { name: string; label: string; type: "email" | "password"; autoComplete: string }
interface Props {
  action: (state: AuthState, formData: FormData) => Promise<AuthState>;
  fields: Field[];
  submitLabel: string;
  next?: string;
  footer: React.ReactNode;
}

export function AuthForm({ action, fields, submitLabel, next, footer }: Props) {
  const [state, formAction, pending] = useActionState(action, {});
  const [showPassword, setShowPassword] = useState(false);
  return (
    <form action={formAction} className="auth-form">
      {next ? <input type="hidden" name="next" value={next} /> : null}
      {fields.map((field) => (
        <label className="auth-field" key={field.name}>
          <span>{field.label}</span>
          <span className="auth-input-wrap">
            {field.type === "email" ? <Mail aria-hidden="true" /> : <LockKeyhole aria-hidden="true" />}
            <input
              name={field.name}
              type={field.type === "password" && showPassword ? "text" : field.type}
              autoComplete={field.autoComplete}
              required
            />
            {field.type === "password" ? (
              <button type="button" className="password-toggle" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? "Hide password" : "Show password"}>
                {showPassword ? <EyeOff /> : <Eye />}
              </button>
            ) : null}
          </span>
        </label>
      ))}
      <div aria-live="polite">
        {state.error ? <p className="form-message error">{state.error}</p> : null}
        {state.message ? <p className="form-message success">{state.message}</p> : null}
      </div>
      <button className="primary-button auth-submit" disabled={pending}>
        {pending ? <LoaderCircle className="spin" aria-hidden="true" /> : null}{submitLabel}
      </button>
      <div className="auth-footer">{footer}</div>
    </form>
  );
}

export const LoginFooter = () => <><Link href="/forgot-password">Forgot password?</Link><span>New here? <Link href="/register">Create an account</Link></span></>;
export const RegisterFooter = () => <span>Already have an account? <Link href="/login">Sign in</Link></span>;
