"use client";

import { useCallback, useEffect, useId, useMemo, useState } from "react";
import { searchMythology, type MythologyCatalogue } from "@/lib/journal/mythology-map";
import { mainMythologyCast, mythologyGameCast, type MythologyComparisonMode } from "@/lib/journal/mythology-comparison";
import MythologyComparisonPanel from "./MythologyComparisonPanel";
import MythologyProfile from "./MythologyProfile";
import MythologyEmblem from "./MythologyEmblem";
import styles from "./MythologyMap.module.css";

const initialFigure = "zagreus";
let catalogueRequest: Promise<MythologyCatalogue> | undefined;

function loadCatalogue() {
  if (!catalogueRequest) catalogueRequest = fetch("/journal/greek-mythology.json").then((response) => {
    if (!response.ok) throw new Error("The catalogue could not be loaded.");
    return response.json() as Promise<MythologyCatalogue>;
  }).catch((error) => {
    catalogueRequest = undefined;
    throw error;
  });
  return catalogueRequest;
}

export default function MythologyMap() {
  const [catalogue, setCatalogue] = useState<MythologyCatalogue>();
  const [error, setError] = useState(false);
  const [selected, setSelected] = useState(initialFigure);
  const [ancientCast, setAncientCast] = useState(() => new Set(mainMythologyCast));
  const [query, setQuery] = useState("");
  const [mode, setMode] = useState<MythologyComparisonMode>("game");
  const searchId = useId();

  useEffect(() => {
    let active = true;
    loadCatalogue().then((result) => {
      if (active) setCatalogue(result);
    }).catch(() => {
      if (active) setError(true);
    });
    return () => { active = false; };
  }, []);

  const gameCast = useMemo(() => catalogue ? mythologyGameCast(catalogue) : new Set<string>(), [catalogue]);
  const available = useMemo(() => catalogue?.entities.filter((entity) =>
    mode === "game" ? gameCast.has(entity.id) : !entity.categories.includes("game character")) || [], [catalogue, gameCast, mode]);
  const results = useMemo(() => searchMythology(available, query).slice(0, 8), [available, query]);
  const entity = available.find((item) => item.id === selected) || available.find((item) => item.id === initialFigure);
  const choose = useCallback((id: string) => {
    setSelected(id);
    setQuery("");
    if (mode === "ancient") setAncientCast((previous) => previous.has(id) ? previous : new Set([...previous, id]));
  }, [mode]);

  return <section className={styles.map} data-mythology-map="" aria-label="Family map of Greek mythology and Hades, from Charon to the Harpies">
    <div className={styles.toolbar}>
      <div className={styles.modeSwitch} role="group" aria-label="Family telling">
        {(["game", "ancient"] as const).map((option) => <button key={option} type="button" aria-pressed={mode === option} onClick={() => { setMode(option); setQuery(""); }}>{option === "game" ? "Hades" : "Ancient accounts"}</button>)}
      </div>
      <div className={styles.search}>
        <div className={styles.searchField}>
          <span aria-hidden="true">⌕</span>
          <input type="search" aria-label="Find a figure" value={query} disabled={!catalogue} placeholder="Find a figure…" aria-controls={query ? searchId : undefined} onChange={(event) => setQuery(event.target.value)} onKeyDown={(event) => {
            if (event.key === "Enter" && results[0]) { event.preventDefault(); choose(results[0].id); }
            if (event.key === "Escape") setQuery("");
          }}/>
        </div>
        {query && <div className={styles.searchResults} id={searchId}>
          {!results.length && <p role="status">No matching figures.</p>}
          {results.map((item) => <button type="button" key={item.id} onClick={() => choose(item.id)}>
            <svg width="30" height="30" viewBox="-36 -36 72 72" aria-hidden="true"><MythologyEmblem entity={item}/></svg>
            <span>{item.name}{item.qualifier && <small>{item.qualifier}</small>}</span>
          </button>)}
        </div>}
      </div>
    </div>
    {catalogue && entity ? <div className={styles.mapBody}>
      <MythologyComparisonPanel catalogue={catalogue} mode={mode} chosen={mode === "game" ? gameCast : ancientCast} selected={entity.id} onSelect={choose}/>
      <MythologyProfile catalogue={catalogue} mode={mode} entity={entity}/>
    </div> : <div className={styles.loading} role="status">{error ? <>The map couldn&apos;t load. <button type="button" onClick={() => { setError(false); loadCatalogue().then(setCatalogue).catch(() => setError(true)); }}>Try again</button></> : "Loading family map…"}</div>}
  </section>;
}
