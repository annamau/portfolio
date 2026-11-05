import { createGenerationalLayout } from "./mythology-layout.ts";
import { isGameTradition, matchesMythologyReading, traceMythologyEdges, type MythologyCatalogue, type MythologyReading } from "./mythology-map.ts";

export const mainMythologyCast = ["chaos", "gaia", "nyx", "zeus", "hera", "poseidon", "hades", "demeter", "hestia", "athena", "apollo", "artemis", "ares", "aphrodite", "hermes", "dionysus", "hephaestus", "persephone", "hecate", "charon", "melinoe", "zagreus", "selene", "eris", "nemesis", "moros", "thanatos", "harpies", "circe", "polyphemus-cyclops"];
export type MythologyComparisonMode = "game" | "ancient";

export function mythologyComparison(catalogue: MythologyCatalogue, mode: MythologyComparisonMode, requested: Set<string>, reading: MythologyReading, spoilers: boolean, originId?: string) {
  const game = mode === "game";
  const visibleRecord = (record: { spoiler?: boolean }) => spoilers || !record.spoiler;
  const eligible = catalogue.entities.filter((entity) => visibleRecord(entity) && (game || !entity.categories.includes("game character")));
  const eligibleIds = new Set(eligible.map((entity) => entity.id));
  const lineages = catalogue.lineages.filter((claim) => visibleRecord(claim) && isGameTradition(claim.tradition) === game && eligibleIds.has(claim.child) && claim.parents.every((id) => eligibleIds.has(id)));
  const chosenOrigin = lineages.find((claim) => claim.id === originId);
  const preferredChildren = new Set(lineages.filter((claim) => matchesMythologyReading(claim.tradition, reading)).map((claim) => claim.child));
  const parentlessInReading = new Set(eligible.filter((entity) => entity.originNotes?.some((note) => note.parentless && matchesMythologyReading(note.tradition, reading))).map((entity) => entity.id));
  const activeLineages = lineages.filter((claim) => {
    if (chosenOrigin?.child === claim.child) return claim.id === chosenOrigin.id;
    if (game || reading === "all") return true;
    if (parentlessInReading.has(claim.child)) return false;
    return !preferredChildren.has(claim.child) || matchesMythologyReading(claim.tradition, reading);
  });
  const relationships = catalogue.relationships.filter((claim) => visibleRecord(claim) && isGameTradition(claim.tradition) === game && eligibleIds.has(claim.from) && eligibleIds.has(claim.to)
    && (game || claim.type !== "precedes" || matchesMythologyReading(claim.tradition, reading)));
  let edges = traceMythologyEdges({ lineages: activeLineages, relationships }, game ? "hades" : reading, chosenOrigin?.id);
  const linked = new Set(edges.flatMap((edge) => [edge.from, edge.to]));
  const allowed = game ? eligible.filter((entity) => linked.has(entity.id)) : eligible;
  const allowedIds = new Set(allowed.map((entity) => entity.id));
  const picked = [...requested].filter((id) => allowedIds.has(id));
  const directParents = edges.filter((edge) => edge.kind !== "relationship" && requested.has(edge.to)).map((edge) => edge.from);
  const targets = [...new Set([...picked, ...directParents])];
  const visible = new Set<string>();
  const adjacent = new Map(allowed.map((entity) => [entity.id, [] as { id: string; primary: boolean }[]]));
  for (const edge of edges) {
    adjacent.get(edge.from)!.push({ id: edge.to, primary: !!edge.emphasis });
    adjacent.get(edge.to)!.push({ id: edge.from, primary: !!edge.emphasis });
  }
  for (const neighbors of adjacent.values()) neighbors.sort((a, b) => Number(b.primary) - Number(a.primary) || a.id.localeCompare(b.id));
  for (const target of targets) {
    if (visible.has(target)) continue;
    if (!visible.size) { visible.add(target); continue; }
    const queue = [...visible], previous = new Map(queue.map((id) => [id, ""]));
    for (let i = 0; i < queue.length && !previous.has(target); i++) for (const neighbor of adjacent.get(queue[i]) || []) {
      if (!previous.has(neighbor.id)) { previous.set(neighbor.id, queue[i]); queue.push(neighbor.id); }
    }
    visible.add(target);
    if (previous.has(target)) for (let cursor = target; cursor; cursor = previous.get(cursor)!) visible.add(cursor);
  }
  const entities = allowed.filter((entity) => visible.has(entity.id));
  edges = edges.filter((edge) => visible.has(edge.from) && visible.has(edge.to));
  const claimIds = new Set(edges.map((edge) => edge.claimId));
  // Cropping is drawing-only. The profile and downloadable facts retain every
  // original parent set, including co-parents outside the chosen cast.
  const drawing: MythologyCatalogue = {
    ...catalogue, entities,
    lineages: activeLineages.filter((claim) => claimIds.has(claim.id)).map((claim) => ({ ...claim, parents: claim.parents.filter((id) => visible.has(id)) })),
    relationships: relationships.filter((claim) => claimIds.has(claim.id)),
  };
  const chaosFirst = (game || reading === "hesiod") && visible.has("chaos") && !edges.some((edge) => edge.to === "chaos" && edge.kind !== "relationship");
  const layout = entities.length ? createGenerationalLayout(drawing, game ? "hades" : reading, spoilers, { first: chaosFirst ? "chaos" : undefined, sequence: game }) : { nodes: [], bounds: { x: 0, y: 0, width: 950, height: 600 } };
  return { entities, edges, layout, picked: picked.length, omitted: [...requested].filter((id) => eligibleIds.has(id) && !allowedIds.has(id)).length, connectors: new Set([...visible].filter((id) => !requested.has(id))) };
}
