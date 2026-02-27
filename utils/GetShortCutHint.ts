import { useEffect,useState } from "react";
export function ShortcutHint() {
  const [shortcut, setShortcut] = useState("Ctrl + K");

  useEffect(() => {
    const ua = navigator.userAgent.toLowerCase();
    if (ua.includes("macintosh") || ua.includes("mac os x")) {
      setShortcut("Cmd + K");
    }
  }, []);

  return shortcut;
}
