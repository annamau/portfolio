import type { MetadataRoute } from "next";
import { listPosts } from "@/lib/journal/store";
import { journalSlug } from "@/lib/journal/permalinks";
import { resourceCollections } from "@/data/resources";
import { SITE_URL } from "@/lib/seo";

export const dynamic = "force-dynamic";
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = (await listPosts()).filter((post) => post.status === "published");
  const journalUpdatedAt = posts.map((post) => post.updatedAt).sort().at(-1);
  return [
    { url: new URL("/", SITE_URL).href },
    { url: `${SITE_URL}/cv` },
    { url: `${SITE_URL}/blog`, ...(journalUpdatedAt ? { lastModified: journalUpdatedAt } : {}) },
    ...["/resources", ...resourceCollections.map(({ id }) => `/resources/${id}`)].map((path) => ({
      url: `${SITE_URL}${path}`,
    })),
    ...posts.map((post) => ({ url: `${SITE_URL}/blog/${journalSlug(post.slug)}`, lastModified: post.updatedAt })),
  ];
}
