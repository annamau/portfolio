import { readdir, mkdir } from "node:fs/promises";
import { blobs, directory, storageMode } from "./store.ts";
import { ResourceError } from "./model.ts";
import { readRecord, writeRecord } from "./record-store.ts";
import { validSuggestionId } from "./suggestions.ts";
import type { ResourceSuggestion } from "./suggestions.ts";

const cloud = () => storageMode() === "netlify";
export async function takeSuggestionSlot() {
  const key = `submission-limits/${new Date().toISOString().slice(0, 13)}`;
  for (let attempt = 0; attempt < 4; attempt++) {
    const current = await readRecord<{ version: number; count: number }>(key);
    if ((current?.count || 0) >= 50) throw new ResourceError("Submissions are busy. Please try again in an hour.", 429);
    try { await writeRecord(key, { version: (current?.version || 0) + 1, count: (current?.count || 0) + 1 }, current?.version || 0); return; }
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
  const rows = await Promise.all(keys.map((key) => readRecord<ResourceSuggestion>(key)));
  return rows.filter((row): row is ResourceSuggestion => !!row).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
export async function saveSuggestion(value: ResourceSuggestion, version = 0) {
  if (!validSuggestionId(value.id)) throw new ResourceError("Invalid suggestion ID.");
  await writeRecord(`suggestions/${value.id}`, value, version);
}
export async function reviewSuggestion(id: string, version: number, status: ResourceSuggestion["status"]) {
  if (!validSuggestionId(id)) throw new ResourceError("Invalid suggestion ID.");
  const value = await readRecord<ResourceSuggestion>(`suggestions/${id}`);
  if (!value) throw new ResourceError("Suggestion not found.", 404);
  await saveSuggestion({ ...value, status, version: value.version + 1 }, version);
}
