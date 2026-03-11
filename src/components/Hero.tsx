"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { ArrowDown } from "@phosphor-icons/react";
import { useLanguage } from "@/contexts/LanguageContext";
import { LiquidButton, WaveButton } from "@/components/ui/liquid-glass-button";

export default function Hero() {
  const { t } = useLanguage();
  const stats = [
    { value: "14", label: t.hero.stats.projects },
    { value: "60%", label: t.hero.stats.savings },
    { value: "3+", label: t.hero.stats.years },
    { value: "12", label: t.hero.stats.team },
  ];
  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center overflow-hidden"
    >
      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-24 pb-16 w-full">
        <div className="grid lg:grid-cols-[1fr_auto] gap-12 items-center">
          {/* Left content — CSS animations for instant LCP */}
          <div className="space-y-8">
            {/* Mobile profile photo */}
            <div
              className="lg:hidden"
              style={{ animation: "hero-fade-in 0.5s 0.3s both" }}
            >
              <div className="relative w-20 h-20 rounded-full overflow-hidden ring-2 ring-accent/30">
                <Image src="/profile.png" alt="Andrés Naves Mauri" fill sizes="80px" className="object-cover" priority />
              </div>
            </div>

            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-accent/30 bg-accent/5 backdrop-blur-sm"
              style={{ animation: "hero-fade-up 0.6s both" }}
            >
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              <span className="text-sm text-accent font-medium">
                {t.hero.available}
              </span>
            </div>

            <h1
              className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight"
              style={{ animation: "hero-fade-up 0.6s 0.1s both" }}
            >
              {t.hero.greeting}{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-accent-light">
                Andrés
              </span>
              <br />
              <span className="text-3xl sm:text-4xl lg:text-5xl text-muted font-normal">
                {t.hero.role}
              </span>
            </h1>

            <p
              className="text-lg text-muted max-w-xl leading-relaxed"
              style={{ animation: "hero-fade-up 0.6s 0.2s both" }}
            >
              {t.hero.bio}
            </p>

            <div
              className="flex items-center gap-4"
              style={{ animation: "hero-fade-up 0.6s 0.3s both" }}
            >
              <WaveButton asChild size="lg" className="rounded-full text-accent font-semibold">
                <a href="#projects" className="flex items-center gap-2">
                  {t.hero.cta_work}
                  <ArrowDown size={18} />
                </a>
              </WaveButton>
              <LiquidButton asChild size="lg" className="rounded-full text-foreground font-medium">
                <a href="#contact">
                  {t.hero.cta_contact}
                </a>
              </LiquidButton>
            </div>
          </div>

          {/* Right side — floating profile photo + stats */}
          <div
            className="hidden lg:flex flex-col items-center gap-8"
            style={{ animation: "hero-fade-right 0.8s 0.4s both" }}
          >
            {/* Profile photo — transparent bg, floating */}
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="relative"
            >
              <div className="absolute -inset-6 rounded-full bg-accent/10 blur-2xl" />
              <div className="relative w-60 h-60">
                <Image
                  src="/profile.png"
                  alt="Andrés Naves Mauri"
                  fill
                  sizes="240px"
                  className="object-contain drop-shadow-[0_0_30px_rgba(245,158,11,0.3)]"
                  priority
                />
              </div>
            </motion.div>

            {/* Stats — glass cards */}
            <div className="grid grid-cols-2 gap-3">
              {stats.map((stat, i) => (
                <div
                  key={stat.label}
                  className="px-5 py-3 rounded-xl bg-white/5 backdrop-blur-md border border-white/10 text-center"
                  style={{ animation: `hero-fade-up 0.5s ${0.5 + i * 0.1}s both` }}
                >
                  <div className="text-2xl font-bold text-accent">
                    {stat.value}
                  </div>
                  <div className="text-[11px] text-muted">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Mobile stats */}
        <div
          className="lg:hidden grid grid-cols-2 sm:grid-cols-4 gap-4 mt-12"
          style={{ animation: "hero-fade-up 0.6s 0.5s both" }}
        >
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="px-4 py-3 rounded-xl bg-white/5 backdrop-blur-md border border-white/10 text-center"
            >
              <div className="text-2xl font-bold text-accent">{stat.value}</div>
              <div className="text-[11px] text-muted mt-1">{stat.label}</div>
            </div>
          ))}
        </div>

      </div>

      {/* Scroll indicator */}
      <div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-20"
        style={{ animation: "hero-fade-in 0.5s 1.2s both" }}
      >
        <span className="text-xs text-muted">{t.hero.scroll}</span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <ArrowDown size={16} className="text-muted" />
        </motion.div>
      </div>
    </section>
  );
}