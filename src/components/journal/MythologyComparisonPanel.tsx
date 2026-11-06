"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { mythologyComparison, type MythologyComparisonMode } from "@/lib/journal/mythology-comparison";
import type { MythologyCatalogue } from "@/lib/journal/mythology-map";
import MythologyNetwork from "./MythologyNetwork";
import MythologyProfile from "./MythologyProfile";
import styles from "./MythologyMap.module.css";

export default function MythologyComparisonPanel({ catalogue, mode, chosen, selected, onSelect }: {
  catalogue: MythologyCatalogue; mode: MythologyComparisonMode; chosen: Set<string>; selected: string; onSelect: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const expandButton = useRef<HTMLButtonElement>(null);
  const wasExpanded = useRef(false);
  const graph = useMemo(() => mythologyComparison(catalogue, mode, chosen, "hesiod", true), [catalogue, mode, chosen]);
  const entity = graph.entities.find((item) => item.id === selected) || graph.entities[0];

  useEffect(() => {
    if (!expanded) {
      if (wasExpanded.current) expandButton.current?.focus({ preventScroll: true });
      wasExpanded.current = false;
      return;
    }
    if (!dialog.current) return;
    wasExpanded.current = true;
    const element = dialog.current;
    const overflow = document.body.style.overflow;
    element.showModal();
    document.body.style.overflow = "hidden";
    return () => {
      if (element.open) element.close();
      document.body.style.overflow = overflow;
    };
  }, [expanded]);

  const network = entity && <MythologyNetwork entities={graph.entities} layout={graph.layout} edges={graph.edges} selected={entity.id} focusKey={mode} connectorIds={graph.connectors} expanded={expanded} onSelect={onSelect}/>;

  return <div className={styles.comparisonPanel} data-comparison={mode}>
    {!expanded && <>
      {network}
      <button ref={expandButton} className={styles.expand} type="button" aria-label="Open family map full screen" onClick={() => setExpanded(true)}>Expand ↗</button>
    </>}
    <dialog ref={dialog} aria-label="Family map full screen" className={styles.expandedPanel} onCancel={(event) => { event.preventDefault(); setExpanded(false); }}>
      {expanded && <div className={styles.expandedBody}>
        {network}
        {entity && <MythologyProfile catalogue={catalogue} mode={mode} entity={entity} expanded/>}
        <button className={styles.expand} type="button" aria-label="Close full screen" onClick={() => setExpanded(false)}>Close ×</button>
      </div>}
    </dialog>
  </div>;
}
