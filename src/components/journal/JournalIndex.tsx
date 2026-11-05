"use client";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import type { publicPost } from "@/lib/journal/model";
import JournalCover from "./JournalCover";
import styles from "./Journal.module.css";
type Post = ReturnType<typeof publicPost>;
export default function JournalIndex({ posts }: { posts: Post[] }) {
  const { locale } = useLanguage(); const es = locale === "es";
  return <section className={styles.content}><div className={styles.masthead}><p className={styles.kicker}>ANDRÉS NAVES · {es ? "APUNTES PERSONALES" : "PERSONAL NOTES"}</p><h1>{es ? "Diario" : "Journal"}<i>.</i></h1><p className={styles.subtitle}>{es ? "Juegos, curiosidades y otras notas." : "Games, curiosities & other notes."}</p></div>
    {posts.length ? <div className={styles.entries}>{posts.map((post, index) => <article key={post.slug} className={styles.entry}><span className={styles.number}>{String(posts.length - index).padStart(2, "0")}</span><Link href={`/blog/${post.slug}`} className={styles.entryLink}><div className={styles.meta}><time dateTime={post.publishedAt}>{new Date(post.publishedAt!).toLocaleDateString(locale, { year: "numeric", month: "short", day: "numeric" })}</time>{post.topic && <span>{post.topic}</span>}<span>{Math.max(1, Math.ceil(post.body.split(/\s+/).length / 220))} min</span></div><h2>{post.title}<span>↗</span></h2>{post.summary && <p>{post.summary}</p>}<JournalCover url={post.cover} title={post.title} /></Link></article>)}</div> : <div className={styles.empty}><span aria-hidden="true">01 /</span><p>{es ? "Aún no hay entradas." : "No entries yet."}</p></div>}
  </section>;
}
