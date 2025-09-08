import { useEffect, useState } from "react";

// Cache for storing the install count to avoid repeated API calls
let cachedInstallCount: string | null = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

export function useVSCodeInstalls() {
  const [installs, setInstalls] = useState<string>("Loading...");
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // Ensure we're on the client side
    setIsClient(true);
  }, []);

  useEffect(() => {
    // Only run on client side
    if (!isClient || typeof window === 'undefined') return;

    const fetchInstallCount = async () => {
      try {
        // Check if we have a valid cached value
        const now = Date.now();
        if (cachedInstallCount && (now - cacheTimestamp) < CACHE_DURATION) {
          setInstalls(cachedInstallCount);
          return;
        }

        // Show loading state
        setInstalls("Loading...");

        // Try our API route first (server-side cached)
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

        // Fallback to direct VS Code Marketplace API
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
          // Cache the result
          cachedInstallCount = formattedCount;
          cacheTimestamp = now;
          setInstalls(formattedCount);
        } else {
          throw new Error("No install count found in API response");
        }
      } catch (error) {
        console.warn("Failed to fetch VS Code install count:", error);
        
        // If we have a cached value, use it even if expired
        if (cachedInstallCount) {
          setInstalls(cachedInstallCount);
        } else {
          // Last resort: try to get a reasonable fallback
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
