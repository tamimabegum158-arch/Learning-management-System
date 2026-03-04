import type { Metadata } from "next";
import "./globals.css";
import { AppShell } from "@/components/Layout/AppShell";

export const metadata: Metadata = {
  title: "LMS Portal",
  description: "Learning Management System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-900">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
