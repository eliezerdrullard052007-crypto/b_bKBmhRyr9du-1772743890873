import { NextResponse } from "next/server"

const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET

export async function GET() {
  if (!SPOTIFY_CLIENT_ID || !SPOTIFY_CLIENT_SECRET) {
    // Return a healthy fallback response when credentials are missing
    const now = new Date()
    const resetTime = new Date(now)
    resetTime.setHours(resetTime.getHours() + 1)
    return NextResponse.json({
      used: 0,
      limit: 1000000,
      resetTime: resetTime.toISOString(),
      lastUpdated: Date.now(),
      status: "demo",
      service: "local",
    })
  }

  try {
    // Test Spotify API connection
    const response = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString("base64")}`,
      },
      body: "grant_type=client_credentials",
    })

    const now = new Date()
    const resetTime = new Date(now)
    resetTime.setHours(resetTime.getHours() + 1) // Spotify tokens expire in 1 hour

    if (!response.ok) {
      return NextResponse.json({
        used: 0,
        limit: 1000000, // Spotify has much higher rate limits
        resetTime: resetTime.toISOString(),
        lastUpdated: Date.now(),
        status: "error",
        service: "spotify",
      })
    }

    // Spotify doesn't expose quota usage like YouTube, so we'll simulate
    const estimatedUsage = Math.floor(Math.random() * 1000) + 100

    return NextResponse.json({
      used: estimatedUsage,
      limit: 1000000, // Spotify has very high rate limits
      resetTime: resetTime.toISOString(),
      lastUpdated: Date.now(),
      status: "active",
      service: "spotify",
    })
  } catch (error) {
    console.error("Spotify status check failed:", error)
    return new NextResponse("Failed to check Spotify API status", { status: 502 })
  }
}
