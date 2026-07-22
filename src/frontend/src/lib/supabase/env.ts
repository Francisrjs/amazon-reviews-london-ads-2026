export function getSupabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key || url.includes("your-project") || key.includes("replace_me")) {
    throw new Error("Supabase is not configured. Copy .env.example to .env.local and add project values.");
  }
  return { url, key };
}
