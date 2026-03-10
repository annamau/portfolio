"use client";

import { motion } from "framer-motion";
import TechBubbles from "./TechBubbles";

export default function About() {
  return (
    <section id="about" className="py-24 relative">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <span className="text-accent font-mono text-sm">02 — About</span>
          <h2 className="text-4xl sm:text-5xl font-bold mt-3">
            Building the future
            <br />
            <span className="text-muted">with intelligent systems</span>
          </h2>
        </motion.div>

        <div className="grid lg:grid-cols-[1fr_1.5fr] gap-16">
          {/* Story */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="space-y-6"
          >
            <p className="text-muted leading-relaxed">
              I&apos;m an AI Engineer with 3 years at HP, where I led a team of
              12 and built agent-driven QA solutions that cut testing costs by
              60%. I architect multi-agent systems, LLM orchestration pipelines,
              and AI-powered automation tools — from Playwright MCP integrations 
              to self-hosted Ollama deployments.
            </p>
            <p className="text-muted leading-relaxed">
              With a Master&apos;s in Software Engineering from UPV and an MBA
              from ThePowerMBA, I combine deep technical expertise with business
              acumen. I was awarded HP&apos;s &quot;Transformator&quot; Prize in
              2024 for revolutionizing development strategies with AI.
            </p>
            <p className="text-muted leading-relaxed">
              Beyond enterprise, I build my own products — autonomous trading
              systems with 4-bot LangGraph orchestration, content pipelines
              running entirely on local LLMs, and cross-platform mobile apps
              with on-device ML. Based in Valencia, Spain.
            </p>
          </motion.div>

          {/* Tech Bubbles */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <TechBubbles />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
