"use client";
import { useId } from "react";
import { isGameTradition, type MythologyCatalogue, type MythologyReference } from "@/lib/journal/mythology-map";
import { mythologyStory } from "@/lib/journal/mythology-stories";
import MythologyEmblem from "./MythologyEmblem";
import styles from "./MythologyMap.module.css";

export default function MythologyProfile({ catalogue, selected, spoilers, originId, onTrace, onSelect }: {
  catalogue: MythologyCatalogue; selected: string; spoilers: boolean; originId?: string;
  onTrace: (id?: string) => void; onSelect: (id: string) => void;
}) {
  const radioId = useId();
  const entity = catalogue.entities.find((entity) => entity.id === selected && (spoilers || !entity.spoiler));
  if (!entity) return <div className={styles.detail}>Choose a seal to read its story.</div>;
  const names = new Map(catalogue.entities.map((entity) => [entity.id, entity]));
  const sources = new Map(catalogue.sources.map((source) => [source.id, source]));
  const origins = catalogue.lineages.filter((claim) => claim.child === selected && (spoilers || !claim.spoiler)).sort((a, b) => Number(isGameTradition(a.tradition)) - Number(isGameTradition(b.tradition)));
  const children = catalogue.lineages.filter((claim) => claim.parents.includes(selected) && (spoilers || !claim.spoiler));
  const relations = catalogue.relationships.filter((claim) => (claim.from === selected || claim.to === selected) && (spoilers || !claim.spoiler));
  const biography = mythologyStory(entity, catalogue);
  const name = (id: string) => names.get(id)?.name || id;
  const person = (id: string) => <button type="button" className={styles.textLink} onClick={() => onSelect(id)}>{name(id)}</button>;
  const refs = (references: MythologyReference[]) => <span className={styles.references}>{references.map((ref, i) => { const source = sources.get(ref.sourceId); return source && <a key={`${ref.sourceId}-${i}`} href={source.url} target="_blank" rel="noopener noreferrer">{source.author}, {source.title} · {ref.passage}</a>; })}</span>;
  return <div className={styles.detail} data-mythology-detail={selected} aria-live="polite">
    <div className={styles.detailHeading}><div><p className={styles.kicker}>{entity.kind === "collective" ? "COLLECTIVE" : entity.categories.join(" · ").replaceAll("-", " ")}</p><h4>{entity.name}</h4>{entity.qualifier && <p className={styles.qualifier}>{entity.qualifier}</p>}</div><svg className={styles.profileEmblem} viewBox="-38 -38 76 76" aria-hidden="true"><MythologyEmblem entity={entity}/></svg></div>
    {!!entity.domains.length && <p className={styles.domains}>{entity.domains.join(" · ")}</p>}
    <p className={styles.shortStory}>{biography.story}</p>
    <aside className={styles.storyDetail}><p className={styles.kicker}>A DETAIL TO REMEMBER</p><p>{biography.detail}</p></aside>
    <div className={styles.originList}><h5>{origins.length > 1 ? "Compare the origins" : "Where the story begins"}</h5>
      {origins.length > 1 && <label className={styles.traceChoice}><input type="radio" name={radioId} checked={!originId} onChange={() => onTrace(undefined)}/>Follow both graph readings</label>}
      {entity.originNotes?.map((note) => <div className={styles.claim} key={note.tradition}><p className={styles.tradition}>{note.tradition}</p><p className={styles.claimNote}>{note.summary}</p>{refs(note.sourceRefs)}</div>)}
      {origins.map((claim) => <div className={styles.claim} data-game={isGameTradition(claim.tradition)} data-traced={originId === claim.id} key={claim.id}><p className={styles.tradition}>{claim.tradition}{isGameTradition(claim.tradition) && " · game continuity"}</p><p className={styles.parents}>{claim.parents.map((id, i) => <span key={id}>{i > 0 && <span className={styles.join}> + </span>}{person(id)}</span>)}<span className={styles.arrow}> → </span>{entity.name}<small>{claim.mode === "birth" ? "Parentage" : claim.mode === "emergence" ? "Emergence" : "Creation"}</small></p>{claim.notes && <p className={styles.claimNote}>{claim.notes}</p>}{refs(claim.sourceRefs)}{origins.length > 1 && <label className={styles.traceChoice}><input type="radio" name={radioId} checked={originId === claim.id} aria-label={`Trace ${claim.tradition}: ${claim.parents.map(name).join(" and ")} (${claim.sourceRefs[0]?.passage})`} onChange={() => onTrace(claim.id)}/>Trace this account</label>}</div>)}
      {!origins.length && !entity.originNotes?.length && <p className={styles.claimNote}>No parents established in the checked sources.</p>}
    </div>
    {!!children.length && <details className={styles.connectionsList}><summary>Children & creations <span>{new Set(children.map((claim) => claim.child)).size}</span></summary>{children.map((claim) => <div className={styles.related} key={claim.id}>{person(claim.child)}<small>{claim.tradition} · {claim.mode}</small>{refs(claim.sourceRefs)}</div>)}</details>}
    {!!relations.length && <details className={styles.connectionsList}><summary>Other connections <span>{relations.length}</span></summary>{relations.map((claim) => <div className={styles.related} key={claim.id}><p>{person(claim.from)} <span className={styles.relationshipType}>{claim.type.replaceAll("_", " ")}</span> {person(claim.to)}</p>{claim.notes && <p className={styles.claimNote}>{claim.notes}</p>}{refs(claim.sourceRefs)}</div>)}</details>}
    <details className={styles.connectionsList}><summary>Sources for this figure <span>↗</span></summary>{refs(entity.sourceRefs)}{entity.aliases.length > 0 && <p className={styles.claimNote}>Also found as {entity.aliases.join(", ")}.</p>}</details>
  </div>;
}
