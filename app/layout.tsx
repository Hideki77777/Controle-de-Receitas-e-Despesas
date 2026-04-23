export const dynamic = 'force-dynamic'

import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { Sidebar } from "@/components/layout/Sidebar";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Controle Financeiro Familiar",
  description: "Controle de receitas e despesas",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${geistSans.variable} h-full antialiased`}>
      <body className="min-h-full flex bg-neutral-900 text-neutral-100">
        <Sidebar />
        <main className="flex-1 overflow-auto">{children}</main>
        <Toaster richColors />
      </body>
    </html>
  );
}
