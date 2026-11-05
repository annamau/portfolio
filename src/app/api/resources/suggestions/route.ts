import { isOwner, sameOrigin } from "@/lib/resources/auth";
import { failure, json, jsonBody, ownerWrite } from "@/lib/resources/http";
import { ResourceError } from "@/lib/resources/model";
import { newSuggestion } from "@/lib/resources/suggestions";
import { listSuggestions, reviewSuggestion, saveSuggestion, takeSuggestionSlot } from "@/lib/resources/suggestion-store";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET(request: Request) {
  try { if (!isOwner(request)) throw new ResourceError("Owner access required.", 401); return json({ suggestions: await listSuggestions() }); }
  catch (error) { return failure(error); }
}
export async function POST(request: Request) {
  try {
    if (!sameOrigin(request)) throw new ResourceError("Submit from the resource directory.", 403);
    const input = await jsonBody(request, 12_000);
    if (input.company) return json({ received: true }, 202);
    const suggestion = newSuggestion(input);
    await takeSuggestionSlot();
    await saveSuggestion(suggestion);
    return json({ received: true }, 202);
  } catch (error) { return failure(error); }
}
export async function PUT(request: Request) {
  try {
    ownerWrite(request);
    const input = await jsonBody(request, 12_000);
    if (typeof input.id !== "string" || !Number.isInteger(input.version) || !["pending", "reviewed", "archived"].includes(String(input.status))) throw new ResourceError("Invalid review.");
    await reviewSuggestion(input.id, input.version as number, input.status as "pending" | "reviewed" | "archived");
    return json({ updated: true });
  } catch (error) { return failure(error); }
}
