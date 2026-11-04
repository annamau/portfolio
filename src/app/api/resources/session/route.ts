import { createOwnerSession, isOwner, localOwner, ownerConfigured, passwordMatches, sameOrigin, sessionCookie } from "@/lib/resources/auth";
import { failure, json, jsonBody } from "@/lib/resources/http";
import { ResourceError } from "@/lib/resources/model";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const attempts = new Map<string, { count: number; until: number }>();

export function GET(request: Request) {
  return json({ authenticated: isOwner(request), configured: ownerConfigured(request), local: localOwner(request) });
}
export async function POST(request: Request) {
  try {
    if (!sameOrigin(request)) throw new ResourceError("Open the resource library to sign in.", 403);
    const body = await jsonBody(request);
    const secure = new URL(request.url).protocol === "https:";
    if (body.action === "logout") return new Response(JSON.stringify({ authenticated: false }), { headers: { "Content-Type": "application/json", "Cache-Control": "no-store", "Set-Cookie": sessionCookie("", secure, true) } });
    if (localOwner(request)) return json({ authenticated: true });
    if (!ownerConfigured(request)) throw new ResourceError("Owner access is not configured on this deployment.", 503);
    const key = "owner-login";
    const now = Date.now();
    const attempt = attempts.get(key);
    if (attempt && attempt.until > now && attempt.count >= 5) throw new ResourceError("Too many attempts. Try again in 15 minutes.", 429);
    if (!passwordMatches(body.password)) {
      attempts.set(key, { count: attempt && attempt.until > now ? attempt.count + 1 : 1, until: now + 15 * 60_000 });
      throw new ResourceError("Incorrect owner password.", 401);
    }
    attempts.delete(key);
    return new Response(JSON.stringify({ authenticated: true }), { headers: { "Content-Type": "application/json", "Cache-Control": "no-store", "Set-Cookie": sessionCookie(createOwnerSession(), secure) } });
  } catch (error) { return failure(error); }
}
