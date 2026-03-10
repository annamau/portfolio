"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowSquareOut,
  GithubLogo,
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
import { Project } from "@/lib/types";
import type { Icon } from "@phosphor-icons/react";

const iconMap: Record<string, Icon> = {
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
};

const tierColors: Record<string, string> = {
  "heavy-ai": "bg-red-500/10 text-red-400 border-red-500/20",
  "medium-ai": "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  web: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  devops: "bg-green-500/10 text-green-400 border-green-500/20",
};

const tierLabels: Record<string, string> = {
  "heavy-ai": "HEAVY AI",
  "medium-ai": "MEDIUM AI",
  web: "WEB",
  devops: "DEVOPS",
};

interface ProjectCardProps {
  project: Project;
  index: number;
}

export default function ProjectCard({ project, index }: ProjectCardProps) {
  const [flipped, setFlipped] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const IconComponent = iconMap[project.icon] || Cube;
  const hasLiveUrl = !!project.liveUrl;

  const handleClose = useCallback(() => setFlipped(false), []);

  useEffect(() => {
    if (!flipped) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [flipped, handleClose]);

  return (
    <>
      {/* Grid placeholder card (front face) */}
      <motion.div
        ref={cardRef}
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.4, delay: index * 0.05 }}
        onClick={() => setFlipped(true)}
        className="group relative rounded-2xl bg-surface border border-border hover:border-accent/30 transition-all duration-300 cursor-pointer overflow-hidden"
      >
        {/* Gradient header with icon */}
        <div className={`relative h-32 bg-gradient-to-r ${project.gradient} flex items-center justify-center`}>
          <IconComponent size={56} weight="duotone" className="text-white/60" />
          <span className="absolute top-3 right-3 text-[10px] font-mono text-white/50 bg-black/20 px-2 py-0.5 rounded-full backdrop-blur-sm">
            {project.year}
          </span>
          {hasLiveUrl && (
            <span className="absolute top-3 left-3 flex items-center gap-1.5 text-[10px] font-semibold text-emerald-400 bg-black/20 px-2 py-0.5 rounded-full backdrop-blur-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              LIVE
            </span>
          )}
        </div>

        {/* Card body */}
        <div className="p-5">
          <div
            className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider border mb-3 ${tierColors[project.tier]}`}
          >
            {tierLabels[project.tier]}
          </div>

          <h3 className="text-lg font-bold mb-2 group-hover:text-accent transition-colors">
            {project.title}
          </h3>
          <p className="text-sm text-muted leading-relaxed mb-4 line-clamp-2">
            {project.tagline}
          </p>

          <div className="flex flex-wrap gap-1.5 mb-4">
            {project.techStack.slice(0, 4).map((tech) => (
              <span
                key={tech}
                className="text-[11px] px-2 py-0.5 rounded-full bg-surface-light text-muted"
              >
                {tech}
              </span>
            ))}
            {project.techStack.length > 4 && (
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-surface-light text-muted">
                +{project.techStack.length - 4}
              </span>
            )}
          </div>

          {hasLiveUrl && (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-1.5 text-sm text-accent hover:text-accent-light font-medium transition-colors"
            >
              Visit Project
              <ArrowSquareOut size={14} />
            </a>
          )}
        </div>
      </motion.div>

      {/* ===== EXPANDED FLIP OVERLAY ===== */}
      <AnimatePresence>
        {flipped && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8"
            onClick={handleClose}
          >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />

            {/* Flip container */}
            <motion.div
              initial={{ scale: 0.7, rotateY: 0 }}
              animate={{ scale: 1, rotateY: 180 }}
              exit={{ scale: 0.7, rotateY: 0 }}
              transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
              style={{ transformStyle: "preserve-3d", perspective: 1200 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-2xl max-h-[85vh]"
            >
              {/* Ghost front (hidden by backface) */}
              <div
                style={{ backfaceVisibility: "hidden" }}
                className="absolute inset-0 rounded-3xl bg-surface border border-border overflow-hidden"
              >
                <div className={`h-40 bg-gradient-to-r ${project.gradient} flex items-center justify-center`}>
                  <IconComponent size={72} weight="duotone" className="text-white/50" />
                </div>
                <div className="p-8">
                  <h2 className="text-2xl font-bold">{project.title}</h2>
                </div>
              </div>

              {/* Back face (revealed) */}
              <div
                style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
                className="rounded-3xl bg-surface border border-accent/30 overflow-hidden flex flex-col max-h-[85vh]"
              >
                {/* Gradient header */}
                <div className={`relative h-36 bg-gradient-to-r ${project.gradient} flex items-center justify-center shrink-0 rounded-t-3xl`}>
                  <IconComponent size={64} weight="duotone" className="text-white/50" />
                  <button
                    onClick={handleClose}
                    className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors bg-black/20 rounded-full p-2 backdrop-blur-sm"
                    aria-label="Close"
                  >
                    <X size={20} />
                  </button>
                  {hasLiveUrl && (
                    <span className="absolute top-4 left-4 flex items-center gap-1.5 text-xs font-semibold text-emerald-400 bg-black/20 px-3 py-1 rounded-full backdrop-blur-sm">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      LIVE
                    </span>
                  )}
                  <span className="absolute bottom-4 right-4 text-xs font-mono text-white/40">
                    {project.year}
                  </span>
                </div>

                {/* Content */}
                <div className="p-6 sm:p-8 flex-1 overflow-y-auto min-h-0">
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider border ${tierColors[project.tier]}`}
                    >
                      {tierLabels[project.tier]}
                    </div>
                  </div>

                  <h2 className="text-2xl font-bold mb-2">{project.title}</h2>
                  <p className="text-accent text-sm font-medium mb-4">
                    {project.tagline}
                  </p>

                  <p className="text-muted leading-relaxed mb-6">
                    {project.description}
                  </p>

                  {/* Tech Stack */}
                  <div className="mb-6">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-muted/70 mb-3">
                      Tech Stack
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {project.techStack.map((tech) => (
                        <span
                          key={tech}
                          className="text-xs px-3 py-1.5 rounded-full bg-surface-light text-foreground border border-border"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="mb-6">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-muted/70 mb-3">
                      Tags
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {project.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-xs px-3 py-1.5 rounded-full border border-accent/20 text-accent"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Action links */}
                  <div className="flex items-center gap-3 pt-2">
                    {hasLiveUrl && (
                      <a
                        href={project.liveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-accent text-background font-semibold rounded-full hover:bg-accent-light transition-colors"
                      >
                        Visit Project
                        <ArrowSquareOut size={18} />
                      </a>
                    )}
                    <a
                      href={`https://github.com/annamau/${project.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-5 py-3 border border-border text-muted hover:text-foreground hover:border-accent/30 font-medium rounded-full transition-colors"
                    >
                      <GithubLogo size={18} />
                      Source
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
