import { failure, json, jsonBody, ownerWrite } from "@/lib/resources/http";
import { linkPreview } from "@/lib/resources/link-preview";
import { ResourceError } from "@/lib/resources/model";
export const runtime = "nodejs";
export async function POST(request: Request) {
  try {
    ownerWrite(request);
    const body = await jsonBody(request);
    if (typeof body.url !== "string") throw new ResourceError("Paste a link first.");
    return json(await linkPreview(body.url));
  } catch (error) { return failure(error); }
}
