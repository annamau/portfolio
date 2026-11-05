"use client";

import { useEffect, useId, useRef, useState } from "react";
import { mythologyMap, type MythologyNode } from "@/lib/journal/mythology-map";
import styles from "./MythologyMap.module.css";

export default function MythologyMap() {
  const root = useRef<HTMLElement>(null);
  const prefix = useId();
  const [folded, setFolded] = useState<Set<string>>(() => new Set());
  const [paths, setPaths] = useState<{ id: string; d: string; edge: string }[]>([]);
  useEffect(() => {
    const element = root.current;
    if (!element) return;
    let pending = 0;
    function measure() {
      cancelAnimationFrame(pending);
      pending = requestAnimationFrame(() => {
        const bounds = element!.getBoundingClientRect();
        const next: typeof paths = [];
        function connect(node: MythologyNode) {
          const parent = element!.querySelector<HTMLElement>(`[data-card="${node.id}"]`);
          if (!parent?.offsetWidth) return;
          const from = parent.getBoundingClientRect();
          for (const child of node.children || []) {
            const target = element!.querySelector<HTMLElement>(`[data-card="${child.id}"]`);
            if (!target?.offsetWidth) continue;
            const to = target.getBoundingClientRect();
            const x1 = from.left - bounds.left + 12, y1 = from.bottom - bounds.top;
            const x2 = to.left - bounds.left + 12, y2 = to.top - bounds.top;
            next.push({ id: child.id, edge: child.edge || "family", d: `M${x1},${y1}V${y2 - 7}H${x2}V${y2}` });
            connect(child);
          }
        }
        connect(mythologyMap); setPaths(next);
      });
    }
    const observer = new ResizeObserver(measure);
    observer.observe(element); measure();
    return () => { observer.disconnect(); cancelAnimationFrame(pending); };
  }, [folded]);
  function toggle(id: string) {
    setFolded((previous) => {
      const next = new Set(previous);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }
  function branch(node: MythologyNode) {
    const hasChildren = !!node.children?.length;
    const open = !folded.has(node.id);
    const label = <><span className={styles.name}>{node.name}</span><span className={styles.role}>{node.role}</span>{node.relation && <span className={styles.relation}>{node.relation}</span>}</>;
    return <li key={node.id} className={styles.branch} data-edge={node.edge || "family"} data-myth-id={node.id}>
      {hasChildren ? <button data-card={node.id} className={styles.node} type="button" aria-expanded={open} aria-controls={`${prefix}-${node.id}`} onClick={() => toggle(node.id)}>{label}<span className={styles.toggle} aria-hidden="true">{open ? "−" : "+"}</span></button> : <div data-card={node.id} className={styles.node}>{label}</div>}
      {hasChildren && <ul id={`${prefix}-${node.id}`} className={styles.children} data-leaves={node.children!.every((child) => !child.children?.length)} hidden={!open}>{node.children!.map(branch)}</ul>}
    </li>;
  }
  return <section ref={root} className={styles.map} data-mythology-map="" aria-label="Connected Greek mythology map">
    <header className={styles.header}><p className={styles.kicker}>MYTHOLOGY · FOLLOW THE CONNECTIONS</p><h3>It runs in the family.</h3><button type="button" onClick={() => setFolded(new Set())} disabled={!folded.size}>Show full tree</button></header>
    <div className={styles.legend}><span>Family</span><span>Story or category</span><span>Foam-born</span></div>
    <svg className={styles.connections} aria-hidden="true">{paths.map((path) => <path key={path.id} data-connection={path.id} data-edge={path.edge} d={path.d}/>)}</svg>
    <ul className={styles.tree}>{branch(mythologyMap)}</ul>
    <p className={styles.note}>Selected branches, with roles beside each name. Tap a branch to fold it. Dashed lines connect settings and categories, not parents.</p>
    <p className={styles.sources}>Family links follow <a href="https://www.theoi.com/Text/HesiodTheogony.html" target="_blank" rel="noopener noreferrer">Hesiod&apos;s Theogony</a>. Charon: <a href="https://adfonteslibrary.org/work-euripides-alcestis" target="_blank" rel="noopener noreferrer">Alcestis 252–256</a>. Scylla: <a href="https://www.theoi.com/Text/HomerOdyssey12.html" target="_blank" rel="noopener noreferrer">Odyssey 12</a>. Other tellings differ.</p>
  </section>;
}
