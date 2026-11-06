import type { Metadata } from "next";
import localFont from "next/font/local";
import Script from "next/script";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { SITE_NAME, SITE_URL } from "@/lib/seo";
import "./globals.css";

const bodoni = localFont({
  variable: "--font-bodoni",
  src: [
    { path: "./fonts/bodoni-moda-normal.woff2", weight: "400 900", style: "normal" },
    { path: "./fonts/bodoni-moda-italic.woff2", weight: "400 900", style: "italic" },
  ],
  display: "swap",
  fallback: ["Georgia", "serif"],
});

const manrope = localFont({
  variable: "--font-manrope",
  src: "./fonts/manrope.woff2",
  weight: "200 800",
  display: "swap",
});

const geistMono = localFont({
  variable: "--font-geist-mono",
  src: "./fonts/geist-mono.woff2",
  weight: "100 900",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${bodoni.variable} ${manrope.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([
              {
                "@context": "https://schema.org",
                "@type": "WebSite",
                name: SITE_NAME,
                url: SITE_URL,
              },
              {
                "@context": "https://schema.org",
                "@type": "Person",
                "@id": `${SITE_URL}/#andres`,
                name: SITE_NAME,
                url: SITE_URL,
                jobTitle: "AI Product Engineer",
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
        <Script
          id="calendly-css"
          strategy="lazyOnload"
          dangerouslySetInnerHTML={{
            __html: `var l=document.createElement('link');l.rel='stylesheet';l.href='https://assets.calendly.com/assets/external/widget.css';document.head.appendChild(l);`,
          }}
        />
        <Script
          src="https://assets.calendly.com/assets/external/widget.js"
          strategy="lazyOnload"
        />
      </body>
    </html>
  );
}
