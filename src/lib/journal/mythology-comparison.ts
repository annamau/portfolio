import { createGenerationalLayout } from "./mythology-layout.ts";
import { isGameTradition, traceMythologyEdges, type MythologyCatalogue, type MythologyReading } from "./mythology-map.ts";

export const mainMythologyCast = ["chaos", "gaia", "nyx", "zeus", "hera", "poseidon", "hades", "demeter", "hestia", "athena", "apollo", "artemis", "ares", "aphrodite", "hermes", "dionysus", "hephaestus", "persephone", "hecate", "charon", "melinoe", "zagreus"];
export type MythologyComparisonMode = "game" | "ancient";

export function mythologyComparison(catalogue: MythologyCatalogue, mode: MythologyComparisonMode, requested: Set<string>, reading: MythologyReading, spoilers: boolean, originId?: string) {
  const allowed = catalogue.entities.filter((entity) => (spoilers || !entity.spoiler) && (mode === "game" || !entity.categories.includes("game character")));
  const allowedIds = new Set(allowed.map((entity) => entity.id));
  const chosenOrigin = catalogue.lineages.find((claim) => claim.id === originId);
  const applicableOrigin = chosenOrigin && isGameTradition(chosenOrigin.tradition) === (mode === "game") ? originId : undefined;
  let edges = traceMythologyEdges(catalogue, mode === "game" ? "hades" : reading, applicableOrigin).filter((edge) => (spoilers || !edge.spoiler) && allowedIds.has(edge.from) && allowedIds.has(edge.to));
  if (mode === "ancient") edges = edges.filter((edge) => !edge.game);
  else {
    const gameParents = new Set(catalogue.lineages.filter((claim) => isGameTradition(claim.tradition)).map((claim) => claim.child));
    // Never retain a competing ancient parent set as if it were game continuity.
    edges = edges.filter((edge) => edge.game || (edge.kind === "relationship" ? catalogue.relationships.find((claim) => claim.id === edge.claimId)?.type !== "identified_with" : !gameParents.has(edge.to)));
  }
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
    lineages: catalogue.lineages.filter((claim) => claimIds.has(claim.id)).map((claim) => ({ ...claim, parents: claim.parents.filter((id) => visible.has(id)) })),
    relationships: catalogue.relationships.filter((claim) => claimIds.has(claim.id)),
  };
  const layout = entities.length ? createGenerationalLayout(drawing, mode === "game" ? "hades" : reading, spoilers) : { nodes: [], bounds: { x: 0, y: 0, width: 950, height: 600 } };
  return { entities, edges, layout, picked: picked.length, connectors: new Set([...visible].filter((id) => !requested.has(id))) };
}
