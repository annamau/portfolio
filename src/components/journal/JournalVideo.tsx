"use client";

import { useState } from "react";
import Image from "next/image";
import { useLanguage } from "@/contexts/LanguageContext";
import styles from "./Journal.module.css";

export default function JournalVideo({ id, title }: { id: string; title: string }) {
  const [playing, setPlaying] = useState(false);
  const { locale } = useLanguage();
  const spanish = locale === "es";

  return <>
    <div className={styles.videoStage}>
      {playing ? (
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1`}
          title={title}
          referrerPolicy="strict-origin-when-cross-origin"
          allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
          allowFullScreen
          ref={(frame) => { frame?.focus(); }}
        />
      ) : (
        <button type="button" onClick={() => setPlaying(true)} aria-label={`${spanish ? "Reproducir" : "Play"} ${title}`}>
          <Image src={`https://i.ytimg.com/vi/${id}/hqdefault.jpg`} alt="" fill unoptimized sizes="(max-width: 768px) 100vw, 720px" />
          <span className={styles.videoPlay} aria-hidden="true">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
          </span>
          <span className={styles.videoTitle}>{title}</span>
        </button>
      )}
    </div>
    <a className={styles.videoSource} href={`https://www.youtube.com/watch?v=${id}`} target="_blank" rel="noopener noreferrer">
      {spanish ? "Ver en YouTube" : "Watch on YouTube"} ↗
    </a>
  </>;
}
