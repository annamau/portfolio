"use client";
import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import styles from "./Journal.module.css";
export default function JournalSpoiler({ children }: { children: React.ReactNode }) {
  const [revealed, setRevealed] = useState(false); const { locale } = useLanguage(); const es = locale === "es";
  return <span className={styles.spoilerGroup}><button type="button" className={styles.spoiler} data-revealed={revealed} aria-expanded={revealed} onClick={() => setRevealed(!revealed)}>{revealed ? (es ? "Ocultar spoiler" : "Hide spoiler") : (es ? "Revelar spoiler" : "Reveal spoiler")}</button>{revealed && <span className={styles.spoilerRevealed}>{children}</span>}</span>;
}
