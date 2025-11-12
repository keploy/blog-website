"use client";

import { useState, useEffect } from "react";
import FloatingNavbarClient from "./FloatingNavbarClient";

const glassNav =
  "relative overflow-visible backdrop-blur-2xl bg-gradient-to-br from-white/80 via-white/62 to-white/48 border border-white/50";

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
      <div className={`${glassNav} rounded-full transition-all duration-300 overflow-visible ${isScrolled ? 'shadow-none' : 'shadow-[0_18px_44px_rgba(15,23,42,0.18)]'} ${isScrolled ? 'px-4 py-1.5 md:px-4 md:py-2 lg:px-5 lg:py-2.5' : 'px-5 py-2 md:px-6 md:py-3 lg:px-8 lg:py-4'}`}>
        <div className="pointer-events-none absolute inset-0 rounded-full">
          <div className="absolute -top-8 -left-6 h-24 w-24 rounded-full bg-white/60 blur-2xl" />
          <div className="absolute -bottom-10 -right-8 h-32 w-32 rounded-full bg-white/40 blur-3xl" />
        </div>
        <FloatingNavbarClient isScrolled={isScrolled} />
      </div>
    </nav>
  );
}

