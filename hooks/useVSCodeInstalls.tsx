import { useEffect, useState } from "react";

export function useVSCodeInstalls(initialInstalls = "695K") {
  const [installs, setInstalls] = useState(initialInstalls);

  useEffect(() => {
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
                  value: "Keploy.keployio", // Replace with actual extension ID
                },
              ],
            },
          ],
          flags: 914,
        }),
      }
    )
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        const count =
          data.results[0]?.extensions[0]?.statistics?.find(
            (stat: { statisticName: string }) =>
              stat.statisticName === "install"
          )?.value || 0;
        
        if (count > 0) {
          const formattedCount = formatInstallCount(count);
          setInstalls(formattedCount);
        }
      })
      .catch((error) => {
        // Log error for debugging but keep fallback value
        console.warn("Failed to fetch VS Code install count:", error);
      });
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
