"use client";

interface AlertProps {
  variant?: "error" | "success" | "info";
  children: React.ReactNode;
  className?: string;
}

export function Alert({ variant = "info", children, className = "" }: AlertProps) {
  const styles =
    variant === "error"
      ? "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20"
      : variant === "success"
        ? "text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20"
        : "text-neutral-700 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-800";
  return (
    <div className={`px-3 py-2 rounded text-sm ${styles} ${className}`} role="alert">
      {children}
    </div>
  );
}
