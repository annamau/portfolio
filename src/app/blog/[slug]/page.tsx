import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { listPosts } from "@/lib/journal/store";
import { publicPost } from "@/lib/journal/model";
import JournalEntry from "@/components/journal/JournalEntry";
export const dynamic = "force-dynamic";
async function entry(slug: string) { return (await listPosts()).find((post) => post.status === "published" && post.slug === slug); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params; const post = await entry(slug); if (!post) return { title: "Entry not found", robots: { index: false } };
  return { title: post.title, description: post.summary, alternates: { canonical: `/blog/${post.slug}` }, openGraph: { type: "article", title: post.title, description: post.summary, publishedTime: post.publishedAt, ...(post.cover ? { images: [post.cover] } : {}) } };
}
export default async function EntryPage({ params }: { params: Promise<{ slug: string }> }) { const { slug } = await params; const post = await entry(slug); if (!post) notFound(); return <JournalEntry post={publicPost(post)}/>; }
