import { connectedMythologyGroups, traceMythologyEdges, type MythologyCatalogue, type MythologyLayout, type MythologyReading } from "./mythology-map.ts";

// Source-specific parent constraints set the vertical order. Story ties only
// influence proximity; they never become invented parent relationships.
export function createGenerationalLayout(catalogue: MythologyCatalogue, reading: MythologyReading = "all", revealed = false, { first, sequence = false }: { first?: string; sequence?: boolean } = {}): MythologyLayout {
  const edges = traceMythologyEdges(catalogue, reading).filter((edge) => revealed || !edge.spoiler);
  const entities = new Map(catalogue.entities.map((entity) => [entity.id, entity]));
  const parents = new Map(catalogue.entities.map((entity) => [entity.id, new Set<string>()]));
  const children = new Map(catalogue.entities.map((entity) => [entity.id, new Set<string>()]));
  const neighbors = new Map(catalogue.entities.map((entity) => [entity.id, new Set<string>()]));
  for (const edge of edges) { neighbors.get(edge.from)!.add(edge.to); neighbors.get(edge.to)!.add(edge.from); }
  const precedes = new Set(sequence ? catalogue.relationships.filter((claim) => claim.type === "precedes").map((claim) => claim.id) : []);
  for (const edge of edges) {
    if (edge.kind === "relationship" && !precedes.has(edge.claimId)) continue;
    parents.get(edge.to)!.add(edge.from); children.get(edge.from)!.add(edge.to);
  }
  const floor = (id: string) => first && id !== first ? 1 : 0;
  const rank = new Map(catalogue.entities.map((entity) => [entity.id, floor(entity.id)]));
  const remaining = new Map([...parents].map(([id, ids]) => [id, ids.size]));
  const queue = catalogue.entities.filter((entity) => !remaining.get(entity.id)).map((entity) => entity.id).sort();
  const order: string[] = [];
  while (queue.length) {
    const id = queue.shift()!; order.push(id);
    for (const child of children.get(id)!) {
      rank.set(child, Math.max(rank.get(child)!, rank.get(id)! + 1));
      remaining.set(child, remaining.get(child)! - 1);
      if (!remaining.get(child)) { queue.push(child); queue.sort(); }
    }
  }
  if (order.length !== entities.size) throw new Error("Conflicting ancestry cycle needs an explicit source decision before drawing.");
  // Pull floating ancestral branches toward their descendants, keeping the
  // primordial beings at the beginning rather than padding the first row.
  for (const id of [...order].reverse()) {
    const next = [...children.get(id)!];
    if (next.length && id !== first && !entities.get(id)!.categories.includes("primordial")) {
      rank.set(id, Math.min(...next.map((child) => rank.get(child)! - 1)));
    }
  }
  const branches = connectedMythologyGroups(order, [...parents].flatMap(([child, ids]) => [...ids].map((parent) => ({ from: parent, to: child }))));
  const anchored = new Set(branches.filter((branch) => branch.some((id) => entities.get(id)!.categories.includes("primordial"))).flat());
  for (const branch of branches.filter((group) => !group.some((id) => anchored.has(id)))) {
    const offsets = branch.flatMap((id) => [...neighbors.get(id)!].filter((other) => anchored.has(other)).map((other) => rank.get(other)! - rank.get(id)!)).sort((a, b) => a - b);
    const offset = offsets.length ? Math.max(0, offsets[Math.floor(offsets.length / 2)]) : 0;
    for (const id of branch) rank.set(id, rank.get(id)! + offset);
  }
  const floating = order.filter((id) => !parents.get(id)!.size && !children.get(id)!.size);
  for (let pass = 0; pass < 3; pass++) for (const id of floating) {
    const related = [...neighbors.get(id)!].filter((other) => !floating.includes(other));
    if (related.length) {
      const ranks = related.map((other) => rank.get(other)!).sort((a, b) => a - b);
      rank.set(id, Math.max(floor(id), ranks[Math.floor(ranks.length / 2)]));
    }
  }
  const bands = new Map<number, string[]>();
  for (const id of order) { const level = rank.get(id)!; bands.set(level, [...(bands.get(level) || []), id]); }
  const points = new Map<string, MythologyLayout["nodes"][number]>();
  let y = 74;
  const gapX = 182, gapY = 128;
  const columns = catalogue.entities.length <= 60 ? Infinity : 8;
  const focal = new Set(edges.filter((edge) => edge.emphasis).flatMap((edge) => [edge.from, edge.to]));
  const center = (id: string) => {
    const lineage = [...parents.get(id)!].map((parent) => points.get(parent)).filter((point) => !!point);
    const related = lineage.length ? lineage : [...neighbors.get(id)!].map((other) => points.get(other)).filter((point) => !!point);
    return related.length ? related.reduce((sum, point) => sum + point.x, 0) / related.length : 0;
  };
  for (const [, ids] of [...bands].sort(([a], [b]) => a - b)) {
    ids.sort((a, b) => Number(focal.has(b)) - Number(focal.has(a)) || center(a) - center(b) || a.localeCompare(b));
    const rowWidth = Math.min(columns, ids.length);
    const rows = Math.ceil(ids.length / rowWidth);
    ids.forEach((id, index) => {
      const row = Math.floor(index / rowWidth), inRow = Math.min(rowWidth, ids.length - row * rowWidth);
      points.set(id, { id, x: (index % rowWidth - (inRow - 1) / 2) * gapX, y: y + row * gapY, radius: entities.get(id)!.kind === "collective" ? 27 : 31 });
    });
    y += rows * gapY + 24;
  }
  const nodes = catalogue.entities.map((entity) => points.get(entity.id)!);
  const minX = Math.min(...nodes.map((node) => node.x)) - 120;
  const maxX = Math.max(...nodes.map((node) => node.x)) + 120;
  return { nodes, bounds: { x: minX, y: 0, width: maxX - minX, height: y } };
}
