"use client"

import * as React from "react"
import { useLocalStorage } from "./use-local-storage"

const MAX_RECENT_SEARCHES = 10

export function useRecentSearches() {
  const [recentSearches, setRecentSearches] = useLocalStorage<string[]>("greenify_recent_searches_v1", [])

  const addRecentSearch = React.useCallback(
    (query: string) => {
      const trimmedQuery = query.trim()
      if (!trimmedQuery) return

      setRecentSearches((prev) => {
        // Remove if already exists to bring it to the top
        const filtered = prev.filter((item) => item.toLowerCase() !== trimmedQuery.toLowerCase())
        // Add to the beginning and limit size
        return [trimmedQuery, ...filtered].slice(0, MAX_RECENT_SEARCHES)
      })
    },
    [setRecentSearches],
  )

  const clearRecentSearches = React.useCallback(() => {
    setRecentSearches([])
  }, [setRecentSearches])

  return {
    recentSearches,
    addRecentSearch,
    clearRecentSearches,
  }
}
