"use client";

import { motion } from "framer-motion";
import { FunnelChart } from "@/components/ui/funnel-chart";
import { Rocket, TrendUp } from "@phosphor-icons/react";
import { useLanguage } from "@/contexts/LanguageContext";

export default function Growth() {
  const { t } = useLanguage();
  const journeyData = [
    { label: t.growth.funnel.total, value: 14, displayValue: "14", color: "#f59e0b" },
    { label: t.growth.funnel.ai, value: 10, displayValue: "10", color: "#f59e0b" },
    { label: t.growth.funnel.heavy, value: 6, displayValue: "6", color: "#d97706" },
    { label: t.growth.funnel.autonomous, value: 3, displayValue: "3", color: "#b45309" },
  ];
  const milestones = t.growth.milestones;
  return (
    <section className="py-12 sm:py-24 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="mb-16 text-center"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-accent/30 bg-accent/5 mb-6">
            <TrendUp size={16} weight="duotone" className="text-accent" />
            <span className="text-sm text-accent font-medium">{t.growth.badge}</span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold">
            {t.growth.heading1}
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-accent-light">
              {t.growth.heading2}
            </span>
          </h2>
          <p className="text-muted mt-4 max-w-2xl mx-auto">
            {t.growth.description}
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-[1fr_1.2fr] gap-16 items-center">
          {/* Funnel chart */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6 }}
          >
            <FunnelChart
              data={journeyData}
              orientation="vertical"
              color="#f59e0b"
              layers={3}
              edges="curved"
              showPercentage={true}
              showValues={true}
              showLabels={true}
              staggerDelay={0.15}
              gap={6}
              style={{ aspectRatio: "1 / 1.4" }}
            />
          </motion.div>

          {/* Timeline */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-6"
          >
            {milestones.map((m, i) => (
              <motion.div
                key={m.year}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.3 + i * 0.1 }}
                className="relative pl-8 border-l-2 border-border hover:border-accent/50 transition-colors"
              >
                <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-surface border-2 border-accent" />
                <span className="text-accent font-mono text-sm font-bold">{m.year}</span>
                <h3 className="text-lg font-bold mt-1">{m.label}</h3>
                <p className="text-sm text-muted mt-1">{m.detail}</p>
              </motion.div>
            ))}

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.6 }}
              className="relative pl-8 border-l-2 border-accent/30"
            >
              <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-accent flex items-center justify-center">
                <Rocket size={10} weight="fill" className="text-background" />
              </div>
              <span className="text-accent font-mono text-sm font-bold">Next</span>
              <h3 className="text-lg font-bold mt-1">{t.growth.next_label}</h3>
              <p className="text-sm text-muted mt-1">
                {t.growth.next_detail}
              </p>
              <a
                href="#contact"
                className="inline-flex items-center gap-2 mt-3 text-sm text-accent font-medium hover:text-accent-light transition-colors"
              >
                {t.growth.next_cta}
              </a>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
