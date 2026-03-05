import { NextResponse } from "next/server"
import { artists } from "@/lib/artists-data"

// Spotify API credentials - you'll need to set these in your Vercel environment variables
const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET

function hasSpotifyCredentials() {
  return !!(SPOTIFY_CLIENT_ID && SPOTIFY_CLIENT_SECRET)
}

// Get Spotify access token using Client Credentials flow
async function getSpotifyAccessToken(): Promise<string> {
  if (!hasSpotifyCredentials()) {
    throw new Error(
      "Missing Spotify credentials. Please set SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET in your environment variables.",
    )
  }

  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString("base64")}`,
    },
    body: "grant_type=client_credentials",
    next: { revalidate: 3600 }, // Cache for 1 hour (tokens expire in 1 hour)
  })

  if (!response.ok) {
    throw new Error("Failed to get Spotify access token")
  }

  const data = await response.json()
  return data.access_token
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const q = searchParams.get("q")?.trim() ?? ""
  if (!q) return NextResponse.json({ items: [] })

  try {
    if (!hasSpotifyCredentials()) {
      // Return fallback search from local artists data
      const allTracks = artists.flatMap((a) => a.tracks)
      const lowerQ = q.toLowerCase()
      const matched = allTracks.filter(
        (t) =>
          t.title.toLowerCase().includes(lowerQ) ||
          t.artist.toLowerCase().includes(lowerQ) ||
          (t.album && t.album.toLowerCase().includes(lowerQ)),
      )
      return NextResponse.json({ items: matched.length > 0 ? matched : allTracks.slice(0, 12) })
    }

    const accessToken = await getSpotifyAccessToken()

    const url = new URL("https://api.spotify.com/v1/search")
    url.searchParams.set("q", q)
    url.searchParams.set("type", "track")
    url.searchParams.set("limit", "24")
    url.searchParams.set("market", "US") // You can make this dynamic based on user location

    const response = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      next: { revalidate: 300 }, // Cache for 5 minutes
    })

    if (!response.ok) {
      const errorData = await response.json()
      return new NextResponse(JSON.stringify(errorData), {
        status: response.status,
        headers: { "Content-Type": "application/json" },
      })
    }

    const data = await response.json()

    const items = (data.tracks?.items ?? [])
      .filter((track: any) => track?.id && track?.name && track?.artists?.[0])
      .map((track: any) => ({
        id: track.id,
        title: track.name,
        artist: track.artists.map((artist: any) => artist.name).join(", "),
        thumbnailUrl: track.album?.images?.[0]?.url || track.album?.images?.[1]?.url || "/abstract-album-art.png",
        album: track.album?.name || "",
        duration_ms: track.duration_ms || 0,
        preview_url: track.preview_url, // 30-second preview URL
        external_urls: track.external_urls,
        spotify_url: track.external_urls?.spotify,
      }))

    return NextResponse.json({ items })
  } catch (error: any) {
    console.error("Spotify API error:", error)
    return new NextResponse(error.message || "Failed to fetch from Spotify API", { status: 502 })
  }
}
