import { isOwner } from "@/lib/resources/auth";
import { failure, json } from "@/lib/resources/http";
import { getPost } from "@/lib/journal/store";
import { getGallery } from "@/lib/journal/galleries";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request, { params }: { params: Promise<{ postId: string; name: string }> }) {
  try {
    const { postId, name } = await params;
    const post = await getPost(postId);
    if (!post || (post.status !== "published" && !isOwner(request))) return json({ error: "Gallery not found." }, 404);
    const gallery = await getGallery(postId, name);
    if (!gallery) return json({ error: "Gallery not found." }, 404);
    return json({ gallery });
  } catch (error) { return failure(error); }
}
