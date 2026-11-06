import { listPosts } from "@/lib/journal/store";
import { publicPost } from "@/lib/journal/model";
import { pageMetadata, shareImages } from "@/lib/seo";
import JournalIndex from "@/components/journal/JournalIndex";
export const dynamic = "force-dynamic";
export const metadata = pageMetadata({
  path: "/blog",
  title: "Journal",
  socialTitle: "Journal by Andrés Naves Mauri",
  description: "Personal essays by Andrés Naves Mauri on games, film, how things are made, and whatever else gets him curious.",
  image: shareImages.journal,
});
export default async function BlogPage() { const posts = (await listPosts()).filter((post) => post.status === "published").map(publicPost); return <JournalIndex posts={posts}/>; }
