"use client"

import * as React from "react"
import { useLocalStorage } from "./use-local-storage"
import type { VideoItem } from "@/components/video-card"

export type RecentlyPlayedTrack = VideoItem & {
  playedAt: number
}

const MAX_RECENTLY_PLAYED = 30 // Limit the number of recently played tracks

export function useRecentlyPlayed() {
  const [recentlyPlayed, setRecentlyPlayed] = useLocalStorage<RecentlyPlayedTrack[]>("greenify_recently_played_v1", [])

  const addRecentlyPlayed = React.useCallback(
    (track: VideoItem) => {
      setRecentlyPlayed((prev) => {
        // Remove if already exists to bring it to the top
        const filtered = prev.filter((item) => item.id !== track.id)
        const newTrack: RecentlyPlayedTrack = { ...track, playedAt: Date.now() }
        // Add to the beginning and limit size
        return [newTrack, ...filtered].slice(0, MAX_RECENTLY_PLAYED)
      })
    },
    [setRecentlyPlayed],
  )

  const getRecentlyPlayed = React.useCallback(() => {
    return recentlyPlayed
  }, [recentlyPlayed])

  return {
    recentlyPlayed,
    addRecentlyPlayed,
    getRecentlyPlayed,
  }
}
