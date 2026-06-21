import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AppShell } from "@/components/layout/AppShell";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { StoreHydrationProvider } from "@/components/providers/StoreHydrationProvider";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "FocusFlow AI",
  description: "Gamified productivity to kill the laziness",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full bg-background text-foreground">
        <TooltipProvider>
          <AppShell>
            <StoreHydrationProvider>{children}</StoreHydrationProvider>
          </AppShell>
        </TooltipProvider>
        <Toaster />
      </body>
    </html>
  );
}
