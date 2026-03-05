"use client"

import React from "react"
import VideoCard, { type VideoItem } from "./video-card"
import { Skeleton } from "@/components/ui/skeleton"
import { motion } from "framer-motion"
import QuotaError from "./quota-error"
import { useQuotaTracker } from "./quota-usage-tracker"
import { useSearchCache } from "@/hooks/use-search-cache" // Import the new hook

type Props = { query: string }

const container = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { when: "beforeChildren", staggerChildren: 0.04 },
  },
}

const itemVar = {
  hidden: { opacity: 0, y: 12, scale: 0.98 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 120, damping: 16 } },
}

export default function ResultsGrid({ query }: Props) {
  const [results, setResults] = React.useState<VideoItem[]>([])
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [isQuotaError, setIsQuotaError] = React.useState(false)
  const { trackApiCall } = useQuotaTracker()
  const { getCachedResults, setCachedResults } = useSearchCache() // Use the search cache hook

  const fetchResults = React.useCallback(async () => {
    if (!query.trim()) {
      setResults([])
      setError(null)
      setIsQuotaError(false)
      return
    }

    // Try to get from cache first
    const cached = getCachedResults(query)
    if (cached) {
      setResults(cached)
      setError(null)
      setIsQuotaError(false)
      setLoading(false) // Ensure loading state is off if served from cache
      return
    }

    setLoading(true)
    setError(null)
    setIsQuotaError(false)

    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
      const text = await res.text()

      if (!res.ok) {
        // Check if it's a quota error
        if (text.includes("quotaExceeded") || text.includes("quota")) {
          setIsQuotaError(true)
          setError("YouTube API quota exceeded")
        } else {
          setError(text)
        }
        return
      }

      const data = JSON.parse(text) as { items: VideoItem[] }
      setResults(data.items)
      setCachedResults(query, data.items) // Cache the new results

      // trackApiCall("search") // Removed from here, now tracked in API route
    } catch (e: any) {
      setError(e?.message ?? "Unexpected error")
    } finally {
      setLoading(false)
    }
  }, [query, getCachedResults, setCachedResults])

  React.useEffect(() => {
    let aborted = false
    const run = async () => {
      await fetchResults()
    }
    run()
    return () => {
      aborted = true
    }
  }, [fetchResults])

  if (isQuotaError) {
    return <QuotaError onRetry={fetchResults} />
  }

  if (error) {
    return (
      <div className="text-sm text-red-400">
        {error.includes("YOUTUBE_API_KEY")
          ? "Missing YouTube API key. Add YOUTUBE_API_KEY in your Vercel project settings and redeploy."
          : error}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="aspect-square w-full rounded-lg bg-neutral-900/80" />
            <Skeleton className="h-4 w-3/4 bg-neutral-900/80" />
            <Skeleton className="h-3 w-1/2 bg-neutral-900/80" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4"
    >
      {results.map((item) => (
        <motion.div key={item.id} variants={itemVar}>
          <VideoCard item={item} />
        </motion.div>
      ))}
    </motion.div>
  )
}
