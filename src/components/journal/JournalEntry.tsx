"use client";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import type { publicPost } from "@/lib/journal/model";
import JournalBody from "./JournalBody";
import JournalCover from "./JournalCover";
import styles from "./Journal.module.css";
export default function JournalEntry({ post }: { post: ReturnType<typeof publicPost> }) {
  const { locale } = useLanguage(); const es = locale === "es";
  return <article className={styles.reading}><Link className={styles.back} href="/blog">← {es ? "Todas las entradas" : "All entries"}</Link><div className={styles.meta}><time dateTime={post.publishedAt}>{new Date(post.publishedAt!).toLocaleDateString(locale, { year: "numeric", month: "long", day: "numeric" })}</time>{post.topic && <span>{post.topic}</span>}<span>{Math.max(1, Math.ceil(post.body.split(/\s+/).length / 220))} min</span></div><h1>{post.title}</h1>{post.summary && <p className={styles.dek}>{post.summary}</p>}<JournalCover url={post.cover} title={post.title}/><JournalBody body={post.body} postId={post.id}/><p className={styles.signature}>Andrés</p></article>;
}
