"use client";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary";
  children: React.ReactNode;
}

export function Button({ variant = "primary", className = "", children, ...props }: ButtonProps) {
  const base = "px-4 py-2 font-medium rounded border transition-colors disabled:opacity-50";
  const styles =
    variant === "primary"
      ? "bg-accent hover:bg-accent-hover text-accent-foreground border-accent"
      : "border-border bg-card text-foreground hover:bg-background";
  return (
    <button className={`${base} ${styles} ${className}`} {...props}>
      {children}
    </button>
  );
}
