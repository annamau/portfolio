import { isOwner } from "@/lib/resources/auth";
import { getEntry, readMedia } from "@/lib/resources/store";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
type Context = { params: Promise<{ id: string; asset: string }> };
export async function GET(request: Request, context: Context) {
  const { id, asset } = await context.params;
  const entry = await getEntry(id);
  if (!entry?.media || entry.media.id !== asset || (entry.status !== "published" && !isOwner(request))) return new Response("Not found", { status: 404, headers: { "Cache-Control": "no-store" } });
  const bytes = await readMedia(id, asset);
  if (!bytes) return new Response("Not found", { status: 404 });
  const isMedia = /^(image|video|audio)\//.test(entry.media.contentType);
  return new Response(Buffer.from(bytes), { headers: {
    "Content-Type": entry.media.contentType,
    "Content-Disposition": `${isMedia ? "inline" : "attachment"}; filename*=UTF-8''${encodeURIComponent(entry.media.name)}`,
    "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff", "Content-Security-Policy": "default-src 'none'; sandbox",
  } });
}
