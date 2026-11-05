import { lookup } from "node:dns/promises";
import { request } from "node:https";
import { createBrotliDecompress, createGunzip, createInflate } from "node:zlib";
import ipaddr from "ipaddr.js";
import { normalizeResourceUrl, ResourceError } from "./model.ts";

interface Address { address: string; family: number }
interface PageResponse { status: number; location?: string; contentType: string; body: Buffer }
type AssetKind = "page" | "image";
interface Network {
  resolve: (hostname: string) => Promise<Address[]>;
  read: (url: URL, address: Address, kind: AssetKind, signal: AbortSignal) => Promise<PageResponse>;
}
export function publicAddress(address: string): boolean {
  try { return ipaddr.process(address).range() === "unicast"; } catch { return false; }
}
function interruptible<T>(promise: Promise<T>, signal: AbortSignal): Promise<T> {
  return new Promise((resolve, reject) => {
    const abort = () => reject(new ResourceError("This page took too long to respond. You can enter the details yourself.", 504));
    signal.addEventListener("abort", abort, { once: true });
    promise.then(resolve, reject).finally(() => signal.removeEventListener("abort", abort));
    if (signal.aborted) abort();
  });
}
const read: Network["read"] = (url, address, kind, signal) => new Promise((resolve, reject) => {
  const req = request(url, {
    signal, agent: false, family: address.family,
    // Pin the checked DNS answer while HTTPS verifies the original hostname.
    lookup: (_hostname, _options, callback) => callback(null, address.address, address.family),
    headers: { "User-Agent": "AndresResourcePreview/1.0", Accept: kind === "page" ? "text/html,application/xhtml+xml" : "image/png,image/jpeg,image/webp,image/gif", "Accept-Encoding": "identity" },
  }, async (response) => {
    const status = response.statusCode || 0;
    const contentType = (response.headers["content-type"] || "").split(";")[0].trim().toLowerCase();
    if ([301, 302, 303, 307, 308].includes(status)) { response.destroy(); resolve({ status, location: response.headers.location, contentType, body: Buffer.alloc(0) }); return; }
    const accepted = kind === "page" ? ["text/html", "application/xhtml+xml"] : ["image/png", "image/jpeg", "image/webp", "image/gif"];
    if (status < 200 || status >= 300 || !accepted.includes(contentType)) { response.destroy(); reject(new ResourceError("This page could not be read. You can enter the details yourself.", 422)); return; }
    const encoding = response.headers["content-encoding"];
    if (encoding && !["identity", "gzip", "br", "deflate"].includes(encoding)) { response.destroy(); reject(new ResourceError("This page uses an unsupported encoding.", 422)); return; }
    const decoder = encoding === "gzip" ? createGunzip() : encoding === "br" ? createBrotliDecompress() : encoding === "deflate" ? createInflate() : null;
    const stream = decoder ? response.pipe(decoder) : response;
    if (decoder) response.once("error", (error) => decoder.destroy(error));
    try {
      const body = await readPublicBody(stream, kind);
      resolve({ status, contentType, body });
    } catch (error) { reject(error); }
    finally { stream.destroy(); response.destroy(); }
  });
  req.once("error", reject); req.end();
});

export async function readPublicBody(stream: AsyncIterable<Uint8Array>, kind: AssetKind) {
  const maximum = kind === "page" ? 512 * 1024 : 4 * 1024 * 1024;
  const chunks: Buffer[] = []; let size = 0;
  for await (const raw of stream) {
    const chunk = Buffer.from(raw);
    if (size + chunk.length > maximum) {
      if (kind === "image") throw new ResourceError("The page image is too large.", 413);
      chunks.push(chunk.subarray(0, maximum - size)); break;
    }
    chunks.push(chunk); size += chunk.length;
  }
  return Buffer.concat(chunks);
}

/** Reads public HTTPS content only; redirects and DNS answers are checked per hop. */
export async function readPublicResource(input: string, kind: AssetKind = "page", network: Network = { resolve: (host) => lookup(host, { all: true }), read }) {
  let url = new URL(normalizeResourceUrl(input));
  const signal = AbortSignal.timeout(10_000);
  for (let hop = 0; hop <= 3; hop++) {
    const addresses = await interruptible(network.resolve(url.hostname), signal);
    if (!addresses.length || addresses.some(({ address }) => !publicAddress(address))) throw new ResourceError("Use a website that resolves to a public address.");
    const address = addresses.find((item) => item.family === 4) || addresses[0];
    const response = await interruptible(network.read(url, address, kind, signal), signal);
    if ([301, 302, 303, 307, 308].includes(response.status)) {
      if (!response.location || hop === 3) throw new ResourceError("This link redirects too many times.");
      url = new URL(normalizeResourceUrl(new URL(response.location, url).href)); continue;
    }
    return { url: url.href, contentType: response.contentType, body: response.body };
  }
  throw new ResourceError("This link could not be read.");
}
