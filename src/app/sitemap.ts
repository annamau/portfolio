import type { MetadataRoute } from "next";
import { listPosts } from "@/lib/journal/store";
import { journalSlug } from "@/lib/journal/permalinks";
import { resourceCollections } from "@/data/resources";

const BASE_URL = "https://andresnavesmauri.com";

export const dynamic = "force-dynamic";
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = (await listPosts()).filter((post) => post.status === "published");
  return [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${BASE_URL}/cv`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    ...["/blog", "/resources", ...resourceCollections.map(({ id }) => `/resources/${id}`)].map((path) => ({
      url: `${BASE_URL}${path}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    ...posts.map((post)=>({url:`${BASE_URL}/blog/${journalSlug(post.slug)}`,lastModified:new Date(post.updatedAt),changeFrequency:"monthly" as const,priority:0.6})),
  ];
}
