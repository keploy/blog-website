import { useEffect, useState } from "react";

const CACHE_KEY = "keploy-vscode-installs";
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour TTL

function readCachedInstalls(): string | null {
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

export function useVSCodeInstalls(initialInstalls = "1.2M") {
  const [installs, setInstalls] = useState(initialInstalls);

  useEffect(() => {
    const cached = readCachedInstalls();
    if (cached) {
      setInstalls(cached);
      return;
    }

    fetch(
      "https://marketplace.visualstudio.com/_apis/public/gallery/extensionquery",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json;api-version=7.1-preview.1",
        },
        body: JSON.stringify({
          filters: [
            {
              criteria: [
                {
                  filterType: 7,
                  value: "Keploy.keployio",
                },
              ],
            },
          ],
          flags: 914,
        }),
      }
    )
      .then((response) => response.json())
      .then((data) => {
        const count =
          data.results[0]?.extensions[0]?.statistics?.find(
            (stat: { statisticName: string }) =>
              stat.statisticName === "install"
          )?.value || 0;
        if (count > 0) {
          const formattedCount = formatInstallCount(count);
          setInstalls(formattedCount);
          try {
            localStorage.setItem(
              CACHE_KEY,
              JSON.stringify({ value: formattedCount, ts: Date.now() })
            );
          } catch {}
        }
      })
      .catch(() => {});
  }, []);

  return installs;
}

function formatInstallCount(count: number): string {
  if (count >= 1_000_000) {
    const millions = count / 1_000_000;
    return millions < 100
      ? `${(Math.round(millions * 10) / 10).toString().replace(/\.0$/, "")}M`
      : `${Math.round(millions)}M`;
  }
  if (count >= 100_000) {
    return `${Math.round(count / 1_000)}K`;
  }
  if (count >= 1_000) {
    return `${(Math.round((count / 1_000) * 10) / 10)
      .toString()
      .replace(/\.0$/, "")}K`;
  }
  return count.toString();
}
