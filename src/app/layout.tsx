import type { Metadata } from "next";
import { Space_Grotesk, Inter } from "next/font/google";
import { Geist_Mono } from "next/font/google";
import Script from "next/script";
import { LanguageProvider } from "@/contexts/LanguageContext";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Andrés Naves Mauri — AI Developer & Automation Engineer",
  description:
    "Portfolio of Andrés Naves Mauri. AI Developer specializing in multi-agent systems, LLM orchestration, and intelligent automation.",
  openGraph: {
    title: "Andrés Naves Mauri — AI Developer & Automation Engineer",
    description:
      "AI Developer specializing in multi-agent systems, LLM orchestration, and intelligent automation.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${spaceGrotesk.variable} ${inter.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <LanguageProvider>
          {children}
        </LanguageProvider>
        <link href="https://assets.calendly.com/assets/external/widget.css" rel="stylesheet" />
        <Script
          src="https://assets.calendly.com/assets/external/widget.js"
          strategy="lazyOnload"
        />
      </body>
    </html>
  );
}
