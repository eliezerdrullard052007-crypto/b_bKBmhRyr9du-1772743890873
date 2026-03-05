"use client"

import React from "react"
import { useLocalStorage } from "@/hooks/use-local-storage"

type QuotaUsage = {
  used: number
  limit: number
  resetTime: string
  lastUpdated: number
}

type ApiCall = {
  endpoint: string
  cost: number
  timestamp: number
}

// YouTube API quota costs per operation
const QUOTA_COSTS = {
  search: 100,
  videos: 1,
  channels: 1,
  playlists: 1,
} as const

export function useQuotaTracker() {
  const [usage, setUsage] = useLocalStorage<QuotaUsage | null>("quota_usage", null)
  const [dailyCalls, setDailyCalls] = useLocalStorage<ApiCall[]>("daily_api_calls", [])

  // Track an API call
  const trackApiCall = React.useCallback(
    (endpoint: keyof typeof QUOTA_COSTS) => {
      const cost = QUOTA_COSTS[endpoint]
      const now = Date.now()

      // Add to daily calls log
      setDailyCalls((prev) => {
        const today = new Date().toDateString()
        const todayCalls = prev.filter((call) => new Date(call.timestamp).toDateString() === today)

        return [...todayCalls, { endpoint, cost, timestamp: now }]
      })

      // Update usage
      setUsage((prev) => {
        if (!prev) {
          // Initialize with estimated values
          const resetTime = new Date()
          resetTime.setDate(resetTime.getDate() + 1)
          resetTime.setHours(0, 0, 0, 0)

          return {
            used: cost,
            limit: 10000,
            resetTime: resetTime.toISOString(),
            lastUpdated: now,
          }
        }

        return {
          ...prev,
          used: prev.used + cost,
          lastUpdated: now,
        }
      })
    },
    [setUsage, setDailyCalls],
  )

  // Get today's usage
  const getTodayUsage = React.useCallback(() => {
    const today = new Date().toDateString()
    const todayCalls = dailyCalls.filter((call) => new Date(call.timestamp).toDateString() === today)

    return todayCalls.reduce((total, call) => total + call.cost, 0)
  }, [dailyCalls])

  // Reset quota at midnight
  React.useEffect(() => {
    if (!usage) return

    const resetTime = new Date(usage.resetTime)
    const now = new Date()

    if (now >= resetTime) {
      // Reset quota
      const nextReset = new Date(resetTime)
      nextReset.setDate(nextReset.getDate() + 1)

      setUsage({
        used: 0,
        limit: usage.limit,
        resetTime: nextReset.toISOString(),
        lastUpdated: Date.now(),
      })

      // Clear old API calls
      setDailyCalls([])
    }
  }, [usage, setUsage, setDailyCalls])

  return {
    usage,
    trackApiCall,
    getTodayUsage,
    dailyCalls,
  }
}

// HOC to automatically track API calls
export function withQuotaTracking<T extends Record<string, any>>(
  Component: React.ComponentType<T>,
): React.ComponentType<T> {
  return function TrackedComponent(props: T) {
    const { trackApiCall } = useQuotaTracker()

    // Inject tracking function into props
    const enhancedProps = {
      ...props,
      trackApiCall,
    } as T

    return <Component {...enhancedProps} />
  }
}
