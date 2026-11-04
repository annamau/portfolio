"use client";
import { useState } from "react";
import Image from "next/image";
import { ArrowUpRight, PlayCircle, XLogo } from "@phosphor-icons/react";
import { resourceCollections } from "@/data/resources";
import { resourcePreviews } from "@/data/resource-media";
import type { Resource, ResourceLocale } from "@/data/resources";
import { kindLabel, resourceHost } from "./resource-labels";
import styles from "./ResourceLibrary.module.css";

export default function ResourceCard({ resource, index, locale, onOpen }: { resource: Resource; index: number; locale: ResourceLocale; onOpen: (resource: Resource) => void }) {
  const group = resourceCollections.find(({ id }) => id === resource.category)!;
  const [failed,setFailed]=useState(false);
  const preview=resource.preview || resourcePreviews[resource.id];
  const opensViewer=!!resource.source || ["video","audio","image","file"].includes(resource.kind);
  return <article className={styles.card} style={{"--resource-color":group.color} as React.CSSProperties}>
    <a href={resource.url} target="_blank" rel="noopener noreferrer" className={styles.cardLink} aria-haspopup={opensViewer?"dialog":undefined} onClick={(event)=>{if(opensViewer&&!event.metaKey&&!event.ctrlKey&&!event.shiftKey){event.preventDefault();onOpen(resource);}}}>
      <div className={`${styles.preview} ${resource.source?styles.xPreview:""}`}>
        {preview&&!failed ? <Image src={preview} alt={`${locale==="es"?"Vista previa de":"Preview of"} ${resource.name}`} width={840} height={440} sizes="(max-width: 600px) 100vw, (max-width: 1100px) 45vw, 30vw" loading={index<3?"eager":"lazy"} unoptimized={preview.startsWith("/api/")} onError={()=>setFailed(true)}/> : <div className={styles.previewFallback} aria-hidden="true"><span>{resource.source?<XLogo size={30}/>:group.glyph}</span><strong>{resource.name}</strong><small>{resource.source?.author || resourceHost(resource.url,locale)}</small></div>}
        {(resource.kind==="video"||resource.kind==="audio") && <span className={styles.playBadge}><PlayCircle size={38} weight="fill"/></span>}
        <span className={styles.typeBadge}>{resource.source&&"X · "}{kindLabel(resource.kind,locale)}</span>
      </div>
      <div className={styles.cardBody}>
        <h2>{resource.name}<ArrowUpRight size={18} aria-hidden="true"/></h2>
        <p>{resource.description[locale]}</p>
        <div className={styles.tags}>{resource.tags.slice(0,7).map((tag)=><span key={tag}>{tag}</span>)}{resource.tags.length>7&&<span>+{resource.tags.length-7}</span>}</div>
        <div className={styles.cardFooter}><span>{resourceHost(resource.url,locale)}</span><span className={styles.categoryLabel}><i/>{group.name[locale]}</span></div>
      </div>
    </a>
  </article>;
}
