"use client";
import Image from "next/image";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import styles from "./Journal.module.css";
export default function JournalShell({ children }: { children: React.ReactNode }) {
  const { locale, setLocale } = useLanguage(); const es = locale === "es";
  return <main className={styles.page}><header className={styles.header}>
    <Link href="/" className={styles.brand}><Image src="/logo-anm.svg" width={38} height={38} alt="" priority /><span>Andrés Naves</span></Link>
    <nav aria-label={es ? "Secciones" : "Sections"}><Link href="/">{es ? "Proyectos" : "Projects"}</Link><Link href="/resources">{es ? "Recursos" : "Resources"}</Link><Link href="/blog" aria-current="page">{es ? "Diario" : "Journal"}</Link></nav>
    <button className={styles.language} onClick={() => setLocale(es ? "en" : "es")} aria-label={es ? "Switch to English" : "Cambiar a español"}>{es ? "EN" : "ES"}</button>
  </header>{children}<footer className={styles.footer}><span>Andrés Naves</span></footer></main>;
}
