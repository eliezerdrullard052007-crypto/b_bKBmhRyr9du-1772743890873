import { NextResponse } from "next/server"
import { artists } from "@/lib/artists-data"

// Deezer API - No authentication required for public endpoints
const DEEZER_API_BASE = "https://api.deezer.com"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const q = searchParams.get("q")?.trim() ?? ""
  if (!q) return NextResponse.json({ items: [] })

  try {
    // Search using Deezer API
    const url = new URL(`${DEEZER_API_BASE}/search/track`)
    url.searchParams.set("q", q)
    url.searchParams.set("limit", "24")

    const response = await fetch(url.toString(), {
      next: { revalidate: 300 }, // Cache for 5 minutes
    })

    if (!response.ok) {
      // Fallback to local artists data
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

    const data = await response.json()

    if (data.error) {
      // Fallback to local artists data on Deezer error
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

    const items = (data.data ?? [])
      .filter((track: any) => track?.id && track?.title && track?.artist)
      .map((track: any) => ({
        id: track.id.toString(),
        title: track.title,
        artist: track.artist?.name || "Unknown Artist",
        thumbnailUrl: track.album?.cover_big || track.album?.cover_medium || track.album?.cover || "/abstract-album-art.png",
        album: track.album?.title || "",
        duration_ms: (track.duration || 0) * 1000, // Deezer returns duration in seconds
        preview_url: track.preview, // 30-second preview URL from Deezer
        deezer_url: track.link,
        artist_id: track.artist?.id,
      }))

    return NextResponse.json({ items })
  } catch (error: any) {
    console.error("Deezer API error:", error)
    // Fallback to local artists data
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
}
