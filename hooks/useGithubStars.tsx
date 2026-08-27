import { useEffect, useState } from "react";

const CACHE_KEY = "keploy-gh-stars";
const CACHE_TTL_MS = 60 * 60 * 1000; // 1h — a star count doesn't need to be fresher.

function readCachedStars(): string | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const { value, ts } = JSON.parse(raw);
    if (typeof value !== "string" || typeof ts !== "number") return null;
    if (Date.now() - ts > CACHE_TTL_MS) return null;
    return value;
  } catch {
    return null;
  }
}

export function useGithubStars(initialStars = "10.2K") {
  const [stars, setStars] = useState(initialStars);

  useEffect(() => {
    // Serve a fresh cached count immediately and skip the network. Only hit
    // api.github.com when the cache is missing or past its TTL — otherwise
    // every navigation fired a request, wasting the per-IP rate limit (60/hr)
    // so users behind shared IPs got 403s and fell back to the stale default.
    const cached = readCachedStars();
    if (cached) {
      setStars(cached);
      return;
    }

    fetch("https://api.github.com/repos/keploy/keploy")
      .then((response) => response.json())
      .then((data) => {
        const count = data.stargazers_count;
        if (typeof count !== "number") return;
        const formattedCount =
          count >= 1000
            ? `${(count / 1000).toFixed(1).replace(".0", "")}K`
            : count.toString();
        setStars(formattedCount);
        try {
          localStorage.setItem(
            CACHE_KEY,
            JSON.stringify({ value: formattedCount, ts: Date.now() })
          );
        } catch {}
      })
      .catch(() => {});
  }, []);

  return stars;
}
