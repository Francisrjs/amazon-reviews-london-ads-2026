"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, Compass, LineChart, LogOut, Rocket, Store, UserRound } from "lucide-react";
import { logout } from "@/app/actions/auth";

const nav = [
  { href: "/analyze", label: "Analyze a product", icon: BarChart3 },
  { href: "/discover", label: "Discover trending", icon: Compass },
  { href: "/store", label: "My store", icon: Store },
  { href: "/trends", label: "Trend radar", icon: LineChart },
];

export function DashboardHeader({ email }: { email?: string }) {
  const pathname = usePathname();
  return <>
    <header className="site-header">
      <Link href="/analyze" className="brand-lockup dark"><span className="brand-mark"><Rocket /></span><span><b>Launchly</b><small>beauty launch co-pilot</small></span></Link>
      <div className="account-chip"><UserRound /><span>{email ?? "Signed in"}</span><form action={logout}><button aria-label="Sign out" title="Sign out"><LogOut /></button></form></div>
    </header>
    <nav className="dashboard-tabs" aria-label="Main navigation">
      {nav.map(({ href, label, icon: Icon }) => <Link key={href} href={href} className={pathname === href ? "active" : ""}><Icon /><span>{label}</span></Link>)}
    </nav>
  </>;
}
