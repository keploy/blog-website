import { useEffect, useState } from "react";
import { useRouter } from "next/router";

export function useVSCodeInstalls(initialInstalls = "540K") {
  const [installs, setInstalls] = useState(initialInstalls);
  const { basePath } = useRouter();

  useEffect(() => {
    const url = `${basePath}/api/vscode-installs`;
    fetch(url)
      .then((response) => response.json())
      .then((data) => {
        const count = data.installs || 0;
        const formattedCount = formatInstallCount(count);
        setInstalls(formattedCount);
      })
      .catch(() => {});
  }, [basePath]);
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
