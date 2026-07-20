import { AlertTriangle, LoaderCircle, SearchX } from "lucide-react";
import { Button } from "./Button";

export function LoadingState({ label = "Looking for evidence…" }: { label?: string }) {
  return <div className="state-block" role="status"><span className="state-icon scan"><LoaderCircle className="spin" /></span><h3>{label}</h3><p>Comparing historical patterns and pressure-testing the price.</p></div>;
}
export function EmptyState({ title, message }: { title: string; message: string }) {
  return <div className="state-block"><span className="state-icon"><SearchX /></span><h3>{title}</h3><p>{message}</p></div>;
}
export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return <div className="state-block error-state" role="alert"><span className="state-icon"><AlertTriangle /></span><h3>We could not run that analysis</h3><p>{message}</p>{onRetry ? <Button variant="secondary" onClick={onRetry}>Try again</Button> : null}</div>;
}
