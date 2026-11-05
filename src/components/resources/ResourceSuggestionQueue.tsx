"use client";
import { useEffect, useState } from "react";
import type { ResourceSuggestion } from "@/lib/resources/suggestions";
import { useLanguage } from "@/contexts/LanguageContext";
import ResourceCapture from "./ResourceCapture";
import forms from "./ResourceDialogs.module.css";
import styles from "./ResourceSuggestions.module.css";

export default function ResourceSuggestionQueue() {
  const { locale } = useLanguage(); const es = locale === "es";
  const [items, setItems] = useState<ResourceSuggestion[]>([]); const [error, setError] = useState(""); const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<ResourceSuggestion["status"]>("pending"); const [reviewing, setReviewing] = useState<ResourceSuggestion | null>(null); const [busy, setBusy] = useState(false);
  async function refresh() {
    try { const response = await fetch("/api/resources/suggestions", { cache: "no-store" }); const data = await response.json(); if (!response.ok) throw new Error(data.error); setItems(data.suggestions); }
    catch (error) { setError(error instanceof Error ? error.message : "Could not load suggestions."); }
    finally { setLoading(false); }
  }
  useEffect(() => { void refresh(); }, []);
  async function mark(item: ResourceSuggestion, status: ResourceSuggestion["status"]) {
    setBusy(true); setError("");
    try { const response = await fetch("/api/resources/suggestions", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: item.id, version: item.version, status }) }); const data = await response.json(); if (!response.ok) throw new Error(data.error); await refresh(); }
    catch (error) { setError(error instanceof Error ? error.message : "Could not update suggestion."); }
    finally { setBusy(false); }
  }
  return <>
    <label className={styles.filters}>{es ? "Estado" : "Status"}<select value={filter} onChange={(event) => setFilter(event.target.value as ResourceSuggestion["status"])}><option value="pending">{es ? "Pendientes" : "Pending"}</option><option value="reviewed">{es ? "Revisadas" : "Reviewed"}</option><option value="archived">{es ? "Archivadas" : "Archived"}</option></select></label>
    {error && <p role="alert" className={forms.error}>{error}</p>}
    {loading ? <p role="status">{es ? "Cargando…" : "Loading…"}</p> : <div className={styles.queue}>{items.filter((item) => item.status === filter).map((item) => <article key={item.id} className={styles.suggestion}>
      <h2>{item.title}</h2><small>{new Date(item.createdAt).toLocaleDateString(locale)} · {item.category}</small>
      {item.url && <p><a href={item.url} target="_blank" rel="noopener noreferrer">{item.url}</a></p>}<p>{item.note}</p>
      <div className={styles.actions}><button className={forms.primary} disabled={busy} onClick={() => setReviewing(item)}>{es ? "Crear borrador" : "Create draft"}</button>{item.status === "pending" && <button className={forms.secondary} disabled={busy} onClick={() => void mark(item, "reviewed")}>{es ? "Marcar revisada" : "Mark reviewed"}</button>}<button className={forms.secondary} disabled={busy} onClick={() => void mark(item, item.status === "archived" ? "pending" : "archived")}>{item.status === "archived" ? (es ? "Restaurar" : "Restore") : (es ? "Archivar" : "Archive")}</button></div>
    </article>)}{!items.some((item) => item.status === filter) && <p>{es ? "No hay propuestas en este estado." : "No suggestions with this status."}</p>}</div>}
    {reviewing && <ResourceCapture initialUrl={reviewing.url} initialName={reviewing.title} initialDescription={reviewing.note} initialCategory={reviewing.category} onClose={() => setReviewing(null)} onSaved={() => void mark(reviewing, "reviewed")} />}
  </>;
}
