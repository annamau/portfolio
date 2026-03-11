import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "CV & Application Pack Generator",
  description:
    "Generate a tailored CV and application pack for Andrés Naves Mauri — AI Developer & Automation Engineer. Customised per job listing with AI.",
  alternates: {
    canonical: "https://andresnavesmauri.com/cv",
  },
  openGraph: {
    title: "CV Generator — Andrés Naves Mauri",
    description:
      "Generate a tailored CV and application pack. AI-powered, customised per job listing.",
    url: "https://andresnavesmauri.com/cv",
  },
};

export default function CvLayout({ children }: { children: React.ReactNode }) {
  return children;
}
