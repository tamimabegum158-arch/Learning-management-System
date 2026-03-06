import type { Metadata } from "next";
import "./globals.css";
import { AppShell } from "@/components/Layout/AppShell";

export const metadata: Metadata = {
  title: "Learning Management System Application",
  description: "Learning Management System Application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased text-foreground bg-background">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
