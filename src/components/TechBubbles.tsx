"use client";

import React, { useRef, useState, useEffect, useMemo } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

// --- Data ---
interface TechItem {
  name: string;
  category: string;
  size: "lg" | "md" | "sm";
}

const techItems: TechItem[] = [
  { name: "LangGraph", category: "ai", size: "lg" },
  { name: "Next.js", category: "frontend", size: "lg" },
  { name: "Python", category: "backend", size: "lg" },
  { name: "TypeScript", category: "frontend", size: "lg" },
  { name: "React", category: "frontend", size: "md" },
  { name: "Supabase", category: "backend", size: "md" },
  { name: "OpenAI", category: "ai", size: "md" },
  { name: "Docker", category: "devops", size: "md" },
  { name: "Gemini", category: "ai", size: "md" },
  { name: "FastAPI", category: "backend", size: "md" },
  { name: "Tailwind", category: "frontend", size: "md" },
  { name: "Flutter", category: "mobile", size: "md" },
  { name: "Framer Motion", category: "frontend", size: "md" },
  { name: "Ollama", category: "ai", size: "md" },
  { name: "PostgreSQL", category: "backend", size: "md" },
  { name: "Three.js", category: "frontend", size: "sm" },
  { name: "RAG", category: "ai", size: "sm" },
  { name: "pgvector", category: "backend", size: "sm" },
  { name: "n8n", category: "automation", size: "sm" },
  { name: "Playwright", category: "automation", size: "sm" },
  { name: "Remotion", category: "automation", size: "sm" },
  { name: "Stripe", category: "backend", size: "sm" },
  { name: "Netlify", category: "devops", size: "sm" },
  { name: "Node.js", category: "backend", size: "sm" },
  { name: "Dart", category: "mobile", size: "sm" },
  { name: "ML Kit", category: "ai", size: "sm" },
  { name: "Selenium", category: "automation", size: "sm" },
  { name: "Coolify", category: "devops", size: "sm" },
  { name: "Crawl4AI", category: "automation", size: "sm" },
  { name: "Sentry", category: "devops", size: "sm" },
  { name: "Vercel", category: "devops", size: "sm" },
  { name: "GitHub Actions", category: "devops", size: "sm" },
  { name: "Material-UI", category: "frontend", size: "sm" },
  { name: "Radix UI", category: "frontend", size: "sm" },
  { name: "OGL", category: "frontend", size: "sm" },
  { name: "Embeddings", category: "ai", size: "sm" },
  { name: "LLaMA", category: "ai", size: "sm" },
  { name: "TensorFlow", category: "ai", size: "sm" },
  { name: "Alpaca API", category: "backend", size: "sm" },
  { name: "Azure Pipelines", category: "devops", size: "sm" },
  { name: "Azure DevOps", category: "devops", size: "sm" },
];

const categoryColors: Record<string, { bg: string; text: string; border: string; glow: string }> = {
  ai: { bg: "bg-violet-500/15", text: "text-violet-300", border: "border-violet-500/30", glow: "shadow-violet-500/20" },
  frontend: { bg: "bg-cyan-500/15", text: "text-cyan-300", border: "border-cyan-500/30", glow: "shadow-cyan-500/20" },
  backend: { bg: "bg-emerald-500/15", text: "text-emerald-300", border: "border-emerald-500/30", glow: "shadow-emerald-500/20" },
  mobile: { bg: "bg-pink-500/15", text: "text-pink-300", border: "border-pink-500/30", glow: "shadow-pink-500/20" },
  devops: { bg: "bg-amber-500/15", text: "text-amber-300", border: "border-amber-500/30", glow: "shadow-amber-500/20" },
  automation: { bg: "bg-red-500/15", text: "text-red-300", border: "border-red-500/30", glow: "shadow-red-500/20" },
};

const categoryLabels: Record<string, string> = {
  ai: "AI & ML",
  frontend: "Frontend",
  backend: "Backend",
  mobile: "Mobile",
  devops: "DevOps",
  automation: "Automation",
};

// --- Bubble radius based on text + size tier ---
function getBubbleRadius(item: TechItem): number {
  // Estimate based on font-weight semibold rendering
  const charW = item.name.length > 10 ? 6.5 : 6;
  const textWidth = item.name.length * charW;
  const padding = item.size === "lg" ? 24 : item.size === "md" ? 22 : 18;
  const minR = item.size === "lg" ? 36 : item.size === "md" ? 30 : 24;
  return Math.max(minR, textWidth / 2 + padding);
}

// --- Physics-based circle packing ---
interface PackedBubble {
  item: TechItem;
  x: number;
  y: number;
  r: number;
}

function packBubbles(items: TechItem[]): PackedBubble[] {
  const sorted = [...items].sort((a, b) => getBubbleRadius(b) - getBubbleRadius(a));
  const packed: PackedBubble[] = [];
  const spacing = 4;

  for (const item of sorted) {
    const r = getBubbleRadius(item);
    if (packed.length === 0) {
      packed.push({ item, x: 0, y: 0, r });
      continue;
    }

    // Try angles around each existing bubble to find best spot (closest to center)
    let bestX = 0, bestY = 0, bestDist = Infinity;

    for (const existing of packed) {
      const targetDist = existing.r + r + spacing;
      for (let angle = 0; angle < 360; angle += 6) {
        const rad = (angle * Math.PI) / 180;
        const cx = existing.x + Math.cos(rad) * targetDist;
        const cy = existing.y + Math.sin(rad) * targetDist;

        // Check no overlap with any existing bubble
        let valid = true;
        for (const other of packed) {
          const dx = cx - other.x;
          const dy = cy - other.y;
          if (Math.sqrt(dx * dx + dy * dy) < other.r + r + spacing) {
            valid = false;
            break;
          }
        }

        if (valid) {
          const dist = Math.sqrt(cx * cx + cy * cy);
          if (dist < bestDist) {
            bestDist = dist;
            bestX = cx;
            bestY = cy;
          }
        }
      }
    }

    packed.push({ item, x: bestX, y: bestY, r });
  }

  return packed;
}

