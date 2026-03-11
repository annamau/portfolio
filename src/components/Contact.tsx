"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Envelope,
  LinkedinLogo,
  GithubLogo,
  PaperPlaneTilt,
  CalendarBlank,
  Rocket,
} from "@phosphor-icons/react";
import { LiquidButton } from "@/components/ui/liquid-glass-button";
import { useLanguage } from "@/contexts/LanguageContext";

/* ── Glass shard data for rocket animation ── */
const SHARDS = Array.from({ length: 12 }, (_, i) => {
  const angle = (i / 12) * Math.PI * 2;
  const r = ((i * 7 + 3) % 12) / 12;
  return {
    id: i,
    flyX: Math.cos(angle) * (80 + r * 80),
    flyY: Math.sin(angle) * (40 + r * 50),
    flyR: (i % 2 === 0 ? 1 : -1) * (140 + r * 220),
    w: 14 + r * 16,
    h: 8 + r * 10,
    delay: r * 0.1,
  };
});

export default function Contact() {
  const { t } = useLanguage();
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [animPhase, setAnimPhase] = useState<"idle" | "shatter" | "reform">("idle");

  useEffect(() => {
    if (status !== "sent") return;
    setAnimPhase("shatter");
    const reformTimer = setTimeout(() => setAnimPhase("reform"), 2000);
    const resetTimer = setTimeout(() => {
      setAnimPhase("idle");
      setStatus("idle");
    }, 3400);
    return () => {
      clearTimeout(reformTimer);
      clearTimeout(resetTimer);
    };
  }, [status]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");

    const form = e.currentTarget;
    const formData = new FormData(form);

    try {
      const res = await fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams(formData as unknown as Record<string, string>).toString(),
      });

      if (res.ok) {
        setStatus("sent");
        form.reset();
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  return (
    <section id="contact" className="py-24 relative">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <span className="text-accent font-mono text-sm">{t.contact.label}</span>
          <h2 className="text-4xl sm:text-5xl font-bold mt-3">
            {t.contact.heading}
          </h2>
          <p className="text-muted mt-4 max-w-2xl">
            {t.contact.description}
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-16">
          {/* Form */}
          <motion.form
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, delay: 0.1 }}
            name="contact"
            method="POST"
            data-netlify="true"
            onSubmit={handleSubmit}
            className="space-y-6"
          >
            <input type="hidden" name="form-name" value="contact" />
            <div>
              <label
                htmlFor="name"
                className="text-sm text-muted mb-2 block"
              >
                {t.contact.name_label}
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                className="w-full px-4 py-3 rounded-xl bg-surface border border-border text-foreground placeholder:text-muted/50 focus:outline-none focus:border-accent transition-colors"
                placeholder={t.contact.name_placeholder}
              />
            </div>
            <div>
              <label
                htmlFor="email"
                className="text-sm text-muted mb-2 block"
              >
                {t.contact.email_label}
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="w-full px-4 py-3 rounded-xl bg-surface border border-border text-foreground placeholder:text-muted/50 focus:outline-none focus:border-accent transition-colors"
                placeholder={t.contact.email_placeholder}
              />
            </div>
            <div>
              <label
                htmlFor="message"
                className="text-sm text-muted mb-2 block"
              >
                {t.contact.message_label}
              </label>
              <textarea
                id="message"
                name="message"
                required
                rows={5}
                className="w-full px-4 py-3 rounded-xl bg-surface border border-border text-foreground placeholder:text-muted/50 focus:outline-none focus:border-accent transition-colors resize-none"
                placeholder={t.contact.message_placeholder}
              />
            </div>
            {/* Submit button with rocket animation */}
            <div className="relative inline-flex">
              {/* Real button */}
              <motion.div
                animate={{
                  opacity: animPhase === "idle" ? 1 : 0,
                  scale: animPhase === "shatter" ? 0.95 : 1,
                }}
                transition={{
                  opacity: {
                    duration: animPhase === "idle" ? 0.5 : 0.15,
                    delay: animPhase === "idle" ? 0.4 : 0,
                  },
                  scale: { duration: 0.15 },
                }}
                style={{ pointerEvents: animPhase !== "idle" ? "none" : "auto" }}
              >
                <LiquidButton
                  type="submit"
                  disabled={status === "sending"}
                  size="lg"
                  className="text-accent font-semibold rounded-full"
                >
                  <span className="flex items-center gap-2">
                    {status === "sending" ? (
                      t.contact.sending
                    ) : (
                      <>
                        {t.contact.send}
                        <PaperPlaneTilt size={18} />
                      </>
                    )}
                  </span>
                </LiquidButton>
              </motion.div>

              {/* Rocket + glass shatter animation */}
              <AnimatePresence>
                {animPhase !== "idle" && (
                  <motion.div
                    className="absolute inset-0 flex items-center justify-center overflow-visible"
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0, transition: { duration: 0.2 } }}
                  >
                    {/* Glass shards */}
                    {SHARDS.map((s) => (
                      <motion.div
                        key={s.id}
                        className="absolute rounded-sm"
                        style={{
                          width: s.w,
                          height: s.h,
                          background:
                            "linear-gradient(135deg, rgba(255,255,255,0.3), rgba(255,255,255,0.05))",
                          border: "1px solid rgba(255,255,255,0.2)",
                          backdropFilter: "blur(4px)",
                          boxShadow: "0 0 8px rgba(245,158,11,0.15)",
                        }}
                        initial={{ x: 0, y: 0, rotate: 0, opacity: 0.9, scale: 1 }}
                        animate={
                          animPhase === "shatter"
                            ? {
                                x: s.flyX,
                                y: s.flyY,
                                rotate: s.flyR,
                                opacity: 0,
                                scale: 0.3,
                              }
                            : {
                                x: 0,
                                y: 0,
                                rotate: 0,
                                opacity: [0, 0.8, 0],
                                scale: [0.3, 1, 0.8],
                              }
                        }
                        transition={
                          animPhase === "shatter"
                            ? {
                                duration: 0.7,
                                delay: 0.2 + s.delay,
                                ease: "easeOut",
                              }
                            : {
                                duration: 0.8,
                                delay: s.delay,
                                ease: [0.16, 1, 0.3, 1],
                              }
                        }
                      />
                    ))}

                    {/* Rocket flying left → right */}
                    {animPhase === "shatter" && (
                      <motion.div
                        className="absolute z-10 flex items-center"
                        style={{ top: "50%", left: 0, translateY: "-50%" }}
                        initial={{ x: -60, opacity: 0 }}
                        animate={{ x: [null, 20, 280], opacity: [0, 1, 0] }}
                        transition={{
                          duration: 1.2,
                          ease: [0.22, 1, 0.36, 1],
                          times: [0, 0.25, 1],
                        }}
                      >
                        <Rocket
                          size={26}
                          weight="fill"
                          className="text-accent drop-shadow-[0_0_12px_rgba(245,158,11,0.6)]"
                          style={{ transform: "rotate(90deg)" }}
                        />
                        {/* Flame trail */}
                        <div
                          className="absolute right-full top-1/2 -translate-y-1/2 h-[3px] rounded-full"
                          style={{
                            width: 40,
                            background:
                              "linear-gradient(to left, rgba(245,158,11,0.7), rgba(245,158,11,0.2), transparent)",
                          }}
                        />
                      </motion.div>
                    )}

                    {/* "Sent!" label */}
                    <motion.span
                      className="relative z-20 font-bold text-lg text-accent drop-shadow-[0_0_16px_rgba(245,158,11,0.4)]"
                      initial={{ opacity: 0, scale: 0.3 }}
                      animate={
                        animPhase === "shatter"
                          ? { opacity: 1, scale: 1 }
                          : { opacity: 0, scale: 0.8 }
                      }
                      transition={{
                        delay: animPhase === "shatter" ? 0.5 : 0,
                        duration: 0.4,
                        ease: [0.16, 1, 0.3, 1],
                      }}
                    >
                      ✓ {t.contact.sent}
                    </motion.span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            {status === "error" && (
              <p className="text-red-400 text-sm">
                {t.contact.error}
              </p>
            )}
          </motion.form>

          {/* Contact info */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col justify-center space-y-8"
          >
            <div>
              <h3 className="text-xl font-bold mb-4">{t.contact.sidebar_heading}</h3>
              <p className="text-muted leading-relaxed">
                {t.contact.sidebar_text}
              </p>
            </div>

            <div className="space-y-4">
              <a
                href="mailto:andnama@gmail.com"
                className="flex items-center gap-3 text-muted hover:text-accent transition-colors group"
              >
                <div className="w-10 h-10 rounded-xl bg-surface border border-border flex items-center justify-center group-hover:border-accent/30 transition-colors">
                  <Envelope size={20} />
                </div>
                <span className="text-sm">andnama@gmail.com</span>
              </a>
              <a
                href="https://www.linkedin.com/in/andres-naves/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-muted hover:text-accent transition-colors group"
              >
                <div className="w-10 h-10 rounded-xl bg-surface border border-border flex items-center justify-center group-hover:border-accent/30 transition-colors">
                  <LinkedinLogo size={20} />
                </div>
                <span className="text-sm">LinkedIn</span>
              </a>
              <a
                href="https://github.com/annamau"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-muted hover:text-accent transition-colors group"
              >
                <div className="w-10 h-10 rounded-xl bg-surface border border-border flex items-center justify-center group-hover:border-accent/30 transition-colors">
                  <GithubLogo size={20} />
                </div>
                <span className="text-sm">GitHub</span>
              </a>
            </div>

            {/* Calendly button */}
            <button
              onClick={() => {
                if (typeof window !== "undefined" && (window as any).Calendly) {
                  (window as any).Calendly.initPopupWidget({ url: "https://calendly.com/a-naves-mauri" });
                }
              }}
              className="flex items-center gap-3 w-full px-5 py-3.5 mt-2 rounded-xl bg-accent/10 border border-accent/30 text-accent hover:bg-accent/20 transition-all duration-200 group cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-accent/20 border border-accent/30 flex items-center justify-center">
                <CalendarBlank size={22} weight="duotone" />
              </div>
              <div>
                <span className="font-semibold text-sm">{t.contact.calendar_label}</span>
                <p className="text-[11px] text-accent/60">{t.contact.calendar_sub}</p>
              </div>
            </button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
