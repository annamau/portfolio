"use client";
import { useState } from "react";
import { mainMythologyCast } from "@/lib/journal/mythology-comparison";
import { searchMythology, type MythologyEntity } from "@/lib/journal/mythology-map";
import styles from "./MythologyMap.module.css";

export default function MythologyCastPicker({ entities, chosen, onChange }: { entities: MythologyEntity[]; chosen: Set<string>; onChange: (ids: Set<string>) => void }) {
  const [query, setQuery] = useState("");
  const featured = new Set([...mainMythologyCast, ...chosen, "kronos", "rhea", "uranus", "hyperion", "thanatos", "hypnos", "moros", "nemesis", "eris", "dora-game", "dusa-game"]);
  const matches = query ? searchMythology(entities, query) : entities.filter((entity) => featured.has(entity.id));
  return <details className={styles.castPicker}>
    <summary><span>Choose the cast</span><span>{chosen.size} selected <b aria-hidden="true">+</b></span></summary>
    <div className={styles.castBody}>
      <div className={styles.castActions}><button type="button" onClick={() => onChange(new Set(mainMythologyCast))}>Main figures</button><button type="button" onClick={() => onChange(new Set())}>Clear selection</button><button type="button" onClick={() => onChange(new Set(entities.map((entity) => entity.id)))}>All available</button></div>
      <input type="search" aria-label="Find figures to add or hide" placeholder="Find a god, shade, nymph…" value={query} onChange={(event) => setQuery(event.target.value)}/>
      <div className={styles.castChecks}>{matches.slice(0, 60).map((entity) => <label key={entity.id}><input type="checkbox" checked={chosen.has(entity.id)} onChange={() => { const next = new Set(chosen); if (next.has(entity.id)) next.delete(entity.id); else next.add(entity.id); onChange(next); }}/><span>{entity.name}{entity.qualifier && <small>{entity.qualifier}</small>}</span></label>)}</div>
      {matches.length > 60 && <p>Keep typing to narrow the list.</p>}
      <p>Small link markers keep the chosen cast connected. Open a marker to add its full seal.</p>
    </div>
  </details>;
}
