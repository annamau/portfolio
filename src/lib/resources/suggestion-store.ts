import { readFile, readdir, mkdir } from "node:fs/promises";
import { join } from "node:path";
import { atomicWrite, blobs, directory, locallySerialized, storageMode } from "./store.ts";
import { ResourceError } from "./model.ts";
import { validSuggestionId } from "./suggestions.ts";
import type { ResourceSuggestion } from "./suggestions.ts";

interface Versioned { version: number }
const cloud = () => storageMode() === "netlify";
const conflict = () => new ResourceError("This suggestion changed. Refresh and try again.", 409);
async function read<T>(key: string): Promise<T | null> {
  if (cloud()) return blobs().get(key, { type: "json" });
  try { return JSON.parse(await readFile(join(directory(), `${key.replaceAll("/", "-")}.json`), "utf8")); }
  catch (error) { if ((error as NodeJS.ErrnoException).code === "ENOENT") return null; throw error; }
}
async function write<T extends Versioned>(key: string, value: T, version: number) {
  if (cloud()) {
    const store = blobs();
    const current = await store.getWithMetadata(key, { type: "json" });
    if (((current?.data as T | undefined)?.version || 0) !== version) throw conflict();
    const result = await store.setJSON(key, value, current?.etag ? { onlyIfMatch: current.etag } : { onlyIfNew: true });
    if (!result.modified) throw conflict();
  } else await locallySerialized(async () => {
    const current = await read<T>(key);
    if ((current?.version || 0) !== version) throw conflict();
    await atomicWrite(join(directory(), `${key.replaceAll("/", "-")}.json`), JSON.stringify(value));
  });
}
export async function takeSuggestionSlot() {
  const key = `submission-limits/${new Date().toISOString().slice(0, 13)}`;
  for (let attempt = 0; attempt < 4; attempt++) {
    const current = await read<{ version: number; count: number }>(key);
    if ((current?.count || 0) >= 50) throw new ResourceError("Submissions are busy. Please try again in an hour.", 429);
    try { await write(key, { version: (current?.version || 0) + 1, count: (current?.count || 0) + 1 }, current?.version || 0); return; }
    catch (error) { if (!(error instanceof ResourceError) || error.status !== 409) throw error; }
  }
  throw new ResourceError("Submissions are busy. Please try again shortly.", 429);
}
export async function listSuggestions(): Promise<ResourceSuggestion[]> {
  let keys: string[];
  if (cloud()) keys = (await blobs().list({ prefix: "suggestions/" })).blobs.map(({ key }) => key);
  else {
    await mkdir(directory(), { recursive: true });
    keys = (await readdir(directory())).filter((file) => /^suggestions-suggestion-[a-f0-9-]{36}\.json$/.test(file)).map((file) => `suggestions/${file.slice(12, -5)}`);
  }
  const rows = await Promise.all(keys.map((key) => read<ResourceSuggestion>(key)));
  return rows.filter((row): row is ResourceSuggestion => !!row).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
export async function saveSuggestion(value: ResourceSuggestion, version = 0) {
  if (!validSuggestionId(value.id)) throw new ResourceError("Invalid suggestion ID.");
  await write(`suggestions/${value.id}`, value, version);
}
export async function reviewSuggestion(id: string, version: number, status: ResourceSuggestion["status"]) {
  if (!validSuggestionId(id)) throw new ResourceError("Invalid suggestion ID.");
  const value = await read<ResourceSuggestion>(`suggestions/${id}`);
  if (!value) throw new ResourceError("Suggestion not found.", 404);
  await saveSuggestion({ ...value, status, version: value.version + 1 }, version);
}
