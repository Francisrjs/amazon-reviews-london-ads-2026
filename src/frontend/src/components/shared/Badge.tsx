export function Badge({ children, tone = "neutral", className = "" }: { children: React.ReactNode; tone?: "neutral" | "mint" | "coral" | "sun" | "violet"; className?: string }) {
  return <span className={`badge badge-${tone} ${className}`}>{children}</span>;
}
