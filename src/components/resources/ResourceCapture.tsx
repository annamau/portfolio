"use client";
import { useState } from "react";
import { DownloadSimple, FileArrowUp, LinkSimple } from "@phosphor-icons/react";
import { resourceCollections, resources } from "@/data/resources";
import type { ResourceCategory, ResourceKind } from "@/data/resources";
import type { SavedResource } from "@/lib/resources/model";
import { useLanguage } from "@/contexts/LanguageContext";
import { kindLabel } from "./resource-labels";
import { useResourceData } from "./ResourceData";
import ResourceDialog from "./ResourceDialog";
import styles from "./ResourceDialogs.module.css";

const kinds: ResourceKind[] = ["tool","library","learning","inspiration","post","article","video","audio","image","file"];
export default function ResourceCapture({ entry, initialUrl = "", initialCategory = "ideas", onClose, onSaved }: { entry?: SavedResource; initialUrl?: string; initialCategory?: ResourceCategory; onClose: () => void; onSaved: (message: string) => void }) {
  const { locale } = useLanguage();
  const es = locale === "es";
  const { refresh } = useResourceData();
  const [mode, setMode] = useState<"link" | "upload" | "import">("link");
  const [url, setUrl] = useState(entry?.url || initialUrl);
  const [name, setName] = useState(entry?.name || "");
  const [description, setDescription] = useState(entry?.description[locale] || "");
  const [category, setCategory] = useState<ResourceCategory>(entry?.category || initialCategory);
  const [kind, setKind] = useState<ResourceKind>(entry?.kind || "tool");
  const [tags, setTags] = useState(entry?.tags.join(", ") || "");
  const [notes, setNotes] = useState(entry?.privateNotes || "");
  const [file, setFile] = useState<File | null>(null);
  const [cover, setCover] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [error, setError] = useState("");
  const urls = url.split(/\r?\n/).map((item) => item.trim()).filter(Boolean);
  const suggestions = [...new Set(resources.flatMap((resource) => resource.tags))].sort();

  async function details() {
    if (urls.length !== 1) return;
    setLoadingPreview(true); setError("");
    try {
      const response = await fetch("/api/resources/preview", { method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({url:urls[0]}) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setUrl(data.url); if (!name) setName(data.name); if (!description) setDescription(data.description);
      if (kind === "tool") setKind(data.kind); if (!tags) setTags(data.tags.join(", "));
    } catch (error) { setError(error instanceof Error ? error.message : "Could not read this link."); }
    finally { setLoadingPreview(false); }
  }
  async function save(event: React.FormEvent) {
    event.preventDefault(); setBusy(true); setError("");
    try {
      const data = { url:urls[0],name:name || undefined,description:entry ? {...entry.description,[locale]:description} : description,category,kind,tags:tags.split(",").map((tag)=>tag.trim()).filter(Boolean),privateNotes:notes };
      let response: Response;
      if (entry) {
        response = await fetch(`/api/resources/${entry.id}`, {method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify({...data,version:entry.version,action:"save"})});
      } else if (mode === "upload" || (cover && urls.length === 1 && mode === "link")) {
        const selected = mode === "upload" ? file : cover;
        if (!selected) throw new Error(es ? "Selecciona un archivo." : "Choose a file.");
        const form = new FormData(); form.set("data",JSON.stringify(data));form.set("file",selected);form.set("role",mode === "upload" ? "attachment" : "cover");
        response=await fetch("/api/resources",{method:"POST",body:form});
      } else {
        let items: unknown[];
        if (mode === "import") {
          if (!file) throw new Error(es ? "Selecciona una exportación JSON o HTML." : "Choose a JSON or HTML export.");
          if (file.size > 2*1024*1024) throw new Error(es ? "La exportación debe ser menor de 2 MB." : "Use an export smaller than 2 MB.");
          const text=await file.text();
          if (/\.html?$/i.test(file.name)) {
            const document = new DOMParser().parseFromString(text,"text/html");
            items=[...document.querySelectorAll("a[href]")].map((anchor)=>({url:anchor.getAttribute("href"),name:anchor.textContent?.trim() || undefined,category,kind,tags:data.tags}));
          } else {
            const parsed=JSON.parse(text);const list=Array.isArray(parsed)?parsed:parsed.resources;
            if(!Array.isArray(list))throw new Error(es?"El JSON debe contener una lista de recursos.":"The JSON must contain a resource list.");
            items=list.map((item: string | Record<string,unknown>)=>typeof item==="string"?{url:item,category,kind,tags:data.tags}:item);
          }
        } else {
          if(!urls.length)throw new Error(es?"Pega un enlace.":"Paste a link.");
          items=urls.map((item)=>({...data,url:item,name:urls.length===1?data.name:undefined,kind:/https:\/\/(?:www\.)?(?:x|twitter)\.com\//i.test(item)&&kind==="tool"?"post":kind}));
        }
        if(items.length>50)throw new Error(es?"Importa hasta 50 enlaces cada vez.":"Import up to 50 links at a time.");
        response=await fetch("/api/resources",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({items})});
      }
      const result=await response.json();
      if(!response.ok)throw new Error(result.error);
      await refresh();
      const count=entry?1:result.resources.length;
      onSaved(`${es?"Guardados en tu bandeja privada":"Saved to your private inbox"}: ${count}${result.duplicates?` · ${result.duplicates} ${es?"duplicados omitidos":"duplicates skipped"}`:""}`);
      onClose();
    } catch(error) { setError(error instanceof Error?error.message:"The resource could not be saved."); }
    finally { setBusy(false); }
  }
  return <ResourceDialog title={entry ? es?"Editar recurso":"Edit resource" : es?"Guardar un recurso":"Save a resource"} onClose={onClose}>
    <p className={styles.intro}>{es?"Primero se guarda en privado. Revisa los detalles y publícalo cuando quieras.":"Save privately first. Review the details and publish when you’re ready."}</p>
    {!entry && <div className={styles.tabs}>{(["link","upload","import"] as const).map((item)=><button key={item} type="button" aria-pressed={mode===item} onClick={()=>{setMode(item);setFile(null);setError("");}}>{item==="link"?<LinkSimple size={15}/>:<FileArrowUp size={15}/>}{{link:es?"Enlace":"Link",upload:es?"Archivo":"Upload",import:es?"Importar":"Import"}[item]}</button>)}</div>}
    <form onSubmit={save} className={styles.form}>
      {(mode==="link"||entry) && <label>{es?"Enlace":"Link"}<textarea value={url} onChange={(event)=>setUrl(event.target.value)} rows={2} required readOnly={!!entry?.file} placeholder="https://…"/><small>{es?"Puedes pegar varios enlaces, uno por línea.":"Paste one link, or several on separate lines."}</small></label>}
      {mode==="link" && !entry?.file && urls.length===1 && <button className={styles.secondary} type="button" onClick={details} disabled={loadingPreview}>{loadingPreview?(es?"Leyendo…":"Reading…"):(es?"Completar detalles del enlace":"Get link details")}</button>}
      {mode!=="link" && !entry && <label className={styles.upload}><FileArrowUp size={28} weight="thin"/>{mode==="import"?(es?"Exportación de marcadores":"Bookmark export"):(es?"Imagen, audio, vídeo o PDF":"Image, audio, video or PDF")}<input type="file" required accept={mode==="import"?".json,.html,.htm":"image/png,image/jpeg,image/webp,image/gif,audio/mpeg,audio/wav,audio/ogg,audio/mp4,audio/webm,video/mp4,video/webm,application/pdf"} onChange={(event)=>{const selected=event.target.files?.[0]||null;setFile(selected);if(selected&&!name&&mode==="upload")setName(selected.name.replace(/\.[^.]+$/,""));}}/><small>{mode==="import"?(es?"JSON o HTML de Chrome · hasta 50 enlaces":"JSON or Chrome HTML · up to 50 links"):(es?"Hasta 4 MB · también puedes guardar el enlace de vídeos grandes":"Up to 4 MB · save a link for larger videos")}</small></label>}
      {mode!=="import" && <label>{es?"Nombre":"Name"}<input value={name} onChange={(event)=>setName(event.target.value)} maxLength={160} placeholder={es?"Un nombre que recuerdes":"A name you’ll remember"}/></label>}
      <div className={styles.twoColumns}><label>{es?"Carpeta":"Folder"}<select value={category} onChange={(event)=>setCategory(event.target.value as ResourceCategory)}>{resourceCollections.map((group)=><option key={group.id} value={group.id}>{group.name[locale]}</option>)}</select></label><label>{es?"Tipo":"Type"}<select value={kind} disabled={!!entry?.file} onChange={(event)=>setKind(event.target.value as ResourceKind)}>{kinds.map((item)=><option key={item} value={item}>{kindLabel(item,locale)}</option>)}</select></label></div>
      {mode!=="import" && <label>{es?"Descripción pública":"Public description"}<textarea rows={3} value={description} onChange={(event)=>setDescription(event.target.value)} maxLength={1500} placeholder={es?"Por qué merece la pena abrirlo":"Why it’s worth opening"}/></label>}
      <label>{es?"Etiquetas":"Tags"}<input value={tags} onChange={(event)=>setTags(event.target.value)} list="resource-tag-options" placeholder="AI, Database, Images…"/><small>{es?"Separadas por comas. Puedes crear etiquetas nuevas.":"Separate with commas. You can add your own tags."}</small><datalist id="resource-tag-options">{suggestions.map((tag)=><option key={tag} value={tag}/>)}</datalist></label>
      {mode==="link" && !entry && urls.length===1 && <label className={styles.optionalCover}>{es?"Imagen de portada (opcional)":"Cover image (optional)"}<input type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={(event)=>setCover(event.target.files?.[0]||null)}/></label>}
      <label>{es?"Notas privadas":"Private notes"}<textarea rows={2} value={notes} onChange={(event)=>setNotes(event.target.value)} maxLength={4000} placeholder={es?"Solo para ti. No se publican.":"Just for you. These aren’t published."}/></label>
      {error && <p role="alert" className={styles.error}>{error}</p>}
      <div className={styles.actions}><button type="button" className={styles.secondary} onClick={onClose} disabled={busy}>{es?"Cancelar":"Cancel"}</button><button type="submit" className={styles.primary} disabled={busy}><DownloadSimple size={16}/>{busy?(es?"Guardando…":"Saving…"):(es?"Guardar en la bandeja":"Save to inbox")}</button></div>
    </form>
  </ResourceDialog>;
}
