"use client"

import React from "react"
import VideoCard, { type VideoItem } from "./video-card"
import { Skeleton } from "@/components/ui/skeleton"
import { motion } from "framer-motion"
import QuotaError from "./quota-error"
import { useHomeDataCache } from "@/hooks/use-home-data-cache"

const LANG_TERMS = [
  { key: "tamil", label: "Tamil", term: "latest tamil songs" },
  { key: "hindi", label: "Hindi", term: "latest hindi songs" },
  { key: "telugu", label: "Telugu", term: "latest telugu songs" },
  { key: "malayalam", label: "Malayalam", term: "latest malayalam songs" },
  { key: "english", label: "English", term: "latest english songs" },
]

type Group = { label: string; items: VideoItem[] }

const sectionVar = {
  hidden: { opacity: 0, y: 8 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, type: "spring", stiffness: 120, damping: 18 },
  }),
}

export default function BrowseSections() {
  // Renamed from HomeLanguageSections
  const [groups, setGroups] = React.useState<Group[] | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [isQuotaError, setIsQuotaError] = React.useState(false)
  const { getCachedHomeData, setCachedHomeData } = useHomeDataCache()

  const fetchLanguageSections = React.useCallback(async () => {
    // Try to get from cache first
    const cached = getCachedHomeData()
    if (cached) {
      setGroups(cached)
      setLoading(false)
      setIsQuotaError(false)
      return
    }

    try {
      setLoading(true)
      setIsQuotaError(false)
      const terms = LANG_TERMS.map((l) => encodeURIComponent(l.term)).join("|")
      const res = await fetch(`/api/multi-search?terms=${terms}`)
      const text = await res.text()

      if (!res.ok) {
        if (text.includes("quotaExceeded") || text.includes("quota")) {
          setIsQuotaError(true)
          return
        }
        throw new Error(text)
      }

      const data = JSON.parse(text) as { groups: Record<string, VideoItem[]> }
      const ordered: Group[] = LANG_TERMS.map((l) => ({
        label: l.label,
        items: data.groups[l.term] || [],
      }))
      setGroups(ordered)
      setCachedHomeData(ordered) // Cache the new results
    } catch (e) {
      console.error("Failed to fetch language sections:", e)
      // Show empty sections on error
      setGroups(LANG_TERMS.map((l) => ({ label: l.label, items: [] })))
    } finally {
      setLoading(false)
    }
  }, [getCachedHomeData, setCachedHomeData])

  React.useEffect(() => {
    fetchLanguageSections()
  }, [fetchLanguageSections])

  if (isQuotaError) {
    return <QuotaError onRetry={fetchLanguageSections} />
  }

  if (loading || !groups) {
    return (
      <div className="grid gap-8">
        {Array.from({ length: 5 }).map((_, sIdx) => (
          <div key={sIdx} className="grid gap-3">
            <Skeleton className="h-5 w-40 bg-neutral-900/80" />
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="aspect-square w-full rounded-lg bg-neutral-900/80" />
                  <Skeleton className="h-4 w-3/4 bg-neutral-900/80" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid gap-8">
      {groups.map((g, i) => (
        <motion.section
          key={g.label}
          custom={i}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={sectionVar}
          className="grid gap-3"
        >
          <h3 className="text-base font-semibold">{g.label} • Latest</h3>
          {g.items.length === 0 ? (
            <div className="text-sm text-neutral-500 py-8 text-center">
              No results available (API quota may be exceeded)
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {g.items.map((it) => (
                <VideoCard key={it.id} item={it} />
              ))}
            </div>
          )}
        </motion.section>
      ))}
    </div>
  )
}
