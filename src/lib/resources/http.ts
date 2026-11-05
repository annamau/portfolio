import { isOwner, sameOrigin } from "./auth.ts";
import { ResourceError } from "./model.ts";

export function ownerWrite(request: Request): void {
  if (!isOwner(request)) throw new ResourceError("Sign in to manage your private inbox.", 401);
  if (!sameOrigin(request)) throw new ResourceError("This request must come from the resource library.", 403);
}
export function json(data: unknown, status = 200): Response {
  return Response.json(data, { status, headers: { "Cache-Control": "private, no-store", "Vary": "Cookie" } });
}
export function failure(error: unknown): Response {
  if (error instanceof ResourceError) return json({ error: error.message }, error.status);
  console.error("Resource request failed:", error instanceof Error ? error.name : "unknown error");
  return json({ error: "The resource could not be processed. Please try again." }, 500);
}
export async function limitedBody(request: Request, limit = 150_000): Promise<Uint8Array> {
  const reader = request.body?.getReader();
  if (!reader) throw new ResourceError("The request is empty.");
  const chunks: Uint8Array[] = [];
  let total = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > limit) { await reader.cancel(); throw new ResourceError("This request is too large.", 413); }
    chunks.push(value);
  }
  return Buffer.concat(chunks);
}
export async function jsonBody(request: Request, limit = 150_000): Promise<Record<string, unknown>> {
  if (!request.headers.get("content-type")?.startsWith("application/json")) throw new ResourceError("Send JSON data.", 415);
  try {
    const parsed = JSON.parse(Buffer.from(await limitedBody(request, limit)).toString());
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new ResourceError("Invalid resource data.");
    return parsed;
  } catch (error) { if (error instanceof ResourceError) throw error; throw new ResourceError("Invalid JSON data."); }
}
