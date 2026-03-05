"use client"

import * as React from "react"

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [state, setState] = React.useState<T>(() => {
    if (typeof window === "undefined") return initialValue
    try {
      const raw = window.localStorage.getItem(key)
      return raw ? (JSON.parse(raw) as T) : initialValue
    } catch {
      return initialValue
    }
  })

  React.useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(state))
    } catch {}
  }, [key, state])

  return [
    state,
    (updater: T | ((prev: T) => T)) =>
      setState((prev) => (typeof updater === "function" ? (updater as any)(prev) : updater)),
  ] as const
}
