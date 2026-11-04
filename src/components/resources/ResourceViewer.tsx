"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ArrowUpRight } from "@phosphor-icons/react";
import type { Resource } from "@/data/resources";
import { useLanguage } from "@/contexts/LanguageContext";
import ResourceDialog from "./ResourceDialog";
import styles from "./ResourceDialogs.module.css";

type XWidgets = { widgets: { createTweet: (id: string, target: HTMLElement, options: Record<string,unknown>) => Promise<HTMLElement | undefined> } };
let widgetsPromise: Promise<XWidgets> | null = null;
function loadXWidgets(): Promise<XWidgets> {
  const current=(window as typeof window & { twttr?: XWidgets }).twttr;
  if(current?.widgets?.createTweet)return Promise.resolve(current);
  if(widgetsPromise)return widgetsPromise;
  widgetsPromise=new Promise((resolve,reject)=>{
    const script=document.createElement("script");script.src="https://platform.x.com/widgets.js";script.async=true;
    script.onload=()=>{const client=(window as typeof window & {twttr?:XWidgets}).twttr;if(client?.widgets)resolve(client);else reject(new Error("X embed unavailable"));};
    script.onerror=()=>{widgetsPromise=null;reject(new Error("X embed unavailable"));};
    document.head.appendChild(script);
  });
  return widgetsPromise;
}
export default function ResourceViewer({ resource, onClose }: { resource: Resource; onClose: () => void }) {
  const {locale}=useLanguage();const es=locale==="es";
  const target=useRef<HTMLDivElement>(null);
  const [embedState,setEmbedState]=useState<"idle"|"loading"|"ready"|"error">("idle");
  useEffect(()=>{
    if(embedState!=="loading"||!resource.source?.postId||!target.current)return;
    let cancelled=false;
    const timeout=setTimeout(()=>{if(!cancelled)setEmbedState("error");},12000);
    void loadXWidgets().then((client)=>{if(cancelled||!target.current)return;target.current.replaceChildren();return client.widgets.createTweet(resource.source!.postId,target.current,{dnt:true,theme:"light",lang:locale,conversation:"none"});}).then((result)=>{if(!cancelled)setEmbedState(result?"ready":"error");}).catch(()=>{if(!cancelled)setEmbedState("error");}).finally(()=>clearTimeout(timeout));
    return()=>{cancelled=true;clearTimeout(timeout);};
  },[embedState,resource.source,locale]);
  const directMedia=resource.file || /\.(mp4|webm|mp3|wav|ogg|m4a)(?:\?|$)/i.test(resource.url);
  return <ResourceDialog title={resource.name} onClose={onClose}>
    <p className={styles.intro}>{resource.description[locale]}</p>
    {resource.source?.platform==="x" && <div className={styles.xPanel}>
      {embedState==="idle" && <button type="button" className={styles.primary} onClick={()=>setEmbedState("loading")}>{es?"Cargar post y vídeo de X":"Load X post & media"}</button>}
      {embedState==="loading" && <p role="status">{es?"Cargando desde X…":"Loading from X…"}</p>}
      <div ref={target}/>
      {embedState==="error" && <p>{es?"X no ha podido mostrar este contenido. Puedes abrir el original.":"X couldn’t display this content. You can open the original."}</p>}
    </div>}
    {!resource.source && resource.kind==="video" && directMedia && <video className={styles.media} src={resource.url} controls preload="metadata"/>}
    {!resource.source && resource.kind==="audio" && directMedia && <audio className={styles.audio} src={resource.url} controls preload="metadata"/>}
    {!resource.source && resource.kind==="image" && <Image className={styles.media} src={resource.url} alt={resource.name} width={1200} height={800} unoptimized/>}
    <div className={styles.viewerTags}>{resource.tags.map((tag)=><span key={tag}>{tag}</span>)}</div>
    <a className={styles.openOriginal} href={resource.url} target="_blank" rel="noopener noreferrer">{resource.source?(es?"Abrir original en X":"Open original on X"):(es?"Abrir recurso":"Open resource")}<ArrowUpRight size={17}/></a>
  </ResourceDialog>;
}
