import { createHash } from "node:crypto";
import { isIP } from "node:net";
import { resourceCollections } from "../../data/resources.ts";
import type { Resource, ResourceCategory, ResourceKind } from "../../data/resources.ts";

export interface SavedResource extends Resource {
  status: "draft" | "published";
  privateNotes: string;
  updatedAt: string;
  version: number;
  media?: { id: string; name: string; contentType: string; size: number; role: "cover" | "attachment" };
}
export class ResourceError extends Error {
  status: number;
  constructor(message: string, status = 400) { super(message); this.status = status; }
}
const kinds = new Set<ResourceKind>(["tool", "library", "inspiration", "learning", "post", "article", "video", "audio", "image", "file"]);
export const validId = (id: string) => /^saved-[a-f0-9]{24}$/.test(id);
export const validAssetId = (id: string) => /^[a-f0-9-]{36}$/.test(id);

export function normalizeResourceUrl(input: unknown): string {
  if (typeof input !== "string" || input.length > 2048) throw new ResourceError("Enter a valid public HTTPS link.");
  let url: URL;
  try { url = new URL(input.trim()); } catch { throw new ResourceError("Enter a valid public HTTPS link."); }
  const host = url.hostname.toLowerCase();
  if (url.protocol !== "https:" || url.username || url.password || url.port || isIP(host.replace(/^\[|\]$/g, "")) || !host.includes(".") || /(^|\.)(localhost|local|internal|test)$/.test(host)) {
    throw new ResourceError("Use a public HTTPS website, not a local or private address.");
  }
  for (const key of [...url.searchParams.keys()]) {
    if (/^(token|access_token|api_key|secret|password|session|auth|signature|code)$/i.test(key)) throw new ResourceError("This link may contain private access details. Use the public page URL.");
    if (/^(utm_|fbclid$|gclid$|ref_src$)/i.test(key)) url.searchParams.delete(key);
  }
  if (["x.com", "www.x.com", "twitter.com", "www.twitter.com", "mobile.twitter.com"].includes(host)) {
    url.hostname = "x.com";
    url.search = "";
    url.hash = "";
    const post = url.pathname.match(/^\/([\w]+)\/status\/(\d+)(?:\/(?:video|photo)\/\d+)?\/?$/);
    if (post) url.pathname = `/${post[1].toLowerCase()}/status/${post[2]}`;
  }
  if (url.pathname === "/" && !url.search && !url.hash) return url.origin;
  return url.href;
}

export function sourceFromUrl(url: string): Resource["source"] | undefined {
  const parsed = new URL(url);
  const match = parsed.hostname === "x.com" && parsed.pathname.match(/^\/([\w]+)\/status\/(\d+)$/);
  return match ? { platform: "x", postId: match[2], author: `@${match[1]}` } : undefined;
}

function text(value: unknown, max: number, fallback = ""): string {
  if (value === undefined || value === null) return fallback;
  if (typeof value !== "string" || value.length > max) throw new ResourceError(`Text must be at most ${max} characters.`);
  return value.trim();
}

export function parseDraft(input: unknown, existing?: SavedResource): Omit<SavedResource, "id" | "version" | "updatedAt" | "createdAt" | "status" | "media"> {
  if (!input || typeof input !== "object" || Array.isArray(input)) throw new ResourceError("Invalid resource.");
  const value = input as Record<string, unknown>;
  const hasAttachment = existing?.media?.role === "attachment" && value.url === existing.url;
  const url = hasAttachment ? existing.url : normalizeResourceUrl(value.url);
  const category = value.category || "ideas";
  if (!resourceCollections.some(({ id }) => id === category)) throw new ResourceError("Choose a resource folder.");
  const source = hasAttachment ? undefined : sourceFromUrl(url);
  const kind = value.kind || (source ? "post" : "tool");
  if (hasAttachment && kind !== existing.kind) throw new ResourceError("The type of an uploaded file cannot be changed.");
  if (!kinds.has(kind as ResourceKind)) throw new ResourceError("Choose a supported resource type.");
  if (value.tags !== undefined && !Array.isArray(value.tags)) throw new ResourceError("Tags must be a list.");
  const tags = [...new Set(((value.tags || []) as unknown[]).map((tag) => text(tag, 40)).filter(Boolean))];
  if (tags.length > 20) throw new ResourceError("Use at most 20 tags.");
  const name = text(value.name, 160, hasAttachment ? existing.name : source ? `Saved post ${source.author}` : new URL(url).hostname);
  if (!name) throw new ResourceError("Give this resource a name.");
  const description = value.description;
  let descriptions: Resource["description"];
  if (description && typeof description === "object" && !Array.isArray(description)) {
    const translations = description as Record<string, unknown>;
    const en = text(translations.en, 1500);
    const es = text(translations.es, 1500, en);
    descriptions = { en, es };
  } else {
    const summary = text(description, 1500);
    descriptions = { en: summary, es: summary };
  }
  return { name, url, category: category as ResourceCategory, kind: kind as ResourceKind, tags, description: descriptions, featured: false, source, privateNotes: text(value.privateNotes, 4000), preview: existing?.preview, file: existing?.file };
}

export function savedId(url: string): string {
  return `saved-${createHash("sha256").update(url).digest("hex").slice(0, 24)}`;
}

export function publicResource(entry: SavedResource): Resource {
  return {
    id: entry.id, name: entry.name, url: entry.url, category: entry.category, kind: entry.kind,
    tags: entry.tags, description: entry.description, featured: false, source: entry.source,
    preview: entry.preview, file: entry.file, createdAt: entry.createdAt,
  };
}
