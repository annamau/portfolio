"use client";

import { memo, useEffect, useId, useMemo, useRef, useState, type PointerEvent } from "react";
import { adjacentMythologyId, mythologyFocus, type MythologyEdge, type MythologyEntity, type MythologyLayout } from "@/lib/journal/mythology-map";
import { mythologyBranches, mythologyCard } from "@/lib/journal/mythology-branches";
import MythologyEmblem from "./MythologyEmblem";
import { mythologyEmblem } from "@/lib/journal/mythology-emblems";
import styles from "./MythologyMap.module.css";

type Point = MythologyLayout["nodes"][number];
type Camera = { x: number; y: number; width: number; height: number };

const Artwork = memo(function Artwork({ entities, positions, edges, selected, connectorIds, onSelect, marker }: {
  entities: MythologyEntity[]; positions: Map<string, Point>; edges: MythologyEdge[];
  selected: string; connectorIds: Set<string>; onSelect: (id: string) => void; marker: string;
}) {
  const neighbors = new Set([selected, ...edges.filter((edge) => edge.emphasis !== false && (edge.from === selected || edge.to === selected)).flatMap((edge) => [edge.from, edge.to])]);
  const branches = mythologyBranches(edges, positions);
  const cardHalfHeight = mythologyCard.height / 2;
  const cardHalfWidth = mythologyCard.width / 2;
  const lanes = new Map<number, number>();
  const incoming = new Map<string, string[]>();
  const outgoing = new Map<string, string[]>();
  for (const [key, branch] of branches) {
    for (const id of branch.parents) outgoing.set(id, [...(outgoing.get(id) || []), key]);
    for (const id of branch.children.keys()) incoming.set(id, [...(incoming.get(id) || []), key]);
  }
  const port = (point: Point, routes: Map<string, string[]>, key: string) => {
    const keys = routes.get(point.id)!;
    const spacing = Math.min(22, 78 / keys.length);
    return point.x + (keys.indexOf(key) - (keys.length - 1) / 2) * spacing;
  };
  return <>
    <g className={styles.inkLines} aria-hidden="true">
      {edges.filter((edge) => edge.kind === "relationship").map((edge) => {
        const from = positions.get(edge.from)!, to = positions.get(edge.to)!;
        const sameRow = from.y === to.y;
        const direction = Math.sign(sameRow ? to.x - from.x : to.y - from.y);
        const xInset = sameRow ? direction * cardHalfWidth : 0;
        const yInset = sameRow ? 0 : direction * cardHalfHeight;
        return <path key={edge.id} d={`M${from.x + xInset},${from.y + yInset}L${to.x - xInset},${to.y - yInset}`} data-kind="relationship" data-game={edge.game} data-from={edge.from} data-to={edge.to} data-active={edge.from === selected || edge.to === selected}/>;
      })}
      {[...branches].map(([key, { parents, children }]) => {
        const parentPoints = parents.map((id) => positions.get(id)!);
        const childPoints = [...children.keys()].map((id) => positions.get(id)!);
        const sample = children.values().next().value![0];
        const childTop = childPoints[0].y - cardHalfHeight;
        const parentBottom = Math.max(...parentPoints.map((point) => point.y)) + cardHalfHeight;
        const lane = lanes.get(childTop) || 0;
        lanes.set(childTop, lane + 1);
        const rail = parentBottom + (childTop - parentBottom) * (0.32 + (lane % 5) * 0.09);
        const starts = parentPoints.map((point) => ({ ...point, x: port(point, outgoing, key) }));
        const ends = childPoints.map((point) => ({ ...point, x: port(point, incoming, key) }));
        const xs = [...starts, ...ends].map((point) => point.x);
        const shared = `M${Math.min(...xs)},${rail}H${Math.max(...xs)}`;
        const active = parents.includes(selected) || children.has(selected);
        const connections = { "data-kind": sample.kind, "data-game": sample.game, "data-emphasis": sample.emphasis, "data-active": active };
        return <g key={key} data-family-branch={parents.join(" ")}>
          <path d={shared} {...connections}/>
          {starts.map((point) => <path key={point.id} d={`M${point.x},${point.y + cardHalfHeight}V${rail}`} {...connections}/>)}
          {ends.map((point) => <path key={point.id} d={`M${point.x},${rail}V${childTop - 4}`} {...connections} data-active={parents.includes(selected) || point.id === selected} data-to={point.id} markerEnd={`url(#${marker}${sample.game ? "-game" : ""})`}/>)}
          {parents.length > 1 && <circle className={styles.familyJoin} cx={starts.reduce((sum, point) => sum + point.x, 0) / parents.length} cy={rail} r="3.3" data-game={sample.game}/>}
        </g>;
      })}
    </g>
    <g className={styles.inkNodes}>{entities.map((entity) => {
      const point = positions.get(entity.id)!;
      const connector = connectorIds.has(entity.id);
      return <g key={entity.id} className={styles.inkNode} transform={`translate(${point.x} ${point.y})`} data-myth-id={entity.id} data-connector={connector} data-selected={selected === entity.id} data-neighbor={neighbors.has(entity.id)} data-collective={entity.kind === "collective"} role="button" aria-label={`Explore ${entity.name}${entity.qualifier ? `, ${entity.qualifier}` : ""}`} tabIndex={entity.id === selected ? 0 : -1} onClick={() => onSelect(entity.id)} onKeyDown={(event) => { if (["ArrowRight", "ArrowDown", "ArrowLeft", "ArrowUp"].includes(event.key)) { event.preventDefault(); const next = adjacentMythologyId(entities, entity.id, ["ArrowRight", "ArrowDown"].includes(event.key) ? 1 : -1); if (next) onSelect(next); } if (event.key === "Enter" || event.key === " ") { event.preventDefault(); onSelect(entity.id); } }}>
        <rect className={styles.nodeCard} x={-cardHalfWidth} y={-cardHalfHeight} width={mythologyCard.width} height={mythologyCard.height} rx="8"/>
        <circle className={styles.emblemPlate} cx="-49" r="17"/>
        <g className={styles.nodeEmblem} transform="translate(-49 0) scale(.66)"><MythologyEmblem entity={entity}/></g>
        <text className={styles.nodeName} x="-25" y="5" textLength={entity.name.length > 12 ? Math.min(94, entity.name.length * 7) : undefined} lengthAdjust="spacingAndGlyphs" aria-hidden="true">{entity.name}</text>
        <title>{entity.name}{entity.qualifier ? ` (${entity.qualifier})` : ""} · {mythologyEmblem(entity).label} · {entity.domains.join(", ") || entity.categories.join(", ")}</title>
      </g>;
    })}</g>
  </>;
});

