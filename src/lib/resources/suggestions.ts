import { randomUUID } from "node:crypto";
import { resourceCollections } from "../../data/resources.ts";
import type { ResourceCategory } from "../../data/resources.ts";
import { ResourceError, normalizeResourceUrl } from "./model.ts";

export interface ResourceSuggestion {
  id: string;
  title: string;
  url: string;
  note: string;
  category: ResourceCategory;
  status: "pending" | "reviewed" | "archived";
  createdAt: string;
  version: number;
}
export const validSuggestionId = (id: string) => /^suggestion-[a-f0-9-]{36}$/.test(id);
function field(value: unknown, max: number, required = false): string {
  if (typeof value !== "string" || value.length > max || (required && !value.trim())) throw new ResourceError(`Enter text up to ${max} characters.`);
  return value.trim();
}
export function newSuggestion(input: Record<string, unknown>): ResourceSuggestion {
  const title = field(input.title, 160, true);
  const note = field(input.note, 1500, true);
  const url = input.url ? normalizeResourceUrl(input.url) : "";
  const category = input.category || "ideas";
  if (!resourceCollections.some(({ id }) => id === category)) throw new ResourceError("Choose a resource folder.");
  return { id: `suggestion-${randomUUID()}`, title, note, url, category: category as ResourceCategory, status: "pending", createdAt: new Date().toISOString(), version: 1 };
}
