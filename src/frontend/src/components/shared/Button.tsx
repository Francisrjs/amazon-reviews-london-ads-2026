import { forwardRef } from "react";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "coral" | "ghost" };

export const Button = forwardRef<HTMLButtonElement, Props>(function Button({ variant = "primary", className = "", ...props }, ref) {
  return <button ref={ref} className={`button button-${variant} ${className}`} {...props} />;
});
