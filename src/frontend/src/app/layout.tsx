import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Launchly", template: "%s · Launchly" },
  description: "Evidence-backed beauty product launch decisions.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
