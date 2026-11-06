"use client";

import { memo, useEffect, useId, useMemo, useRef, useState, type PointerEvent } from "react";
import { adjacentMythologyId, mythologyFocus, type MythologyEdge, type MythologyEntity, type MythologyLayout } from "@/lib/journal/mythology-map";
import { mythologyCard } from "@/lib/journal/mythology-branches";
import { mythologyPath, mythologyRoutes } from "@/lib/journal/mythology-routing";
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
  const routes = useMemo(() => mythologyRoutes(edges, positions), [edges, positions]);
  const cardHalfHeight = mythologyCard.height / 2;
  const cardHalfWidth = mythologyCard.width / 2;
  const isActive = (route: (typeof routes.family)[number]) => route.parents.includes(selected) || route.childPaths.some((child) => child.id === selected);
  const families = [...routes.family].sort((a, b) => Number(isActive(a)) - Number(isActive(b)));
  return <>
    <g className={styles.inkLines} aria-hidden="true">
      {routes.story.map(({ edge, points }) =>
        <path key={edge.id} d={mythologyPath(points)} data-kind="relationship" data-game={edge.game} data-from={edge.from} data-to={edge.to} data-active={edge.from === selected || edge.to === selected}/>
      )}
      {families.map((route) => {
        const { id, edge, parents, rail, junction, union, parentPaths, childPaths } = route;
        const connections = { "data-kind": edge.kind, "data-game": edge.game, "data-emphasis": edge.emphasis, "data-active": isActive(route) };
        return <g key={id} data-family-branch={parents.join(" ")}>
          <path d={mythologyPath(rail)} {...connections}/>
          {junction && <path data-parent-junction="" d={union.map(mythologyPath).join("")} {...connections}/>}
          {parentPaths.map((points, index) => <path key={parents[index]} d={mythologyPath(points)} {...connections}/>)}
          {childPaths.map((child) => <path key={child.id} d={mythologyPath(child.points)} {...connections} data-active={parents.includes(selected) || child.id === selected} data-to={child.id} markerEnd={`url(#${marker}${edge.game ? "-game" : ""})`}/>)}
          {junction && <circle className={styles.familyJoin} cx={junction.x} cy={junction.y} r="3.3" data-game={edge.game}/>}
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
      <defs><marker id={marker} markerWidth="10" markerHeight="10" refX="9" refY="5" orient="auto" markerUnits="userSpaceOnUse"><path d="M0,0 L9,5 L0,10 Z" fill="#ad4b34"/></marker><marker id={`${marker}-game`} markerWidth="10" markerHeight="10" refX="9" refY="5" orient="auto" markerUnits="userSpaceOnUse"><path d="M0,0 L9,5 L0,10 Z" fill="#53715d"/></marker></defs>
      <Artwork entities={entities} positions={positions} edges={edges} selected={selected} connectorIds={connectorIds} onSelect={onSelect} marker={marker}/>
    </svg>
    <div className={styles.mapTools} aria-label="Map controls"><button type="button" aria-label="Zoom in" onClick={() => zoom(0.72)}>+</button><button type="button" aria-label="Zoom out" onClick={() => zoom(1 / 0.72)}>−</button><button type="button" onClick={fit}>Fit</button>{!expanded && <button type="button" aria-pressed={moving} onClick={() => setMoving((value) => !value)}>{moving ? "Scroll page" : "Move map"}</button>}</div>
  </div>;
}
