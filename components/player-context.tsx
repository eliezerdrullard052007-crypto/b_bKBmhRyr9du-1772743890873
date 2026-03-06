"use client"

import React from "react"
import type { VideoItem } from "./video-card"

export type PlayerContextType = {
  currentTrack: VideoItem | null
  isPlaying: boolean
  volume: number // 0..100
  queue: VideoItem[] // New: Queue of upcoming tracks
  setTrack: (track: VideoItem) => void
  setTrackAndPlay: (track: VideoItem) => void
  setIsPlaying: (playing: boolean) => void
  setVolume: (vol: number) => void
  addToQueue: (track: VideoItem) => void // New: Add track to queue
  playNext: () => void // New: Play next track in queue
  clearQueue: () => void // New: Clear the queue
}

const PlayerContext = React.createContext<PlayerContextType | null>(null)

// Fetch preview_url from Deezer if not available
async function fetchDeezerPreview(track: VideoItem): Promise<VideoItem> {
  if (track.preview_url) return track
  
  try {
    const query = encodeURIComponent(`${track.title} ${track.artist}`)
    const res = await fetch(`/api/search?q=${query}`)
    const data = await res.json()
    
    if (data.items && data.items.length > 0) {
      const match = data.items[0]
      return {
        ...track,
        preview_url: match.preview_url,
        thumbnailUrl: match.thumbnailUrl || track.thumbnailUrl,
      }
    }
  } catch {
    // Silently fail if Deezer lookup fails
  }
  
  return track
}

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const [currentTrack, setCurrentTrack] = React.useState<VideoItem | null>(null)
  const [isPlaying, setIsPlaying] = React.useState(false)
  const [volume, setVolume] = React.useState(70)
  const [queue, setQueue] = React.useState<VideoItem[]>([]) // Initialize queue state

  const setTrack = async (track: VideoItem) => {
    const trackWithPreview = await fetchDeezerPreview(track)
    setCurrentTrack(trackWithPreview)
    setQueue([]) // Clear queue when a new track is explicitly set
  }

  const setTrackAndPlay = async (track: VideoItem) => {
    const trackWithPreview = await fetchDeezerPreview(track)
    setCurrentTrack(trackWithPreview)
    setIsPlaying(true)
    setQueue([]) // Clear queue when a new track is explicitly set and played
  }

  const addToQueue = (track: VideoItem) => {
    setQueue((prev) => {
      // Prevent duplicates in queue
      if (prev.some((item) => item.id === track.id)) {
        return prev
      }
      return [...prev, track]
    })
  }

  const playNext = async () => {
    if (queue.length > 0) {
      const [nextTrack, ...rest] = queue
      const trackWithPreview = await fetchDeezerPreview(nextTrack)
      setCurrentTrack(trackWithPreview)
      setIsPlaying(true)
      setQueue(rest)
    } else {
      setCurrentTrack(null)
      setIsPlaying(false)
    }
  }

  const clearQueue = () => {
    setQueue([])
  }

  return (
    <PlayerContext.Provider
      value={{
        currentTrack,
        isPlaying,
        volume,
        queue,
        setTrack,
        setTrackAndPlay,
        setIsPlaying,
        setVolume,
        addToQueue,
        playNext,
        clearQueue,
      }}
    >
      {children}
    </PlayerContext.Provider>
  )
}

export function usePlayer() {
  const ctx = React.useContext(PlayerContext)
  if (!ctx) throw new Error("usePlayer must be used within PlayerProvider")
  return ctx
}
