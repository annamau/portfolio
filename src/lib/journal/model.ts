import { randomUUID } from "node:crypto";
import { ResourceError, normalizeResourceUrl } from "../resources/model.ts";
import { journalSlug } from "./permalinks.ts";
export interface JournalPost {
  id: string; slug: string; title: string; summary: string; body: string; topic: string; cover: string;
  status: "draft" | "published"; createdAt: string; updatedAt: string; publishedAt?: string; version: number;
}
export const validPostId = (id: string) => /^post-[a-f0-9-]{36}$/.test(id);
function text(value: unknown, max: number, required = false) {
  if (typeof value !== "string" || value.length > max || (required && !value.trim())) throw new ResourceError(`Enter text up to ${max} characters.`);
  return value.trim();
}
export function postContent(input: Record<string, unknown>) {
  return { title: text(input.title, 160, true), summary: text(input.summary || "", 280), body: text(input.body, 40_000, true), topic: text(input.topic || "", 60), cover: input.cover ? normalizeResourceUrl(input.cover) : "" };
}
export function newPost(input: Record<string, unknown>): JournalPost {
  const content = postContent(input); const uuid = randomUUID(); const now = new Date().toISOString();
  const stem = content.title.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 70) || "entry";
  return { ...content, id: `post-${uuid}`, slug: `${stem}-${uuid.slice(0, 8)}`, status: "draft", version: 1, createdAt: now, updatedAt: now };
}
export function updatePost(existing: JournalPost, input: Record<string, unknown>): JournalPost {
  if (input.version !== existing.version) throw new ResourceError("This entry changed in another tab. Refresh before saving.", 409);
  if (!["save", "publish", "unpublish"].includes(String(input.action))) throw new ResourceError("Choose a journal action.");
  const content = input.action === "unpublish" ? existing : postContent(input);
  return { ...existing, ...content, id: existing.id, slug: existing.slug, status: input.action === "publish" ? "published" : input.action === "unpublish" ? "draft" : existing.status, publishedAt: input.action === "publish" ? existing.publishedAt || new Date().toISOString() : existing.publishedAt, updatedAt: new Date().toISOString(), version: existing.version + 1 };
}
export function publicPost(post: JournalPost) {
  return { id: post.id, slug: journalSlug(post.slug), title: post.title, summary: post.summary, body: post.body, topic: post.topic, cover: post.cover, publishedAt: post.publishedAt };
}
