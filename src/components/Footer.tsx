"use client";

import { useLanguage } from "@/contexts/LanguageContext";

export default function Footer() {
  const { t } = useLanguage();
  return (
    <footer className="py-8 border-t border-border">
      <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-sm text-muted">
          © {new Date().getFullYear()} Andrés Naves Mauri. {t.footer.rights}
        </p>
        <p className="text-xs text-muted/50">
          {t.footer.built}
        </p>
      </div>
    </footer>
  );
}
