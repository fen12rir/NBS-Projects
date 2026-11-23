"use client";

import { useEffect, useRef } from "react";

interface UseAutoRefreshOptions {
  // Polling interval
  intervalMs?: number;
  // Minimum refresh gap
  minGapMs?: number;
  // Auto-refresh toggle
  enabled?: boolean;
}

// Auto-refresh hook
export function useAutoRefresh(
  onRefresh: () => void | Promise<void>,
  options: UseAutoRefreshOptions = {}
) {
  const { intervalMs = 20000, minGapMs = 3000, enabled = true } = options;
  const savedCallback = useRef(onRefresh);
  const lastRunRef = useRef<number>(Date.now());

  useEffect(() => {
    savedCallback.current = onRefresh;
  }, [onRefresh]);

  useEffect(() => {
    if (!enabled) return;

    const triggerRefresh = (force = false) => {
      if (typeof document !== "undefined" && document.visibilityState !== "visible") {
        return;
      }
      const now = Date.now();
      if (!force && now - lastRunRef.current < minGapMs) {
        return;
      }
      lastRunRef.current = now;
      savedCallback.current();
    };

    const timer = setInterval(() => {
      triggerRefresh(true);
    }, intervalMs);

    const handleFocus = () => triggerRefresh(false);
    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        triggerRefresh(false);
      }
    };

    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      clearInterval(timer);
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [intervalMs, minGapMs, enabled]);
}
