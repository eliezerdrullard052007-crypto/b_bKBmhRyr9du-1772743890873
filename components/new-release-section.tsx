"use client"

import React from "react"
import NewReleaseCard from "./new-release-card"
import { useRecentlyPlayed } from "@/hooks/use-recently-played"
import { inferDominantLanguage } from "@/lib/language-detector"
import { Skeleton } from "@/components/ui/skeleton"
import type { VideoItem } from "./video-card"

export default function NewReleaseSection() {
  const { recentlyPlayed } = useRecentlyPlayed()
  const [newRelease, setNewRelease] = React.useState<VideoItem | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    const fetchNewRelease = async () => {
      setLoading(true)
      setError(null)
      try {
        const texts = recentlyPlayed.map((t) => `${t.title} ${t.artist}`)
        const dominantLanguage = inferDominantLanguage(texts) || "general"
        const simulatedArtistName = dominantLanguage === "tamil" ? "Harris Jayaraj" : "Various Artists" // Simulate artist name

        const res = await fetch(`/api/recommendations?type=single-release&language=${dominantLanguage}`)
        const data = await res.json()

        if (!res.ok) {
          setError(data.error?.message || "Failed to fetch new release")
          return
        }

        if (data.items && data.items.length > 0) {
          // Randomly select one item from the fetched results
          const randomIndex = Math.floor(Math.random() * data.items.length)
          const selectedItem = data.items[randomIndex]
          setNewRelease({ ...selectedItem, artist: selectedItem.artist || simulatedArtistName })
        } else {
          setNewRelease(null)
        }
      } catch (err: any) {
        console.error("Error fetching new release:", err)
        setError(err.message || "An unexpected error occurred.")
      } finally {
        setLoading(false)
      }
    }
    fetchNewRelease()
  }, [recentlyPlayed])

  if (error) {
    return <div className="text-sm text-red-400">{error}</div>
  }

  if (loading) {
    return (
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 rounded-lg bg-neutral-900/80 border border-neutral-800">
        <Skeleton className="size-32 sm:size-40 rounded-md bg-neutral-800 shrink-0" />
        <div className="flex-1 grid gap-2 min-w-0">
          <Skeleton className="h-4 w-24 bg-neutral-800" />
          <Skeleton className="h-6 w-3/4 bg-neutral-800" />
          <Skeleton className="h-4 w-1/2 bg-neutral-800" />
          <div className="flex gap-2 mt-2">
            <Skeleton className="h-10 w-24 rounded-full" />
            <Skeleton className="size-10 rounded-full" />
            <Skeleton className="size-10 rounded-full" />
          </div>
        </div>
      </div>
    )
  }

  if (!newRelease) {
    return (
      <div className="rounded-lg border border-neutral-800 p-8 text-center text-neutral-400">
        No new release found for your preferences.
      </div>
    )
  }

  return <NewReleaseCard item={newRelease} artistName={newRelease.artist} releaseType="Single" />
}
