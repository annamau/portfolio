"use client";

import { SmokeBackground } from "@/components/ui/spooky-smoke-animation";

export function GlobalSmoke() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none">
      <SmokeBackground smokeColor="#d97706" />
    </div>
  );
}
