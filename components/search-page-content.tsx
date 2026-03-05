"use client"

import React from "react"
import { motion } from "framer-motion"
import SearchBar from "./search-bar"
import ResultsGrid from "./results-grid"
import { useRecentSearches } from "@/hooks/use-recent-searches"
import { Button } from "@/components/ui/button"
import { XCircle } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { useRecentlyPlayed } from "@/hooks/use-recently-played"
import { inferDominantLanguage } from "@/lib/language-detector"
import QuotaError from "./quota-error"
import { Skeleton } from "@/components/ui/skeleton"
import VideoCard, { type VideoItem } from "./video-card"

const sectionVar = {
  hidden: { opacity: 0, y: 8 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, type: "spring", stiffness: 120, damping: 18 },
  }),
}

export default function SearchPageContent() {
  const [currentSearchQuery, setCurrentSearchQuery] = React.useState("")
  const { recentSearches, clearRecentSearches, addRecentSearch } = useRecentSearches()
  const { recentlyPlayed } = useRecentlyPlayed()
  const [languageBasedSongs, setLanguageBasedSongs] = React.useState<Record<string, VideoItem[]>>({})
  const [loadingLanguageSongs, setLoadingLanguageSongs] = React.useState(true)
  const [languageSongsError, setLanguageSongsError] = React.useState<string | null>(null)
  const [isQuotaError, setIsQuotaError] = React.useState(false)

  const fetchLanguageBasedSongs = React.useCallback(async () => {
    setLoadingLanguageSongs(true)
    setLanguageSongsError(null)
    setIsQuotaError(false)

    try {
      const texts = recentlyPlayed.map((t) => `${t.title} ${t.artist}`)
      const dominantLanguage = inferDominantLanguage(texts) || "general"

      const languagesToFetch = new Set<string>()
      languagesToFetch.add(dominantLanguage)
      // Also add a couple of other popular languages for variety if dominant is not very specific
      if (dominantLanguage === "general" || dominantLanguage === "english") {
        languagesToFetch.add("tamil")
        languagesToFetch.add("hindi")
      }

      const terms = Array.from(languagesToFetch)
        .map((lang) => encodeURIComponent(`new ${lang} songs`))
        .join("|")

      if (!terms) {
        setLanguageBasedSongs({})
        setLoadingLanguageSongs(false)
        return
      }

      const res = await fetch(`/api/multi-search?terms=${terms}`)
      const text = await res.text()

      if (!res.ok) {
        if (text.includes("quotaExceeded") || text.includes("quota")) {
          setIsQuotaError(true)
          setLanguageSongsError("YouTube API quota exceeded for language-based songs.")
          return
        }
        throw new Error(text)
      }

      const data = JSON.parse(text) as { groups: Record<string, VideoItem[]> }
      const formattedData: Record<string, VideoItem[]> = {}
      for (const term in data.groups) {
        const lang = term.replace("new ", "").replace(" songs", "") // Extract language from term
        formattedData[lang] = data.groups[term]
      }
      setLanguageBasedSongs(formattedData)
    } catch (e: any) {
      console.error("Failed to fetch language-based songs:", e)
      setLanguageSongsError(e.message || "An unexpected error occurred fetching language-based songs.")
      setLanguageBasedSongs({}) // Clear previous results on error
    } finally {
      setLoadingLanguageSongs(false)
    }
  }, [recentlyPlayed])

  React.useEffect(() => {
    fetchLanguageBasedSongs()
  }, [fetchLanguageBasedSongs])

  const handleRecentSearchClick = (query: string) => {
    setCurrentSearchQuery(query)
    addRecentSearch(query) // Bring to top of recents
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="grid gap-6"
    >
      <section className="grid gap-4">
        <h2 className="text-2xl font-bold">Search</h2>
        <SearchBar defaultValue={currentSearchQuery} onChange={setCurrentSearchQuery} />
      </section>

      {currentSearchQuery.trim().length > 0 ? (
        <ResultsGrid query={currentSearchQuery} />
      ) : (
        <>
          {/* Recent Searches Section */}
          <section className="grid gap-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold">Recent Searches</h3>
              {recentSearches.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearRecentSearches}
                  className="text-xs text-neutral-400 hover:text-white gap-1"
                >
                  <XCircle className="h-3 w-3" />
                  Clear All
                </Button>
              )}
            </div>
            {recentSearches.length === 0 ? (
              <div className="rounded-lg border border-neutral-800 p-8 text-center text-neutral-400">
                No recent searches. Start searching for songs, artists, or videos!
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {recentSearches.map((query, i) => (
                  <motion.div
                    key={query}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Button
                      variant="secondary"
                      className="rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-200"
                      onClick={() => handleRecentSearchClick(query)}
                    >
                      {query}
                    </Button>
                  </motion.div>
                ))}
              </div>
            )}
          </section>

          <Separator className="bg-neutral-800" />

          {/* New Songs by Language Section */}
          <section className="grid gap-3">
            <h3 className="text-xl font-semibold">New Songs for You</h3>
            {isQuotaError ? (
              <QuotaError onRetry={fetchLanguageBasedSongs} />
            ) : languageSongsError ? (
              <div className="text-sm text-red-400">{languageSongsError}</div>
            ) : loadingLanguageSongs ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="aspect-square w-full rounded-lg bg-neutral-900/80" />
                    <Skeleton className="h-4 w-3/4 bg-neutral-900/80" />
                  </div>
                ))}
              </div>
            ) : Object.keys(languageBasedSongs).length === 0 ? (
              <div className="rounded-lg border border-neutral-800 p-8 text-center text-neutral-400">
                No new songs found based on your listening history.
              </div>
            ) : (
              <div className="grid gap-8">
                {Object.entries(languageBasedSongs).map(([lang, items], sIdx) => (
                  <motion.section
                    key={lang}
                    custom={sIdx}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.2 }}
                    variants={sectionVar}
                    className="grid gap-3"
                  >
                    <h4 className="text-base font-semibold">
                      {lang.charAt(0).toUpperCase() + lang.slice(1)} New Releases
                    </h4>
                    {items.length === 0 ? (
                      <div className="text-sm text-neutral-500 py-4 text-center">
                        No new releases available for {lang}.
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                        {items.map((it) => (
                          <VideoCard key={it.id} item={it} />
                        ))}
                      </div>
                    )}
                  </motion.section>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </motion.div>
  )
}
