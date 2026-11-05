"use client";
import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import styles from "./Journal.module.css";
export default function JournalSpoiler({ children }: { children: React.ReactNode }) {
  const [revealed, setRevealed] = useState(false); const { locale } = useLanguage();
  function reveal() { setRevealed(true); }
  return <span className={styles.spoiler} data-revealed={revealed} role={revealed ? undefined : "button"} tabIndex={revealed ? undefined : 0} aria-label={revealed ? undefined : locale === "es" ? "Revelar spoiler" : "Reveal spoiler"} aria-expanded={revealed ? undefined : false} onClick={reveal} onKeyDown={(event) => { if (!revealed && (event.key === "Enter" || event.key === " ")) { event.preventDefault(); reveal(); } }}><span data-spoiler-content="" inert={!revealed} aria-hidden={revealed ? undefined : true}>{children}</span></span>;
}
