import { mythologyBranches, mythologyCard } from "./mythology-branches.ts";
import type { MythologyEdge, MythologyLayout } from "./mythology-map.ts";

type Point = { x: number; y: number };
type Node = MythologyLayout["nodes"][number];
type Span = { id: string; row: number; left: number; right: number };

const halfWidth = mythologyCard.width / 2;
const halfHeight = mythologyCard.height / 2;
const clearance = 9;

function lanes(spans: Span[]) {
  const byRow = new Map<number, Span[]>();
  for (const span of spans) {
    const row = byRow.get(span.row) || [];
    row.push(span);
    byRow.set(span.row, row);
  }
  const fractions = new Map<string, number>();
  for (const row of byRow.values()) {
    const ends: number[] = [];
    const assignments = row.sort((a, b) => a.left - b.left || a.right - b.right).map((span) => {
      const free = ends.findIndex((end) => end + clearance <= span.left);
      const lane = free === -1 ? ends.length : free;
      ends[lane] = span.right;
      return { id: span.id, lane };
    });
    for (const { id, lane } of assignments) fractions.set(id, (lane + 1) / (ends.length + 1));
  }
  return fractions;
}

function span(id: string, row: number, xs: number[]): Span {
  return { id, row, left: Math.min(...xs), right: Math.max(...xs) };
}

export function mythologyRoutes(edges: MythologyEdge[], positions: Map<string, Node>) {
  const rows = new Map<number, Node[]>();
  for (const node of positions.values()) {
    const row = rows.get(node.y) || [];
    row.push(node);
    rows.set(node.y, row);
  }
  const levels = [...rows.keys()].sort((a, b) => a - b);
  const before = new Map(levels.map((level, i) => [level, levels[i - 1]]));
  const after = new Map(levels.map((level, i) => [level, levels[i + 1]]));
  const branches = mythologyBranches(edges, positions);
  const incoming = new Map<string, string[]>();
  const outgoing = new Map<string, string[]>();
  for (const [id, branch] of branches) {
    for (const parent of branch.parents) outgoing.set(parent, [...(outgoing.get(parent) || []), id]);
    for (const child of branch.children.keys()) incoming.set(child, [...(incoming.get(child) || []), id]);
  }
  const port = (node: Node, routes: Map<string, string[]>, id: string) => {
    const keys = routes.get(node.id)!;
    return { ...node, x: node.x + (keys.indexOf(id) - (keys.length - 1) / 2) * Math.min(22, 78 / keys.length) };
  };
  const families = [...branches].map(([id, { parents, children }]) => {
    const starts = parents.map((parent) => port(positions.get(parent)!, outgoing, id));
    const ends = [...children.keys()].map((child) => port(positions.get(child)!, incoming, id));
    const edge = children.values().next().value![0];
    const joinX = starts.reduce((sum, node) => sum + node.x, 0) / starts.length;
    const joined = edge.kind === "birth" && starts.length > 1 && starts.every((node) => node.y === starts[0].y);
    return { id, starts, ends, edge, joinX, joined, parents };
  });
  const drops = lanes(families.map(({ id, joined, joinX, starts, ends }) =>
    span(id, ends[0].y, [...(joined ? [joinX] : starts.map((node) => node.x)), ...ends.map((node) => node.x)])));
  const joins = lanes(families.filter((family) => family.joined).map(({ id, starts }) =>
    span(id, starts[0].y, starts.map((node) => node.x))));

  // Move between rows at an open gutter, then return to the requested port.
  // All vertical segments advance toward the lower generation.
  function down(start: Point, end: Point): Point[] {
    const points = [start];
    let x = start.x;
    let lastBottom = start.y;
    for (const y of levels) {
      const top = y - halfHeight;
      if (top <= start.y || y + halfHeight >= end.y) continue;
      lastBottom = y + halfHeight;
      const row = rows.get(y)!;
      const clear = (candidate: number) => row.every((node) => Math.abs(node.x - candidate) >= halfWidth + clearance - 0.001);
      if (clear(x)) continue;
      const candidates = row.flatMap((node) => [node.x - halfWidth - clearance, node.x + halfWidth + clearance]).filter(clear);
      const next = candidates.reduce((nearest, candidate) => Math.abs(candidate - x) < Math.abs(nearest - x) ? candidate : nearest);
      points.push({ x, y: top - 6 }, { x: next, y: top - 6 });
      x = next;
    }
    if (x !== end.x) {
      const bend = Math.max(lastBottom, end.y - 6);
      points.push({ x, y: bend }, { x: end.x, y: bend });
    }
    points.push(end);
    return points;
  }

  const family = families.map(({ id, starts, ends, edge, joinX, joined, parents }) => {
    const child = ends[0].y;
    const rowBottom = (before.get(child) ?? child - mythologyCard.height - 60) + halfHeight;
    const top = child - halfHeight;
    const railY = rowBottom + (top - rowBottom) * (0.51 + 0.39 * drops.get(id)!);
    const parentY = starts[0].y;
    const parentBottom = parentY + halfHeight;
    const nextTop = (after.get(parentY) ?? child) - halfHeight;
    const joinY = parentBottom + (nextTop - parentBottom) * (0.10 + 0.39 * (joins.get(id) ?? 0));
    const railXs = [...(joined ? [joinX] : starts.map((node) => node.x)), ...ends.map((node) => node.x)];
    const rail = [{ x: Math.min(...railXs), y: railY }, { x: Math.max(...railXs), y: railY }];
    const parentPaths = starts.map((node) => down({ x: node.x, y: node.y + halfHeight }, { x: node.x, y: joined ? joinY : railY }));
    const junction = joined ? { x: joinX, y: joinY } : undefined;
    const union = junction ? [
      [{ x: Math.min(...starts.map((node) => node.x)), y: joinY }, { x: Math.max(...starts.map((node) => node.x)), y: joinY }],
      down(junction, { x: joinX, y: railY }),
    ] : [];
    return {
      id, edge, parents, rail, junction, union, parentPaths,
      childPaths: ends.map((node) => ({ id: node.id, points: [{ x: node.x, y: railY }, { x: node.x, y: top - 4 }] })),
    };
  });

  const storyEdges = edges.filter((edge) => edge.kind === "relationship");
  const sameRowLanes = lanes(storyEdges.flatMap((edge) => {
    const from = positions.get(edge.from)!, to = positions.get(edge.to)!;
    return from.y === to.y ? [span(edge.id, from.y, [from.x, to.x])] : [];
  }));
  const story = storyEdges.map((edge) => {
    const from = positions.get(edge.from)!, to = positions.get(edge.to)!;
    if (from.y === to.y) {
      const bottom = from.y + halfHeight;
      const nextTop = (after.get(from.y) ?? from.y + mythologyCard.height + 64) - halfHeight;
      const rail = bottom + (nextTop - bottom) * (0.02 + 0.07 * sameRowLanes.get(edge.id)!);
      return { edge, points: [{ x: from.x, y: bottom }, { x: from.x, y: rail }, { x: to.x, y: rail }, { x: to.x, y: bottom }] };
    }
    const [upper, lower] = from.y < to.y ? [from, to] : [to, from];
    const points = down({ x: upper.x, y: upper.y + halfHeight }, { x: lower.x, y: lower.y - halfHeight });
    return { edge, points: from === upper ? points : points.reverse() };
  });
  return { family, story };
}

export function mythologyPath(points: Point[]) {
  return points.map(({ x, y }, i) => `${i ? "L" : "M"}${x},${y}`).join("");
}
