import { isOwner } from "@/lib/resources/auth";
import { failure, json, jsonBody, ownerWrite } from "@/lib/resources/http";
import { ResourceError } from "@/lib/resources/model";
import { newPost, publicPost, updatePost } from "@/lib/journal/model";
import { getPost, listPosts, savePost } from "@/lib/journal/store";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET(request: Request) {
  try {
    const owner = new URL(request.url).searchParams.get("scope") === "owner";
    if (owner && !isOwner(request)) throw new ResourceError("Owner access required.", 401);
    const posts = await listPosts();
    return json({ posts: owner ? posts : posts.filter((post) => post.status === "published").map(publicPost) });
  } catch (error) { return failure(error); }
}
export async function POST(request: Request) {
  try { ownerWrite(request); const post = newPost(await jsonBody(request, 180_000)); await savePost(post); return json({ post }, 201); }
  catch (error) { return failure(error); }
}
export async function PUT(request: Request) {
  try {
    ownerWrite(request); const input = await jsonBody(request, 180_000);
    const existing = typeof input.id === "string" && await getPost(input.id);
    if (!existing) throw new ResourceError("Entry not found.", 404);
    const post = updatePost(existing, input); await savePost(post, existing.version); return json({ post });
  } catch (error) { return failure(error); }
}
