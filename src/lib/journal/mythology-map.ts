export interface MythologyReference { sourceId: string; passage: string }
export interface MythologyEntity {
  id: string; name: string; qualifier?: string; originNotes?: { tradition: string; summary: string; sourceRefs: MythologyReference[] }[]; aliases: string[]; kind: "individual" | "collective";
  categories: string[]; domains: string[]; summary: string;
  originStatus: "attested" | "variant" | "unknown" | "primordial";
  sourceRefs: MythologyReference[];
}
export interface MythologyLineage {
  id: string; child: string; parents: string[]; mode: "birth" | "emergence" | "creation";
  tradition: string; variantGroup: string; notes: string; spoiler: boolean;
  sourceRefs: MythologyReference[];
}
export interface MythologyRelationship {
  id: string; from: string; to: string; type: string; tradition: string;
  notes: string; spoiler: boolean; sourceRefs: MythologyReference[];
}
export interface MythologyCatalogue {
  schemaVersion: number;
  metadata: { title: string; asOf: string; scope: string; cautions: string[]; counts: Record<string, number> };
  entities: MythologyEntity[]; lineages: MythologyLineage[]; relationships: MythologyRelationship[];
  sources: { id: string; author: string; title: string; url: string; type: string }[];
  coverage: { group: string; expected: number | null; entityIds: string[]; notes: string; sourceRefs: MythologyReference[] }[];
  unresolved: { entityId: string; issue: string }[];
}
export interface MythologyEdge {
  id: string; from: string; to: string; kind: "birth" | "emergence" | "creation" | "relationship";
  game: boolean; spoiler: boolean; claimId: string; emphasis?: boolean;
}
export type MythologyReading = "all" | "hesiod" | "homer" | "orphic" | "apollodorus" | "hades";
export const mythologyReadings: { id: MythologyReading; label: string; note: string }[] = [
  { id: "all", label: "All accounts", note: "Pick a telling to rearrange the family." },
  { id: "hesiod", label: "Hesiod", note: "Hesiod in focus. Some origins differ even within the Theogony." },
  { id: "homer", label: "Homer & Homeric hymns", note: "Epic and hymns grouped for reading, not a single author. Other accounts stay pale." },
  { id: "orphic", label: "Orphic traditions", note: "Several Orphic accounts, kept distinct. Other origins stay in pale ink." },
  { id: "apollodorus", label: "Apollodorus", note: "The Library and Epitome in focus. Other traditions stay in pale ink." },
  { id: "hades", label: "Hades games", note: "Game continuity in focus. Ancient accounts stay in pale ink." },
];
export interface MythologyLayout {
  nodes: { id: string; x: number; y: number; radius: number }[];
  bounds: { x: number; y: number; width: number; height: number };
  readings?: Partial<Record<MythologyReading, MythologyLayout>>;
}
export function isGameTradition(tradition: string) { return /^hades(?:\s|$)/i.test(tradition); }
// Each parent gets a real connection. Alternative parent sets stay separate claims.
export function mythologyEdges(catalogue: Pick<MythologyCatalogue, "lineages" | "relationships">): MythologyEdge[] {
  return [
    ...catalogue.lineages.flatMap((claim) => claim.parents.map((parent) => ({
      id: `${claim.id}:${parent}`, from: parent, to: claim.child, kind: claim.mode,
      game: isGameTradition(claim.tradition), spoiler: !!claim.spoiler, claimId: claim.id,
    }))),
    ...catalogue.relationships.map((claim) => ({
      id: claim.id, from: claim.from, to: claim.to, kind: "relationship" as const,
      game: isGameTradition(claim.tradition), spoiler: !!claim.spoiler, claimId: claim.id,
    })),
  ];
}

export function matchesMythologyReading(tradition: string, reading: MythologyReading) {
  if (reading === "all") return true;
  if (reading === "hades") return isGameTradition(tradition);
  if (reading === "hesiod") return /hesiod/i.test(tradition);
  if (reading === "homer") return /homer/i.test(tradition);
  if (reading === "orphic") return /orphic/i.test(tradition);
  return /apollodorus/i.test(tradition);
}

export function traceMythologyEdges(catalogue: Pick<MythologyCatalogue, "lineages" | "relationships">, reading: MythologyReading, originId?: string) {
  const claims = new Map([...catalogue.lineages, ...catalogue.relationships].map((claim) => [claim.id, claim]));
  const chosen = catalogue.lineages.find((claim) => claim.id === originId);
  return mythologyEdges(catalogue).map((edge) => ({
    ...edge,
    emphasis: chosen && edge.kind !== "relationship" && edge.to === chosen.child
      ? edge.claimId === chosen.id
      : matchesMythologyReading(claims.get(edge.claimId)!.tradition, reading),
  }));
}
export function connectedMythologyGroups(ids: string[], edges: Pick<MythologyEdge, "from" | "to">[]) {
  const adjacent = new Map(ids.map((id) => [id, new Set<string>()]));
  for (const edge of edges) { adjacent.get(edge.from)?.add(edge.to); adjacent.get(edge.to)?.add(edge.from); }
  const unseen = new Set(ids), groups: string[][] = [];
  for (const id of ids) {
    if (!unseen.delete(id)) continue;
    const group = [id];
    for (let i = 0; i < group.length; i++) for (const next of adjacent.get(group[i]) || []) if (unseen.delete(next)) group.push(next);
    groups.push(group);
  }
  return groups;
}
export function searchMythology(entities: MythologyEntity[], query: string) {
  const normalize = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
  const term = normalize(query);
  if (!term) return [];
  return entities.filter((entity) => normalize([entity.name, ...entity.aliases, ...entity.domains, ...entity.categories].join(" ")).includes(term))
    .sort((a, b) => Number(normalize(b.name).startsWith(term)) - Number(normalize(a.name).startsWith(term)) || a.name.localeCompare(b.name));
}

export function adjacentMythologyId(entities: MythologyEntity[], current: string, direction: 1 | -1) {
  const index = entities.findIndex((entity) => entity.id === current);
  return entities[(index + direction + entities.length) % entities.length]?.id;
}

export function mythologyNeighbors(edges: MythologyEdge[], selected: string) {
  return [...new Set(edges.filter((edge) => edge.from === selected || edge.to === selected).map((edge) => edge.from === selected ? edge.to : edge.from))];
}

// Keep the selected person and every displayed parent within the same view.
export function mythologyFocus(layout: MythologyLayout, edges: MythologyEdge[], selected: string, aspect: number) {
  const ids = new Set([selected, ...edges.filter((edge) => edge.emphasis !== false && edge.to === selected && edge.kind !== "relationship").map((edge) => edge.from)]);
  const context = layout.nodes.filter((node) => ids.has(node.id));
  const minX = Math.min(...context.map((node) => node.x)), maxX = Math.max(...context.map((node) => node.x));
  const minY = Math.min(...context.map((node) => node.y)), maxY = Math.max(...context.map((node) => node.y));
  const width = Math.max(aspect < 0.9 ? 650 : 950, maxX - minX + 240, (maxY - minY + 240) * aspect);
  return { x: (minX + maxX - width) / 2, y: (minY + maxY - width / aspect) / 2, width, height: width / aspect };
}
