"use client";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return (
    <button
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      className="
        p-2
        rounded-full
        transition
        bg-transparent
        hover:bg-transparent
        focus-visible:ring-0
        focus-visible:ring-offset-0
        focus:outline-none
        shadow-none
        text-gray-600
        dark:text-gray-300
        hover:text-orange-500
      "
    >
      {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
    </button>
  );
}
