"use client";
import { useState } from "react";
import Image from "next/image";
import styles from "./Journal.module.css";
export default function JournalCover({ url, title }: { url: string; title: string }) {
  const [failed, setFailed] = useState(false);
  return url && !failed ? <div className={styles.cover}><Image src={url} alt={title} width={1200} height={675} unoptimized onError={() => setFailed(true)} /></div> : null;
}
