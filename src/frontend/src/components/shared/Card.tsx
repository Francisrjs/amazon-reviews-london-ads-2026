export function Card({ children, className = "", accent }: { children: React.ReactNode; className?: string; accent?: "violet" | "mint" | "coral" }) {
  return <section className={`card ${accent ? `card-${accent}` : ""} ${className}`}>{children}</section>;
}
