"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getSiteUrl } from "@/lib/site-url";

export interface AuthState { error?: string; message?: string }

const safeNext = (value: FormDataEntryValue | null, fallback = "/analyze") => {
  const next = typeof value === "string" ? value : fallback;
  return next.startsWith("/") && !next.startsWith("//") ? next : fallback;
};

export async function login(_: AuthState, formData: FormData): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) return { error: "Enter your email and password." };
  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: "We could not sign you in. Check your details and try again." };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Authentication is unavailable." };
  }
  redirect(safeNext(formData.get("next")));
}

export async function register(_: AuthState, formData: FormData): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirmPassword") ?? "");
  if (!/^\S+@\S+\.\S+$/.test(email)) return { error: "Enter a valid email address." };
  if (password.length < 10) return { error: "Use at least 10 characters for your password." };
  if (password !== confirm) return { error: "The passwords do not match." };
  try {
    const supabase = await createClient();
    const siteUrl = getSiteUrl();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${siteUrl}/auth/confirm?next=/analyze` },
    });
    if (error) return { error: "We could not create the account. Try another email or try again later." };
    return { message: "Check your inbox to confirm your account, then sign in." };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Registration is unavailable." };
  }
}

export async function requestReset(_: AuthState, formData: FormData): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim();
  if (!/^\S+@\S+\.\S+$/.test(email)) return { error: "Enter a valid email address." };
  try {
    const supabase = await createClient();
    const siteUrl = getSiteUrl();
    await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${siteUrl}/reset-password` });
    return { message: "If that email is registered, a reset link is on its way." };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Password recovery is unavailable." };
  }
}

export async function updatePassword(_: AuthState, formData: FormData): Promise<AuthState> {
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirmPassword") ?? "");
  if (password.length < 10) return { error: "Use at least 10 characters for your password." };
  if (password !== confirm) return { error: "The passwords do not match." };
  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.updateUser({ password });
    if (error) return { error: "The reset link is invalid or expired. Request a new one." };
    return { message: "Password updated. You can continue to Priori." };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Password update is unavailable." };
  }
}

export async function logout() {
  try {
    const supabase = await createClient();
    await supabase.auth.signOut();
  } finally {
    redirect("/login");
  }
}
