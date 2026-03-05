"use client"

import * as React from "react"
import { useLocalStorage } from "./use-local-storage"
import type { VideoItem } from "@/components/video-card"

type HomeSectionGroup = { label: string; items: VideoItem[] }

type CachedHomeData = {
  timestamp: number
  groups: HomeSectionGroup[]
}

const HOME_CACHE_DURATION_MS = 15 * 60 * 1000 // 15 minutes

export function useHomeDataCache() {
  const [cache, setCache] = useLocalStorage<CachedHomeData | null>("greenify_home_data_cache_v1", null)

  const getCachedHomeData = React.useCallback((): HomeSectionGroup[] | null => {
    if (cache && Date.now() - cache.timestamp < HOME_CACHE_DURATION_MS) {
      return cache.groups
    }
    return null
  }, [cache])

  const setCachedHomeData = React.useCallback(
    (groups: HomeSectionGroup[]) => {
      setCache({
        timestamp: Date.now(),
        groups,
      })
    },
    [setCache],
  )

  return { getCachedHomeData, setCachedHomeData }
}
