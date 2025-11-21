"use client";

import React, { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";
import { cn } from "../../lib/utils/utils";

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Avoid rendering until client mounted to prevent SSR mismatch
  if (!mounted) {
    return (
      <div
        aria-hidden
        className={cn("w-10 h-10 rounded-md bg-card border-border", className)}
      />
    );
  }

  const effectiveTheme = theme === "system" ? (systemTheme ?? "light") : theme;
  const isDark = effectiveTheme === "dark";

  const toggleTheme = () => setTheme(isDark ? "light" : "dark");

  return (
    <button
      type="button"
      aria-pressed={isDark}
      onClick={toggleTheme}
      className={cn(
        "relative inline-flex items-center rounded-full p-0.5 transition-colors focus:outline-none",
        className || ""
      )}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {/* Track */}
      <span
        className={cn(
          "block w-14 h-8 rounded-full transition-colors duration-300",
          isDark ? "bg-zinc-800/90 border border-zinc-700" : "bg-white border border-zinc-200"
        )}
      />

      {/* Thumb */}
      <span
        className={cn(
          "absolute top-0.5 left-0.5 w-7 h-7 rounded-full transform transition-transform duration-300 shadow-md flex items-center justify-center",
          isDark
            ? "translate-x-6 bg-[#FF914D] text-white"
            : "translate-x-0 bg-white text-zinc-800"
        )}
        aria-hidden
      >
        {isDark ? (
          <Moon className="w-4 h-4" />
        ) : (
          <Sun className="w-4 h-4" />
        )}
      </span>
    </button>
  );
}

export default ThemeToggle;
