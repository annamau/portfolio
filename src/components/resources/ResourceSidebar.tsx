"use client";
import Image from "next/image";
import Link from "next/link";
import { BookmarkSimple, FolderSimple, Lightbulb, LockSimple, Plus } from "@phosphor-icons/react";
import { resourceCollections } from "@/data/resources";
import type { ResourceCategory } from "@/data/resources";
import { useLanguage } from "@/contexts/LanguageContext";
import { useResourceData } from "./ResourceData";
import styles from "./ResourceLibrary.module.css";

export default function ResourceSidebar({ category, inbox = false, onAdd }: { category?: ResourceCategory; inbox?: boolean; onAdd?: () => void }) {
  const { locale, setLocale } = useLanguage();
  const { resources, entries, session } = useResourceData();
  const es = locale === "es";
  return <aside className={styles.sidebar}>
    <Link href="/" className={styles.ownerBrand} aria-label={es ? "Andrés Naves, volver a los proyectos" : "Andrés Naves, back to projects"}>
      <Image src="/logo-anm.svg" width={36} height={36} alt="" priority />
      <span>Andrés Naves<small>{es ? "Proyectos y recursos" : "Projects & resources"}</small></span>
    </Link>
    {session?.authenticated && (onAdd ? <button type="button" onClick={onAdd} className={styles.sidebarAdd}><Plus size={16} aria-hidden="true" />{es ? "Añadir recurso" : "Add resource"}</button> : <Link href={`/resources/inbox?${session?.authenticated?"add=1":""}${category ? `&folder=${category}` : ""}`} className={styles.sidebarAdd}><Plus size={16} aria-hidden="true" />{session?.authenticated?(es ? "Añadir recurso" : "Add resource"):(es?"Proponer recurso":"Suggest a resource")}</Link>)}
    <nav className={styles.collections} aria-label={es ? "Carpetas de recursos" : "Resource folders"}>
      <span className={styles.folderLabel}>{es ? "Carpetas" : "Folders"}</span>
      <Link href="/resources" aria-current={!category && !inbox ? "page" : undefined}><BookmarkSimple size={17} aria-hidden="true" />{es ? "Todos los recursos" : "All resources"}<span>{resources.length}</span></Link>
      {resourceCollections.map((group) => <Link key={group.id} href={`/resources/${group.id}`} aria-current={category === group.id ? "page" : undefined}><FolderSimple size={17} weight="duotone" color={category === group.id ? undefined : group.color} aria-hidden="true" />{group.name[locale]}<span>{resources.filter((resource) => resource.category === group.id).length}</span></Link>)}
      <Link href="/resources/inbox" className={styles.inboxLink} aria-current={inbox ? "page" : undefined}>{session?.authenticated?<LockSimple size={17} aria-hidden="true" />:<Lightbulb size={17} aria-hidden="true" />}{session?.authenticated?(es ? "Revisar bandeja" : "Review inbox"):(es?"Proponer recurso":"Suggest a resource")}{session?.authenticated && <span>{entries.filter((entry) => entry.status === "draft").length}</span>}</Link>
    </nav>
    <div className={styles.sidebarFooter}>
      {session?.authenticated&&<span>{es ? "Acceso de propietario" : "Owner access"}</span>}
      <button type="button" onClick={() => setLocale(es ? "en" : "es")} aria-label={es ? "Switch to English" : "Cambiar a español"}>{es ? "EN" : "ES"}</button>
    </div>
  </aside>;
}
