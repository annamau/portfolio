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

const BASE_URL = "https://andresnaves.com";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "Andrés Naves Mauri — AI Developer & Automation Engineer",
    template: "%s | Andrés Naves Mauri",
  },
  description:
    "Portfolio of Andrés Naves Mauri. AI Engineer specializing in multi-agent systems, LangGraph orchestration, and intelligent automation. Based in Valencia, Spain.",
  keywords: [
    "AI Engineer",
    "AI Developer",
    "Multi-Agent Systems",
    "LangGraph",
    "LLM Orchestration",
    "Automation Engineer",
    "Full Stack Developer",
    "Next.js",
    "React",
    "Python",
    "Valencia Spain",
    "Andrés Naves Mauri",
  ],
  authors: [{ name: "Andrés Naves Mauri", url: BASE_URL }],
  creator: "Andrés Naves Mauri",
  openGraph: {
    title: "Andrés Naves Mauri — AI Developer & Automation Engineer",
    description:
      "AI Engineer specializing in multi-agent systems, LangGraph orchestration, and intelligent automation.",
    url: BASE_URL,
    siteName: "Andrés Naves Mauri",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/profile.jpg",
        width: 1200,
        height: 630,
        alt: "Andrés Naves Mauri — AI Developer",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Andrés Naves Mauri — AI Developer & Automation Engineer",
    description:
      "AI Engineer specializing in multi-agent systems, LangGraph orchestration, and intelligent automation.",
    images: ["/profile.jpg"],
  },
  alternates: {
    canonical: BASE_URL,
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([
              {
                "@context": "https://schema.org",
                "@type": "WebSite",
                name: "Andrés Naves Mauri",
                url: BASE_URL,
              },
              {
                "@context": "https://schema.org",
                "@type": "Person",
                name: "Andrés Naves Mauri",
                url: BASE_URL,
                jobTitle: "AI Developer & Automation Engineer",
                description:
                  "AI Engineer specializing in multi-agent systems, LangGraph orchestration, and intelligent automation.",
                address: {
                  "@type": "PostalAddress",
                  addressLocality: "Valencia",
                  addressCountry: "ES",
                },
                sameAs: [
                  "https://www.linkedin.com/in/andres-naves/",
                  "https://github.com/annamau",
                ],
              },
            ]),
          }}
        />
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
