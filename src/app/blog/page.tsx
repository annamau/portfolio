import type { Metadata } from "next";
import { listPosts } from "@/lib/journal/store";
import { publicPost } from "@/lib/journal/model";
import JournalIndex from "@/components/journal/JournalIndex";
export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Journal", description: "Games, curiosities and personal notes by Andrés Naves.", alternates: { canonical: "/blog" } };
export default async function BlogPage() { const posts = (await listPosts()).filter((post) => post.status === "published").map(publicPost); return <JournalIndex posts={posts}/>; }
