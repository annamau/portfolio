import type { MythologyEdge, MythologyLayout } from "./mythology-map.ts";

export const mythologyCard = { width: 152, height: 58 };
type Point = MythologyLayout["nodes"][number];

export function mythologyBranches(edges: MythologyEdge[], positions: Map<string, Point>) {
  const claims = new Map<string, MythologyEdge[]>();
  const branches = new Map<string, { parents: string[]; children: Map<string, MythologyEdge[]> }>();
  for (const edge of edges) {
    if (edge.kind === "relationship") continue;
    const claim = claims.get(edge.claimId) || [];
    claim.push(edge);
    claims.set(edge.claimId, claim);
  }
  for (const claim of claims.values()) {
    const first = claim[0];
    const parents = claim.map((edge) => edge.from).sort();
    const childRow = positions.get(first.to)!.y;
    // Each origin stays intact. Alternative parent sets never share a junction.
    const key = JSON.stringify([parents, first.kind, first.game, first.emphasis, childRow]);
    const branch = branches.get(key) || { parents, children: new Map<string, MythologyEdge[]>() };
    if (!branch.children.has(first.to)) branch.children.set(first.to, claim);
    branches.set(key, branch);
  }
  return branches;
}
