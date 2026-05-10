/**
 * SWR hooks for SmartScan live data
 * Use these in any client component — no prop drilling needed.
 */
"use client";

import useSWR from "swr";
import { flaskApi } from "@/lib/flask-api";

const fetcher = {
  status: () => flaskApi.status(),
  health: () => flaskApi.health(),
  usage: () => flaskApi.usage(),
  pages: () => flaskApi.pages(),
};

/** Polls /status every 3 s — pages scanned, formulas, activity feed */
export function useStatus() {
  const { data, error, isLoading } = useSWR("status", fetcher.status, {
    refreshInterval: 3000,
    revalidateOnFocus: false,
  });
  return { status: data, statusError: error, statusLoading: isLoading };
}

/** Polls /health every 5 s — Arduino / Pi / model connectivity */
export function useHealth() {
  const { data, error, isLoading } = useSWR("health", fetcher.health, {
    refreshInterval: 5000,
    revalidateOnFocus: false,
  });
  return { health: data, healthError: error, healthLoading: isLoading };
}

/** Polls /usage every 10 s — Gemini call count & latency */
export function useUsage() {
  const { data, error, isLoading } = useSWR("usage", fetcher.usage, {
    refreshInterval: 10000,
    revalidateOnFocus: false,
  });
  return { usage: data, usageError: error, usageLoading: isLoading };
}

/** Polls /pages every 5 s — list of all processed page markdowns */
export function usePages() {
  const { data, error, isLoading, mutate } = useSWR("pages", fetcher.pages, {
    refreshInterval: 5000,
    revalidateOnFocus: false,
  });
  return {
    pages: data?.pages ?? [],
    total: data?.total ?? 0,
    pagesError: error,
    pagesLoading: isLoading,
    mutatePages: mutate,
  };
}
