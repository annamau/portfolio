"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { CalendarBlank, GithubLogo, LinkedinLogo } from "@phosphor-icons/react";
import { useLanguage } from "@/contexts/LanguageContext";

export default function Nav() {
  const { locale, setLocale } = useLanguage();

  return (
    <motion.nav
      className="dynamic-island"
      aria-label="Primary navigation"
      initial={{ opacity: 0, y: -50, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
    >
      <span className="island-animated-border" aria-hidden="true" />
      <span className="island-glass-highlight" aria-hidden="true" />

      <Link href="/" className="island-brand" aria-label="Andrés Naves, home">
        <span className="island-logo">
          <Image src="/logo-anm.svg" alt="" width={36} height={36} priority />
        </span>
        <span className="island-name">
          Andrés<span className="island-period">.</span>
        </span>
      </Link>

      <span className="island-divider" aria-hidden="true" />

      <div className="island-status">
        <span />
        {locale === "es" ? "Disponible para proyectos" : "Available for projects"}
      </div>

      <span className="island-divider island-divider--right" aria-hidden="true" />

      <div className="island-actions">
        <a
          href={process.env.NEXT_PUBLIC_GITHUB || "https://github.com/annamau"}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="GitHub"
        >
          <GithubLogo size={17} weight="bold" />
        </a>
        <a
          href={process.env.NEXT_PUBLIC_LINKEDIN || "https://www.linkedin.com/in/andres-naves/"}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="LinkedIn"
        >
          <LinkedinLogo size={17} weight="bold" />
        </a>
        <button
          type="button"
          className="language-switch"
          onClick={() => setLocale(locale === "en" ? "es" : "en")}
          aria-label={locale === "en" ? "Cambiar a español" : "Switch to English"}
        >
          {locale === "en" ? "ES" : "EN"}
        </button>
        <a
          href="https://calendly.com/a-naves-mauri"
          target="_blank"
          rel="noopener noreferrer"
          className="island-contact"
          aria-label={locale === "es" ? "Agendar una conversación" : "Schedule a conversation"}
        >
          <CalendarBlank size={18} weight="bold" />
        </a>
      </div>
    </motion.nav>
  );
}
