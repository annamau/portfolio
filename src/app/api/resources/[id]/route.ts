import { failure, json, jsonBody, ownerWrite } from "@/lib/resources/http";
import { resources as seedResources } from "@/data/resources";
import { normalizeResourceUrl, parseDraft, ResourceError } from "@/lib/resources/model";
import { getEntry, listEntries, writeEntry } from "@/lib/resources/store";

export const runtime = "nodejs";
type Context = { params: Promise<{ id: string }> };

export async function PUT(request: Request, context: Context) {
  try {
    ownerWrite(request);
    const { id } = await context.params;
    const previous = await getEntry(id);
    if (!previous) throw new ResourceError("Resource not found.", 404);
    const body = await jsonBody(request);
    if (body.version !== previous.version) throw new ResourceError("This resource changed in another tab. Refresh and try again.", 409);
    const action = body.action || "save";
    if (!["save", "publish", "unpublish"].includes(String(action))) throw new ResourceError("Invalid action.");
    if (action === "save" && previous.status === "published") throw new ResourceError("Move this resource to the inbox before editing it.", 409);
    const edited = parseDraft({ ...previous, ...body, url: previous.media?.role === "attachment" ? previous.url : body.url || previous.url }, previous);
    if (edited.url !== previous.url) {
      const duplicate = seedResources.some((item) => normalizeResourceUrl(item.url) === edited.url) || (await listEntries()).some((item) => item.id !== id && item.url === edited.url);
      if (duplicate) throw new ResourceError("This link is already saved in your inbox or directory.", 409);
    }
    const entry = { ...previous, ...edited, status: action === "publish" ? "published" as const : "draft" as const, version: previous.version + 1, updatedAt: new Date().toISOString() };
    await writeEntry(entry, previous.version);
    return json({ resource: entry });
  } catch (error) { return failure(error); }
}
