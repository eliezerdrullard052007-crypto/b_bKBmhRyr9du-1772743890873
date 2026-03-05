"use client"

import React from "react"
import { motion } from "framer-motion"
import BrowseCard from "./browse-card"
import { useRecentlyPlayed } from "@/hooks/use-recently-played"
import { inferDominantLanguage } from "@/lib/language-detector"
import { Skeleton } from "@/components/ui/skeleton"
import { usePlayer } from "./player-context"
import { toast } from "@/hooks/use-toast"
import type { VideoItem } from "./video-card"

type SimulatedPlaylist = {
  id: string
  name: string
  tracks: VideoItem[]
  thumbnailUrl: string
}

const itemVar = {
  hidden: { opacity: 0, y: 12, scale: 0.98 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 120, damping: 16 } },
}

export default function RecommendedPlaylistsSection() {
  const { recentlyPlayed } = useRecentlyPlayed()
  const { setTrackAndPlay, addToQueue } = usePlayer()
  const [displayedPlaylists, setDisplayedPlaylists] = React.useState<SimulatedPlaylist[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    const fetchAndSelectRecommendations = async () => {
      setLoading(true)
      setError(null)
      try {
        const texts = recentlyPlayed.map((t) => `${t.title} ${t.artist}`)
        const dominantLanguage = inferDominantLanguage(texts) || "general"

        const res = await fetch(`/api/recommendations?type=playlists&language=${dominantLanguage}`)
        const data = await res.json()

        if (!res.ok) {
          setError(data.error?.message || "Failed to fetch recommendations")
          return
        }

        if (data.items && data.items.length > 0) {
          // Randomly select 3 to 6 playlists to display
          const numToDisplay = Math.min(data.items.length, Math.floor(Math.random() * 4) + 3) // 3 to 6 playlists
          const shuffled = data.items.sort(() => 0.5 - Math.random())
          setDisplayedPlaylists(shuffled.slice(0, numToDisplay))
        } else {
          setDisplayedPlaylists([])
        }
      } catch (err: any) {
        console.error("Error fetching recommended playlists:", err)
        setError(err.message || "An unexpected error occurred.")
      } finally {
        setLoading(false)
      }
    }
    fetchAndSelectRecommendations()
  }, [recentlyPlayed])

  const handlePlayRecommendedPlaylist = (playlist: SimulatedPlaylist) => {
    if (playlist.tracks.length === 0) {
      toast({
        title: "Playlist Empty",
        description: "This recommended playlist has no tracks.",
        variant: "destructive",
      })
      return
    }
    setTrackAndPlay(playlist.tracks[0]) // Play the first track
    playlist.tracks.slice(1).forEach((track) => addToQueue(track)) // Add rest to queue
    toast({
      title: "Playing Recommended Playlist",
      description: `Now playing "${playlist.name}" and adding tracks to queue.`,
    })
  }

  if (error) {
    return <div className="text-sm text-red-400">{error}</div>
  }

  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-48 w-full rounded-lg bg-neutral-900/80" />
        ))}
      </div>
    )
  }

  if (displayedPlaylists.length === 0) {
    return (
      <div className="rounded-lg border border-neutral-800 p-8 text-center text-neutral-400">
        No personalized recommendations available right now. Listen to more songs to get suggestions!
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
      {displayedPlaylists.map((playlist, i) => (
        <motion.div key={playlist.id} variants={itemVar} custom={i}>
          <BrowseCard
            title={playlist.name}
            imageUrl={playlist.thumbnailUrl}
            bgColor="#282828"
            className="h-48 flex-col items-center justify-center p-4"
            onClick={() => handlePlayRecommendedPlaylist(playlist)}
          />
        </motion.div>
      ))}
    </div>
  )
}
