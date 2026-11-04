import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ResourceLibrary from "@/components/resources/ResourceLibrary";
import { resourceCollections } from "@/data/resources";

type Props = { params: Promise<{ category: string }> };

export function generateStaticParams() {
  return resourceCollections.map(({ id }) => ({ category: id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category } = await params;
  const collection = resourceCollections.find(({ id }) => id === category);
  if (!collection) return {};
  return {
    title: `${collection.name.en} resources`,
    description: collection.description.en,
    alternates: { canonical: `/resources/${collection.id}` },
    openGraph: { url: `/resources/${collection.id}`, title: `${collection.name.en} — The Resource Library` },
  };
}

export default async function ResourceCategoryPage({ params }: Props) {
  const { category } = await params;
  const collection = resourceCollections.find(({ id }) => id === category);
  if (!collection) notFound();
  return <ResourceLibrary key={collection.id} category={collection.id} />;
}
