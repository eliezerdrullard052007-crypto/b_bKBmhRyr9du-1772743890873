import { NextResponse } from "next/server"
import { artists } from "@/lib/artists-data"

const DEEZER_API_BASE = "https://api.deezer.com"

async function searchDeezer(query: string): Promise<any[]> {
  const url = new URL(`${DEEZER_API_BASE}/search/track`)
  url.searchParams.set("q", query)
  url.searchParams.set("limit", "12")

  const response = await fetch(url.toString(), {
    next: { revalidate: 300 },
  })

  if (!response.ok) {
    throw new Error(`Deezer API error: ${response.status}`)
  }

  const data = await response.json()

  if (data.error) {
    throw new Error(data.error.message || "Deezer API error")
  }

  const items = (data.data ?? [])
    .filter((track: any) => track?.id && track?.title && track?.artist)
    .map((track: any) => ({
      id: track.id.toString(),
      title: track.title,
      artist: track.artist?.name || "Unknown Artist",
      thumbnailUrl: track.album?.cover_big || track.album?.cover_medium || track.album?.cover || "/abstract-album-art.png",
      album: track.album?.title || "",
      duration_ms: (track.duration || 0) * 1000,
      preview_url: track.preview,
      deezer_url: track.link,
      artist_id: track.artist?.id,
    }))

  return items
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const raw = searchParams.get("terms") || ""
  const terms = raw
    .split("|")
    .map((s) => decodeURIComponent(s))
    .filter(Boolean)

  try {
    const entries = await Promise.all(
      terms.map(async (term) => {
        try {
          const items = await searchDeezer(term)
          return [term, items] as const
        } catch (error) {
          console.error(`Search failed for term "${term}":`, error)
          // Fallback to local artists data
          const allTracks = artists.flatMap((a) => a.tracks)
          const lowerTerm = term.toLowerCase()
          const matched = allTracks.filter(
            (t) =>
              t.title.toLowerCase().includes(lowerTerm) ||
              t.artist.toLowerCase().includes(lowerTerm) ||
              (t.album && t.album.toLowerCase().includes(lowerTerm)),
          )
          return [term, matched.length > 0 ? matched : allTracks.slice(0, 6)] as const
        }
      }),
    )

    const groups: Record<string, any[]> = {}
    for (const [term, items] of entries) {
      groups[term] = items
    }

    return NextResponse.json({ groups })
  } catch (error: any) {
    console.error("Multi-search error:", error)
    // Fallback to local artists data
    const allTracks = artists.flatMap((a) => a.tracks)
    const groups: Record<string, any[]> = {}
    for (const term of terms) {
      const lowerTerm = term.toLowerCase()
      const matched = allTracks.filter(
        (t) =>
          t.title.toLowerCase().includes(lowerTerm) ||
          t.artist.toLowerCase().includes(lowerTerm) ||
          (t.album && t.album.toLowerCase().includes(lowerTerm)),
      )
      groups[term] = matched.length > 0 ? matched : allTracks.slice(0, 6)
    }
    return NextResponse.json({ groups })
  }
}
