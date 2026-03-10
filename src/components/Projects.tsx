"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { projects } from "@/data/projects";
import {
  ArrowSquareOut,
  X,
  ChartLineUp,
  Brain,
  Lightning,
  Newspaper,
  DeviceMobile,
  VideoCamera,
  FirstAidKit,
  Wine,
  Moon,
  Cube,
  Globe,
  Leaf,
  HardDrives,
} from "@phosphor-icons/react";
import type { Icon } from "@phosphor-icons/react";
import { Project } from "@/lib/types";
import { useLanguage } from "@/contexts/LanguageContext";

const iconMap: Record<string, Icon> = {
  ChartLineUp, Brain, Lightning, Newspaper, DeviceMobile,
  VideoCamera, FirstAidKit, Wine, Moon, Cube, Globe, Leaf, HardDrives,
};

const tierColors: Record<string, string> = {
  "heavy-ai": "bg-red-500/20 text-red-400 border-red-500/30",
  "medium-ai": "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  web: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  devops: "bg-green-500/20 text-green-400 border-green-500/30",
};

/* ─── Card dimensions (base, before scaling) ─── */
const CARD_W = 420;
const CARD_H = 540;
const CARD_W_SM = 300;
const CARD_H_SM = 500;
const N = projects.length;
const MOBILE_CARD_COUNT = 8;

/* ─── Scatter positions as viewport % ─── */
const SCATTER: { x: number; y: number; r: number }[] = [
  { x: 10, y: 32, r: -2.5 },
  { x: 28, y: 28, r: 1.8 },
  { x: 46, y: 34, r: -1.2 },
  { x: 64, y: 26, r: 2.2 },
  { x: 82, y: 30, r: -1.8 },
  { x: 8,  y: 54, r: 1.5 },
  { x: 26, y: 58, r: -2.0 },
  { x: 44, y: 52, r: 1.0 },
  { x: 62, y: 56, r: -1.5 },
  { x: 80, y: 50, r: 2.5 },
  { x: 16, y: 76, r: -1.0 },
  { x: 36, y: 72, r: 2.0 },
  { x: 58, y: 78, r: -2.2 },
  { x: 78, y: 74, r: 1.2 },
];

/* ─── Helpers ─── */
function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}
function smoothstep(t: number) {
  return t * t * (3 - 2 * t);
}

interface CardTransform {
  x: number;
  y: number;
  scale: number;
  rotate: number;
  opacity: number;
}

