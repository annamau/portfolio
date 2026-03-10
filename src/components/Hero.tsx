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
          {/* Left content */}
          <div className="space-y-8">
            {/* Mobile profile photo */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="lg:hidden"
            >
              <div className="relative w-20 h-20 rounded-full overflow-hidden ring-2 ring-accent/30">
                <Image src="/profile.png" alt="Andrés Naves Mauri" fill sizes="80px" className="object-cover" priority />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-accent/30 bg-accent/5 backdrop-blur-sm"
            >
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              <span className="text-sm text-accent font-medium">
                {t.hero.available}
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight"
            >
              {t.hero.greeting}{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-accent-light">
                Andrés
              </span>
              <br />
              <span className="text-3xl sm:text-4xl lg:text-5xl text-muted font-normal">
                {t.hero.role}
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg text-muted max-w-xl leading-relaxed"
            >
              {t.hero.bio}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex items-center gap-4"
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
            </motion.div>
          </div>

          {/* Right side — floating profile photo + stats */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="hidden lg:flex flex-col items-center gap-8"
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
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.5 + i * 0.1 }}
                  className="px-5 py-3 rounded-xl bg-white/5 backdrop-blur-md border border-white/10 text-center"
                >
                  <div className="text-2xl font-bold text-accent">
                    {stat.value}
                  </div>
                  <div className="text-[11px] text-muted">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Mobile stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="lg:hidden grid grid-cols-2 sm:grid-cols-4 gap-4 mt-12"
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
        </motion.div>

      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-20"
      >
        <span className="text-xs text-muted">{t.hero.scroll}</span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <ArrowDown size={16} className="text-muted" />
        </motion.div>
      </motion.div>
    </section>
  );
}