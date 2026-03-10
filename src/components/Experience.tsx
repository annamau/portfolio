"use client";

import { motion } from "framer-motion";
import { Buildings, Briefcase } from "@phosphor-icons/react";
import { experiences } from "@/data/experience";

export default function Experience() {
  return (
    <section id="experience" className="py-24 relative">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <span className="text-accent font-mono text-sm">
            03 — Background
          </span>
          <h2 className="text-4xl sm:text-5xl font-bold mt-3">
            Work history
          </h2>
          <p className="text-muted mt-4 max-w-2xl">
            Where engineering rigor meets AI innovation.
          </p>
        </motion.div>

        <div className="space-y-8">
          {experiences.map((exp, i) => (
            <motion.div
              key={exp.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="relative p-8 rounded-2xl bg-surface border border-border hover:border-accent/30 transition-colors duration-300"
            >
              <div className="flex flex-col sm:flex-row sm:items-start gap-6">
                {/* Icon */}
                <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center shrink-0">
                  <Buildings size={28} weight="duotone" className="text-accent" />
                </div>

                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-2">
                    <h3 className="text-xl font-bold">{exp.company}</h3>
                    <span className="text-sm text-accent font-medium">
                      {exp.period}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-muted mb-4">
                    <Briefcase size={16} />
                    <span className="text-sm">{exp.role}</span>
                  </div>

                  <p className="text-muted leading-relaxed mb-4">
                    {exp.description}
                  </p>

                  <ul className="space-y-2 mb-4">
                    {exp.highlights.map((h) => (
                      <li
                        key={h}
                        className="text-sm text-muted flex items-start gap-2"
                      >
                        <span className="text-accent mt-1.5 text-xs">●</span>
                        {h}
                      </li>
                    ))}
                  </ul>

                  <div className="flex flex-wrap gap-2">
                    {exp.techUsed.map((tech) => (
                      <span
                        key={tech}
                        className="text-xs px-3 py-1 rounded-full bg-surface-light text-muted border border-border"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
