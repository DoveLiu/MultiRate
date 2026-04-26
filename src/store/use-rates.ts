"use client";

import { useEffect, useState } from "react";
import type { RatesPayload } from "@/lib/rates/types";

export function useRates() {
  const [data, setData] = useState<RatesPayload | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load(force = false) {
    try {
      if (force) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      const response = await fetch(`/api/rates${force ? "?force=1" : ""}`, {
        cache: "no-store"
      });
      const payload = (await response.json()) as RatesPayload;
      const nextError = !response.ok ? payload.error ?? "無法取得匯率資料" : payload.error;

      setData(payload);
      setError(nextError);

      return response.ok && !nextError;
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "無法取得匯率資料");
      return false;
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }

  useEffect(() => {
    void load(false);
  }, []);

  return {
    data,
    isLoading,
    isRefreshing,
    error,
    refresh: () => load(true)
  };
}
