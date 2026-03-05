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

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const [currentTrack, setCurrentTrack] = React.useState<VideoItem | null>(null)
  const [isPlaying, setIsPlaying] = React.useState(false)
  const [volume, setVolume] = React.useState(70)
  const [queue, setQueue] = React.useState<VideoItem[]>([]) // Initialize queue state

  const setTrack = (track: VideoItem) => {
    setCurrentTrack(track)
    setQueue([]) // Clear queue when a new track is explicitly set
  }

  const setTrackAndPlay = (track: VideoItem) => {
    setCurrentTrack(track)
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

  const playNext = () => {
    setQueue((prev) => {
      if (prev.length > 0) {
        const [nextTrack, ...rest] = prev
        setCurrentTrack(nextTrack)
        setIsPlaying(true)
        return rest
      } else {
        setCurrentTrack(null)
        setIsPlaying(false)
        return []
      }
    })
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
