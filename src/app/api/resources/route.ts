import { randomUUID } from "node:crypto";
import { resources as seedResources } from "@/data/resources";
import { isOwner } from "@/lib/resources/auth";
import { failure, json, jsonBody, limitedBody, ownerWrite } from "@/lib/resources/http";
import { normalizeResourceUrl, parseDraft, publicResource, ResourceError, savedId } from "@/lib/resources/model";
import type { SavedResource } from "@/lib/resources/model";
import { listEntries, getEntry, writeEntry, writeMedia } from "@/lib/resources/store";
import { MAX_UPLOAD_BYTES, validateUpload } from "@/lib/resources/upload";
import { readPublicResource } from "@/lib/resources/public-page";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const privateScope = new URL(request.url).searchParams.get("scope") === "inbox";
    if (privateScope && !isOwner(request)) return json({ error: "Sign in to open your private inbox." }, 401);
    const entries = await listEntries();
    return json({ resources: privateScope ? entries : entries.filter((entry) => entry.status === "published").map(publicResource) });
  } catch (error) { return failure(error); }
}

async function createDraft(input: unknown, upload?: File, role: "cover" | "attachment" = "attachment"): Promise<{ resource: SavedResource; warning?: string }> {
  const now = new Date().toISOString();
  let fileData;
  let baseInput = input;
  let id: string;
  if (upload) {
    fileData = await validateUpload(upload);
    if (role === "cover" && fileData.kind !== "image") throw new ResourceError("A cover must be an image.");
  }
  if (fileData && role === "attachment") {
    id = savedId(`upload:${randomUUID()}`);
    baseInput = { ...(input as object), url: `https://upload.invalid/${id}`, kind: fileData.kind, name: (input as { name?: string }).name || fileData.name };
  } else {
    const parsed = parseDraft(baseInput);
    if (seedResources.some((entry) => normalizeResourceUrl(entry.url) === parsed.url) || (await listEntries()).some((entry) => entry.url === parsed.url)) throw new ResourceError("This link is already in the directory.", 409);
    id = savedId(parsed.url);
  }
  if (await getEntry(id)) throw new ResourceError("This link is already saved in your inbox or directory.", 409);
  let warning: string | undefined;
  const coverUrl = (input as { coverUrl?: unknown }).coverUrl;
  if (!upload && typeof coverUrl === "string" && coverUrl) {
    try {
      const image = await readPublicResource(coverUrl, "image");
      fileData = await validateUpload(new File([new Uint8Array(image.body)], "page-image", { type: image.contentType }));
      if (fileData.kind !== "image") throw new ResourceError("A cover must be an image.");
      role = "cover";
    } catch { fileData = undefined; warning = "page-image-unavailable"; }
  }
  const entry: SavedResource = { ...parseDraft(baseInput), id, status: "draft", createdAt: now, updatedAt: now, version: 1 };
  if (fileData) {
    const asset = randomUUID();
    const mediaUrl = `/api/resources/media/${id}/${asset}`;
    entry.media = { id: asset, name: fileData.name, contentType: fileData.contentType, size: fileData.bytes.byteLength, role };
    if (role === "attachment") { entry.url = mediaUrl; entry.file = { name: fileData.name, contentType: fileData.contentType, size: fileData.bytes.byteLength }; }
    if (fileData.kind === "image") entry.preview = mediaUrl;
    await writeMedia(id, asset, fileData.bytes);
  }
  await writeEntry(entry, 0);
  return { resource: entry, warning };
}

export async function POST(request: Request) {
  try {
    ownerWrite(request);
    if (request.headers.get("content-type")?.startsWith("multipart/form-data")) {
      const bytes = await limitedBody(request, MAX_UPLOAD_BYTES + 100_000);
      const multipart = new Request(request.url, { method: "POST", headers: { "content-type": request.headers.get("content-type")! }, body: Buffer.from(bytes) });
      const form = await multipart.formData();
      const upload = form.get("file");
      if (!(upload instanceof File)) throw new ResourceError("Choose a file to upload.");
      let data: unknown;
      try { data = JSON.parse(String(form.get("data") || "{}")); } catch { throw new ResourceError("Invalid upload details."); }
      const { resource } = await createDraft(data, upload, form.get("role") === "cover" ? "cover" : "attachment");
      return json({ resources: [resource], duplicates: 0 }, 201);
    }
    const body = await jsonBody(request);
    const items = Array.isArray(body.items) ? body.items : [body];
    if (!items.length || items.length > 50) throw new ResourceError("Add between 1 and 50 links at a time.");
    if (items.length > 1 && items.some((item) => item && typeof item === "object" && "coverUrl" in item && item.coverUrl)) throw new ResourceError("Save page images one link at a time.");
    // Validate the entire batch before writing any part of an import.
    items.forEach((item) => parseDraft(item));
    const entries: SavedResource[] = [];
    let duplicates = 0;
    const warnings: string[] = [];
    for (const item of items) {
      try { const result = await createDraft(item); entries.push(result.resource); if (result.warning) warnings.push(result.warning); }
      catch (error) { if (error instanceof ResourceError && error.status === 409) duplicates++; else throw error; }
    }
    return json({ resources: entries, duplicates, warnings }, entries.length ? 201 : 200);
  } catch (error) { return failure(error); }
}
