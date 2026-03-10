"use client";

import { motion } from "framer-motion";
import TechBubbles from "./TechBubbles";
import { useLanguage } from "@/contexts/LanguageContext";

export default function About() {
  const { t } = useLanguage();
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
          <span className="text-accent font-mono text-sm">{t.about.label}</span>
          <h2 className="text-4xl sm:text-5xl font-bold mt-3">
            {t.about.heading1}
            <br />
            <span className="text-muted">{t.about.heading2}</span>
          </h2>
        </motion.div>

        <div className="grid lg:grid-cols-[1fr_1.5fr] gap-16 items-stretch">
          {/* Story */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="space-y-6 flex flex-col justify-between"
          >
            <p className="text-muted leading-relaxed">
              {t.about.bio1}
            </p>
            <p className="text-muted leading-relaxed">
              {t.about.bio2}
            </p>
            <p className="text-muted leading-relaxed">
              {t.about.bio3}
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
