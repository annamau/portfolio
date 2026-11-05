"use client";
import { useCallback, useEffect, useReducer, useRef, useState } from "react";
import Image from "next/image";
import { DownloadSimple, FileArrowUp, LinkSimple } from "@phosphor-icons/react";
import { resourceCollections, resources } from "@/data/resources";
import type { ResourceCategory, ResourceKind } from "@/data/resources";
import type { SavedResource } from "@/lib/resources/model";
import { captureReducer, captureState, type CaptureFields } from "@/lib/resources/capture-prefill";
import { useLanguage } from "@/contexts/LanguageContext";
import { kindLabel } from "./resource-labels";
import { useResourceData } from "./ResourceData";
import ResourceDialog from "./ResourceDialog";
import styles from "./ResourceDialogs.module.css";

const kinds: ResourceKind[] = ["tool","library","learning","inspiration","post","article","video","audio","image","file"];
export default function ResourceCapture({ entry, initialUrl = "", initialCategory = "ideas", initialName = "", initialDescription = "", onClose, onSaved }: { entry?: SavedResource; initialUrl?: string; initialCategory?: ResourceCategory; initialName?: string; initialDescription?: string; onClose: () => void; onSaved: (message: string) => void }) {
  const { locale } = useLanguage();
  const es = locale === "es";
  const { refresh } = useResourceData();
  const [mode, setMode] = useState<"link" | "upload" | "import">("link");
  const [capture, dispatch] = useReducer(captureReducer, captureState({ url:entry?.url || initialUrl, name:entry?.name || initialName, description:entry?.description[locale] || initialDescription, category:entry?.category || initialCategory, kind:entry?.kind || "tool", tags:entry?.tags.join(", ") || "", image:"" }, !!entry));
  const { url, name, description, category, kind, tags, image } = capture.fields;
  const edit = (field: keyof CaptureFields, value: string) => dispatch({ type:"edit",field,value });
  const [notes, setNotes] = useState(entry?.privateNotes || "");
  const [file, setFile] = useState<File | null>(null);
  const [cover, setCover] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [preview, setPreview] = useState({ url:"",status:"idle",thumbnail:"" });
  const pending = useRef<AbortController | null>(null);
  const [error, setError] = useState("");
  const urls = url.split(/\r?\n/).map((item) => item.trim()).filter(Boolean);
  const singleUrl = urls.length === 1 ? urls[0] : "";
  const loadingPreview = mode === "link" && (preview.url === singleUrl && preview.status === "loading" || !entry && /^https:\/\/\S+$/i.test(singleUrl) && preview.url !== singleUrl);
  const suggestions = [...new Set(resources.flatMap((resource) => resource.tags))].sort();

  const details = useCallback(async (requestedUrl: string) => {
    if (!requestedUrl) return;
    pending.current?.abort();
    const controller = new AbortController(); pending.current = controller;
    setPreview({ url:requestedUrl,status:"loading",thumbnail:"" }); setError("");
    try {
      const response = await fetch("/api/resources/preview", { method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({url:requestedUrl}),signal:controller.signal });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      if (controller.signal.aborted) return;
      dispatch({ type:"prefill",url:requestedUrl,details:data });
      setPreview({ url:requestedUrl,status:"ready",thumbnail:data.thumbnail || "" });
    } catch (error) {
      if (controller.signal.aborted) return;
      setError(error instanceof Error ? error.message : "Could not read this link. You can enter the details yourself.");
      setPreview({ url:requestedUrl,status:"failed",thumbnail:"" });
    }
  }, []);
  useEffect(() => {
    const timer = !entry && mode === "link" && /^https:\/\/\S+$/i.test(singleUrl) ? setTimeout(() => void details(singleUrl), 600) : undefined;
    return () => { clearTimeout(timer); pending.current?.abort(); };
  }, [singleUrl, mode, entry, details]);
  async function save(event: React.FormEvent) {
    event.preventDefault(); if (loadingPreview) return; setBusy(true); setError("");
    try {
      const data = { url:urls[0],name:name || undefined,description:entry ? {...entry.description,[locale]:description} : description,category,kind,tags:tags.split(",").map((tag)=>tag.trim()).filter(Boolean),privateNotes:notes,coverUrl:!entry && !cover && image ? image : undefined };
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
      onSaved(`${es?"Guardados en tu bandeja privada":"Saved to your private inbox"}: ${count}${result.duplicates?` · ${result.duplicates} ${es?"duplicados omitidos":"duplicates skipped"}`:""}${result.warnings?.length ? ` · ${es?"No se pudo guardar la imagen de la página.":"The page image could not be saved."}` : ""}`);
      onClose();
    } catch(error) { setError(error instanceof Error?error.message:"The resource could not be saved."); }
    finally { setBusy(false); }
  }
  return <ResourceDialog title={entry ? es?"Editar recurso":"Edit resource" : es?"Guardar un recurso":"Save a resource"} onClose={onClose}>
    <p className={styles.intro}>{es?"Primero se guarda en privado. Revisa los detalles y publícalo cuando quieras.":"Save privately first. Review the details and publish when you’re ready."}</p>
    {!entry && <div className={styles.tabs}>{(["link","upload","import"] as const).map((item)=><button key={item} type="button" aria-pressed={mode===item} onClick={()=>{setMode(item);setFile(null);setError("");}}>{item==="link"?<LinkSimple size={15}/>:<FileArrowUp size={15}/>}{{link:es?"Enlace":"Link",upload:es?"Archivo":"Upload",import:es?"Importar":"Import"}[item]}</button>)}</div>}
    <form onSubmit={save} className={styles.form}>
      {(mode==="link"||entry) && <label>{es?"Enlace":"Link"}<textarea value={url} onChange={(event)=>edit("url",event.target.value)} rows={2} required readOnly={!!entry?.file} placeholder="https://…"/><small>{es?"Un enlace completa los detalles. También puedes pegar varios, uno por línea.":"One link fills the details. You can also paste several on separate lines."}</small></label>}
      {mode==="link" && !entry?.file && urls.length===1 && <><button className={styles.secondary} type="button" onClick={()=>void details(singleUrl)} disabled={loadingPreview}>{loadingPreview?(es?"Leyendo…":"Reading…"):(es?"Completar detalles del enlace":"Get link details")}</button>{preview.url===singleUrl&&preview.status==="ready"&&<small role="status">{es?"Detalles encontrados. Puedes editarlos antes de guardar.":"Details found. You can edit them before saving."}</small>}</>}
      {mode!=="link" && !entry && <label className={styles.upload}><FileArrowUp size={28} weight="thin"/>{mode==="import"?(es?"Exportación de marcadores":"Bookmark export"):(es?"Imagen, audio, vídeo o PDF":"Image, audio, video or PDF")}<input type="file" required accept={mode==="import"?".json,.html,.htm":"image/png,image/jpeg,image/webp,image/gif,audio/mpeg,audio/wav,audio/ogg,audio/mp4,audio/webm,video/mp4,video/webm,application/pdf"} onChange={(event)=>{const selected=event.target.files?.[0]||null;setFile(selected);if(selected&&!name&&mode==="upload")edit("name",selected.name.replace(/\.[^.]+$/,""));}}/><small>{mode==="import"?(es?"JSON o HTML de Chrome · hasta 50 enlaces":"JSON or Chrome HTML · up to 50 links"):(es?"Hasta 4 MB · también puedes guardar el enlace de vídeos grandes":"Up to 4 MB · save a link for larger videos")}</small></label>}
      {mode!=="import" && <label>{es?"Nombre":"Name"}<input value={name} onChange={(event)=>edit("name",event.target.value)} maxLength={160} placeholder={es?"Un nombre que recuerdes":"A name you’ll remember"}/></label>}
      <div className={styles.twoColumns}><label>{es?"Carpeta":"Folder"}<select value={category} onChange={(event)=>edit("category",event.target.value)}>{resourceCollections.map((group)=><option key={group.id} value={group.id}>{group.name[locale]}</option>)}</select></label><label>{es?"Tipo":"Type"}<select value={kind} disabled={!!entry?.file} onChange={(event)=>edit("kind",event.target.value)}>{kinds.map((item)=><option key={item} value={item}>{kindLabel(item,locale)}</option>)}</select></label></div>
      {mode!=="import" && <label>{es?"Descripción pública":"Public description"}<textarea rows={3} value={description} onChange={(event)=>edit("description",event.target.value)} maxLength={1500} placeholder={es?"Por qué merece la pena abrirlo":"Why it’s worth opening"}/></label>}
      <label>{es?"Etiquetas":"Tags"}<input value={tags} onChange={(event)=>edit("tags",event.target.value)} list="resource-tag-options" placeholder="AI, Database, Images…"/><small>{es?"Separadas por comas. Puedes crear etiquetas nuevas.":"Separate with commas. You can add your own tags."}</small><datalist id="resource-tag-options">{suggestions.map((tag)=><option key={tag} value={tag}/>)}</datalist></label>
      {mode==="link"&&!entry&&image&&!cover&&preview.thumbnail&&<div className={styles.pageImage}><Image src={preview.thumbnail} alt={es?"Imagen de la página":"Page image"} width={160} height={84} unoptimized/><div><span>{es?"Imagen de la página":"Page image"}</span><button type="button" onClick={()=>edit("image","")}>{es?"Quitar":"Remove"}</button></div></div>}
      {mode==="link" && !entry && urls.length===1 && <label className={styles.optionalCover}>{es?"Imagen de portada (opcional)":"Cover image (optional)"}<input type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={(event)=>setCover(event.target.files?.[0]||null)}/></label>}
      <label>{es?"Notas privadas":"Private notes"}<textarea rows={2} value={notes} onChange={(event)=>setNotes(event.target.value)} maxLength={4000} placeholder={es?"Solo para ti. No se publican.":"Just for you. These aren’t published."}/></label>
      {error && <p role="alert" className={styles.error}>{error}</p>}
      <div className={styles.actions}><button type="button" className={styles.secondary} onClick={onClose} disabled={busy}>{es?"Cancelar":"Cancel"}</button><button type="submit" className={styles.primary} disabled={busy||loadingPreview}><DownloadSimple size={16}/>{busy?(es?"Guardando…":"Saving…"):(es?"Guardar en la bandeja":"Save to inbox")}</button></div>
    </form>
  </ResourceDialog>;
}
