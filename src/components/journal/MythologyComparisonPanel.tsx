"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { mythologyComparison, type MythologyComparisonMode } from "@/lib/journal/mythology-comparison";
import { mythologyStory } from "@/lib/journal/mythology-stories";
import type { MythologyCatalogue, MythologyReading } from "@/lib/journal/mythology-map";
import MythologyNetwork from "./MythologyNetwork";
import styles from "./MythologyMap.module.css";

export default function MythologyComparisonPanel({ catalogue, mode, chosen, selected, reading, spoilers, originId, onSelect }: {
  catalogue: MythologyCatalogue; mode: MythologyComparisonMode; chosen: Set<string>; selected: string;
  reading: MythologyReading; spoilers: boolean; originId?: string; onSelect: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const expandButton = useRef<HTMLButtonElement>(null);
  const wasExpanded = useRef(false);
  const graph = useMemo(() => mythologyComparison(catalogue, mode, chosen, reading, spoilers, originId), [catalogue, mode, chosen, reading, spoilers, originId]);
  const active = graph.entities.some((entity) => entity.id === selected) ? selected : graph.entities.find((entity) => chosen.has(entity.id))?.id || "";
  const title = mode === "game" ? "In Hades" : "In ancient mythology";
  const selectedEntity = catalogue.entities.find((entity) => entity.id === selected);
  const activeEntity = graph.entities.find((entity) => entity.id === active);
  useEffect(() => {
    if (!expanded) {
      if (wasExpanded.current) expandButton.current?.focus({ preventScroll: true });
      wasExpanded.current = false;
      return;
    }
    if (!dialog.current) return;
    wasExpanded.current = true;
    const element = dialog.current, overflow = document.body.style.overflow;
    element.showModal(); document.body.style.overflow = "hidden";
    return () => { if (element.open) element.close(); document.body.style.overflow = overflow; };
  }, [expanded]);
  const contents = <>
    <header className={styles.panelHeader}><div><p className={styles.kicker}>{mode === "game" ? "GAME CONTINUITY" : "SOURCE TRADITIONS"}</p><h4>{title}</h4></div><button ref={expandButton} type="button" onClick={() => setExpanded((value) => !value)} aria-label={`${expanded ? "Close" : "Open"} ${mode === "game" ? "Hades graph" : "ancient mythology graph"} full screen`}>{expanded ? "Close ×" : "Expand ↗"}</button></header>
    <p className={styles.panelNote}>{mode === "game" ? "Green links are game-attested. Pale links give ancient background; competing ancient parents are replaced where the game names its own." : "Ancient accounts, with game-only links removed. Different tellings remain separate in the profile below."}</p>
    {graph.entities.length ? <MythologyNetwork entities={graph.entities} layout={graph.layout} edges={graph.edges} selected={active} focusKey={`${mode}/${reading}/${originId || ""}/${spoilers}/${[...chosen].join(",")}`} connectorIds={graph.connectors} expanded={expanded} onSelect={onSelect}/> : <div className={styles.emptyCast}>Choose a few figures to start exploring.</div>}
    <p className={styles.panelCount}>{graph.picked} chosen figures{graph.connectors.size > 0 && <> + {graph.connectors.size} small link markers</>}. {mode === "ancient" && selectedEntity?.categories.includes("game character") && <>No separate ancient identity is assigned to {selectedEntity.name} here.</>}</p>
    {expanded && activeEntity && <div className={styles.expandedStory} data-fullscreen-profile={activeEntity.id}><strong>{activeEntity.name}</strong><p>{mythologyStory(activeEntity, catalogue).story}</p></div>}
  </>;
  return <div className={styles.comparisonPanel} data-comparison={mode}>
    {!expanded && contents}
    <dialog ref={dialog} aria-label={`${title} full screen`} className={styles.expandedPanel} onCancel={(event) => { event.preventDefault(); setExpanded(false); }}>{expanded && contents}</dialog>
  </div>;
}
