import { NextResponse } from "next/server"

// Deezer API - No authentication required
export async function GET() {
  try {
    // Test Deezer API connection with a simple request
    const response = await fetch("https://api.deezer.com/chart/0/tracks?limit=1")

    const now = new Date()
    const resetTime = new Date(now)
    resetTime.setHours(resetTime.getHours() + 1)

    if (!response.ok) {
      return NextResponse.json({
        used: 0,
        limit: 50, // Deezer has 50 requests per 5 seconds limit
        resetTime: resetTime.toISOString(),
        lastUpdated: Date.now(),
        status: "error",
        service: "deezer",
      })
    }

    return NextResponse.json({
      used: 0,
      limit: 50, // Deezer rate limit
      resetTime: resetTime.toISOString(),
      lastUpdated: Date.now(),
      status: "active",
      service: "deezer",
    })
  } catch (error) {
    console.error("Deezer status check failed:", error)
    return new NextResponse("Failed to check Deezer API status", { status: 502 })
  }
}
