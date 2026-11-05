import { failure, json, jsonBody, ownerWrite } from "@/lib/resources/http";
import { ResourceError } from "@/lib/resources/model";
import { getPost } from "@/lib/journal/store";
import { saveChart } from "@/lib/journal/charts";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function PUT(request: Request) {
  try {
    ownerWrite(request); const input = await jsonBody(request, 1_500_000);
    if (typeof input.postId !== "string" || !await getPost(input.postId)) throw new ResourceError("Entry not found.", 404);
    await saveChart(input); return json({ saved: true });
  } catch (error) { return failure(error); }
}
