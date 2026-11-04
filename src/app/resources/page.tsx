import type { Metadata } from "next";
import ResourceLibrary from "@/components/resources/ResourceLibrary";

export const metadata: Metadata = {
  title: "Resources — Tools, references & good ideas",
  description: "A personal library of developer tools, AI frameworks, design references and marketing resources, curated from Andrés Naves Mauri’s bookmarks.",
  alternates: { canonical: "/resources" },
  openGraph: { url: "/resources", title: "The Resource Library — Andrés Naves Mauri" },
};

export default function ResourcesPage() {
  return <ResourceLibrary />;
}
