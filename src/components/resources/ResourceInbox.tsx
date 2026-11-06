"use client";
import { useState } from "react";
import Link from "next/link";
import { DownloadSimple, Lightbulb, LockSimple, MagnifyingGlass, Plus } from "@phosphor-icons/react";
import type { Resource, ResourceCategory } from "@/data/resources";
import type { SavedResource } from "@/lib/resources/model";
import { useLanguage } from "@/contexts/LanguageContext";
import { useResourceData } from "./ResourceData";
import ResourceSidebar from "./ResourceSidebar";
import ResourceCard from "./ResourceCard";
import ResourceCapture from "./ResourceCapture";
import ResourceSuggestionForm from "./ResourceSuggestionForm";
import ResourceSuggestionQueue from "./ResourceSuggestionQueue";
import ResourceViewer from "./ResourceViewer";
import styles from "./ResourceLibrary.module.css";
import forms from "./ResourceDialogs.module.css";

export default function ResourceInbox({ initialAdd=false, initialUrl="", initialCategory="ideas", ownerEntry=false }: { initialAdd?: boolean; initialUrl?: string; initialCategory?: ResourceCategory; ownerEntry?: boolean }) {
  const {locale}=useLanguage();const es=locale==="es";
  const {entries,session,error:dataError,refresh}=useResourceData();
  const [editing,setEditing]=useState<SavedResource|"new"|null>(initialAdd||initialUrl?"new":null);
  const [viewing,setViewing]=useState<Resource|null>(null);
  const [tab,setTab]=useState<"draft"|"published"|"suggestions">("draft");
  const [query,setQuery]=useState("");
  const [password,setPassword]=useState("");
  const [busy,setBusy]=useState("");
  const [error,setError]=useState("");
  const [notice,setNotice]=useState("");
  const visible=entries.filter((entry)=>entry.status===tab&&`${entry.name} ${entry.url} ${entry.tags.join(" ")} ${entry.privateNotes}`.toLowerCase().includes(query.toLowerCase()));
  async function login(event:React.FormEvent){
    event.preventDefault();setBusy("login");setError("");
    try{const response=await fetch("/api/resources/session",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({password})});const data=await response.json();if(!response.ok)throw new Error(data.error);setPassword("");await refresh();}catch(error){setError(error instanceof Error?error.message:"Sign in failed.");}finally{setBusy("");}
  }
  async function action(entry:SavedResource,action:"publish"|"unpublish"){
    setBusy(entry.id);setError("");setNotice("");
    try{const response=await fetch(`/api/resources/${entry.id}`,{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify({version:entry.version,action})});const data=await response.json();if(!response.ok)throw new Error(data.error);await refresh();setNotice(action==="publish"?(es?"Publicado en el directorio.":"Published in the directory."):(es?"Devuelto a la bandeja privada.":"Moved back to your private inbox."));}catch(error){setError(error instanceof Error?error.message:"This resource could not be updated.");}finally{setBusy("");}
  }
  async function logout(){await fetch("/api/resources/session",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({action:"logout"})});await refresh();}
  function exportLinks(){const links=entries.filter((entry)=>entry.url.startsWith("https://"));const url=URL.createObjectURL(new Blob([JSON.stringify(links,null,2)],{type:"application/json"}));const anchor=document.createElement("a");anchor.href=url;anchor.download="resource-links.json";anchor.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
  return <main className={styles.page}>
    <ResourceSidebar inbox onAdd={()=>setEditing("new")}/>
    <section className={styles.directory} aria-labelledby="inbox-heading">
      <div className={styles.folderHeading}><h1 id="inbox-heading">{session?.authenticated||ownerEntry?<LockSimple size={25} weight="duotone"/>:<Lightbulb size={25} weight="duotone"/>}{session?.authenticated?(es?"Revisar bandeja":"Review inbox"):ownerEntry?(es?"Acceso de propietario":"Owner sign-in"):(es?"Proponer recurso":"Suggest a resource")}</h1>{session?.authenticated&&<button type="button" aria-label={es?"Añadir recurso":"Add resource"} className={styles.addButton} onClick={()=>setEditing("new")}><Plus size={17}/><span>{es?"Añadir recurso":"Add resource"}</span></button>}</div>
      {(!session||dataError)&&<div className={styles.dataNotice} role="status">{dataError|| (es?"Abriendo tu bandeja…":"Opening your inbox…")}{dataError&&<button type="button" onClick={()=>void refresh()}>{es?"Reintentar":"Retry"}</button>}</div>}
      {session&&!session.authenticated&&!ownerEntry&&<ResourceSuggestionForm initialCategory={initialCategory} initialUrl={initialUrl}/>}
      {session&&!session.authenticated&&ownerEntry&&<form onSubmit={login} className={`${forms.form} ${styles.login}`}>
        <p>{es?"Accede para guardar y revisar recursos antes de publicarlos.":"Sign in to save and review resources before publishing."}</p>
        {session.configured?<><label>{es?"Contraseña de propietario":"Owner password"}<input type="password" autoComplete="current-password" value={password} onChange={(event)=>setPassword(event.target.value)} required/></label><button className={forms.primary} type="submit" disabled={!!busy}>{busy?(es?"Accediendo…":"Signing in…"):(es?"Entrar":"Sign in")}</button></>:<p>{es?"El acceso de propietario necesita configurarse en esta web.":"Owner access needs to be configured on this deployment."}</p>}
      </form>}
      {session?.authenticated&&<>
        <Link className={styles.addButton} href="/blog/write">{es?"Escribir en el diario":"Write in the journal"}</Link>
        <div className={styles.inboxTools}><div className={styles.statusTabs}>{(["draft","published","suggestions"] as const).map((status)=><button key={status} type="button" aria-pressed={tab===status} onClick={()=>setTab(status)}>{status==="draft"?(es?"Por revisar":"To review"):status==="published"?(es?"Publicados":"Published"):(es?"Propuestas":"Suggestions")}{status!=="suggestions"&&<span>{entries.filter((entry)=>entry.status===status).length}</span>}</button>)}</div><button type="button" onClick={exportLinks}><DownloadSimple size={14}/>{es?"Exportar enlaces":"Export links"}</button>{!session.local&&<button type="button" onClick={()=>void logout()}>{es?"Salir":"Sign out"}</button>}</div>
        {tab==="suggestions"?<ResourceSuggestionQueue/>:<>
        <div className={styles.search}><MagnifyingGlass size={19}/><input type="search" value={query} onChange={(event)=>setQuery(event.target.value)} aria-label={es?"Buscar en la bandeja":"Search inbox"} placeholder={es?"Busca entre lo que has guardado…":"Find something you’ve saved…"}/></div>
        {notice&&<p role="status" className={styles.successNotice}>{notice}</p>}
        {error&&<p role="alert" className={forms.error}>{error}</p>}
        <p className={styles.resultBar}>{visible.length} {es?"recursos":"resources"}</p>
        {visible.length?<div className={styles.grid}>{visible.map((entry,index)=><div key={entry.id} className={styles.inboxEntry}>
          <ResourceCard resource={entry} index={index} locale={locale} onOpen={setViewing}/>
          {entry.privateNotes&&<details className={styles.privateNotes}><summary>{es?"Notas privadas":"Private notes"}</summary><p>{entry.privateNotes}</p></details>}
          <div className={styles.entryActions}>{entry.status==="draft"?<><button type="button" onClick={()=>setEditing(entry)} disabled={!!busy}>{es?"Revisar y editar":"Review & edit"}</button><button type="button" className={styles.publishButton} disabled={!!busy} onClick={()=>void action(entry,"publish")}>{busy===entry.id?(es?"Publicando…":"Publishing…"):(es?"Publicar":"Publish")}</button></>:<button type="button" disabled={!!busy} onClick={()=>void action(entry,"unpublish")}>{es?"Mover a la bandeja":"Move to inbox"}</button>}</div>
        </div>)}</div>:<div className={styles.empty}><LockSimple size={32} weight="thin"/><h2>{query?(es?"Sin resultados.":"No matches."):(es?"No hay borradores.":"No drafts yet.")}</h2><p>{es?"Pega un enlace, sube un archivo o importa tus marcadores.":"Paste a link, upload a file or import your bookmarks."}</p><button type="button" onClick={()=>setEditing("new")}><Plus size={16}/>{es?"Guardar un recurso":"Save a resource"}</button></div>}
        </>}
      </>}
      {error&&!session?.authenticated&&<p role="alert" className={forms.error}>{error}</p>}
    </section>
    {editing&&session?.authenticated&&<ResourceCapture entry={editing==="new"?undefined:editing} initialUrl={initialUrl} initialCategory={initialCategory} onClose={()=>setEditing(null)} onSaved={setNotice}/>}
    {viewing&&<ResourceViewer resource={viewing} onClose={()=>setViewing(null)}/>}
  </main>;
}
