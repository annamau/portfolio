"use client";
import { useState } from "react";
import { resourceCollections } from "@/data/resources";
import type { ResourceCategory } from "@/data/resources";
import { useLanguage } from "@/contexts/LanguageContext";
import forms from "./ResourceDialogs.module.css";
import styles from "./ResourceSuggestions.module.css";

export default function ResourceSuggestionForm({ initialCategory, initialUrl = "" }: { initialCategory: ResourceCategory; initialUrl?: string }) {
  const { locale } = useLanguage(); const es = locale === "es";
  const [busy, setBusy] = useState(false); const [error, setError] = useState(""); const [sent, setSent] = useState(false);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); const form = event.currentTarget; setBusy(true); setError("");
    try {
      const data = Object.fromEntries(new FormData(form));
      const response = await fetch("/api/resources/suggestions", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      const result = await response.json(); if (!response.ok) throw new Error(result.error);
      form.reset(); setSent(true);
    } catch (error) { setError(error instanceof Error ? error.message : "Please try again."); }
    finally { setBusy(false); }
  }
  return <div className={styles.submission}>
    <p className={styles.caption}>{es ? "Revisado antes de publicarse." : "Reviewed before publishing."}</p>
    {sent ? <div role="status" className={styles.receipt}><h2>{es ? "Propuesta recibida." : "Suggestion received."}</h2><button type="button" className={forms.secondary} onClick={() => setSent(false)}>{es ? "Enviar otra" : "Send another"}</button></div> : <form onSubmit={submit} className={`${forms.form} ${styles.form}`}>
      <label>{es ? "Recurso o idea" : "Resource or idea"}<input name="title" required maxLength={160} autoComplete="off" /></label>
      <label>{es ? "Enlace (opcional)" : "Link (optional)"}<input name="url" type="url" maxLength={2048} defaultValue={initialUrl} placeholder="https://…" /></label>
      <label>{es ? "Carpeta" : "Folder"}<select name="category" defaultValue={initialCategory}>{resourceCollections.map((group) => <option key={group.id} value={group.id}>{group.name[locale]}</option>)}</select></label>
      <label>{es ? "¿Por qué añadirlo?" : "Why add it?"}<textarea name="note" required maxLength={1500} rows={4} /></label>
      <div className={styles.honeypot} aria-hidden="true"><label>Company<input name="company" tabIndex={-1} autoComplete="off" /></label></div>
      {error && <p role="alert" className={forms.error}>{error}</p>}
      <button type="submit" className={forms.primary} disabled={busy}>{busy ? (es ? "Enviando…" : "Sending…") : (es ? "Enviar propuesta" : "Submit suggestion")}</button>
    </form>}
  </div>;
}
