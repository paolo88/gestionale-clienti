import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Revenue Monitor",
  description: "Advanced revenue monitoring for clients and companies",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it">
      <body className={cn(inter.className, "antialiased bg-neutral-50")}>
        {children}
      </body>
    </html>
  );
}