export default function MythologyNetwork({ entities, layout, edges, selected, focusKey, connectorIds, expanded = false, onSelect }: {
  entities: MythologyEntity[]; layout: MythologyLayout; edges: MythologyEdge[];
  selected: string; focusKey: string; connectorIds: Set<string>; expanded?: boolean; onSelect: (id: string) => void;
}) {
  const svg = useRef<SVGSVGElement>(null);
  const positions = useMemo(() => new Map(layout.nodes.map((node) => [node.id, node])), [layout]);
  const [aspect, setAspect] = useState(1.6);
  const [moving, setMoving] = useState(expanded);
  const [customCamera, setCamera] = useState<(Camera & { key: string }) | null>(null);
  const cameraKey = `${selected}/${focusKey}`;
  const focus = mythologyFocus(layout, edges, selected, aspect);
  const camera: Camera = customCamera?.key === cameraKey ? { ...customCamera, height: customCamera.width / aspect } : { ...focus, y: Math.max(layout.bounds.y, focus.y) };
  const gesture = useRef<{ x: number; y: number; camera: Camera; moved: boolean } | null>(null);
  const marker = useId().replaceAll(":", "");
  useEffect(() => {
    const element = svg.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => { setAspect(entry.contentRect.width / entry.contentRect.height); });
    observer.observe(element); return () => observer.disconnect();
  }, []);
  useEffect(() => {
    const element = svg.current;
    if (element?.contains(document.activeElement) && document.activeElement?.hasAttribute("data-myth-id")) {
      element.querySelector<SVGElement>(`[data-myth-id="${selected}"]`)?.focus({ preventScroll: true });
    }
  }, [selected]);
  function zoom(factor: number) {
    setCamera((value) => {
      const previous = value?.key === cameraKey ? value : camera;
      const width = Math.max(230, Math.min(layout.bounds.width * 1.2, previous.width * factor)), height = width / aspect;
      return { key: cameraKey, x: previous.x + (previous.width - width) / 2, y: previous.y + (previous.height - height) / 2, width, height };
    });
  }
  function fit() {
    const bounds = layout.bounds, width = Math.max(bounds.width, bounds.height * aspect), height = width / aspect;
    setCamera({ key: cameraKey, x: bounds.x + (bounds.width - width) / 2, y: bounds.y + (bounds.height - height) / 2, width, height });
  }
  function down(event: PointerEvent<SVGSVGElement>) {
    if (event.button !== 0 || (event.target as Element).closest('[data-myth-id]')) return;
    gesture.current = { x: event.clientX, y: event.clientY, camera, moved: false };
    event.currentTarget.setPointerCapture(event.pointerId);
  }
  function move(event: PointerEvent<SVGSVGElement>) {
    const start = gesture.current, element = svg.current;
    if (!start || !element) return;
    const dx = event.clientX - start.x, dy = event.clientY - start.y;
    if (Math.hypot(dx, dy) < 4 && !start.moved) return;
    start.moved = true;
    const scale = start.camera.width / element.getBoundingClientRect().width;
    setCamera({ ...start.camera, key: cameraKey, x: start.camera.x - dx * scale, y: start.camera.y - dy * scale });
  }
  return <div className={styles.network} data-moving={moving}>
    <svg ref={svg} className={styles.canvas} viewBox={`${camera.x} ${camera.y} ${camera.width} ${camera.height}`} role="group" aria-label="Mythology network. Search a name, select a card, or use arrow keys to pan. Focus a card and use arrow keys to explore names. Plus and minus zoom." tabIndex={0} onPointerDown={down} onPointerMove={move} onPointerUp={() => { gesture.current = null; }} onPointerCancel={() => { gesture.current = null; }} onKeyDown={(event) => {
      if (event.target !== event.currentTarget) return;
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.key)) {
        event.preventDefault();
        setCamera((previous) => { const value = previous?.key === cameraKey ? previous : camera; return ({ ...value, key: cameraKey, x: value.x + (event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0) * value.width * 0.15, y: value.y + (event.key === "ArrowDown" ? 1 : event.key === "ArrowUp" ? -1 : 0) * value.height * 0.15 }); });
      }
      if (event.key === "+" || event.key === "=") { event.preventDefault(); zoom(0.72); }
      if (event.key === "-") { event.preventDefault(); zoom(1 / 0.72); }
      if (event.key === "Home") { event.preventDefault(); fit(); }
    }}>
      <defs><marker id={marker} markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto" markerUnits="userSpaceOnUse"><path d="M0,0 L6,3.5 L0,7" fill="none" stroke="#ad4b34" strokeWidth="1.2"/></marker><marker id={`${marker}-game`} markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto" markerUnits="userSpaceOnUse"><path d="M0,0 L6,3.5 L0,7" fill="none" stroke="#687665" strokeWidth="1.2"/></marker></defs>
      <Artwork entities={entities} positions={positions} edges={edges} selected={selected} connectorIds={connectorIds} onSelect={onSelect} marker={marker}/>
    </svg>
    <div className={styles.mapTools} aria-label="Map controls"><button type="button" aria-label="Zoom in" onClick={() => zoom(0.72)}>+</button><button type="button" aria-label="Zoom out" onClick={() => zoom(1 / 0.72)}>−</button><button type="button" onClick={fit}>Whole family</button>{!expanded && <button type="button" aria-pressed={moving} onClick={() => setMoving((value) => !value)}>{moving ? "Scroll page" : "Move map"}</button>}</div>
    <span className={styles.mapStamp} aria-hidden="true">PARENTS ABOVE · CHILDREN BELOW</span>
  </div>;
}
