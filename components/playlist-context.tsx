"use client"

import React from "react"
import type { VideoItem } from "./video-card"
import { useLocalStorage } from "@/hooks/use-local-storage"

export type Playlist = {
  id: string
  name: string
  createdAt: number
  trackIds: string[]
}

type PersistState = {
  playlists: Record<string, Playlist>
  tracks: Record<string, VideoItem>
  favorites: Record<string, true>
}

const defaultState: PersistState = { playlists: {}, tracks: {}, favorites: {} }

type Ctx = {
  playlists: Playlist[]
  getPlaylist: (id: string) => (Playlist & { tracks: VideoItem[] }) | undefined
  createPlaylist: (name: string) => string
  addToPlaylist: (id: string, track: VideoItem) => void
  removeFromPlaylist: (id: string, trackId: string) => void
  isFavorite: (trackId: string) => boolean
  toggleFavorite: (track: VideoItem) => void
  exportPlaylist: (id: string, format: "m3u" | "json") => void
  reorderPlaylist: (id: string, newOrder: string[]) => void
  // Expose raw state for liked songs page
  state: PersistState
}

const PlaylistContext = React.createContext<Ctx | null>(null)

export function PlaylistProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useLocalStorage<PersistState>("greenify_state_v1", defaultState)

  const playlists = React.useMemo(
    () => Object.values(state.playlists).sort((a, b) => b.createdAt - a.createdAt),
    [state.playlists],
  )

  const getPlaylist = (id: string) => {
    const p = state.playlists[id]
    if (!p) return undefined
    const tracks = p.trackIds.map((tid) => state.tracks[tid]).filter(Boolean)
    return { ...p, tracks }
  }

  const createPlaylist = (name: string) => {
    const id = crypto.randomUUID()
    setState((prev) => ({
      ...prev,
      playlists: {
        ...prev.playlists,
        [id]: { id, name, createdAt: Date.now(), trackIds: [] },
      },
    }))
    return id
  }

  const addToPlaylist = (id: string, track: VideoItem) => {
    setState((prev) => {
      const p = prev.playlists[id]
      if (!p) return prev
      const has = p.trackIds.includes(track.id)
      return {
        ...prev,
        tracks: { ...prev.tracks, [track.id]: track },
        playlists: {
          ...prev.playlists,
          [id]: { ...p, trackIds: has ? p.trackIds : [...p.trackIds, track.id] },
        },
      }
    })
  }

  const removeFromPlaylist = (id: string, trackId: string) => {
    setState((prev) => {
      const p = prev.playlists[id]
      if (!p) return prev
      return {
        ...prev,
        playlists: {
          ...prev.playlists,
          [id]: { ...p, trackIds: p.trackIds.filter((t) => t !== trackId) },
        },
      }
    })
  }

  const reorderPlaylist = (id: string, newOrder: string[]) => {
    setState((prev) => {
      const p = prev.playlists[id]
      if (!p) return prev
      // Keep only unique ids that exist in current playlist and known tracks
      const set = new Set<string>(p.trackIds)
      const filtered = newOrder.filter((tid) => set.has(tid))
      // Fallback: if filtered is empty (bad input), keep existing order
      const nextOrder = filtered.length > 0 ? filtered : p.trackIds
      return {
        ...prev,
        playlists: {
          ...prev.playlists,
          [id]: { ...p, trackIds: nextOrder },
        },
      }
    })
  }

  const isFavorite = (trackId: string) => !!state.favorites[trackId]

  const toggleFavorite = (track: VideoItem) => {
    setState((prev) => {
      const nextFav = { ...prev.favorites }
      if (nextFav[track.id]) delete nextFav[track.id]
      else nextFav[track.id] = true
      return { ...prev, tracks: { ...prev.tracks, [track.id]: track }, favorites: nextFav }
    })
  }

  const exportPlaylist = (id: string, format: "m3u" | "json") => {
    const p = getPlaylist(id)
    if (!p) return
    if (format === "json") {
      const blob = new Blob([JSON.stringify(p, null, 2)], { type: "application/json" })
      const a = document.createElement("a")
      a.href = URL.createObjectURL(blob)
      a.download = `${p.name}.json`
      a.click()
      URL.revokeObjectURL(a.href)
      return
    }
    // m3u export with YouTube URLs
    const lines = ["#EXTM3U", ...p.tracks.map((t) => `https://www.youtube.com/watch?v=${t.id}`)]
    const blob = new Blob([lines.join("\n")], { type: "audio/x-mpegurl" })
    const a = document.createElement("a")
    a.href = URL.createObjectURL(blob)
    a.download = `${p.name}.m3u`
    a.click()
    URL.revokeObjectURL(a.href)
  }

  const value: Ctx = {
    playlists,
    getPlaylist,
    createPlaylist,
    addToPlaylist,
    removeFromPlaylist,
    isFavorite,
    toggleFavorite,
    exportPlaylist,
    reorderPlaylist,
    state, // Expose raw state
  }

  return <PlaylistContext.Provider value={value}>{children}</PlaylistContext.Provider>
}

export function usePlaylists() {
  const ctx = React.useContext(PlaylistContext)
  if (!ctx) throw new Error("usePlaylists must be used within PlaylistProvider")
  return ctx
}
