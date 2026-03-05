import { NextResponse } from "next/server"
import { artists } from "@/lib/artists-data"

const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET

function hasSpotifyCredentials() {
  return !!(SPOTIFY_CLIENT_ID && SPOTIFY_CLIENT_SECRET)
}

async function getSpotifyAccessToken(): Promise<string> {
  if (!hasSpotifyCredentials()) {
    throw new Error("Missing Spotify credentials")
  }

  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString("base64")}`,
    },
    body: "grant_type=client_credentials",
    next: { revalidate: 3600 },
  })

  if (!response.ok) {
    throw new Error("Failed to get Spotify access token")
  }

  const data = await response.json()
  return data.access_token
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const raw = searchParams.get("terms") || ""
  const terms = raw
    .split("|")
    .map((s) => decodeURIComponent(s))
    .filter(Boolean)

  async function search(query: string, accessToken: string): Promise<any[]> {
    const url = new URL("https://api.spotify.com/v1/search")
    url.searchParams.set("q", query)
    url.searchParams.set("type", "track")
    url.searchParams.set("limit", "12")
    url.searchParams.set("market", "US")

    const response = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      next: { revalidate: 300 },
    })

    if (!response.ok) {
      throw new Error(`Spotify API error: ${response.status}`)
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
        preview_url: track.preview_url,
        external_urls: track.external_urls,
        spotify_url: track.external_urls?.spotify,
      }))

    return items
  }

  try {
    if (!hasSpotifyCredentials()) {
      // Return fallback data from local artists
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

    const accessToken = await getSpotifyAccessToken()

    const entries = await Promise.all(
      terms.map(async (term) => {
        try {
          const items = await search(term, accessToken)
          return [term, items] as const
        } catch (error) {
          console.error(`Search failed for term "${term}":`, error)
          return [term, [] as any[]] as const
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
    return new NextResponse("Failed to fetch from Spotify API", { status: 502 })
  }
}