// --- Single Bubble ---
interface BubbleProps {
  bubble: PackedBubble;
  mouseX: number;
  mouseY: number;
  dimmed: boolean;
  containerCenter: { x: number; y: number };
}

function Bubble({ bubble, mouseX, mouseY, dimmed, containerCenter }: BubbleProps) {
  const colors = categoryColors[bubble.item.category];
  // Calculate font size proportional to bubble radius
  const baseFontSize = bubble.item.size === "lg" ? 12 : bubble.item.size === "md" ? 10.5 : 9;
  const fontSize = Math.max(7, baseFontSize * (bubble.r / getBubbleRadius(bubble.item)));

  // Calculate magnification based on mouse distance
  const bx = containerCenter.x + bubble.x;
  const by = containerCenter.y + bubble.y;
  const dx = mouseX - bx;
  const dy = mouseY - by;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const magRange = 140;
  const t = Math.max(0, 1 - dist / magRange);
  const scale = 1 + t * 0.3;

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{
        scale: dimmed ? 0.85 : scale,
        opacity: dimmed ? 0.25 : 1,
        filter: dimmed ? "grayscale(0.8)" : "grayscale(0)",
      }}
      transition={{ type: "spring", stiffness: 200, damping: 20, mass: 0.5 }}
      className={`absolute flex items-center justify-center rounded-full border backdrop-blur-sm cursor-default select-none ${colors.bg} ${colors.border} hover:shadow-lg ${colors.glow}`}
      style={{
        width: bubble.r * 2,
        height: bubble.r * 2,
        left: containerCenter.x + bubble.x - bubble.r,
        top: containerCenter.y + bubble.y - bubble.r,
      }}
    >
      <span
        className={`font-semibold ${colors.text} text-center leading-tight`}
        style={{ fontSize }}
      >
        {bubble.item.name}
      </span>
    </motion.div>
  );
}

// --- Main Component ---
export default function TechBubbles() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: -9999, y: -9999 });
  const [containerSize, setContainerSize] = useState({ width: 600, height: 600 });
  const categories = Object.keys(categoryColors);

  const packed = useMemo(() => packBubbles(techItems), []);

  // Compute bounding box of packed bubbles to size container
  const bounds = useMemo(() => {
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    for (const b of packed) {
      minX = Math.min(minX, b.x - b.r);
      maxX = Math.max(maxX, b.x + b.r);
      minY = Math.min(minY, b.y - b.r);
      maxY = Math.max(maxY, b.y + b.r);
    }
    return { minX, maxX, minY, maxY, width: maxX - minX, height: maxY - minY };
  }, [packed]);

  // Scale factor to fit cluster within container
  const scaleFactor = useMemo(() => {
    if (bounds.width <= 0 || containerSize.width <= 0) return 1;
    const maxW = containerSize.width - 16; // 8px padding each side
    return bounds.width > maxW ? maxW / bounds.width : 1;
  }, [bounds.width, containerSize.width]);

  // Scaled bounds height for container sizing
  const scaledHeight = bounds.height * scaleFactor;

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const obs = new ResizeObserver((entries) => {
      for (const e of entries) setContainerSize({ width: e.contentRect.width, height: e.contentRect.height });
    });
    obs.observe(el);
    setContainerSize({ width: el.offsetWidth, height: el.offsetHeight });
    return () => obs.disconnect();
  }, []);

  const containerCenter = {
    x: containerSize.width / 2,
    y: (scaledHeight + 40) / 2,
  };

  return (
    <div>
      {/* Category legend */}
      <div className="flex flex-wrap gap-2 mb-6 justify-center">
        {categories.map((cat) => {
          const colors = categoryColors[cat];
          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 border ${
                activeCategory === cat
                  ? `${colors.bg} ${colors.text} ${colors.border}`
                  : activeCategory === null
                  ? "bg-white/[0.04] border-white/[0.08] text-white/60 hover:text-white/90 hover:border-white/20"
                  : "bg-white/[0.02] border-white/[0.04] text-white/25"
              }`}
            >
              {categoryLabels[cat]}
            </button>
          );
        })}
      </div>

      {/* Bubble cluster */}
      <div
        ref={containerRef}
        className="relative w-full overflow-visible"
        style={{ height: scaledHeight + 40 }}
        onMouseMove={(e) => {
          const rect = containerRef.current?.getBoundingClientRect();
          if (rect) setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
        }}
        onMouseLeave={() => setMousePos({ x: -9999, y: -9999 })}
      >
        {packed.map((bubble) => {
          const scaledBubble = {
            ...bubble,
            x: bubble.x * scaleFactor,
            y: bubble.y * scaleFactor,
            r: bubble.r * scaleFactor,
          };
          return (
            <Bubble
              key={bubble.item.name}
              bubble={scaledBubble}
              mouseX={mousePos.x}
              mouseY={mousePos.y}
              dimmed={activeCategory !== null && activeCategory !== bubble.item.category}
              containerCenter={containerCenter}
            />
          );
        })}
      </div>
    </div>
  );
}
