"use client"

import * as React from "react"
import { useLocalStorage } from "./use-local-storage"
import type { VideoItem } from "@/components/video-card"

type CachedSearchResult = {
  query: string
  timestamp: number
  items: VideoItem[]
}

const CACHE_DURATION_MS = 5 * 60 * 1000 // 5 minutes

export function useSearchCache() {
  const [cache, setCache] = useLocalStorage<Record<string, CachedSearchResult>>("greenify_search_cache_v1", {})

  const getCachedResults = React.useCallback(
    (query: string): VideoItem[] | null => {
      const entry = cache[query.toLowerCase()]
      if (entry && Date.now() - entry.timestamp < CACHE_DURATION_MS) {
        return entry.items
      }
      return null
    },
    [cache],
  )

  const setCachedResults = React.useCallback(
    (query: string, items: VideoItem[]) => {
      setCache((prev) => ({
        ...prev,
        [query.toLowerCase()]: {
          query,
          timestamp: Date.now(),
          items,
        },
      }))
    },
    [setCache],
  )

  return { getCachedResults, setCachedResults }
}
