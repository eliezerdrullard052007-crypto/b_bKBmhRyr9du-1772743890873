"use client"

import React from "react"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { useRecentSearches } from "@/hooks/use-recent-searches"

type Props = {
  defaultValue?: string
  onChange?: (value: string) => void
}

export default function SearchBar({ defaultValue = "", onChange }: Props) {
  const [value, setValue] = React.useState(defaultValue)
  const { addRecentSearch } = useRecentSearches() // Add this line
  React.useEffect(() => setValue(defaultValue), [defaultValue])

  // Debounce to support real-time search without spamming the API
  React.useEffect(() => {
    const t = setTimeout(() => {
      onChange?.(value)
      if (value.trim()) {
        // Only add non-empty searches
        addRecentSearch(value)
      }
    }, 300)
    return () => clearTimeout(t)
  }, [value, onChange, addRecentSearch]) // Add addRecentSearch to dependencies

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-neutral-400" />
      <Input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search for songs, artists, or videos"
        className="pl-10 h-10 bg-neutral-900 border-neutral-800 focus-visible:ring-emerald-500/60 rounded-full"
      />
    </div>
  )
}
