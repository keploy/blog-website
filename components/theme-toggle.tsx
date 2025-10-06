"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export function ThemeToggle() {
  const { setTheme, theme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div className="relative group">
      <button
        onClick={() => setTheme(theme === "light" ? "dark" : "light")}
        className="relative overflow-hidden px-4 py-1 flex items-center justify-center transition-all duration-200 border-2 border-transparent hover:border-orange-400/80 rounded-full hover:bg-orange-400/10 hover:text-orange-500 text-lg group/link dark:text-white min-w-[48px] h-[38px]"
      >
        <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-orange-500" />
        <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-blue-400" />
        <div className="absolute inset-0 -translate-x-full group-hover/link:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-orange-400/20 to-transparent" />
        <span className="sr-only">Toggle theme</span>
      </button>
    </div>
  );
}
