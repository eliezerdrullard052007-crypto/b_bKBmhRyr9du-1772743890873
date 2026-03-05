"use client"

type ApiKeyStatus = {
  key: string
  name: string
  quotaUsed: number
  quotaLimit: number
  isActive: boolean
  lastError: string | null
  lastUsed: number
  resetTime: string
}

type ApiKeyConfig = {
  keys: ApiKeyStatus[]
  currentIndex: number
  rotationEnabled: boolean
  autoFailover: boolean
}

const DEFAULT_CONFIG: ApiKeyConfig = {
  keys: [],
  currentIndex: 0,
  rotationEnabled: true,
  autoFailover: true,
}

class ApiKeyManager {
  private config: ApiKeyConfig
  private storageKey = "youtube_api_keys_config"

  constructor() {
    this.config = this.loadConfig()
    // REMOVED: Automatically add the Vercel environment variable key if no keys are present
    // if (this.config.keys.length === 0 && typeof process !== "undefined" && process.env.NEXT_PUBLIC_YOUTUBE_API_KEY) {
    //   this.addApiKey(process.env.NEXT_PUBLIC_YOUTUBE_API_KEY, "Default (Vercel Env)", false)
    // }
  }

  private loadConfig(): ApiKeyConfig {
    if (typeof window === "undefined") return DEFAULT_CONFIG

    try {
      const stored = localStorage.getItem(this.storageKey)
      if (stored) {
        const parsed = JSON.parse(stored)
        // REMOVED: Filtering out non-persisted default keys
        // const filteredKeys = parsed.keys.filter(
        //   (k: ApiKeyStatus) => k.name !== "Default (Vercel Env)" || k.key !== process.env.NEXT_PUBLIC_YOUTUBE_API_KEY,
        // )
        // return { ...DEFAULT_CONFIG, ...parsed, keys: filteredKeys }
        return { ...DEFAULT_CONFIG, ...parsed } // Keep all parsed keys
      }
    } catch (error) {
      console.error("Failed to load API key config:", error)
    }

    return DEFAULT_CONFIG
  }

