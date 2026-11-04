import { mkdir, readFile, readdir, rename, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { randomUUID } from "node:crypto";
import { getStore } from "@netlify/blobs";
import { ResourceError, validId, validAssetId } from "./model.ts";
import type { SavedResource } from "./model.ts";

const directory = () => process.env.RESOURCE_DATA_DIR || join(process.cwd(), ".resource-data");
export function storageMode(env: Record<string, string | undefined> = process.env): "local" | "netlify" {
  if (env.RESOURCE_STORAGE === "netlify" || env.NETLIFY === "true" || env.NETLIFY_BLOBS_CONTEXT) return "netlify";
  if (env.VERCEL) throw new ResourceError("Persistent resource storage is not configured on this host.", 503);
  if (env.RESOURCE_STORAGE === "local" || env.RESOURCE_LOCAL_OWNER === "1" || env.NODE_ENV !== "production") return "local";
  throw new ResourceError("Persistent resource storage is not configured on this host.", 503);
}
const cloud = () => storageMode() === "netlify";
const blobs = () => getStore({ name: "portfolio-resource-library", consistency: "strong" });
let queue = Promise.resolve();

async function locallySerialized<T>(work: () => Promise<T>): Promise<T> {
  const previous = queue;
  let release!: () => void;
  queue = new Promise<void>((resolve) => { release = resolve; });
  await previous;
  try { return await work(); } finally { release(); }
}
async function atomicWrite(path: string, data: string | Uint8Array): Promise<void> {
  await mkdir(directory(), { recursive: true });
  const temporary = `${path}.${randomUUID()}.tmp`;
  await writeFile(temporary, data, { mode: 0o600 });
  await rename(temporary, path);
}
export async function getEntry(id: string): Promise<SavedResource | null> {
  if (!validId(id)) return null;
  if (cloud()) return blobs().get(`entries/${id}`, { type: "json" });
  try { return JSON.parse(await readFile(join(directory(), `${id}.json`), "utf8")); }
  catch (error) { if ((error as NodeJS.ErrnoException).code === "ENOENT") return null; throw error; }
}
export async function listEntries(): Promise<SavedResource[]> {
  if (cloud()) {
    const { blobs: entries } = await blobs().list({ prefix: "entries/" });
    const rows = await Promise.all(entries.map(({ key }) => blobs().get(key, { type: "json" }) as Promise<SavedResource | null>));
    return rows.filter((row): row is SavedResource => !!row).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }
  await mkdir(directory(), { recursive: true });
  const files = (await readdir(directory())).filter((file) => /^saved-[a-f0-9]{24}\.json$/.test(file));
  const rows = await Promise.all(files.map(async (file) => JSON.parse(await readFile(join(directory(), file), "utf8")) as SavedResource));
  return rows.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}
export async function writeEntry(entry: SavedResource, expectedVersion: number): Promise<void> {
  if (!validId(entry.id)) throw new ResourceError("Invalid resource ID.");
  if (cloud()) {
    const store = blobs();
    const current = await store.getWithMetadata(`entries/${entry.id}`, { type: "json" });
    const previous = current?.data as SavedResource | undefined;
    if ((previous?.version || 0) !== expectedVersion) throw new ResourceError("This resource changed in another tab. Refresh and try again.", 409);
    const result = await store.setJSON(`entries/${entry.id}`, entry, current?.etag ? { onlyIfMatch: current.etag } : { onlyIfNew: true });
    if (!result.modified) throw new ResourceError("This resource changed in another tab. Refresh and try again.", 409);
    return;
  }
  await locallySerialized(async () => {
    const current = await getEntry(entry.id);
    if ((current?.version || 0) !== expectedVersion) throw new ResourceError("This resource changed in another tab. Refresh and try again.", 409);
    await atomicWrite(join(directory(), `${entry.id}.json`), JSON.stringify(entry));
  });
}
export async function writeMedia(id: string, asset: string, bytes: Uint8Array): Promise<void> {
  if (!validId(id) || !validAssetId(asset)) throw new ResourceError("Invalid media ID.");
  if (cloud()) { await blobs().set(`media/${id}/${asset}`, bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer); return; }
  await atomicWrite(join(directory(), `${id}-${asset}.media`), bytes);
}
export async function readMedia(id: string, asset: string): Promise<Uint8Array | null> {
  if (!validId(id) || !validAssetId(asset)) return null;
  if (cloud()) {
    const value = await blobs().get(`media/${id}/${asset}`, { type: "arrayBuffer" });
    return value ? new Uint8Array(value) : null;
  }
  try { return await readFile(join(directory(), `${id}-${asset}.media`)); }
  catch (error) { if ((error as NodeJS.ErrnoException).code === "ENOENT") return null; throw error; }
}
