"use client";
import { useEffect, useRef } from "react";
import { X } from "@phosphor-icons/react";
import { useLanguage } from "@/contexts/LanguageContext";
import styles from "./ResourceDialogs.module.css";
export default function ResourceDialog({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const { locale } = useLanguage();
  useEffect(() => {
    const dialog = ref.current!;
    const previous = document.activeElement as HTMLElement | null;
    dialog.showModal();
    const overflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    return () => { dialog.close(); document.documentElement.style.overflow = overflow; previous?.focus(); };
  }, []);
  return <dialog ref={ref} className={styles.dialog} aria-label={title} onCancel={(event) => { event.preventDefault(); onClose(); }} onClick={(event) => { if (event.target !== event.currentTarget) return; const bounds = event.currentTarget.getBoundingClientRect(); if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) onClose(); }}>
    <div className={styles.heading}><h2>{title}</h2><button type="button" onClick={onClose} aria-label={locale === "es" ? "Cerrar" : "Close"}><X size={19} /></button></div>
    {children}
  </dialog>;
}
