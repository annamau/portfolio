"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import {
  ArrowUpRight,
  CaretLeft,
  CaretRight,
  ListDashes,
  Pause,
  Play,
  Plus,
  X,
} from "@phosphor-icons/react";
import { projects, getProjectUrl } from "@/data/projects";
import { useLanguage } from "@/contexts/LanguageContext";
import type { Project } from "@/lib/types";

const AUTOPLAY_MS = 8000;

const copy = {
  en: {
    eyebrow: "SELECTED WORK · VALENCIA",
    titleA: "Things I’ve designed,",
    titleB: "built",
    titleC: "and learned from.",
    intro:
      "A personal collection of products, experiments and digital systems—across AI, healthcare, hospitality, insurance and the spaces in between.",
    cta: "Browse the collection",
    player: "PROJECT JUKEBOX",
    nowPlaying: "NOW PLAYING",
    open: "Open project",
    private: "Private build",
    knowMore: "Know more",
    close: "Close sleeve",
    flip: "Flip the sleeve",
    front: "SIDE A · COVER",
    back: "SIDE B · LINER NOTES",
    trackProject: "THE PROJECT",
    trackSystem: "THE SYSTEM",
    trackUses: "IN USE",
    trackStatus: "CURRENT STATUS",
    trackRole: "MY ROLE",
    trackGenre: "GENRE",
    sleeveHint: "Click the sleeve to turn it over",
    collectionLabel: "THE COLLECTION",
    select: "Select a record",
    pause: "Pause autoplay",
    play: "Start autoplay",
    previous: "Previous project",
    next: "Next project",
  },
  es: {
    eyebrow: "TRABAJO SELECCIONADO · VALENCIA",
    titleA: "Proyectos que he",
    titleB: "diseñado",
    titleC: "y construido.",
    intro:
      "Una colección personal de productos, experimentos y sistemas digitales en IA, salud, hostelería, seguros y los espacios intermedios.",
    cta: "Ver la colección",
    player: "JUKEBOX DE PROYECTOS",
    nowPlaying: "REPRODUCIENDO",
    open: "Abrir proyecto",
    private: "Proyecto privado",
    knowMore: "Saber más",
    close: "Cerrar carpeta",
    flip: "Girar la carpeta",
    front: "CARA A · PORTADA",
    back: "CARA B · NOTAS",
    trackProject: "EL PROYECTO",
    trackSystem: "EL SISTEMA",
    trackUses: "USOS",
    trackStatus: "ESTADO ACTUAL",
    trackRole: "MI PAPEL",
    trackGenre: "GÉNERO",
    sleeveHint: "Pulsa la carpeta para darle la vuelta",
    collectionLabel: "LA COLECCIÓN",
    select: "Elige un disco",
    pause: "Pausar reproducción",
    play: "Iniciar reproducción",
    previous: "Proyecto anterior",
    next: "Proyecto siguiente",
  },
} as const;

function ProjectMark({
  project,
  size,
  className = "",
}: {
  project: Project;
  size: number;
  className?: string;
}) {
  if (project.logo) {
    return (
      <Image
        src={project.logo}
        alt={`${project.title} logo`}
        width={size}
        height={size}
        className={`${className} project-mark project-mark--${project.logoStyle || "mark"}`}
      />
    );
  }

  return (
    <strong className={`${className} project-mark project-mark--monogram`}>
      {project.monogram}
    </strong>
  );
}

