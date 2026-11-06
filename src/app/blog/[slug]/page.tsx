import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import { listPosts } from "@/lib/journal/store";
import { publicPost, type JournalPost } from "@/lib/journal/model";
import { journalSlug } from "@/lib/journal/permalinks";
import { journalShareImage, pageMetadata, SITE_NAME, SITE_URL } from "@/lib/seo";
import JournalEntry from "@/components/journal/JournalEntry";

export const dynamic = "force-dynamic";
type Props = { params: Promise<{ slug: string }> };

const entry = cache(async (slug: string) => {
  return (await listPosts()).find((post) => post.status === "published" && journalSlug(post.slug) === slug);
});

function entryDescription(post: JournalPost) {
  return post.summary || `${post.title}, an entry in the Journal by ${SITE_NAME}.`;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await entry(slug);
  if (!post) return { title: "Entry not found", robots: { index: false } };

  return pageMetadata({
    path: `/blog/${slug}`,
    title: post.title,
    description: entryDescription(post),
    image: journalShareImage(post.cover, post.title),
    article: { publishedTime: post.publishedAt, modifiedTime: post.updatedAt, section: post.topic || undefined },
  });
}

export default async function EntryPage({ params }: Props) {
  const { slug } = await params;
  const post = await entry(slug);
  if (!post) notFound();

  const url = new URL(`/blog/${slug}`, SITE_URL).href;
  const schema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    url,
    mainEntityOfPage: url,
    headline: post.title,
    description: entryDescription(post),
    image: new URL(journalShareImage(post.cover, post.title).url, SITE_URL).href,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    author: { "@type": "Person", "@id": `${SITE_URL}/#andres`, name: SITE_NAME, url: SITE_URL },
  };

  return <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }} />
    <JournalEntry post={publicPost(post)} />
  </>;
}
