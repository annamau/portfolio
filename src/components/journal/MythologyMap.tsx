"use client";

import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { isGameTradition, mythologyEdges, mythologyNeighbors, searchMythology, type MythologyCatalogue, type MythologyLayout, type MythologyReference } from "@/lib/journal/mythology-map";
import MythologyNetwork from "./MythologyNetwork";
import styles from "./MythologyMap.module.css";

let request: Promise<{ catalogue: MythologyCatalogue; layout: MythologyLayout }> | undefined;
function loadMap() {
  if (!request) request = Promise.all(["greek-mythology.json", "greek-mythology-layout.json"].map(async (name) => {
    const response = await fetch(`/journal/${name}`);
    if (!response.ok) throw new Error("The map could not be loaded.");
    return response.json();
  })).then(([catalogue, layout]) => ({ catalogue, layout })).catch((error) => { request = undefined; throw error; });
  return request;
}

export default function MythologyMap() {
  const [data, setData] = useState<Awaited<ReturnType<typeof loadMap>>>();
  const [error, setError] = useState(false);
  const [selected, setSelected] = useState("chaos");
  const [query, setQuery] = useState("");
  const [spoilers, setSpoilers] = useState(false);
  const searchId = useId();
  const root = useRef<HTMLElement>(null);
  useEffect(() => {
    let active = true;
    loadMap().then((result) => { if (active) setData(result); }).catch(() => { if (active) setError(true); });
    return () => { active = false; };
  }, []);
  const catalogue = data?.catalogue;
  const byId = useMemo(() => new Map(catalogue?.entities.map((entity) => [entity.id, entity])), [catalogue]);
  const sourceById = useMemo(() => new Map(catalogue?.sources.map((source) => [source.id, source])), [catalogue]);
  const edges = useMemo(() => catalogue ? mythologyEdges(catalogue).filter((edge) => spoilers || !edge.spoiler) : [], [catalogue, spoilers]);
  const results = useMemo(() => catalogue ? searchMythology(catalogue.entities, query) : [], [catalogue, query]);
  const entity = byId.get(selected);
  const origins = catalogue?.lineages.filter((claim) => claim.child === selected && (spoilers || !claim.spoiler)).sort((a, b) => Number(isGameTradition(a.tradition)) - Number(isGameTradition(b.tradition))) || [];
  const children = catalogue?.lineages.filter((claim) => claim.parents.includes(selected) && (spoilers || !claim.spoiler)) || [];
  const relationships = catalogue?.relationships.filter((claim) => (claim.from === selected || claim.to === selected) && (spoilers || !claim.spoiler)) || [];
  const choose = useCallback((id: string) => { setSelected(id); setQuery(""); }, []);
  function name(id: string) { return byId.get(id)?.name || id; }
  function nodeLink(id: string) { return <button type="button" className={styles.textLink} onClick={() => choose(id)}>{name(id)}</button>; }
  function references(refs: MythologyReference[]) {
    return <span className={styles.references}>{refs.map((ref, index) => {
      const source = sourceById.get(ref.sourceId);
      return source && <a key={`${ref.sourceId}-${index}`} href={source.url} target="_blank" rel="noopener noreferrer">{source.author}, {source.title} · {ref.passage}</a>;
    })}</span>;
  }
  function reveal() { setSpoilers(true); }
  return <section ref={root} className={styles.map} data-mythology-map="" aria-label="Connected Greek mythology map">
    <header className={styles.header}>
      <p className={styles.kicker}>THE FAMILY IS COMPLICATED</p>
      <h3>One very extended family.</h3>
      <p>From Chaos and Gaia to Melinoë, Zagreus, Charon and the Harpies. Follow a name. See where it takes you.</p>
    </header>
    <div className={styles.search}>
      <label htmlFor={searchId}>Find a familiar face</label>
      <div className={styles.searchField}><span aria-hidden="true">⌕</span><input id={searchId} type="search" placeholder="A name, a power, a rabbit hole…" value={query} disabled={!data} aria-controls={query ? `${searchId}-results` : undefined} onChange={(event) => setQuery(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && results[0]) { event.preventDefault(); choose(results[0].id); } if (event.key === "Escape") setQuery(""); }}/></div>
      {query && <div className={styles.searchResults} id={`${searchId}-results`}><p role="status">{results.length ? `${results.length} ${results.length === 1 ? "match" : "matches"}` : "No match yet. Try another spelling."}</p>{results.slice(0, 8).map((result) => <button key={result.id} type="button" onClick={() => choose(result.id)}><span>{result.name}{result.qualifier && <em>{result.qualifier}</em>}</span><small>{result.domains.join(" · ") || result.categories.join(" · ")}</small></button>)}{results.length > 8 && <p>Keep typing to narrow it down.</p>}</div>}
    </div>
    <div className={styles.legend} aria-label="Connection key"><span>Parent → child</span><span>Emergence / creation</span><span>Story / membership</span><span>Hades games</span></div>
    <p className={styles.variantNote}>Parent arrows include alternative accounts. Select a figure to read each version separately.</p>
    {data ? <MythologyNetwork entities={data.catalogue.entities} layout={data.layout} edges={edges} selected={selected} onSelect={choose}/> : <div className={styles.loading} role="status">{error ? <>The map couldn&apos;t load. <button type="button" onClick={() => { setError(false); loadMap().then(setData).catch(() => setError(true)); }}>Try again</button></> : "Unravelling the family…"}</div>}
    <div className={styles.mapCaption}><span>{catalogue ? `${catalogue.metadata.counts.entities} figures & collectives · one connected network` : "A sourced map, with room to keep exploring."}</span><span>Drag to explore · + / − to zoom</span></div>
    <div className={styles.detail} aria-live="polite" aria-atomic="false" data-mythology-detail={selected}>
      {entity && <>
        <div className={styles.detailHeading}><div><p className={styles.kicker}>{entity.kind === "collective" ? "COLLECTIVE" : entity.categories.join(" · ").replaceAll("-", " ")}</p><h4>{entity.name}</h4>{entity.qualifier && <p className={styles.qualifier}>{entity.qualifier}</p>}</div><span className={styles.index}>↗</span></div>
        {entity.domains.length > 0 && <p className={styles.domains}>{entity.domains.join(" · ")}</p>}
        <p className={styles.summary}>{entity.summary}</p>
        <label className={styles.connectionPicker}>Follow a connection
          <select aria-label={`Follow a connection from ${entity.name}`} value="" onChange={(event) => choose(event.target.value)}>
            <option value="" disabled>Choose a connected figure</option>
            {mythologyNeighbors(edges, selected).sort((a, b) => name(a).localeCompare(name(b))).map((id) => <option key={id} value={id}>{name(id)}{byId.get(id)?.qualifier ? ` (${byId.get(id)!.qualifier})` : ""}</option>)}
          </select>
        </label>
        <div className={styles.originList}>
          <h5>Where {entity.kind === "collective" ? "they" : "the story"} begins</h5>
          {entity.originNotes?.map((note) => <div key={note.tradition} className={styles.claim}><p className={styles.tradition}>{note.tradition}</p><p className={styles.claimNote}>{note.summary}</p>{references(note.sourceRefs)}</div>)}
          {origins.length ? origins.map((claim) => <div key={claim.id} className={styles.claim} data-game={isGameTradition(claim.tradition)}><p className={styles.tradition}>{claim.tradition}{isGameTradition(claim.tradition) ? " · game continuity" : ""}</p><p className={styles.parents}>{claim.parents.map((parent, index) => <span key={parent}>{index > 0 && <span className={styles.join}> + </span>}{nodeLink(parent)}</span>)}<span className={styles.arrow}> → </span>{entity.name}<small>{claim.mode === "birth" ? "Parentage" : claim.mode === "emergence" ? "Emergence, not an ordinary birth" : "Creation, not an ordinary birth"}</small></p>{claim.notes && <p className={styles.claimNote}>{claim.notes}</p>}{references(claim.sourceRefs)}</div>) : !entity.originNotes?.length && <p className={styles.claimNote}>{entity.originStatus === "primordial" || entity.categories.includes("primordial") ? "A first being in the cited telling. No parent is assigned here." : "No parentage established in the sources checked here. Story and membership ties keep this figure in the map."}</p>}
        </div>
        {!!children.length && <details className={styles.connectionsList}><summary>Children & creations <span>{new Set(children.map((claim) => claim.child)).size}</span></summary>{children.map((claim) => <div key={claim.id} className={styles.related}>{nodeLink(claim.child)}<small>{claim.tradition} · {claim.mode}{isGameTradition(claim.tradition) ? " · game" : ""}</small>{references(claim.sourceRefs)}</div>)}</details>}
        {!!relationships.length && <details className={styles.connectionsList}><summary>Other connections <span>{relationships.length}</span></summary>{relationships.map((claim) => <div key={claim.id} className={styles.related}><p>{nodeLink(claim.from)} <span className={styles.relationshipType}>{claim.type.replaceAll("_", " ")}</span> {nodeLink(claim.to)}</p><small>{claim.tradition}{isGameTradition(claim.tradition) ? " · game continuity" : ""}</small>{claim.notes && <p className={styles.claimNote}>{claim.notes}</p>}{references(claim.sourceRefs)}</div>)}</details>}
        <details className={styles.connectionsList}><summary>About this figure <span>sources</span></summary>{references(entity.sourceRefs)}{entity.aliases.length > 0 && <p className={styles.claimNote}>Also found as {entity.aliases.join(", ")}.</p>}</details>
      </>}
    </div>
    <p className={styles.spoilerNote}>Game story connections: {spoilers ? <span>revealed</span> : <span className={styles.covered} role="button" tabIndex={0} aria-label="Reveal game story connections and spoilers" onClick={reveal} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); reveal(); } }}><span aria-hidden="true">Some names have a past. Tap to uncover it.</span></span>}</p>
    <details className={styles.method}><summary>A note on this slightly chaotic family</summary><p>There isn&apos;t one agreed family tree. Hesiod, Homer and later writers sometimes give the same figure different parents. Each account stays separate here. A dashed story link connects the map without inventing a parent.</p><p>Chaos comes first in Hesiod&apos;s telling. That doesn&apos;t make Chaos everybody&apos;s parent. And yes, Kronos the Titan and Chronos as Time are separate names here.</p><p>This is a growing catalogue of named figures, not every being in every version. The sources sometimes count a group differently from the names they list.</p>{catalogue?.coverage.map((group) => <p key={group.group} className={styles.coverage}><strong>{group.group}</strong> · {group.entityIds.length} named{group.notes && <>. {group.notes}</>}{references(group.sourceRefs)}</p>)}</details>
    <p className={styles.download}><a href="/journal/greek-mythology.json" download>Take the full JSON ↗</a><span>Names, origins, connections & sources. Includes game spoilers.</span></p>
  </section>;
}
