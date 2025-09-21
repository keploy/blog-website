import { useEffect, useState } from "react";

// Cache for client-side requests
let cachedInstallCount: string | null = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export function useVSCodeInstalls() {
  const [installs, setInstalls] = useState<string>("Loading...");
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient || typeof window === 'undefined') return;

    const fetchInstallCount = async () => {
      try {
        const now = Date.now();
        if (cachedInstallCount && (now - cacheTimestamp) < CACHE_DURATION) {
          setInstalls(cachedInstallCount);
          return;
        }

        setInstalls("Loading...");

        // Try API route first (better for production)
        try {
          const apiResponse = await fetch('/api/vscode-installs');
          if (apiResponse.ok) {
            const data = await apiResponse.json();
            if (data.count) {
              cachedInstallCount = data.count;
              cacheTimestamp = now;
              setInstalls(data.count);
              return;
            }
          }
        } catch (apiError) {
          console.warn("API route failed, trying direct VS Code API:", apiError);
        }

        // Fallback to direct VS Code API
        const response = await fetch(
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
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        const count =
          data.results[0]?.extensions[0]?.statistics?.find(
            (stat: { statisticName: string }) =>
              stat.statisticName === "install"
          )?.value || 0;

        if (count > 0) {
          const formattedCount = formatInstallCount(count);
          cachedInstallCount = formattedCount;
          cacheTimestamp = now;
          setInstalls(formattedCount);
        } else {
          throw new Error("No install count found in API response");
        }
      } catch (error) {
        console.warn("Failed to fetch VS Code install count:", error);

        // Use cached data if available
        if (cachedInstallCount) {
          setInstalls(cachedInstallCount);
        } else {
          // Fallback to current known value
          setInstalls("695K+");
        }
      }
    };

    fetchInstallCount();
  }, [isClient]);

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