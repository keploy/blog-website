"use client";

import { useState, useEffect } from "react";
import FloatingNavbarClient from "./FloatingNavbarClient";

const glassNav =
  "relative overflow-visible backdrop-blur-3xl bg-gradient-to-br from-white/95 via-white/85 to-white/75 border border-white/80 shadow-[0_16px_40px_rgba(0,0,0,0.22)]";

export default function FloatingNavbar() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav className={`fixed top-6 left-1/2 -translate-x-1/2 z-40 transition-all duration-300 ${isScrolled ? 'w-[78%] md:w-[82%] md:max-w-4xl' : 'w-[90%] md:w-[96%] md:max-w-6xl'}`}>
      <div className={`${glassNav} rounded-full transition-all duration-300 overflow-visible ${isScrolled ? 'px-5 py-2.5' : 'px-8 py-4'}`}>
        <div className="pointer-events-none absolute inset-0 rounded-full">
          <div className="absolute -top-8 -left-6 h-24 w-24 rounded-full bg-white/60 blur-2xl" />
          <div className="absolute -bottom-10 -right-8 h-32 w-32 rounded-full bg-white/40 blur-3xl" />
        </div>
        <FloatingNavbarClient isScrolled={isScrolled} />
      </div>
    </nav>
  );
}

