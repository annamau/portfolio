"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { FolderSimple, MagnifyingGlass, Plus, X } from "@phosphor-icons/react";
import { useLanguage } from "@/contexts/LanguageContext";
import { resourceCollections } from "@/data/resources";
import type { Resource, ResourceCategory } from "@/data/resources";
import { canonicalTag, filterResources } from "@/lib/resource-search";
import type { ResourceFilters } from "@/lib/resource-search";
import { useResourceData } from "./ResourceData";
import ResourceSidebar from "./ResourceSidebar";
import ResourceCard from "./ResourceCard";
import ResourceViewer from "./ResourceViewer";
import styles from "./ResourceLibrary.module.css";

const quickTags=[{tag:"Database",en:"DB",es:"DB"},{tag:"Images",en:"Images",es:"Imágenes"},{tag:"Audio",en:"Audio",es:"Audio"},{tag:"Video",en:"Video",es:"Vídeo"},{tag:"AI",en:"AI",es:"IA"},{tag:"API",en:"API",es:"API"},{tag:"Self-hosting",en:"Self-hosting",es:"Autoalojamiento"}];
const formats: {value:NonNullable<ResourceFilters["format"]>;en:string;es:string}[]=[
  {value:"website",en:"Websites & tools",es:"Webs y herramientas"},{value:"article",en:"Articles & guides",es:"Artículos y guías"},{value:"post",en:"X posts",es:"Posts de X"},{value:"video",en:"Videos",es:"Vídeos"},{value:"audio",en:"Audio",es:"Audio"},{value:"image",en:"Images",es:"Imágenes"},{value:"file",en:"Files",es:"Archivos"},
];
export default function ResourceLibrary({ category }: { category?: ResourceCategory }) {
  const {locale}=useLanguage();const es=locale==="es";
  const {resources,error,refresh,session}=useResourceData();
  const [query,setQuery]=useState("");
  const [tag,setTag]=useState("");
  const [sort,setSort]=useState<"curated"|"az">("curated");
  const [format,setFormat]=useState<ResourceFilters["format"]|"">("");
  const [viewing,setViewing]=useState<Resource|null>(null);
  const collection=resourceCollections.find(({id})=>id===category);
  const categoryResources=useMemo(()=>filterResources(resources,{category}),[resources,category]);
  const tags=useMemo(()=>[...new Set(categoryResources.flatMap((resource)=>resource.tags))].sort(),[categoryResources]);
  const visible=useMemo(()=>filterResources(resources,{category,query,tag,sort,format:format||undefined}),[resources,category,query,tag,sort,format]);
  const hasFilters=!!query||!!tag||!!format||sort!=="curated";
  const reset=()=>{setQuery("");setTag("");setFormat("");setSort("curated");};
  return <main className={styles.page} id="main-content">
    <a className={styles.skip} href="#resource-directory">{es?"Ir a los recursos":"Skip to resources"}</a>
    <ResourceSidebar category={category}/>
    <section id="resource-directory" className={styles.directory} aria-labelledby="directory-heading">
      <div className={styles.folderHeading}>
        <h1 id="directory-heading"><FolderSimple size={26} weight="duotone" aria-hidden="true"/>{collection?collection.name[locale]:(es?"Todos los recursos":"All resources")}</h1><span>{categoryResources.length}</span>
        <Link href={`/resources/inbox?${session?.authenticated?"add=1":""}${category?`&folder=${category}`:""}`} className={styles.addButton} aria-label={session?.authenticated?(es?"Añadir recurso":"Add resource"):(es?"Proponer recurso":"Suggest a resource")}><Plus size={17}/><span>{session?.authenticated?(es?"Añadir recurso":"Add resource"):(es?"Proponer recurso":"Suggest a resource")}</span></Link>
      </div>
      <div className={styles.toolbar}>
        <div className={styles.search}><MagnifyingGlass size={20} aria-hidden="true"/><input type="search" value={query} onChange={(event)=>setQuery(event.target.value)} placeholder={es?"Busca: db, imágenes, audio, AI…":"Search: db, images, audio, AI…"} aria-label={es?"Buscar recursos":"Search resources"} autoComplete="off"/>{query&&<button type="button" aria-label={es?"Borrar búsqueda":"Clear search"} onClick={()=>setQuery("")}><X size={16}/></button>}</div>
        <label className={styles.select}><span>{es?"Tema":"Topic"}</span><select value={tag} onChange={(event)=>setTag(event.target.value)}><option value="">{es?"Todos los temas":"All topics"}</option>{tags.map((item)=><option key={item} value={item}>{item}</option>)}</select></label>
        <label className={styles.select}><span>{es?"Formato":"Format"}</span><select value={format} onChange={(event)=>setFormat(event.target.value as typeof format)}><option value="">{es?"Todos los formatos":"All formats"}</option>{formats.map((item)=><option key={item.value} value={item.value}>{item[locale]}</option>)}</select></label>
      </div>
      <div className={styles.quickTags} aria-label={es?"Filtros rápidos":"Quick filters"}>{quickTags.filter((item)=>tags.some((value)=>canonicalTag(value)===canonicalTag(item.tag))).map((item)=><button key={item.tag} type="button" aria-pressed={canonicalTag(tag)===canonicalTag(item.tag)} onClick={()=>setTag(canonicalTag(tag)===canonicalTag(item.tag)?"":item.tag)}>{item[locale]}</button>)}</div>
      <div className={styles.resultBar}><p role="status" aria-live="polite">{visible.length} {visible.length===1?(es?"recurso":"resource"):(es?"recursos":"resources")}{query&&<> · “{query}”</>}</p><div className={styles.resultActions}>{hasFilters&&<button type="button" onClick={reset}>{es?"Quitar filtros":"Reset filters"}<X size={12}/></button>}<select aria-label={es?"Ordenar recursos":"Sort resources"} value={sort} onChange={(event)=>setSort(event.target.value as typeof sort)}><option value="curated">{es?"Orden de la selección":"Curated order"}</option><option value="az">{es?"Nombre A–Z":"Name A–Z"}</option></select></div></div>
      {error&&<div role="status" className={styles.dataNotice}>{error}<button type="button" onClick={()=>void refresh()}>{es?"Reintentar":"Retry"}</button></div>}
      {visible.length?<div className={styles.grid}>{visible.map((resource,index)=><ResourceCard key={resource.id} resource={resource} index={index} locale={locale} onOpen={setViewing}/>)}</div>:<div className={styles.empty}><FolderSimple size={38} weight="thin"/><h2>{es?"No hay marcadores con estos filtros.":"No bookmarks found."}</h2><p>{es?"Prueba otra búsqueda o quita los filtros.":"Try a different search or clear the filters."}</p><button type="button" onClick={reset}>{es?"Quitar filtros":"Reset filters"}</button></div>}
    </section>
    {viewing&&<ResourceViewer resource={viewing} onClose={()=>setViewing(null)}/>}
  </main>;
}
