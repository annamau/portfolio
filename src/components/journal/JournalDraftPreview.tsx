"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import type { JournalPost } from "@/lib/journal/model";
import { useLanguage } from "@/contexts/LanguageContext";
import JournalEntry from "./JournalEntry";
import styles from "./Journal.module.css";
export default function JournalDraftPreview({ id }: { id: string }) {
  const { locale } = useLanguage(); const es = locale === "es"; const [post, setPost] = useState<JournalPost | null>(null); const [error, setError] = useState("");
  useEffect(() => { let active = true; void (async () => {
    try { const response = await fetch("/api/resources/journal?scope=owner", { cache: "no-store" }); const data = await response.json(); if (!response.ok) throw new Error(es ? "Accede para ver este borrador." : "Sign in to view this draft."); const found = data.posts.find((item: JournalPost) => item.id === id); if (!found) throw new Error(es ? "Entrada no encontrada." : "Entry not found."); if (active) setPost(found); }
    catch (error) { if (active) setError(error instanceof Error ? error.message : "Could not load draft."); }
  })(); return () => { active = false; }; }, [id, es]);
  if (error) return <section className={styles.reading}><p role="alert">{error}</p><Link href={`/blog/write?post=${encodeURIComponent(id)}`}>{es ? "Acceso de propietario" : "Owner sign-in"} ↗</Link></section>;
  if (!post) return <p className={styles.reading} role="status">{es ? "Cargando vista previa…" : "Loading preview…"}</p>;
  return <><aside className={styles.draftBanner}><span>{post.status === "draft" ? (es ? "Borrador privado" : "Private draft") : (es ? "Vista previa" : "Preview")}</span><Link href={`/blog/write?post=${post.id}`}>{es ? "Editar" : "Edit"} ↗</Link></aside><JournalEntry post={{ ...post, publishedAt: post.publishedAt || post.createdAt }}/></>;
}
