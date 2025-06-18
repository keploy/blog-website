// components/DarkModeToggle.tsx
import { useEffect, useState } from "react";

export default function DarkModeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const isDark = localStorage.theme === "dark";
    setDark(isDark);
    document.documentElement.classList.toggle("dark", isDark);
  }, []);

  const toggleDark = () => {
    const newDark = !dark;
    setDark(newDark);
    document.documentElement.classList.toggle("dark", newDark);
    localStorage.theme = newDark ? "dark" : "light";
  };

  return (
    <button
      onClick={toggleDark}
      className="p-2 rounded-lg transition-colors"
      style={{
        background: 'var(--card)',
        color: 'var(--text)'
      }}
    >
      {dark ? "🌙" : "☀️"}
    </button>
  );
}
