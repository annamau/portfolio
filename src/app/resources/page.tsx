import ResourceLibrary from "@/components/resources/ResourceLibrary";
import { pageMetadata, shareImages } from "@/lib/seo";

export const metadata = pageMetadata({
  path: "/resources",
  title: "Resource Library",
  description: "A personal library of developer tools, AI frameworks, design references and marketing resources, curated from Andrés Naves Mauri’s bookmarks.",
  socialTitle: "The Resource Library by Andrés Naves Mauri",
  image: shareImages.resources,
});

export default function ResourcesPage() {
  return <ResourceLibrary />;
}
