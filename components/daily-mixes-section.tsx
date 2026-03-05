"use client"

import React from "react"
import { motion } from "framer-motion"
import VideoCard, { type VideoItem } from "./video-card"
import { useRecentlyPlayed } from "@/hooks/use-recently-played"
import { inferDominantLanguage } from "@/lib/language-detector"
import { Skeleton } from "@/components/ui/skeleton"

const itemVar = {
  hidden: { opacity: 0, y: 12, scale: 0.98 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 120, damping: 16 } },
}

export default function DailyMixesSection() {
  const { recentlyPlayed } = useRecentlyPlayed()
  const [dailyMixSongs, setDailyMixSongs] = React.useState<VideoItem[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    const fetchRecommendations = async () => {
      setLoading(true)
      setError(null)
      try {
        const texts = recentlyPlayed.map((t) => `${t.title} ${t.artist}`)
        const dominantLanguage = inferDominantLanguage(texts) || "general"

        const res = await fetch(`/api/recommendations?type=songs&language=${dominantLanguage}`)
        const data = await res.json()

        if (!res.ok) {
          setError(data.error?.message || "Failed to fetch recommendations")
          return
        }
        setDailyMixSongs(data.items)
      } catch (err: any) {
        console.error("Error fetching daily mix songs:", err)
        setError(err.message || "An unexpected error occurred.")
      } finally {
        setLoading(false)
      }
    }
    fetchRecommendations()
  }, [recentlyPlayed])

  if (error) {
    return <div className="text-sm text-red-400">{error}</div>
  }

  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="aspect-square w-full rounded-lg bg-neutral-900/80" />
            <Skeleton className="h-4 w-3/4 bg-neutral-900/80" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
      {dailyMixSongs.map((item, i) => (
        <motion.div key={item.id} variants={itemVar} custom={i}>
          <VideoCard item={item} />
        </motion.div>
      ))}
    </div>
  )
}
