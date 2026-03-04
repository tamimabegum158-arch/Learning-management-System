"use client";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary";
  children: React.ReactNode;
}

export function Button({ variant = "primary", className = "", children, ...props }: ButtonProps) {
  const base = "px-4 py-2 font-medium rounded transition-colors disabled:opacity-50";
  const styles =
    variant === "primary"
      ? "bg-slate-600 hover:bg-slate-500 dark:bg-slate-500 dark:hover:bg-slate-400 text-white dark:text-slate-900 transition-colors"
      : "border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors";
  return (
    <button className={`${base} ${styles} ${className}`} {...props}>
      {children}
    </button>
  );
}
