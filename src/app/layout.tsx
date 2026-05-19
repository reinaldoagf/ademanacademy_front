import type { Metadata } from "next";
import { Anton, Questrial } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";

// 1. Configurar fuentes de Google
const anton = Anton({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-anton", // Variable CSS para Tailwind
});

const questrial = Questrial({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-questrial",
});

// 2. Configurar fuente local (Breathing)
const breathing = localFont({
  src: "./fonts/Breathing.ttf", // Asegúrate de que el nombre y extensión coincidan
  variable: "--font-breathing",
});

export const metadata = {
  title: "Ademan - Academia de Baile",
  description: "Sistema de gestión administrativa",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${anton.variable} ${questrial.variable} ${breathing.variable}`}
    >
      <body className="min-h-full flex flex-col" suppressHydrationWarning>{children}</body>
    </html>
  );
}
