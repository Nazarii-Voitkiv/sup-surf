import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "СапСерф Калининград - Морские прогулки и серфинг",
  description: "Организация сап-прогулок и серфинга в Калининграде. Маршруты по морю, обучение серфингу, аренда оборудования.",
  keywords: ["сап", "серфинг", "Калининград", "SUP", "прогулки по морю", "водный спорт"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className="scroll-smooth light">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