function getCardTransform(
  index: number,
  progress: number,
  vw: number,
  vh: number,
  dragOffset: number = 0,
  cardW: number = CARD_W,
  isMobile: boolean = false,
): CardTransform {
  /* ── On mobile, hide overflow cards during scatter/circle/arc ── */
  if (isMobile && index >= MOBILE_CARD_COUNT && progress < 0.48) {
    return { x: vw / 2, y: vh / 2, scale: 0, rotate: 0, opacity: 0 };
  }
  if (isMobile && index >= MOBILE_CARD_COUNT && progress < 0.55) {
    const fadeT = smoothstep((progress - 0.48) / 0.07);
    const CS = 0.95, CG = 16;
    const sp = cardW * CS + CG;
    const mg = cardW * CS / 2 + 20;
    return { x: mg + index * sp + dragOffset, y: vh * 0.50, scale: CS * fadeT, rotate: 0, opacity: fadeT };
  }

  /* ── Scatter ── */
  const s = SCATTER[index];
  const scX = (s.x / 100) * vw;
  const scY = (s.y / 100) * vh;
  const scS = isMobile ? 0.30 : 0.48;
  const scR = s.r;

  /* ── Circle ── */
  const visibleN = isMobile ? MOBILE_CARD_COUNT : N;
  const cAngle = -Math.PI / 2 + index * ((2 * Math.PI) / visibleN);
  const cR = Math.min(vw, vh) * (isMobile ? 0.28 : 0.24);
  const cX = vw / 2 + cR * Math.cos(cAngle);
  const cY = vh * 0.50 + cR * Math.sin(cAngle);
  const cS = isMobile ? 0.30 : 0.35;

  /* ── Arc ── */
  const arcN = isMobile ? MOBILE_CARD_COUNT : N;
  const at = index / (arcN - 1);
  const aX = (0.10 + at * 0.80) * vw;
  const aY = vh * 0.50 + vh * 0.15 * Math.sin(at * Math.PI);
  const aS =
    (isMobile ? 0.30 : 0.38) + 0.05 * (1 - Math.abs((index - (arcN - 1) / 2) / ((arcN - 1) / 2)));

  let x: number,
    y: number,
    scale: number,
    rotate: number,
    opacity = 1;

  if (progress <= 0.03) {
    // Entry — scale up from 0 (skip fade on mobile to avoid invisible cards)
    const t = isMobile ? 1 : progress / 0.03;
    x = scX;
    y = scY;
    scale = scS * t;
    rotate = scR;
    opacity = t;
  } else if (progress <= 0.12) {
    // Scatter hold
    x = scX;
    y = scY;
    scale = scS;
    rotate = scR;
  } else if (progress <= 0.24) {
    // Scatter → Circle
    const t = smoothstep((progress - 0.12) / 0.12);
    x = lerp(scX, cX, t);
    y = lerp(scY, cY, t);
    scale = lerp(scS, cS, t);
    rotate = lerp(scR, 0, t);
  } else if (progress <= 0.36) {
    // Circle hold
    x = cX;
    y = cY;
    scale = cS;
    rotate = 0;
  } else if (progress <= 0.48) {
    // Circle → Arc
    const t = smoothstep((progress - 0.36) / 0.12);
    x = lerp(cX, aX, t);
    y = lerp(cY, aY, t);
    scale = lerp(cS, aS, t);
    rotate = 0;
  } else if (progress <= 0.55) {
    // Arc → Carousel row
    const t = smoothstep((progress - 0.48) / 0.07);
    const CAROUSEL_SCALE = isMobile ? 0.95 : 0.85;
    const CAROUSEL_GAP = isMobile ? 16 : 24;
    const cardSpacing = cardW * CAROUSEL_SCALE + CAROUSEL_GAP;
    const margin = cardW * CAROUSEL_SCALE / 2 + (isMobile ? 20 : 60);
    const rowX = margin + index * cardSpacing + dragOffset;
    const rowY = isMobile ? vh * 0.49 : vh * 0.50;
    x = lerp(aX, rowX, t);
    y = lerp(aY, rowY, t);
    scale = lerp(aS, CAROUSEL_SCALE, t);
    rotate = 0;
    opacity = 1;
  } else {
    // Carousel hold — stays in carousel for the remaining 45% of scroll
    const CAROUSEL_SCALE = isMobile ? 0.95 : 0.85;
    const CAROUSEL_GAP = isMobile ? 16 : 24;
    const cardSpacing = cardW * CAROUSEL_SCALE + CAROUSEL_GAP;
    const margin = cardW * CAROUSEL_SCALE / 2 + (isMobile ? 20 : 60);
    const rowX = margin + index * cardSpacing + dragOffset;
    const rowY = isMobile ? vh * 0.49 : vh * 0.50;
    x = rowX;
    y = rowY;
    scale = CAROUSEL_SCALE;
    rotate = 0;
    opacity = 1;
  }

  return { x, y, scale, rotate, opacity };
}

