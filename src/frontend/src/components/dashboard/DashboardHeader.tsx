"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, ChevronDown, Compass, LineChart, LogOut, Plug, Store, UserRound } from "lucide-react";
import { logout } from "@/app/actions/auth";
import { PrioriMark } from "@/components/shared/PrioriMark";

const nav = [
  { href: "/analyze", label: "Analyze", icon: BarChart3 },
  { href: "/discover", label: "Discover", icon: Compass },
  { href: "/store", label: "Store", icon: Store },
  { href: "/trends", label: "Trends", icon: LineChart },
];

export function DashboardHeader({ email }: { email?: string }) {
  const pathname = usePathname();
  return (
    <nav className="site-nav" aria-label="Main navigation">
      <Link href="/analyze" className="brand-lockup"><span className="brand-mark"><PrioriMark size={34} /></span><span><b>Priori</b><small>Know before you launch</small></span></Link>

      <div className="nav-center">
        {nav.map(({ href, label, icon: Icon }) => (
          <div className="nav-item" key={href}>
            <Link href={href} className={`navlink ${pathname === href ? "active" : ""}`}><Icon /><span>{label}</span></Link>
          </div>
        ))}
        <div className="nav-item has-drop">
          <button type="button" className="navlink" aria-haspopup="true"><Plug /><span>Connect</span><ChevronDown className="caret" /></button>
          <div className="mega">
            <div className="mega-grid">
              <div className="mega-head">Everything you need to plug in your live data</div>
              <div className="mega-links">
                <Link href="/trends"><b>Google Trends&nbsp;›</b><span>Forecast demand on real search interest</span></Link>
                <Link href="/store"><b>Amazon store&nbsp;›</b><span>Publish listings &amp; automate pricing</span></Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="nav-right">
        <div className="account-chip"><UserRound /><span>{email ?? "Signed in"}</span><form action={logout}><button aria-label="Sign out" title="Sign out"><LogOut /></button></form></div>
      </div>
    </nav>
  );
}
