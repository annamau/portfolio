import { isOwner } from "@/lib/resources/auth";
import { getEntry, readMedia } from "@/lib/resources/store";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
type Context = { params: Promise<{ id: string; asset: string }> };
export async function GET(request: Request, context: Context) {
  const { id, asset } = await context.params;
  const entry = await getEntry(id);
  if (!entry?.media || entry.media.id !== asset || (entry.status !== "published" && !isOwner(request))) return new Response("Not found", { status: 404, headers: { "Cache-Control": "no-store" } });
  const contentType = entry.media.contentType;
  const browserCacheable = entry.status === "published" && contentType === "image/webp";
  const cacheHeaders = new Headers({ "Cache-Control": browserCacheable ? "private, max-age=300" : "private, no-store" });
  if (browserCacheable) {
    const etag = `"${asset}"`;
    cacheHeaders.set("ETag", etag);
    if (request.headers.get("If-None-Match")?.split(",").some(tag => tag.trim().replace(/^W\//, "") === etag)) {
      return new Response(null, { status: 304, headers: cacheHeaders });
    }
  }
  const bytes = await readMedia(id, asset);
  if (!bytes) return new Response("Not found", { status: 404, headers: { "Cache-Control": "no-store" } });
  const isMedia = /^(image|video|audio)\//.test(contentType);
  cacheHeaders.set("Content-Type", contentType);
  cacheHeaders.set("Content-Disposition", `${isMedia ? "inline" : "attachment"}; filename*=UTF-8''${encodeURIComponent(entry.media.name)}`);
  cacheHeaders.set("X-Content-Type-Options", "nosniff");
  cacheHeaders.set("Content-Security-Policy", "default-src 'none'; sandbox");
  return new Response(Buffer.from(bytes), { headers: cacheHeaders });
}
