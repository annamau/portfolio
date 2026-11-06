import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ResourceLibrary from "@/components/resources/ResourceLibrary";
import { resourceCollections } from "@/data/resources";
import { pageMetadata, shareImages } from "@/lib/seo";

type Props = { params: Promise<{ category: string }> };

const descriptions = {
  development: "Curated tools and references for web development, including frontend libraries, components, developer docs and testing tools.",
  ai: "A curated directory of AI and agent resources, from models and SDKs to orchestration, context management and agent workflows.",
  design: "Curated design tools and references for interfaces, typography, color, motion and visual inspiration.",
  marketing: "Curated marketing resources for content, analytics, discoverability and telling a clearer story about what you build.",
  ideas: "A collection of creative references, articles and ideas for new projects, from product experiments to visual inspiration.",
  infrastructure: "Curated resources for the systems behind a product, including databases, hosting, storage and deployment.",
};

export function generateStaticParams() {
  return resourceCollections.map(({ id }) => ({ category: id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category } = await params;
  const collection = resourceCollections.find(({ id }) => id === category);
  if (!collection) return {};
  return pageMetadata({
    path: `/resources/${collection.id}`,
    title: `${collection.name.en} resources`,
    description: descriptions[collection.id],
    image: shareImages.resources,
  });
}

export default async function ResourceCategoryPage({ params }: Props) {
  const { category } = await params;
  const collection = resourceCollections.find(({ id }) => id === category);
  if (!collection) notFound();
  return <ResourceLibrary key={collection.id} category={collection.id} />;
}
