"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import type { JournalPost } from "@/lib/journal/model";
import { journalSlug } from "@/lib/journal/permalinks";
import { useLanguage } from "@/contexts/LanguageContext";
import JournalBody from "./JournalBody";
import forms from "../resources/ResourceDialogs.module.css";
import styles from "./Journal.module.css";
const blank = { title: "", summary: "", body: "", topic: "", cover: "" };
export default function JournalEditor({ initialPostId = "" }: { initialPostId?: string }) {
  const { locale } = useLanguage(); const es = locale === "es";
  const [owner, setOwner] = useState<boolean | null>(null); const [password, setPassword] = useState("");
  const [posts, setPosts] = useState<JournalPost[]>([]); const [post, setPost] = useState<JournalPost | null>(null); const [content, setContent] = useState(blank);
  const [busy, setBusy] = useState(false); const [error, setError] = useState(""); const [notice, setNotice] = useState(""); const [preview, setPreview] = useState(false);
  async function refreshPosts() {
    const response = await fetch("/api/resources/journal?scope=owner", { cache: "no-store" }); const data = await response.json();
    if (!response.ok) throw new Error(data.error); setPosts(data.posts); return data.posts as JournalPost[];
  }
  useEffect(() => {
    let active = true;
    void (async () => { try {
      const response = await fetch("/api/resources/session", { cache: "no-store" }); if (!response.ok) throw new Error("Could not check owner access.");
      const data = await response.json(); if (!active) return; setOwner(data.authenticated);
      if (data.authenticated) {
        const response = await fetch("/api/resources/journal?scope=owner", { cache: "no-store" }); const result = await response.json(); if (!response.ok) throw new Error(result.error); if (!active) return; setPosts(result.posts);
        const initial = result.posts.find((item: JournalPost) => item.id === initialPostId); if (initial) selectPost(initial);
      }
    } catch (error) { if (active) setError(error instanceof Error ? error.message : "Could not load editor."); } })();
    return () => { active = false; };
  }, [initialPostId]);
  async function login(event: React.FormEvent) {
    event.preventDefault(); setBusy(true); setError("");
    try { const response = await fetch("/api/resources/session", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password }) }); const data = await response.json(); if (!response.ok) throw new Error(data.error); setPassword(""); setOwner(true); const entries = await refreshPosts(); const initial = entries.find((item) => item.id === initialPostId); if (initial) selectPost(initial); }
    catch (error) { setError(error instanceof Error ? error.message : "Sign in failed."); } finally { setBusy(false); }
  }
  function selectPost(value: JournalPost | null) { setPost(value); setContent(value ? { title: value.title, summary: value.summary, body: value.body, topic: value.topic, cover: value.cover } : blank); setNotice(""); setError(""); setPreview(false); }
  async function save(action: "save" | "publish" | "unpublish") {
    setBusy(true); setError(""); setNotice("");
    try {
      const response = await fetch("/api/resources/journal", { method: post ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...content, action, id: post?.id, version: post?.version }) }); const data = await response.json();
      if (!response.ok) throw new Error(data.error); selectPost(data.post); await refreshPosts();
      setNotice(data.post.status === "published" ? (es ? "Publicado." : "Published.") : (es ? "Borrador privado guardado." : "Private draft saved."));
    } catch (error) { setError(error instanceof Error ? error.message : "Could not save entry."); } finally { setBusy(false); }
  }
  const labels = { title: es ? "Título" : "Title", summary: es ? "Resumen (opcional)" : "Summary (optional)", topic: es ? "Tema (opcional)" : "Topic (optional)", cover: es ? "URL de portada (opcional)" : "Cover URL (optional)" };
  return <section className={styles.editor}><h1>{es ? "Escribir" : "Write"}<span className={styles.editorStatus}>{post?.status === "published" ? (es ? "PUBLICADO" : "PUBLISHED") : (es ? "BORRADOR PRIVADO" : "PRIVATE DRAFT")}</span></h1>
    {error && <p role="alert" className={forms.error}>{error}</p>}{notice && <p role="status" className={styles.notice}>{notice}</p>}
    {owner === null ? <p role="status">{es ? "Comprobando acceso…" : "Checking access…"}</p> : !owner ? <form className={forms.form} onSubmit={login}><label>{es ? "Contraseña de propietario" : "Owner password"}<input type="password" value={password} autoComplete="current-password" onChange={(event) => setPassword(event.target.value)} required /></label><button className={forms.primary} disabled={busy}>{es ? "Entrar" : "Sign in"}</button></form> : <div className={styles.editorGrid}>
      <form className={forms.form} onSubmit={(event) => { event.preventDefault(); void save("save"); }}>
        <label>{labels.title}<input required maxLength={160} value={content.title} onChange={(event) => setContent({ ...content, title: event.target.value })}/></label>
        <label>{labels.summary}<textarea rows={2} maxLength={280} value={content.summary} onChange={(event) => setContent({ ...content, summary: event.target.value })}/></label>
        <div className={forms.twoColumns}>{(["topic", "cover"] as const).map((key) => <label key={key}>{labels[key]}<input type={key === "cover" ? "url" : "text"} maxLength={key === "cover" ? 2048 : 60} value={content[key]} onChange={(event) => setContent({ ...content, [key]: event.target.value })}/></label>)}</div>
        <label>{es ? "Entrada" : "Entry"}<textarea className={styles.writingArea} rows={18} required maxLength={40_000} value={content.body} onChange={(event) => setContent({ ...content, body: event.target.value })}/><small>{es ? "Párrafos separados por una línea vacía. # Título · - Lista · > Cita · >!Spoiler!<" : "Separate paragraphs with a blank line. # Heading · - List · > Quote · >!Spoiler!<"}</small></label>
        <div className={styles.actions}><button className={forms.primary} disabled={busy} type="submit">{busy ? (es ? "Guardando…" : "Saving…") : post?.status === "published" ? (es ? "Guardar cambios" : "Save changes") : (es ? "Guardar borrador" : "Save draft")}</button>{post && <button className={forms.secondary} disabled={busy} type="button" onClick={() => void save(post.status === "published" ? "unpublish" : "publish")}>{post.status === "published" ? (es ? "Retirar publicación" : "Unpublish") : (es ? "Publicar" : "Publish")}</button>}<button className={forms.secondary} type="button" onClick={() => setPreview(!preview)}>{preview ? (es ? "Ocultar vista previa" : "Hide preview") : (es ? "Vista previa" : "Preview")}</button></div>
        {post && <Link className={styles.back} href={`/blog/preview/${post.id}`}>{es ? "Vista previa completa" : "Full preview"} ↗</Link>}
        {post?.status === "published" && <Link className={styles.back} href={`/blog/${journalSlug(post.slug)}`}>{es ? "Abrir entrada" : "View entry"} ↗</Link>}
        {preview && <section aria-label={es ? "Vista previa" : "Preview"}><h2>{content.title}</h2><JournalBody body={content.body} postId={post?.id}/></section>}
      </form>
      <aside className={styles.postList}><button disabled={busy} onClick={() => selectPost(null)}>+ {es ? "Nueva entrada" : "New entry"}</button>{posts.map((item) => <button disabled={busy} aria-pressed={post?.id === item.id} key={item.id} onClick={() => selectPost(item)}>{item.title}<small>{item.status === "published" ? (es ? "Publicado" : "Published") : (es ? "Borrador" : "Draft")}</small></button>)}</aside>
    </div>}
  </section>;
}
