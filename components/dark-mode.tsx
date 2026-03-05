"use client"

import { useEffect } from "react"

// Ensures dark mode at the document level so all shadcn variants render dark
export default function DarkModeEnforcer() {
  useEffect(() => {
    const el = document.documentElement
    el.classList.add("dark")
    el.style.colorScheme = "dark"
    return () => {
      // keep dark by default; no cleanup to avoid flicker on route changes
    }
  }, [])
  return null
}
