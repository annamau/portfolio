"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from "framer-motion";
import { List, X, LinkedinLogo, CalendarBlank } from "@phosphor-icons/react";

const navLinks = [
  { label: "Home", href: "#hero" },
  { label: "Projects", href: "#projects" },
  { label: "About", href: "#about" },
  { label: "Experience", href: "#experience" },
  { label: "Contact", href: "#contact" },
];

// Sections the island checks for "collision" (proximity to their headers)
const collisionSections = ["projects", "about", "experience", "contact"];

export default function Nav() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("hero");
  const [isCompact, setIsCompact] = useState(false);
  const [nudgeDir, setNudgeDir] = useState<"none" | "left" | "right">("none");
  const navRef = useRef<HTMLElement>(null);
  const rafRef = useRef<number>(0);

  // Spring-driven horizontal offset for collision avoidance
  const rawX = useMotionValue(0);
  const springX = useSpring(rawX, { stiffness: 180, damping: 28, mass: 0.8 });

  // Scale pulse on collision
  const rawScale = useMotionValue(1);
  const springScale = useSpring(rawScale, { stiffness: 300, damping: 20 });

  // Width morphing between expanded and compact
  const rawWidth = useMotionValue(680);
  const springWidth = useSpring(rawWidth, { stiffness: 200, damping: 30 });

  // Glow intensity tied to scroll
  const glowOpacity = useMotionValue(0);
  const springGlow = useSpring(glowOpacity, { stiffness: 120, damping: 20 });

  const handleScroll = useCallback(() => {
    const scrollY = window.scrollY;
    const compact = scrollY > 80;
    setIsCompact(compact);
    rawWidth.set(compact ? 600 : 720);
    glowOpacity.set(compact ? 0.6 : 0);

    // Detect active section
    const sections = navLinks.map((l) => l.href.slice(1));
    for (const id of [...sections].reverse()) {
      const el = document.getElementById(id);
      if (el && el.getBoundingClientRect().top <= 120) {
        setActiveSection(id);
        break;
      }
    }

    // Collision detection — check if a section heading is near the nav bar
    if (!navRef.current) return;
    const navRect = navRef.current.getBoundingClientRect();
    const navCenter = navRect.left + navRect.width / 2;
    const viewportCenter = window.innerWidth / 2;
    let newNudge: "none" | "left" | "right" = "none";

    for (const sectionId of collisionSections) {
      const el = document.getElementById(sectionId);
      if (!el) continue;
      // Get the section heading (first h2)
      const heading = el.querySelector("h2, h1");
      if (!heading) continue;
      const headingRect = heading.getBoundingClientRect();
      // Check if the heading vertically overlaps with the nav island
      const verticalOverlap =
        headingRect.top < navRect.bottom + 20 &&
        headingRect.bottom > navRect.top - 20;
      if (verticalOverlap) {
        // Determine nudge direction based on heading position
        const headingCenter = headingRect.left + headingRect.width / 2;
        if (headingCenter < viewportCenter) {
          newNudge = "right";
        } else {
          newNudge = "left";
        }
        break;
      }
    }

    setNudgeDir(newNudge);
    if (newNudge === "left") {
      rawX.set(-120);
      rawScale.set(0.95);
    } else if (newNudge === "right") {
      rawX.set(120);
      rawScale.set(0.95);
    } else {
      rawX.set(0);
      rawScale.set(1);
    }
  }, [rawWidth, glowOpacity, rawX, rawScale]);

  useEffect(() => {
    const onScroll = () => {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(handleScroll);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    handleScroll();
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(rafRef.current);
    };
  }, [handleScroll]);

  // Border gradient rotation via CSS variable
  const borderRotation = useMotionValue(0);
  useEffect(() => {
    let frame: number;
    let angle = 0;
    const spin = () => {
      angle = (angle + 0.4) % 360;
      borderRotation.set(angle);
      frame = requestAnimationFrame(spin);
    };
    frame = requestAnimationFrame(spin);
    return () => cancelAnimationFrame(frame);
  }, [borderRotation]);

  const borderRotationCSS = useTransform(borderRotation, (v) => `${v}deg`);

  return (
    <>
      <motion.nav
        ref={navRef}
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        style={{
          x: springX,
          scale: springScale,
          width: springWidth,
          maxWidth: "calc(100vw - 32px)",
        }}
        className="fixed top-4 left-1/2 -translate-x-1/2 z-50"
      >
        {/* Liquid glass island */}
        <motion.div
          className="relative rounded-[28px] overflow-hidden"
          style={{
            // @ts-expect-error CSS custom property
            "--border-angle": borderRotationCSS,
          }}
        >
          {/* Animated gradient border */}
          <div
            className="absolute -inset-[1px] rounded-[28px] pointer-events-none"
            style={{
              background: `conic-gradient(from var(--border-angle, 0deg), transparent 40%, rgba(245,158,11,0.4) 50%, transparent 60%)`,
              mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
              maskComposite: "exclude",
              WebkitMaskComposite: "xor",
              padding: "1px",
            }}
          />

          {/* Glass layers */}
          <div className="absolute inset-0 rounded-[28px] bg-[#0a0a0f]/60 backdrop-blur-2xl" />
          <div className="absolute inset-0 rounded-[28px] bg-gradient-to-b from-white/[0.08] to-transparent" />
          <div className="absolute inset-0 rounded-[28px] shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),inset_0_-1px_1px_rgba(0,0,0,0.3)]" />

          {/* Glow on scroll */}
          <motion.div
            className="absolute inset-0 rounded-[28px] pointer-events-none"
            style={{
              opacity: springGlow,
              background: "radial-gradient(ellipse at 50% 0%, rgba(245,158,11,0.12) 0%, transparent 70%)",
            }}
          />

          {/* Content */}
          <div className="relative z-10 flex items-center h-14 px-5 gap-1">
            {/* Logo — always visible, morphs with compact state */}
            <a
              href="#hero"
              className="flex items-center gap-2 shrink-0 group mr-2"
            >
              <motion.div
                className="relative flex items-center justify-center"
                animate={{
                  width: isCompact ? 32 : 36,
                  height: isCompact ? 32 : 36,
                }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/logo.svg"
                  alt="AN"
                  className="w-full h-full invert drop-shadow-[0_0_8px_rgba(245,158,11,0.3)]"
                />
              </motion.div>
              <AnimatePresence>
                {!isCompact && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: "auto" }}
                    exit={{ opacity: 0, width: 0 }}
                    transition={{ duration: 0.3 }}
                    className="font-semibold text-foreground whitespace-nowrap overflow-hidden"
                  >
                    Andrés<span className="text-accent">.</span>
                  </motion.span>
                )}
              </AnimatePresence>
            </a>

            {/* Divider */}
            <div className="hidden md:block w-px h-5 bg-white/10 mx-2 shrink-0" />

            {/* Desktop links */}
            <div className="hidden md:flex items-center gap-0.5 flex-1 justify-center min-w-0">
              {navLinks.map((link) => {
                const isActive = activeSection === link.href.slice(1);
                return (
                  <a
                    key={link.href}
                    href={link.href}
                    className="relative px-2.5 py-1.5 text-sm rounded-full transition-colors duration-200 whitespace-nowrap shrink-0"
                  >
                    {isActive && (
                      <motion.span
                        layoutId="nav-active-pill"
                        className="absolute inset-0 rounded-full bg-white/[0.08]"
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}
                    <span
                      className={`relative z-10 ${
                        isActive
                          ? "text-accent font-medium"
                          : "text-white/60 hover:text-white/90"
                      }`}
                    >
                      {link.label}
                    </span>
                  </a>
                );
              })}
            </div>

            {/* Divider */}
            <div className="hidden lg:block w-px h-5 bg-white/10 mx-2 shrink-0" />

            {/* LinkedIn */}
            <a
              href={process.env.NEXT_PUBLIC_LINKEDIN || "https://www.linkedin.com/in/andres-naves/"}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:flex items-center justify-center w-8 h-8 rounded-full text-white/50 hover:text-white/90 hover:bg-white/[0.06] transition-all duration-200 shrink-0"
              aria-label="LinkedIn"
            >
              <LinkedinLogo size={18} weight="bold" />
            </a>

            {/* Calendly */}
            <button
              onClick={() => {
                if (typeof window !== "undefined" && (window as any).Calendly) {
                  (window as any).Calendly.initPopupWidget({ url: "https://calendly.com/a-naves-mauri" });
                }
              }}
              className="hidden md:flex items-center justify-center w-8 h-8 rounded-full text-white/50 hover:text-accent hover:bg-white/[0.06] transition-all duration-200 shrink-0"
              aria-label="Schedule with me"
            >
              <CalendarBlank size={18} weight="bold" />
            </button>

            {/* Mobile toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden text-foreground p-2 ml-auto"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={22} /> : <List size={22} />}
            </button>
          </div>
        </motion.div>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10, scaleY: 0.9  }}
              animate={{ opacity: 1, y: 0, scaleY: 1 }}
              exit={{ opacity: 0, y: -10, scaleY: 0.9 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="mt-2 rounded-2xl overflow-hidden origin-top"
            >
              <div className="relative">
                <div className="absolute inset-0 rounded-2xl bg-[#0a0a0f]/70 backdrop-blur-2xl" />
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-white/[0.06] to-transparent" />
                <div className="absolute inset-0 rounded-2xl border border-white/[0.06]" />
                <div className="relative z-10 px-5 py-4 flex flex-col gap-3">
                  {navLinks.map((link) => (
                    <a
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      className={`text-sm transition-colors px-3 py-1.5 rounded-xl ${
                        activeSection === link.href.slice(1)
                          ? "text-accent font-medium bg-white/[0.05]"
                          : "text-white/60 hover:text-white/90"
                      }`}
                    >
                      {link.label}
                    </a>
                  ))}
                  <a
                    href={process.env.NEXT_PUBLIC_LINKEDIN || "https://www.linkedin.com/in/andres-naves/"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-white/60 hover:text-white/90 transition-colors px-3 py-1.5 rounded-xl flex items-center gap-2"
                    onClick={() => setMobileOpen(false)}
                  >
                    <LinkedinLogo size={18} weight="bold" />
                    LinkedIn
                  </a>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
    </>
  );
}
