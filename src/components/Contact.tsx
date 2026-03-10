"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Envelope,
  LinkedinLogo,
  GithubLogo,
  PaperPlaneTilt,
  CalendarBlank,
} from "@phosphor-icons/react";

export default function Contact() {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle"
  );

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
          <span className="text-accent font-mono text-sm">04 — Contact</span>
          <h2 className="text-4xl sm:text-5xl font-bold mt-3">
            Let&apos;s work together
          </h2>
          <p className="text-muted mt-4 max-w-2xl">
            Have a project in mind? Let&apos;s talk about how I can help bring
            it to life.
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
                Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                className="w-full px-4 py-3 rounded-xl bg-surface border border-border text-foreground placeholder:text-muted/50 focus:outline-none focus:border-accent transition-colors"
                placeholder="Your name"
              />
            </div>
            <div>
              <label
                htmlFor="email"
                className="text-sm text-muted mb-2 block"
              >
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="w-full px-4 py-3 rounded-xl bg-surface border border-border text-foreground placeholder:text-muted/50 focus:outline-none focus:border-accent transition-colors"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label
                htmlFor="message"
                className="text-sm text-muted mb-2 block"
              >
                Message
              </label>
              <textarea
                id="message"
                name="message"
                required
                rows={5}
                className="w-full px-4 py-3 rounded-xl bg-surface border border-border text-foreground placeholder:text-muted/50 focus:outline-none focus:border-accent transition-colors resize-none"
                placeholder="Tell me about your project..."
              />
            </div>
            <button
              type="submit"
              disabled={status === "sending"}
              className="flex items-center gap-2 px-7 py-3.5 bg-accent text-background font-semibold rounded-full hover:bg-accent-light transition-all duration-200 disabled:opacity-50"
            >
              {status === "sending" ? (
                "Sending..."
              ) : status === "sent" ? (
                "Message Sent!"
              ) : (
                <>
                  Send Message
                  <PaperPlaneTilt size={18} />
                </>
              )}
            </button>
            {status === "error" && (
              <p className="text-red-400 text-sm">
                Something went wrong. Please try again.
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
              <h3 className="text-xl font-bold mb-4">Get in touch</h3>
              <p className="text-muted leading-relaxed">
                I&apos;m open to freelance projects, consulting, and full-time
                opportunities. Let&apos;s build something great together.
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
                <span className="font-semibold text-sm">Schedule with me</span>
                <p className="text-[11px] text-accent/60">Book a free consultation</p>
              </div>
            </button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
