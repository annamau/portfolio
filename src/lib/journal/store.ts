import { mkdir, readdir } from "node:fs/promises";
import { blobs, directory, storageMode } from "../resources/store.ts";
import { readRecord, writeRecord } from "../resources/record-store.ts";
import { ResourceError } from "../resources/model.ts";
import { validPostId } from "./model.ts";
import type { JournalPost } from "./model.ts";
export async function getPost(id: string): Promise<JournalPost | null> {
  return validPostId(id) ? readRecord<JournalPost>(`journal/${id}`) : null;
}
export async function listPosts(): Promise<JournalPost[]> {
  let keys: string[];
  if (storageMode() === "netlify") keys = (await blobs().list({ prefix: "journal/" })).blobs.map(({ key }) => key);
  else {
    await mkdir(directory(), { recursive: true });
    keys = (await readdir(directory())).filter((file) => /^journal-post-[a-f0-9-]{36}\.json$/.test(file)).map((file) => `journal/${file.slice(8, -5)}`);
  }
  const rows = await Promise.all(keys.map((key) => readRecord<JournalPost>(key)));
  return rows.filter((row): row is JournalPost => !!row).sort((a, b) => (b.publishedAt || b.updatedAt).localeCompare(a.publishedAt || a.updatedAt));
}
export async function savePost(post: JournalPost, version = 0) {
  if (!validPostId(post.id)) throw new ResourceError("Invalid journal entry.");
  await writeRecord(`journal/${post.id}`, post, version);
}