  private saveConfig() {
    if (typeof window === "undefined") return

    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.config))
    } catch (error) {
      console.error("Failed to save API key config:", error)
    }
  }

  // Add a new API key
  addApiKey(key: string, name: string, persist = true) {
    const exists = this.config.keys.some((k) => k.key === key)
    if (exists) {
      throw new Error("API key already exists")
    }

    const newKey: ApiKeyStatus = {
      key,
      name,
      quotaUsed: 0,
      quotaLimit: 10000,
      isActive: true,
      lastError: null,
      lastUsed: 0,
      resetTime: this.getNextResetTime(),
    }

    this.config.keys.push(newKey)
    if (persist) {
      this.saveConfig()
    }
  }

  // Remove an API key
  removeApiKey(key: string) {
    const index = this.config.keys.findIndex((k) => k.key === key)
    if (index === -1) return false

    this.config.keys.splice(index, 1)

    // Adjust current index if needed
    if (this.config.currentIndex >= this.config.keys.length) {
      this.config.currentIndex = Math.max(0, this.config.keys.length - 1)
    }

    this.saveConfig()
    return true
  }

  // Get the current active API key (from user-added keys)
  getCurrentApiKey(): string | null {
    if (this.config.keys.length === 0) return null

    const currentKey = this.config.keys[this.config.currentIndex]
    return currentKey?.isActive ? currentKey.key : null
  }

  // Get the next available API key (from user-added keys)
  getNextAvailableKey(): string | null {
    const now = new Date()
    // First, reset quotas for any keys that have passed their reset time
    this.config.keys.forEach((key) => {
      if (new Date(key.resetTime) <= now) {
        key.quotaUsed = 0
        key.lastError = null
        key.resetTime = this.getNextResetTime()
      }
    })
    this.saveConfig() // Save after potential resets

    const availableKeys = this.config.keys.filter(
      (k) =>
        k.isActive &&
        k.quotaUsed < k.quotaLimit * 0.95 && // Use keys under 95% quota
        !k.lastError,
    )

    if (availableKeys.length === 0) {
      return null
    }

    // Use round-robin or least-used strategy
    const currentKeyIndexInAvailable = availableKeys.findIndex(
      (k) => k.key === this.config.keys[this.config.currentIndex]?.key,
    )
    let nextIndex = (currentKeyIndexInAvailable + 1) % availableKeys.length

    if (
      this.config.keys[this.config.currentIndex]?.quotaUsed >=
        this.config.keys[this.config.currentIndex]?.quotaLimit * 0.95 ||
      this.config.keys[this.config.currentIndex]?.lastError
    ) {
      const leastUsedKey = availableKeys.reduce((prev, current) =>
        prev.quotaUsed < current.quotaUsed ? prev : current,
      )
      nextIndex = availableKeys.indexOf(leastUsedKey)
    }

    const nextKey = availableKeys[nextIndex]

    this.config.currentIndex = this.config.keys.findIndex((k) => k.key === nextKey.key)
    this.saveConfig()

    return nextKey.key
  }

  // Mark a key as having an error (for user-added keys)
  markKeyError(key: string, error: string) {
    const keyStatus = this.config.keys.find((k) => k.key === key)
    if (keyStatus) {
      keyStatus.lastError = error
      keyStatus.lastUsed = Date.now()

      if (error.includes("quota") || error.includes("quotaExceeded")) {
        keyStatus.quotaUsed = keyStatus.quotaLimit
      }

      this.saveConfig()
    }
  }

  // Update quota usage for a key (for user-added keys)
  updateQuotaUsage(key: string, cost: number) {
    const keyStatus = this.config.keys.find((k) => k.key === key)
    if (keyStatus) {
      keyStatus.quotaUsed += cost
      keyStatus.lastUsed = Date.now()
      keyStatus.lastError = null
      this.saveConfig()
    }
  }

  // Get all keys status
  getAllKeysStatus(): ApiKeyStatus[] {
    return [...this.config.keys]
  }

  // Toggle rotation
  setRotationEnabled(enabled: boolean) {
    this.config.rotationEnabled = enabled
    this.saveConfig()
  }

  // Toggle auto failover
  setAutoFailover(enabled: boolean) {
    this.config.autoFailover = enabled
    this.saveConfig()
  }

  // Get configuration
  getConfig() {
    return { ...this.config }
  }

  // Reset all quotas (for testing or manual reset of user-added keys)
  resetAllQuotas() {
    const resetTime = this.getNextResetTime()
    this.config.keys.forEach((key) => {
      key.quotaUsed = 0
      key.lastError = null
      key.resetTime = resetTime
    })
    this.saveConfig()
  }

  private getNextResetTime(): string {
    const now = new Date()
    const pacificTime = new Date(now.toLocaleString("en-US", { timeZone: "America/Los_Angeles" }))
    const resetTime = new Date(pacificTime)
    resetTime.setDate(resetTime.getDate() + 1)
    resetTime.setHours(0, 0, 0, 0)
    return resetTime.toISOString()
  }

  // Auto-rotate to next key if current is near limit (for user-added keys)
  autoRotate(): boolean {
    if (!this.config.rotationEnabled) return false

    const currentKey = this.config.keys[this.config.currentIndex]
    if (!currentKey) return false

    const isNearLimit = currentKey.quotaUsed >= currentKey.quotaLimit * 0.9
    const hasError = !!currentKey.lastError

    if (isNearLimit || hasError) {
      const nextKey = this.getNextAvailableKey()
      return !!nextKey
    }

    return false
  }
}

// Singleton instance
export const apiKeyManager = new ApiKeyManager()

// REMOVED: Initialize with NEXT_PUBLIC_YOUTUBE_API_KEY if available and no keys are loaded
// if (
//   typeof window !== "undefined" &&
//   apiKeyManager.getAllKeysStatus().length === 0 &&
//   process.env.NEXT_PUBLIC_YOUTUBE_API_KEY
// ) {
//   try {
//     apiKeyManager.addApiKey(process.env.NEXT_PUBLIC_YOUTUBE_API_KEY, "Default (Vercel Env)", false)
//   } catch (e) {
//     console.warn("Default API key already added or failed to add:", e)
//   }
// }
