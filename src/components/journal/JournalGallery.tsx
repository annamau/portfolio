"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ArrowLeft, ArrowRight, ArrowsOut, X } from "@phosphor-icons/react";
import { useLanguage } from "@/contexts/LanguageContext";
import type { JournalGallery as Gallery } from "@/lib/journal/galleries";
import styles from "./JournalGallery.module.css";

export default function JournalGallery({ postId, name }: { postId?: string; name: string }) {
  const { locale } = useLanguage();
  const es = locale === "es";
  const [gallery, setGallery] = useState<Gallery | null>(null);
  const [active, setActive] = useState(0);
  const [attempt, setAttempt] = useState(0);
  const [failed, setFailed] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const pointer = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    if (!postId) return;
    const controller = new AbortController();
    async function load() {
      try {
        const response = await fetch(`/api/resources/journal/galleries/${encodeURIComponent(postId!)}/${encodeURIComponent(name)}`, { cache: "no-store", signal: controller.signal });
        if (!response.ok) throw new Error("Gallery unavailable");
        const result = await response.json();
        if (!controller.signal.aborted) { setGallery(result.gallery); setFailed(false); }
      } catch {
        if (!controller.signal.aborted) setFailed(true);
      }
    }
    void load();
    return () => controller.abort();
  }, [postId, name, attempt]);

  if (!postId) return null;
  if (!gallery) return <div className={styles.placeholder} role="status">
    <p>{failed ? (es ? "No se han podido cargar las pinturas." : "The paintings could not be loaded.") : (es ? "Preparando las pinturas…" : "Loading the paintings…")}</p>
    {failed && <button type="button" onClick={() => setAttempt(attempt + 1)}>{es ? "Reintentar" : "Try again"}</button>}
  </div>;

  const { images } = gallery;
  const image = images[active];
  const count = `${String(active + 1).padStart(2, "0")} / ${String(images.length).padStart(2, "0")}`;
  function move(step: number) { setActive((current) => (current + step + images.length) % images.length); }
  const previousLabel = es ? "Pintura anterior" : "Previous painting";
  const nextLabel = es ? "Siguiente pintura" : "Next painting";

  return <section
    className={styles.gallery}
    aria-label={gallery.title}
    aria-roledescription={es ? "carrusel" : "carousel"}
    data-journal-gallery=""
    onKeyDown={(event) => {
      if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
        event.preventDefault();
        move(event.key === "ArrowLeft" ? -1 : 1);
      }
    }}
  >
    <header className={styles.heading}>
      <span>{es ? "DEL ÁLBUM FAMILIAR" : "FROM THE FAMILY ALBUM"}</span>
      <h3>{gallery.title}</h3>
    </header>
    <div
      className={styles.stage}
      onPointerDown={(event) => { pointer.current = { x: event.clientX, y: event.clientY }; }}
      onPointerCancel={() => { pointer.current = null; }}
      onPointerUp={(event) => {
        const start = pointer.current;
        pointer.current = null;
        if (!start) return;
        const dx = event.clientX - start.x;
        const dy = event.clientY - start.y;
        if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.3) move(dx < 0 ? 1 : -1);
      }}
    >
      <Image key={active} className={styles.painting} src={image.src} alt={image.alt} width={image.width} height={image.height} unoptimized draggable={false} />
      <button className={styles.enlarge} type="button" onClick={() => dialog.current?.showModal()} aria-label={es ? "Ampliar pintura" : "Enlarge painting"}>
        <ArrowsOut size={16} aria-hidden="true" /><span>{es ? "Ampliar" : "View larger"}</span>
      </button>
    </div>
    <div className={styles.navigation}>
      <div className={styles.label} aria-live="polite" aria-atomic="true"><span>{count}</span><strong>{image.title}</strong></div>
      <div className={styles.arrows}>
        <button type="button" onClick={() => move(-1)} aria-label={previousLabel}><ArrowLeft size={19} aria-hidden="true" /></button>
        <button type="button" onClick={() => move(1)} aria-label={nextLabel}><ArrowRight size={19} aria-hidden="true" /></button>
      </div>
    </div>
    <div className={styles.thumbnails} aria-label={es ? "Elegir una pintura" : "Choose a painting"}>
      {images.map((item, index) => <button type="button" key={index} aria-label={`${es ? "Ver" : "View"} ${item.title}`} aria-current={active === index ? "true" : undefined} onClick={() => setActive(index)}>
        <Image src={item.src} alt="" fill sizes="150px" unoptimized draggable={false} />
      </button>)}
    </div>
    <dialog ref={dialog} className={styles.lightbox} aria-label={es ? "Pintura ampliada" : "Enlarged painting"} onClick={(event) => { if (event.target === event.currentTarget) dialog.current?.close(); }}>
      <div className={styles.lightboxHeader}><span>{image.title}</span><button type="button" aria-label={es ? "Cerrar" : "Close"} onClick={() => dialog.current?.close()}><X size={22} aria-hidden="true" /></button></div>
      <Image className={styles.largePainting} src={image.src} alt={image.alt} width={image.width} height={image.height} unoptimized draggable={false} />
      <div className={styles.lightboxFooter}><button type="button" aria-label={previousLabel} onClick={() => move(-1)}><ArrowLeft size={22} aria-hidden="true" /></button><span aria-live="polite">{count}</span><button type="button" aria-label={nextLabel} onClick={() => move(1)}><ArrowRight size={22} aria-hidden="true" /></button></div>
    </dialog>
  </section>;
}
