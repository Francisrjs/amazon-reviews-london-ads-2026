import { ShieldCheck, Sparkles } from "lucide-react";
import { PrioriMark } from "@/components/shared/PrioriMark";

export function AuthShell({ eyebrow, title, description, children }: { eyebrow: string; title: string; description: string; children: React.ReactNode }) {
  return (
    <main className="auth-page">
      <section className="auth-story" aria-label="Priori introduction">
        <div className="brand-lockup"><span className="brand-mark"><PrioriMark /></span><span><b>Priori</b><small>Know before you launch</small></span></div>
        <div className="auth-story-copy">
          <span className="eyebrow light">{eyebrow}</span>
          <h1>See the money<br />before you launch.</h1>
          <p>Turn a beauty idea into an evidence-backed decision with calibrated scores, comparable products and honest limitations.</p>
          <div className="auth-proof"><ShieldCheck /><span><b>Your workspace, protected.</b><small>Supabase sessions and server-checked routes.</small></span></div>
        </div>
        <Sparkles className="auth-spark spark-one" /><Sparkles className="auth-spark spark-two" />
      </section>
      <section className="auth-panel">
        <div className="auth-card"><span className="eyebrow">{eyebrow}</span><h2>{title}</h2><p>{description}</p>{children}</div>
      </section>
    </main>
  );
}
