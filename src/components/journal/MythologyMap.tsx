"use client";

import { useCallback, useEffect, useId, useMemo, useState } from "react";
import { mythologyReadings, searchMythology, type MythologyCatalogue, type MythologyReading } from "@/lib/journal/mythology-map";
import { mainMythologyCast, type MythologyComparisonMode } from "@/lib/journal/mythology-comparison";
import MythologyCastPicker from "./MythologyCastPicker";
import MythologyComparisonPanel from "./MythologyComparisonPanel";
import MythologyProfile from "./MythologyProfile";
import MythologyEmblem from "./MythologyEmblem";
import styles from "./MythologyMap.module.css";

let catalogueRequest: Promise<MythologyCatalogue> | undefined;
function loadCatalogue() {
  if (!catalogueRequest) catalogueRequest = fetch("/journal/greek-mythology.json").then((response) => {
    if (!response.ok) throw new Error("The catalogue could not be loaded.");
    return response.json() as Promise<MythologyCatalogue>;
  }).catch((error) => { catalogueRequest = undefined; throw error; });
  return catalogueRequest;
}

export default function MythologyMap() {
  const [catalogue, setCatalogue] = useState<MythologyCatalogue>();
  const [error, setError] = useState(false);
  const [selected, setSelected] = useState("chaos");
  const [chosen, setChosen] = useState(() => new Set(mainMythologyCast));
  const [query, setQuery] = useState("");
  const [spoilers, setSpoilers] = useState(false);
  const [mode, setMode] = useState<MythologyComparisonMode>("ancient");
  const [reading, setReading] = useState<MythologyReading>("hesiod");
  const [originId, setOriginId] = useState<string>();
  const searchId = useId();
  useEffect(() => {
    let active = true;
    loadCatalogue().then((result) => { if (active) setCatalogue(result); }).catch(() => { if (active) setError(true); });
    return () => { active = false; };
  }, []);
  const available = useMemo(() => catalogue?.entities.filter((entity) => spoilers || !entity.spoiler) || [], [catalogue, spoilers]);
  const results = useMemo(() => searchMythology(available, query), [available, query]);
  const choose = useCallback((id: string) => {
    setSelected(id); setQuery(""); setOriginId(undefined);
    setChosen((previous) => previous.has(id) ? previous : new Set([...previous, id]));
  }, []);
  function changeCast(ids: Set<string>) {
    setChosen(ids); setOriginId(undefined);
    if (!ids.has(selected)) setSelected([...ids][0] || "");
  }
  const reveal = () => setSpoilers(true);
  return <section className={styles.map} data-mythology-map="" data-mythology-reading={reading} data-traced-origin={originId || ""} aria-label="Greek mythology and Hades comparison">
    <header className={styles.header}><p className={styles.kicker}>SAME NAMES. DIFFERENT STORIES.</p><h3>One family map, two tellings</h3><p>From Chaos and Gaia to Melinoë, Zagreus, Charon and the Harpies. Switch tellings to see the family move. Pick a name to read their story.</p></header>
    <div className={styles.exploreControls} data-mode={mode}>
      <div className={styles.search}><label htmlFor={searchId}>Find a familiar face</label><div className={styles.searchField}><span aria-hidden="true">⌕</span><input id={searchId} type="search" value={query} disabled={!catalogue} placeholder="Search a name or a power…" aria-controls={query ? `${searchId}-results` : undefined} onChange={(event) => setQuery(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && results[0]) { event.preventDefault(); choose(results[0].id); } if (event.key === "Escape") setQuery(""); }}/></div>
        {query && <div className={styles.searchResults} id={`${searchId}-results`}><p role="status">{results.length ? `${results.length} matches` : "No match yet. Try another spelling."}</p>{results.slice(0, 8).map((entity) => <button type="button" key={entity.id} onClick={() => choose(entity.id)}><span className={styles.resultIdentity}><svg width="32" height="32" viewBox="-36 -36 72 72" aria-hidden="true"><MythologyEmblem entity={entity}/></svg><span>{entity.name}{entity.qualifier && <em>{entity.qualifier}</em>}</span></span><small>{entity.domains.join(" · ") || entity.categories.join(" · ")}</small></button>)}</div>}
      </div>
      {mode === "ancient" && <label className={styles.readingPicker}>Ancient reading<select value={reading} disabled={!catalogue} onChange={(event) => { setReading(event.target.value as MythologyReading); setOriginId(undefined); }}>{mythologyReadings.filter((option) => option.id !== "hades").map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}</select></label>}
    </div>
    {catalogue && <MythologyCastPicker entities={available} chosen={chosen} onChange={changeCast}/>}
    <div className={styles.modeSwitch} role="group" aria-label="Family telling">
      {(["ancient", "game"] as const).map((option) => <button key={option} type="button" aria-pressed={mode === option} onClick={() => { setMode(option); setOriginId(undefined); }}>{option === "ancient" ? "Ancient accounts" : "Hades"}</button>)}
    </div>
    <div className={styles.legend} aria-label="Connection key" data-mode={mode}><span>Parent → child</span><span>Emergence / creation</span><span>Story / sequence</span></div>
    {catalogue ? <div className={styles.mapBody}>
      <MythologyComparisonPanel catalogue={catalogue} mode={mode} chosen={chosen} selected={selected} reading={reading} spoilers={spoilers} originId={originId} onSelect={choose}/>
      <MythologyProfile catalogue={catalogue} mode={mode} reading={reading} selected={selected} spoilers={spoilers} originId={originId} onTrace={setOriginId} onSelect={choose}/>
    </div> : <div className={styles.loading} role="status">{error ? <>The catalogue couldn&apos;t load. <button type="button" onClick={() => { setError(false); loadCatalogue().then(setCatalogue).catch(() => setError(true)); }}>Try again</button></> : "Unravelling the family…"}</div>}
    <p className={styles.spoilerNote}>Game story connections: {spoilers ? <span>revealed</span> : <span className={styles.covered} role="button" tabIndex={0} aria-label="Reveal game story connections and spoilers" onClick={reveal} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); reveal(); } }}><span aria-hidden="true">Some names have a past. Tap to uncover it.</span></span>}</p>
    <details className={styles.method}><summary>About the comparison & sources</summary><p>Hades draws checked game connections only. Ancient readings use their own account where it gives an origin; lighter lines fill gaps from other ancient texts. Choose All accounts to see the alternatives together.</p><p>Shared branches group children who have the same parents in a source. Muted cards keep relatives and story links visible. Every name has a short profile. For figures preserved mostly in a list, the profile says what that source establishes rather than making up an adventure.</p><p>Emblems use familiar attributes and illustrated realm seals with initials. They are navigation cues. See the <a href="https://www.metmuseum.org/essays/greek-gods-and-religious-practices" target="_blank" rel="noopener noreferrer">Met&apos;s guide to divine attributes</a> and <a href="https://www.getty.edu/education/teachers/classroom_resources/curricula/vsi/downloads/vsi_worksheet03_01.pdf" target="_blank" rel="noopener noreferrer">Getty&apos;s Apollo example</a>.</p><p>This is a growing catalogue of named figures, not every being in every tradition.</p>{catalogue?.coverage.map((group) => <p className={styles.coverage} key={group.group}><strong>{group.group}</strong> · {group.entityIds.length} named. {group.notes}</p>)}</details>
    <p className={styles.download}><a href="/journal/greek-mythology.json" download>Take the full JSON ↗</a><span>Names, origins, connections & sources. Includes game spoilers.</span></p>
  </section>;
}
