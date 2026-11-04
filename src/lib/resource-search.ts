import type { Resource, ResourceCategory, ResourceKind } from "../data/resources";

export interface ResourceFilters {
  category?: ResourceCategory;
  query?: string;
  tag?: string;
  sort?: "curated" | "az";
  format?: "website" | "post" | "article" | "video" | "audio" | "image" | "file";
}

function normalize(value: string): string {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

const aliases: Record<string, string[]> = {
  database: ["db", "databases", "base de datos", "bases de datos"],
  images: ["image", "imagenes", "imagen", "photos", "photo", "fotos", "pictures"],
  audio: ["sound", "sonido", "music", "musica"],
  video: ["videos", "clips", "footage"],
  ai: ["ia", "artificial intelligence", "inteligencia artificial"],
  frontend: ["front-end", "front end"],
  backend: ["back-end", "back end"],
  hosting: ["alojamiento", "deploy", "deployment"],
};

export function canonicalTag(tag: string): string {
  const normalized = normalize(tag.trim());
  return Object.entries(aliases).find(([key, values]) => key === normalized || values.includes(normalized))?.[0] || normalized;
}

export function resourceFormat(kind: ResourceKind): NonNullable<ResourceFilters["format"]> {
  if (kind === "tool" || kind === "library" || kind === "inspiration") return "website";
  return kind === "learning" ? "article" : kind;
}

export function filterResources(resources: Resource[], filters: ResourceFilters): Resource[] {
  const terms = normalize(filters.query?.trim() || "").split(/\s+/).filter(Boolean);
  const matches = resources.filter((resource) => {
    if (filters.category && resource.category !== filters.category) return false;
    if (filters.tag && !resource.tags.some((tag) => canonicalTag(tag) === canonicalTag(filters.tag!))) return false;
    if (filters.format && resourceFormat(resource.kind) !== filters.format) return false;
    const searchable = normalize([
      resource.name, resource.category, resource.kind,
      resource.description.en, resource.description.es,
      ...resource.tags.flatMap((tag) => [tag, ...(aliases[canonicalTag(tag)] || [])]),
    ].join(" "));
    return terms.every((term) => searchable.includes(term));
  });
  return filters.sort === "az"
    ? matches.sort((a, b) => a.name.localeCompare(b.name))
    : matches;
}
