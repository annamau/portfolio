"use client";

import { memo, useEffect, useId, useMemo, useRef, useState, type CSSProperties, type PointerEvent } from "react";
import { adjacentMythologyId, mythologyFocus, type MythologyEdge, type MythologyEntity, type MythologyLayout } from "@/lib/journal/mythology-map";
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
  return <>
    <g className={styles.inkLines} aria-hidden="true">{edges.map((edge) => {
      const from = positions.get(edge.from)!, to = positions.get(edge.to)!;
      const dx = to.x - from.x, dy = to.y - from.y, distance = Math.hypot(dx, dy);
      const ux = dx / distance, uy = dy / distance;
      const fromRadius = connectorIds.has(edge.from) ? 6 : from.radius, toRadius = connectorIds.has(edge.to) ? 6 : to.radius;
      const active = edge.emphasis !== false && (edge.from === selected || edge.to === selected);
      const family = edge.kind !== "relationship";
      const down = to.y > from.y;
      const midY = (from.y + to.y) / 2;
      const path = family && down
        ? `M${from.x},${from.y + fromRadius + 4}C${from.x},${midY} ${to.x},${midY} ${to.x},${to.y - toRadius - 8}`
        : `M${from.x + ux * (fromRadius + 4)},${from.y + uy * (fromRadius + 4)}L${to.x - ux * (toRadius + 8)},${to.y - uy * (toRadius + 8)}`;
      return <path key={edge.id} d={path} data-from={edge.from} data-to={edge.to} data-kind={edge.kind} data-game={edge.game} data-active={active} data-emphasis={edge.emphasis !== false} markerEnd={edge.kind === "relationship" ? undefined : `url(#${marker}${edge.game ? "-game" : ""})`}/>;
    })}</g>
    <g className={styles.inkNodes}>{entities.map((entity) => {
      const point = positions.get(entity.id)!;
      const connector = connectorIds.has(entity.id);
      return <g key={entity.id} className={styles.inkNode} transform={`translate(${point.x} ${point.y})`} data-myth-id={entity.id} data-connector={connector} data-selected={selected === entity.id} data-neighbor={neighbors.has(entity.id)} data-collective={entity.kind === "collective"} role="button" aria-label={`Explore ${entity.name}${entity.qualifier ? `, ${entity.qualifier}` : ""}`} tabIndex={entity.id === selected ? 0 : -1} onClick={() => onSelect(entity.id)} onKeyDown={(event) => { if (["ArrowRight", "ArrowDown", "ArrowLeft", "ArrowUp"].includes(event.key)) { event.preventDefault(); const next = adjacentMythologyId(entities, entity.id, ["ArrowRight", "ArrowDown"].includes(event.key) ? 1 : -1); if (next) onSelect(next); } if (event.key === "Enter" || event.key === " ") { event.preventDefault(); onSelect(entity.id); } }}>
        <circle className={styles.nodeHit} r={point.radius + 15}/>
        <circle className={styles.nodeWash} cx="-2" cy="2" r={connector ? 8 : point.radius + 2}/>
        <ellipse className={styles.nodeRing} rx={connector ? 6 : point.radius} ry={connector ? 6 : point.radius * 0.96} transform="rotate(-7)"/>
        {!connector && <g className={styles.nodeEmblem}><MythologyEmblem entity={entity}/></g>}
        <text className={styles.nodeName} textAnchor="middle" y={connector ? 22 : point.radius + 22} aria-hidden="true">{entity.name}</text>
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
  const [canvasWidth, setCanvasWidth] = useState(720);
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
    const observer = new ResizeObserver(([entry]) => { setAspect(entry.contentRect.width / entry.contentRect.height); setCanvasWidth(entry.contentRect.width); });
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
    <svg ref={svg} className={styles.canvas} style={{ "--map-label-size": `${Math.max(14, Math.min(38, camera.width / canvasWidth * 13))}px` } as CSSProperties} viewBox={`${camera.x} ${camera.y} ${camera.width} ${camera.height}`} role="group" aria-label="Mythology network. Search a name, select a circle, or use arrow keys to pan. Focus a circle and use arrow keys to explore names. Plus and minus zoom." tabIndex={0} onPointerDown={down} onPointerMove={move} onPointerUp={() => { gesture.current = null; }} onPointerCancel={() => { gesture.current = null; }} onKeyDown={(event) => {
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
