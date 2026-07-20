export function getSiteUrl() {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  const vercelDeployment = process.env.VERCEL_URL?.trim();
  const origin = configured || (vercelDeployment ? `https://${vercelDeployment}` : "http://localhost:3000");

  return origin.replace(/\/+$/, "");
}
