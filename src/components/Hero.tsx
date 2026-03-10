"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { ArrowDown } from "@phosphor-icons/react";

const stats = [
  { value: "14", label: "Projects Built" },
  { value: "60%", label: "Cost Savings via AI" },
  { value: "3+", label: "Years Enterprise" },
  { value: "12", label: "Team Members Led" },
];

export default function Hero() {
  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center overflow-hidden"
    >
      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-24 pb-16 w-full">
        <div className="grid lg:grid-cols-[1fr_auto] gap-12 items-center">
          {/* Left content */}
          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-accent/30 bg-accent/5 backdrop-blur-sm"
            >
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              <span className="text-sm text-accent font-medium">
                Available for projects
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight"
            >
              Hello, I&apos;m{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-accent-light">
                Andrés
              </span>
              <br />
              <span className="text-3xl sm:text-4xl lg:text-5xl text-muted font-normal">
                AI Engineer
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg text-muted max-w-xl leading-relaxed"
            >
              I build multi-agent AI systems, intelligent automation pipelines,
              and full-stack products from concept to deployment. Specializing in
              LangGraph, LLM orchestration, and creative web experiences.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex items-center gap-4"
            >
              <a
                href="#projects"
                className="group px-7 py-3.5 bg-accent text-background font-semibold rounded-full hover:bg-accent-light transition-all duration-200 flex items-center gap-2"
              >
                See My Work
                <ArrowDown
                  size={18}
                  className="group-hover:translate-y-0.5 transition-transform"
                />
              </a>
              <a
                href="#contact"
                className="px-7 py-3.5 border border-border text-foreground font-medium rounded-full hover:border-accent hover:text-accent transition-all duration-200"
              >
                Get In Touch
              </a>
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

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        >
          <span className="text-xs text-muted">Scroll Down</span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <ArrowDown size={16} className="text-muted" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}