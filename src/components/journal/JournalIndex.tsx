"use client";

import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import type { publicPost } from "@/lib/journal/model";
import JournalCover from "./JournalCover";
import styles from "./Journal.module.css";

type Post = ReturnType<typeof publicPost>;

export default function JournalIndex({ posts }: { posts: Post[] }) {
  const { locale } = useLanguage();
  const es = locale === "es";

  return <section className={styles.content}>
    <header className={styles.masthead}>
      <h1>{es ? "Diario" : "Journal"}<span aria-hidden="true">.</span></h1>
      <p>{es ? "Juegos, cine y cosas que me dan curiosidad." : "Games, film, and things I get curious about."}</p>
    </header>
    {posts.length > 0 ? <div className={styles.entries}>
      {posts.map((post) => {
        const headingId = `entry-${post.slug}`;
        const date = post.publishedAt && new Date(post.publishedAt);
        const minutes = Math.max(1, Math.ceil(post.body.split(/\s+/).length / 220));

        return <article key={post.slug} className={styles.entry}>
          <Link href={`/blog/${post.slug}`} aria-labelledby={headingId} className={styles.entryLink}>
            <div className={styles.entryCopy}>
              <div className={styles.meta}>
                {date && <time dateTime={post.publishedAt}>{date.toLocaleDateString(locale, { year: "numeric", month: "short", day: "numeric" })}</time>}
                {post.topic && <span>{post.topic}</span>}
                <span>{minutes} min</span>
              </div>
              <h2 id={headingId}>{post.title}<span aria-hidden="true">↗</span></h2>
              {post.summary && <p>{post.summary}</p>}
            </div>
            <JournalCover url={post.cover} title="" />
          </Link>
        </article>;
      })}
    </div> : <div className={styles.empty}>
      <p>{es ? "Aún no hay entradas." : "No entries yet."}</p>
    </div>}
  </section>;
}
