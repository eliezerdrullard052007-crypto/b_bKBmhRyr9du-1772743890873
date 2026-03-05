import { NextResponse } from "next/server"
import type { VideoItem } from "@/components/video-card"
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

async function fetchFromSpotify(query: string, accessToken: string, maxResults: number): Promise<VideoItem[]> {
  const url = new URL("https://api.spotify.com/v1/search")
  url.searchParams.set("q", query)
  url.searchParams.set("type", "track")
  url.searchParams.set("limit", String(maxResults))
  url.searchParams.set("market", "US")

  const response = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    next: { revalidate: 3600 },
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

// Get featured playlists from Spotify
async function getFeaturedPlaylists(accessToken: string, limit = 10) {
  const url = new URL("https://api.spotify.com/v1/browse/featured-playlists")
  url.searchParams.set("limit", String(limit))
  url.searchParams.set("country", "US")

  const response = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    next: { revalidate: 3600 },
  })

  if (!response.ok) {
    throw new Error(`Spotify API error: ${response.status}`)
  }

  const data = await response.json()
  return data.playlists?.items || []
}

// Get new releases from Spotify
async function getNewReleases(accessToken: string, limit = 10) {
  const url = new URL("https://api.spotify.com/v1/browse/new-releases")
  url.searchParams.set("limit", String(limit))
  url.searchParams.set("country", "US")

  const response = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    next: { revalidate: 3600 },
  })

  if (!response.ok) {
    throw new Error(`Spotify API error: ${response.status}`)
  }

  const data = await response.json()
  return data.albums?.items || []
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const language = searchParams.get("language") || "general"
  const type = searchParams.get("type") || "songs"

  try {
    if (!hasSpotifyCredentials()) {
      // Return fallback data from local artists
      const allTracks = artists.flatMap((a) => a.tracks)
      if (type === "playlists") {
        const simulatedPlaylists = artists.slice(0, 8).map((a) => ({
          id: a.id,
          name: `${a.name} Mix`,
          tracks: [],
          thumbnailUrl: a.image,
          description: `A mix inspired by ${a.name}`,
        }))
        return NextResponse.json({ type: "playlists", items: simulatedPlaylists })
      } else if (type === "single-release") {
        const releaseItems = allTracks.slice(0, 5).map((t) => ({
          ...t,
          release_date: "2026-03-01",
        }))
        return NextResponse.json({ type: "single-release", items: releaseItems })
      } else {
        return NextResponse.json({ type: "songs", items: allTracks.slice(0, 6) })
      }
    }

    const accessToken = await getSpotifyAccessToken()

    let baseQuery = ""
    if (language === "tamil") baseQuery = "tamil songs"
    else if (language === "hindi") baseQuery = "hindi bollywood"
    else if (language === "telugu") baseQuery = "telugu songs"
    else if (language === "malayalam") baseQuery = "malayalam songs"
    else if (language === "english") baseQuery = "pop hits"
    else baseQuery = "trending music"

    if (type === "playlists") {
      const featuredPlaylists = await getFeaturedPlaylists(accessToken, 8)
      const simulatedPlaylists = featuredPlaylists.map((playlist: any) => ({
        id: playlist.id,
        name: playlist.name,
        tracks: [], // We'd need additional API calls to get tracks
        thumbnailUrl: playlist.images?.[0]?.url || "/playlist-cover.png",
        description: playlist.description,
        spotify_url: playlist.external_urls?.spotify,
      }))
      return NextResponse.json({ type: "playlists", items: simulatedPlaylists })
    } else if (type === "single-release") {
      const newReleases = await getNewReleases(accessToken, 5)
      const releaseItems = newReleases.map((album: any) => ({
        id: album.id,
        title: album.name,
        artist: album.artists.map((artist: any) => artist.name).join(", "),
        thumbnailUrl: album.images?.[0]?.url || "/abstract-album-art.png",
        album: album.name,
        release_date: album.release_date,
        spotify_url: album.external_urls?.spotify,
      }))
      return NextResponse.json({ type: "single-release", items: releaseItems })
    } else {
      // For "songs" (Daily Mixes)
      const results = await fetchFromSpotify(baseQuery, accessToken, 6)
      return NextResponse.json({ type: "songs", items: results })
    }
  } catch (error: any) {
    console.error("Spotify recommendations API error:", error)
    return new NextResponse("Failed to fetch recommendations from Spotify", { status: 502 })
  }
}
