import { Rocket, ShieldCheck, Sparkles } from "lucide-react";

export function AuthShell({ eyebrow, title, description, children }: { eyebrow: string; title: string; description: string; children: React.ReactNode }) {
  return (
    <main className="auth-page">
      <section className="auth-story" aria-label="Launchly introduction">
        <div className="brand-lockup"><span className="brand-mark"><Rocket /></span><span><b>Launchly</b><small>beauty launch co-pilot</small></span></div>
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
