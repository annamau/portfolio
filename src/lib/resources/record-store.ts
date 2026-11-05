import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { atomicWrite, blobs, directory, locallySerialized, storageMode } from "./store.ts";
import { ResourceError } from "./model.ts";

interface Versioned { version: number }
const cloud = () => storageMode() === "netlify";
const conflict = () => new ResourceError("These details changed. Refresh and try again.", 409);
export async function readRecord<T>(key: string): Promise<T | null> {
  if (cloud()) return blobs().get(key, { type: "json" });
  try { return JSON.parse(await readFile(join(directory(), `${key.replaceAll("/", "-")}.json`), "utf8")); }
  catch (error) { if ((error as NodeJS.ErrnoException).code === "ENOENT") return null; throw error; }
}
export async function writeRecord<T extends Versioned>(key: string, value: T, version: number) {
  if (cloud()) {
    const store = blobs();
    const current = await store.getWithMetadata(key, { type: "json" });
    if (((current?.data as T | undefined)?.version || 0) !== version) throw conflict();
    const result = await store.setJSON(key, value, current?.etag ? { onlyIfMatch: current.etag } : { onlyIfNew: true });
    if (!result.modified) throw conflict();
  } else await locallySerialized(async () => {
    const current = await readRecord<T>(key);
    if ((current?.version || 0) !== version) throw conflict();
    await atomicWrite(join(directory(), `${key.replaceAll("/", "-")}.json`), JSON.stringify(value));
  });
}
