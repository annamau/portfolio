import { createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";

export const SESSION_COOKIE = "resource_owner";
const SESSION_SECONDS = 8 * 60 * 60;
type Environment = Record<string, string | undefined>;

function password(env: Environment): string | undefined {
  const value = env.RESOURCE_ADMIN_PASSWORD;
  return value && value.length >= 16 ? value : undefined;
}
export function localOwner(request: Request, env: Environment = process.env): boolean {
  return env.RESOURCE_LOCAL_OWNER === "1" && !env.NETLIFY && !env.NETLIFY_BLOBS_CONTEXT && !env.VERCEL && ["localhost", "127.0.0.1", "[::1]"].includes(new URL(request.url).hostname);
}
export function ownerConfigured(request: Request, env: Environment = process.env): boolean {
  return localOwner(request, env) || !!password(env);
}
export function passwordMatches(candidate: unknown, env: Environment = process.env): boolean {
  const secret = password(env);
  if (!secret || typeof candidate !== "string" || candidate.length > 512) return false;
  return timingSafeEqual(createHash("sha256").update(candidate).digest(), createHash("sha256").update(secret).digest());
}
function signature(payload: string, secret: string): string {
  return createHmac("sha256", secret).update(payload).digest("base64url");
}
export function createOwnerSession(env: Environment = process.env, now = Date.now()): string {
  const secret = password(env);
  if (!secret) throw new Error("Owner password is not configured.");
  const payload = `${Math.floor(now / 1000) + SESSION_SECONDS}.${randomBytes(24).toString("base64url")}`;
  return `${payload}.${signature(payload, secret)}`;
}
export function isOwner(request: Request, env: Environment = process.env, now = Date.now()): boolean {
  if (localOwner(request, env)) return true;
  const secret = password(env);
  if (!secret) return false;
  const raw = request.headers.get("cookie")?.split(";").map((part) => part.trim()).find((part) => part.startsWith(`${SESSION_COOKIE}=`))?.slice(SESSION_COOKIE.length + 1);
  if (!raw || raw.length > 256) return false;
  const parts = raw.split(".");
  if (parts.length !== 3 || !/^\d+$/.test(parts[0])) return false;
  const expiry = Number(parts[0]);
  const seconds = Math.floor(now / 1000);
  if (expiry <= seconds || expiry > seconds + SESSION_SECONDS) return false;
  const expected = Buffer.from(signature(`${parts[0]}.${parts[1]}`, secret));
  const actual = Buffer.from(parts[2]);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}
export function sameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  const url = new URL(request.url);
  const host = request.headers.get("host");
  // Next can normalize a loopback request URL to localhost. Host retains the browser-facing authority.
  return !!origin && origin === (host ? `${url.protocol}//${host}` : url.origin);
}
export function sessionCookie(value: string, secure: boolean, remove = false): string {
  return `${SESSION_COOKIE}=${value}; HttpOnly; Path=/api/resources; SameSite=Strict; Max-Age=${remove ? 0 : SESSION_SECONDS}${secure ? "; Secure" : ""}`;
}
