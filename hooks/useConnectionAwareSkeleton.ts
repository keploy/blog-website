import { useEffect, useState } from "react";

const SLOW_CONNECTION_TYPES = new Set(["slow-2g", "2g", "3g"]);

type ConnectionAwareSkeletonOptions = {
  enabled?: boolean;
  fastDelay?: number;
  slowDelay?: number;
};

export function useConnectionAwareSkeleton(
  options: ConnectionAwareSkeletonOptions = {}
) {
  const { enabled = true, fastDelay = 300, slowDelay = 1200 } = options;
  const [isLoading, setIsLoading] = useState(enabled);

  useEffect(() => {
    if (!enabled) {
      setIsLoading(false);
      return;
    }

    const detectDelay = () => {
      if (typeof navigator === "undefined") {
        return fastDelay;
      }

      const navigatorWithConnection = navigator as Navigator & {
        connection?: { effectiveType?: string };
        mozConnection?: { effectiveType?: string };
        webkitConnection?: { effectiveType?: string };
      };

      const connection =
        navigatorWithConnection.connection ||
        (navigatorWithConnection as any).mozConnection ||
        (navigatorWithConnection as any).webkitConnection;

      if (
        connection?.effectiveType &&
        SLOW_CONNECTION_TYPES.has(connection.effectiveType)
      ) {
        return slowDelay;
      }

      return fastDelay;
    };

    const timer = window.setTimeout(() => {
      setIsLoading(false);
    }, detectDelay());

    return () => window.clearTimeout(timer);
  }, [enabled, fastDelay, slowDelay]);

  return isLoading;
}