/* ─── Morph Card (compact for animation) ─── */
function MorphCard({
  project,
  transform,
  zIndex,
  onClick,
  inCarousel,
  cardW,
  cardH,
}: {
  project: Project;
  transform: CardTransform;
  zIndex: number;
  onClick: () => void;
  inCarousel?: boolean;
  cardW: number;
  cardH: number;
}) {
  const { t } = useLanguage();
  const tierLabels = t.projects.tiers as Record<string, string>;
  const IconComp = iconMap[project.icon] || Cube;
  const hasLiveUrl = !!project.liveUrl;
  const [imgError, setImgError] = React.useState(false);
  const imgRef = React.useRef<HTMLImageElement>(null);
  const showImage = !!project.image && !imgError;

  // Catch errors that fired before React hydrated
  React.useEffect(() => {
    const img = imgRef.current;
    if (img && img.complete && img.naturalWidth === 0) {
      setImgError(true);
    }
  }, []);

  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        width: cardW,
        height: cardH,
        transform: `translate(${transform.x - cardW / 2}px, ${transform.y - cardH / 2}px) scale(${transform.scale}) rotate(${transform.rotate}deg)`,
        transformOrigin: "center center",
        opacity: transform.opacity,
        zIndex,
        willChange: "transform, opacity",
        transition: inCarousel ? "none" : "transform 0.12s ease-out, opacity 0.12s ease-out",
      }}
    >
      <motion.div
        whileHover={{ scale: 1.12, y: -4 }}
        transition={{ type: "spring", stiffness: 300, damping: 24 }}
        className="w-full h-full cursor-pointer"
        onClick={onClick}
      >
        <div className="relative h-full w-full overflow-hidden rounded-xl shadow-lg border border-white/10 bg-[#0c0c14] hover:border-accent/30 transition-colors duration-300 select-none">
          {/* Image / Gradient with icon fallback */}
          <div className="relative h-[55%]">
            {showImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                ref={imgRef}
                src={project.image}
                alt={project.title}
                className="h-full w-full object-cover"
                onError={() => setImgError(true)}
              />
            ) : (
              <div
                className={`h-full w-full bg-gradient-to-br ${project.gradient} flex items-center justify-center`}
              >
                <IconComp
                  size={72}
                  weight="duotone"
                  className="text-white/40"
                />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0c0c14] via-[#0c0c14]/20 to-transparent" />
            {hasLiveUrl && (
              <span className="absolute top-3 left-3 flex items-center gap-1.5 text-xs font-bold text-emerald-400 bg-black/50 px-2 py-1 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                LIVE
              </span>
            )}
            <span className="absolute top-3 right-3 text-xs font-mono text-white/40 bg-black/50 px-2 py-1 rounded-full">
              {project.year}
            </span>
          </div>

          {/* Info */}
          <div className="p-5 flex flex-col h-[45%]">
            <span
              className={`self-start px-2.5 py-1 rounded text-xs font-bold uppercase tracking-wider border mb-2 ${tierColors[project.tier]}`}
            >
              {tierLabels[project.tier]}
            </span>
            <div className="flex items-center gap-2 mb-2">
              <IconComp
                size={20}
                weight="duotone"
                className="text-accent shrink-0"
              />
              <h3 className="text-base font-bold text-white font-heading leading-tight truncate">
                {project.title}
              </h3>
            </div>
            <p className="text-sm text-white/55 leading-relaxed line-clamp-3 mb-3">
              {project.tagline}
            </p>
            <p className="text-xs text-white/40 leading-relaxed line-clamp-2 mt-auto">
              {project.description}
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

/* ─── Detail Modal ─── */
function DetailModal({
  project,
  onClose,
}: {
  project: Project;
  onClose: () => void;
}) {
  const { t } = useLanguage();
  const tierLabels = t.projects.tiers as Record<string, string>;
  const IconComp = iconMap[project.icon] || Cube;
  const [modalImgError, setModalImgError] = React.useState(false);
  const modalImgRef = React.useRef<HTMLImageElement>(null);
  const showModalImage = !!project.image && !modalImgError;

  React.useEffect(() => {
    const img = modalImgRef.current;
    if (img && img.complete && img.naturalWidth === 0) {
      setModalImgError(true);
    }
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-[100] flex items-center justify-center px-6"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      {/* Card */}
      <motion.div
        initial={{ scale: 0.9, y: 30 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 30 }}
        transition={{ type: "spring", stiffness: 300, damping: 28 }}
        onClick={(e) => e.stopPropagation()}
        className="relative z-10 w-full max-w-lg rounded-2xl overflow-hidden border border-white/10 bg-[#0c0c14] shadow-2xl"
      >
        {/* Header image */}
        <div className="relative h-32 sm:h-48">
          {showModalImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              ref={modalImgRef}
              src={project.image}
              alt={project.title}
              className="h-full w-full object-cover"
              onError={() => setModalImgError(true)}
            />
          ) : (
            <div
              className={`h-full w-full bg-gradient-to-br ${project.gradient} flex items-center justify-center`}
            >
              <IconComp size={64} weight="duotone" className="text-white/40" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0c0c14] via-transparent to-transparent" />
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white/70 hover:text-white hover:bg-black/70 transition-colors"
          >
            <X size={16} weight="bold" />
          </button>
          {project.liveUrl && (
            <span className="absolute top-3 left-3 flex items-center gap-1 text-xs font-bold text-emerald-400 bg-black/40 px-2 py-1 rounded-full backdrop-blur-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              LIVE
            </span>
          )}
        </div>

        {/* Body */}
        <div className="p-6">
          <div className="flex items-center gap-2 mb-1">
            <span
              className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider border ${tierColors[project.tier]}`}
            >
              {tierLabels[project.tier]}
            </span>
            <span className="text-xs font-mono text-white/30">
              {project.year}
            </span>
          </div>
          <div className="flex items-center gap-2 mt-3 mb-1">
            <IconComp
              size={22}
              weight="duotone"
              className="text-accent shrink-0"
            />
            <h3 className="text-xl font-bold text-white">{project.title}</h3>
          </div>
          <p className="text-sm text-accent/80 mb-4">{project.tagline}</p>
          <p className="text-sm text-white/50 leading-relaxed mb-6">
            {project.description}
          </p>

          {/* Tech stack */}
          <div className="flex flex-wrap gap-2 mb-5">
            {project.techStack.map((t) => (
              <span
                key={t}
                className="text-xs px-2.5 py-1 rounded-full bg-white/5 text-white/50 border border-white/10"
              >
                {t}
              </span>
            ))}
          </div>

          {/* CTA */}
          {project.liveUrl && (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-accent text-background font-semibold rounded-full hover:bg-accent-light transition-colors text-sm"
            >
              {t.projects.visit} <ArrowSquareOut size={16} />
            </a>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ─── Sorted projects: tier order (heavy-ai → web → medium-ai → devops), then live first, then newest first ─── */
const tierOrder: Record<string, number> = { "heavy-ai": 0, web: 1, "medium-ai": 2, devops: 3 };
const sortedProjects = [...projects].sort((a, b) => {
  const tierDiff = (tierOrder[a.tier] ?? 99) - (tierOrder[b.tier] ?? 99);
  if (tierDiff !== 0) return tierDiff;
  const aLive = a.liveUrl ? 1 : 0;
  const bLive = b.liveUrl ? 1 : 0;
  if (aLive !== bLive) return bLive - aLive;
  return parseInt(b.year) - parseInt(a.year);
});

/* ─── Main Section: Scatter → Circle → Arc morph ─── */
export default function Projects() {
  const { t } = useLanguage();
  const sectionRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [viewSize, setViewSize] = useState({ w: 1200, h: 800 });
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const isMobile = viewSize.w < 768;
  const cardW = isMobile ? CARD_W_SM : CARD_W;
  const cardH = isMobile ? CARD_H_SM : CARD_H;

  /* ─── Drag carousel state ─── */
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const isDraggingRef = useRef(false);
  const dragStartXRef = useRef(0);
  const dragStartOffsetRef = useRef(0);
  const velocityRef = useRef(0);
  const lastXRef = useRef(0);
  const momentumRef = useRef<number>(0);
  const hasDraggedRef = useRef(false);
  const DRAG_THRESHOLD = 6;
  const isCarouselMode = progress >= 0.55;

  useEffect(() => {
    const update = () =>
      setViewSize({ w: window.innerWidth, h: window.innerHeight });
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const handleScroll = useCallback(() => {
    const section = sectionRef.current;
    if (!section) return;
    const rect = section.getBoundingClientRect();
    const viewH = window.innerHeight;
    const sectionH = section.offsetHeight;
    const scrollRange = sectionH - viewH;
    if (scrollRange <= 0) return;
    const scrolled = -rect.top;
    const t = Math.max(0, Math.min(1, scrolled / scrollRange));
    setProgress(t);
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  /* ─── Drag handlers for carousel ─── */
  const getClampedOffset = useCallback((offset: number) => {
    const CAROUSEL_SCALE = isMobile ? 0.95 : 0.85;
    const CAROUSEL_GAP = isMobile ? 16 : 24;
    const cardSpacing = cardW * CAROUSEL_SCALE + CAROUSEL_GAP;
    const margin = cardW * CAROUSEL_SCALE / 2 + (isMobile ? 20 : 60);
    const maxOffset = margin;
    const minOffset = -(N - 1) * cardSpacing + viewSize.w - margin;
    return Math.max(minOffset, Math.min(maxOffset, offset));
  }, [viewSize.w, isMobile, cardW]);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (!isCarouselMode) return;
    isDraggingRef.current = true;
    hasDraggedRef.current = false;
    setIsDragging(true);
    dragStartXRef.current = e.clientX;
    dragStartOffsetRef.current = dragOffset;
    lastXRef.current = e.clientX;
    velocityRef.current = 0;
    cancelAnimationFrame(momentumRef.current);
  }, [isCarouselMode, dragOffset]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    const dx = e.clientX - dragStartXRef.current;
    if (Math.abs(dx) > DRAG_THRESHOLD) hasDraggedRef.current = true;
    velocityRef.current = e.clientX - lastXRef.current;
    lastXRef.current = e.clientX;
    setDragOffset(getClampedOffset(dragStartOffsetRef.current + dx));
  }, [getClampedOffset]);

  const handlePointerUp = useCallback(() => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    setIsDragging(false);
    let vel = velocityRef.current;
    const decay = () => {
      vel *= 0.95;
      if (Math.abs(vel) < 0.5) return;
      setDragOffset(prev => getClampedOffset(prev + vel));
      momentumRef.current = requestAnimationFrame(decay);
    };
    if (Math.abs(vel) > 2) {
      momentumRef.current = requestAnimationFrame(decay);
    }
  }, [getClampedOffset]);

  useEffect(() => {
    return () => cancelAnimationFrame(momentumRef.current);
  }, []);

  // Reset drag offset when scrolling back out of carousel
  useEffect(() => {
    if (!isCarouselMode) {
      setDragOffset(0);
      cancelAnimationFrame(momentumRef.current);
    }
  }, [isCarouselMode]);

  return (
    <>
      <section
        id="projects"
        ref={sectionRef}
        className="relative"
        style={{ height: isMobile ? "250vh" : "500vh" }}
      >
        <div
          className="sticky top-0 h-screen overflow-hidden"
          style={{
            cursor: isCarouselMode ? (isDragging ? 'grabbing' : 'grab') : 'default',
            touchAction: isCarouselMode ? 'pan-y' : 'auto',
          }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
        >
          {/* Header */}
          <div className="absolute top-0 left-0 right-0 pt-14 sm:pt-20 pb-3 text-center z-30 pointer-events-none">
            <span className="text-accent font-mono text-sm">
              {t.projects.label}
            </span>
            <h2 className="text-4xl sm:text-5xl font-bold mt-1 sm:mt-3">
              {t.projects.heading}
            </h2>
            <p className="text-muted mt-1 sm:mt-3 max-w-md mx-auto text-sm">
              {t.projects.instruction}
            </p>
            <div className="w-48 h-0.5 bg-white/10 rounded-full mx-auto mt-2 sm:mt-4">
              <div
                className="h-full bg-accent/60 rounded-full transition-all duration-100"
                style={{ width: `${progress * 100}%` }}
              />
            </div>
          </div>

          {/* Cards */}
          {sortedProjects.map((project, i) => {
            const transform = getCardTransform(
              i,
              progress,
              viewSize.w,
              viewSize.h,
              dragOffset,
              cardW,
              isMobile,
            );
            return (
              <MorphCard
                key={project.id}
                project={project}
                transform={transform}
                zIndex={10 + i}
                onClick={() => !hasDraggedRef.current && setSelectedProject(project)}
                inCarousel={isCarouselMode}
                cardW={cardW}
                cardH={cardH}
              />
            );
          })}

          {/* Bottom fade for smooth transition — hidden in carousel mode */}
          {!isCarouselMode && (
            <div
              className="absolute bottom-0 left-0 right-0 h-48 pointer-events-none z-40"
              style={{
                background:
                  "linear-gradient(to top, rgba(10, 10, 15, 0.8), transparent)",
              }}
            />
          )}
        </div>
      </section>

      {/* Detail modal */}
      <AnimatePresence>
        {selectedProject && (
          <DetailModal
            project={selectedProject}
            onClose={() => setSelectedProject(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
