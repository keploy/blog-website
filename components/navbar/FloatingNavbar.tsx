"use client";

import FloatingNavbarClient from "./FloatingNavbarClient";

// Tailwind glass helpers used by the client component too
const glassNav =
  "relative overflow-visible backdrop-blur-3xl bg-gradient-to-br from-white/90 via-white/70 to-white/50 border border-white/70 shadow-[0_16px_40px_rgba(0,0,0,0.22)]";

export default function FloatingNavbar() {
  return (
    <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-40 w-[96%] max-w-6xl">
      <div className={`${glassNav} rounded-full px-8 py-4 overflow-visible`}>
        {/* sheen + vignette layers */}
        <div className="pointer-events-none absolute inset-0 rounded-full">
          <div className="absolute -top-8 -left-6 h-24 w-24 rounded-full bg-white/60 blur-2xl" />
          <div className="absolute -bottom-10 -right-8 h-32 w-32 rounded-full bg-white/40 blur-3xl" />
        </div>
        <FloatingNavbarClient />
      </div>
    </nav>
  );
}

