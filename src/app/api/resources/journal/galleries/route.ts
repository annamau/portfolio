import { failure, json, jsonBody, ownerWrite } from "@/lib/resources/http";
import { ResourceError } from "@/lib/resources/model";
import { getPost } from "@/lib/journal/store";
import { saveGallery } from "@/lib/journal/galleries";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PUT(request: Request) {
  try {
    ownerWrite(request);
    const input = await jsonBody(request, 4_000_000);
    if (typeof input.postId !== "string" || !await getPost(input.postId)) throw new ResourceError("Entry not found.", 404);
    const gallery = await saveGallery(input);
    return json({ saved: true, version: gallery.version });
  } catch (error) { return failure(error); }
}