export default function PortfolioHero() {
  const { locale } = useLanguage();
  const text = copy[locale];
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [sleeveOpen, setSleeveOpen] = useState(false);
  const [sleeveFlipped, setSleeveFlipped] = useState(false);
  const [isPortraitMobile, setIsPortraitMobile] = useState(false);

  const activeProject = projects[activeIndex];
  const activeUrl = getProjectUrl(activeProject);
  const recordStyle = useMemo(
    () =>
      ({
        "--record-accent": activeProject.accent,
        "--record-secondary": activeProject.accentSecondary,
      }) as React.CSSProperties,
    [activeProject],
  );

  const selectProject = useCallback((index: number) => {
    setActiveIndex((index + projects.length) % projects.length);
    setSleeveOpen(false);
    setSleeveFlipped(false);
  }, []);

  const closeSleeve = useCallback(() => {
    setSleeveOpen(false);
    setSleeveFlipped(false);
    setIsPlaying(true);
  }, []);

  const previousProject = useCallback(() => {
    setActiveIndex((current) => (current - 1 + projects.length) % projects.length);
  }, []);

  const nextProject = useCallback(() => {
    setActiveIndex((current) => (current + 1) % projects.length);
  }, []);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 620px) and (orientation: portrait)");
    const updateMobileDirection = () => setIsPortraitMobile(media.matches);
    updateMobileDirection();
    media.addEventListener("change", updateMobileDirection);
    return () => media.removeEventListener("change", updateMobileDirection);
  }, []);

  useEffect(() => {
    if (!isPlaying || sleeveOpen) return;
    const timer = window.setInterval(nextProject, AUTOPLAY_MS);
    return () => window.clearInterval(timer);
  }, [activeIndex, isPlaying, nextProject, sleeveOpen]);

  useEffect(() => {
    if (!sleeveOpen) return;
    const flipTimer = window.setTimeout(() => setSleeveFlipped(true), 1500);
    return () => window.clearTimeout(flipTimer);
  }, [sleeveOpen]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && sleeveOpen) {
        closeSleeve();
        return;
      }
      if (sleeveOpen) return;
      if (event.key === "ArrowLeft") previousProject();
      if (event.key === "ArrowRight") nextProject();
      if (event.key === " " && event.target === document.body) {
        event.preventDefault();
        setIsPlaying((playing) => !playing);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [closeSleeve, nextProject, previousProject, sleeveOpen]);

  return (
    <main className="portfolio-shell">
      <div className="paper-grain" aria-hidden="true" />
      <div className="ambient-orb ambient-orb--one" aria-hidden="true" />
      <div className="ambient-orb ambient-orb--two" aria-hidden="true" />

      <div className="portfolio-layout">
        <motion.article
          className="portfolio-intro"
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.08 }}
        >
          <p className="intro-eyebrow">
            <span />
            {text.eyebrow}
          </p>

          <h1>
            {text.titleA}{" "}
            <em>{text.titleB}</em>
            <br />
            {text.titleC}
          </h1>

          <p className="intro-copy">{text.intro}</p>

          <div className="intro-actions">
            <button
              type="button"
              className="primary-cta"
              onClick={() => {
                setLibraryOpen(true);
                setSleeveOpen(false);
              }}
            >
              {text.cta}
              <ListDashes size={17} weight="bold" />
            </button>
          </div>
        </motion.article>

        <motion.section
          className="project-jukebox"
          style={recordStyle}
          aria-label={text.player}
          initial={{ opacity: 0, x: 36, rotate: 0.8 }}
          animate={{ opacity: 1, x: 0, rotate: 0 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
        >
          <div className="jukebox-screw jukebox-screw--tl" aria-hidden="true" />
          <div className="jukebox-screw jukebox-screw--tr" aria-hidden="true" />
          <div className="jukebox-screw jukebox-screw--bl" aria-hidden="true" />
          <div className="jukebox-screw jukebox-screw--br" aria-hidden="true" />

          <header className="jukebox-header">
            <div>
              <span className="jukebox-kicker">
                <i className="header-live-dot" aria-hidden="true" />
                {text.nowPlaying}
              </span>
              <span className="jukebox-model">
                {activeProject.title} · {String(activeIndex + 1).padStart(2, "0")} /{" "}
                {String(projects.length).padStart(2, "0")}
              </span>
            </div>
            <div className="playing-indicator" aria-label={isPlaying ? text.pause : text.play}>
              {[0, 1, 2, 3].map((bar) => (
                <span
                  key={bar}
                  style={{ animationPlayState: isPlaying ? "running" : "paused" }}
                />
              ))}
            </div>
          </header>

          <div className="jukebox-stage">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeProject.id}
                className="project-notes"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                <div className="project-meta-row">
                  <p className="project-year">
                    {activeProject.year} · {activeProject.tags[0]}
                  </p>
                  <span className="project-status">
                    {locale === "es" ? activeProject.statusEs : activeProject.status}
                  </span>
                </div>
                <h2>{activeProject.title}</h2>
                <p className="project-tagline">
                  {locale === "es" && activeProject.taglineEs
                    ? activeProject.taglineEs
                    : activeProject.tagline}
                </p>
                <p className="project-description">{activeProject.description}</p>

                <div className="project-stack" aria-label="Technology">
                  {activeProject.techStack.slice(0, 4).map((technology) => (
                    <span key={technology}>{technology}</span>
                  ))}
                </div>

                <div className="project-actions">
                  <button
                    type="button"
                    className="project-details-button"
                    onClick={() => {
                      setSleeveFlipped(false);
                      setSleeveOpen(true);
                      setLibraryOpen(false);
                      setIsPlaying(false);
                    }}
                  >
                    <Plus size={13} weight="bold" />
                    {text.knowMore}
                  </button>

                  {activeUrl ? (
                    <a
                      className="project-link"
                      href={activeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {text.open}
                      <ArrowUpRight size={14} weight="bold" />
                    </a>
                  ) : (
                    <span className="project-link project-link--disabled">
                      <span className="private-dot" />
                      {text.private}
                    </span>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>

            <div className="turntable" aria-hidden="true">
              <div
                className={`vinyl-record ${isPlaying ? "vinyl-record--playing" : ""}`}
              >
                <div className="record-sheen" />
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeProject.id}
                    className="record-label"
                    initial={{ opacity: 0, scale: 0.82, rotate: -10 }}
                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                    exit={{ opacity: 0, scale: 0.82, rotate: 10 }}
                    transition={{ duration: 0.28 }}
                  >
                    <span className="label-series">ANDRÉS NAVES</span>
                    <ProjectMark
                      project={activeProject}
                      size={76}
                      className="record-project-mark"
                    />
                    <span className="label-title">{activeProject.title}</span>
                    <span className="label-speed">33⅓</span>
                  </motion.div>
                </AnimatePresence>
                <div className="record-spindle" />
              </div>

              <div className="tonearm-base">
                <div className="tonearm-pivot" />
                <motion.div
                  className="tonearm"
                  animate={{ rotate: isPlaying ? 18 : -7 }}
                  transition={{ type: "spring", stiffness: 90, damping: 14 }}
                >
                  <span className="tonearm-head" />
                </motion.div>
              </div>

              <div className="speed-switch">
                <span>33</span>
                <i />
                <span>45</span>
              </div>
            </div>
          </div>

          <div className="jukebox-controls">
            <div className="transport-controls">
              <button type="button" onClick={previousProject} aria-label={text.previous}>
                <CaretLeft size={17} weight="bold" />
              </button>
              <button
                type="button"
                className="play-control"
                onClick={() => setIsPlaying((playing) => !playing)}
                aria-label={isPlaying ? text.pause : text.play}
              >
                {isPlaying ? (
                  <Pause size={15} weight="fill" />
                ) : (
                  <Play size={15} weight="fill" />
                )}
              </button>
              <button type="button" onClick={nextProject} aria-label={text.next}>
                <CaretRight size={17} weight="bold" />
              </button>
            </div>

            <div className="playback-line" aria-hidden="true">
              <motion.span
                key={`${activeIndex}-${isPlaying}`}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: isPlaying ? 1 : 0 }}
                transition={{ duration: isPlaying ? AUTOPLAY_MS / 1000 : 0.2, ease: "linear" }}
              />
            </div>

            <button
              type="button"
              className={`library-toggle ${libraryOpen ? "library-toggle--open" : ""}`}
              onClick={() => setLibraryOpen((open) => !open)}
              aria-expanded={libraryOpen}
              aria-label={text.collectionLabel}
              aria-controls="record-library"
            >
              <ListDashes size={16} weight="bold" />
              <span>{text.collectionLabel}</span>
            </button>
          </div>

          <AnimatePresence>
            {sleeveOpen && (
              <motion.div
                className="sleeve-overlay"
                role="dialog"
                aria-modal="true"
                aria-label={`${activeProject.title} project details`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
              >
                <button
                  type="button"
                  className="sleeve-close"
                  onClick={closeSleeve}
                  aria-label={text.close}
                >
                  <X size={17} weight="bold" />
                </button>

                <div className="sleeve-scene">
                  <motion.div
                    className="sleeve-record-peek"
                    initial={{ x: "0%", y: 0, rotate: 0, opacity: 1, scale: 0.985 }}
                    animate={{
                      x: isPortraitMobile ? "0%" : "28%",
                      y: isPortraitMobile ? "30%" : 0,
                      rotate: isPortraitMobile ? -7 : 10,
                      scale: 1,
                    }}
                    transition={{
                      duration: 1.15,
                      delay: 0.22,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    aria-hidden="true"
                  >
                    <span>
                      <ProjectMark project={activeProject} size={46} />
                    </span>
                  </motion.div>

                  <button
                    type="button"
                    className={`album-sleeve ${sleeveFlipped ? "album-sleeve--flipped" : ""}`}
                    onClick={() => setSleeveFlipped((flipped) => !flipped)}
                    aria-label={text.flip}
                  >
                    <motion.span
                      className="album-sleeve-inner"
                      animate={{ rotateY: sleeveFlipped ? 180 : 0 }}
                      transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
                    >
                      <span className="album-face album-front">
                        <span className="album-catalog">
                          {String(activeIndex + 1).padStart(2, "0")} · {text.front}
                        </span>
                        <span className="album-front-mark">
                          <ProjectMark project={activeProject} size={104} />
                        </span>
                        <span className="album-front-copy">
                          <small>{activeProject.tags[0]}</small>
                          <strong>{activeProject.title}</strong>
                          <em>{activeProject.year}</em>
                        </span>
                      </span>

                      <span className="album-face album-back">
                        <span className="album-back-heading">
                          <small>{text.back}</small>
                          <strong>{activeProject.title}</strong>
                        </span>
                        <span className="sleeve-tracks">
                          <span className="sleeve-track">
                            <b>01</b>
                            <span>
                              <small>{text.trackProject}</small>
                              <em>{activeProject.description}</em>
                            </span>
                          </span>
                          <span className="sleeve-track">
                            <b>02</b>
                            <span>
                              <small>{text.trackSystem}</small>
                              <em>{activeProject.techStack.join(" · ")}</em>
                            </span>
                          </span>
                          <span className="sleeve-track">
                            <b>03</b>
                            <span>
                              <small>{text.trackUses}</small>
                              <em>{activeProject.uses.join(" · ")}</em>
                            </span>
                          </span>
                          <span className="sleeve-track">
                            <b>04</b>
                            <span>
                              <small>{text.trackStatus}</small>
                              <em>
                                {locale === "es"
                                  ? activeProject.statusEs
                                  : activeProject.status}
                              </em>
                            </span>
                          </span>
                          <span className="sleeve-track">
                            <b>05</b>
                            <span>
                              <small>{text.trackRole}</small>
                              <em>
                                {locale === "es" ? activeProject.roleEs : activeProject.role}
                              </em>
                            </span>
                          </span>
                        </span>
                        <span className="album-genre">
                          {text.trackGenre} · {activeProject.tags.join(" · ")}
                        </span>
                        <span className="album-barcode" aria-hidden="true" />
                      </span>
                    </motion.span>
                  </button>
                </div>

                <div className="sleeve-footer">
                  <span>{text.sleeveHint}</span>
                  {activeUrl && (
                    <a href={activeUrl} target="_blank" rel="noopener noreferrer">
                      {text.open}
                      <ArrowUpRight size={14} weight="bold" />
                    </a>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div
            id="record-library"
            className={`record-library ${libraryOpen ? "record-library--open" : ""}`}
            aria-label={text.select}
            aria-hidden={!libraryOpen}
          >
            {projects.map((project, index) => (
              <button
                key={project.id}
                type="button"
                className={index === activeIndex ? "is-active" : ""}
                onClick={() => {
                  selectProject(index);
                  setLibraryOpen(false);
                }}
                aria-label={`${String(index + 1).padStart(2, "0")} — ${project.title}`}
                aria-current={index === activeIndex ? "true" : undefined}
                tabIndex={libraryOpen ? 0 : -1}
                style={{ "--disc-color": project.accent } as React.CSSProperties}
              >
                <i>
                  {project.logo && (
                    <ProjectMark
                      project={project}
                      size={15}
                      className="mini-record-mark"
                    />
                  )}
                </i>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <b>{project.title}</b>
              </button>
            ))}
          </div>
        </motion.section>
      </div>
    </main>
  );
}
