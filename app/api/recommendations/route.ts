import { NextResponse } from "next/server"
import type { VideoItem } from "@/components/video-card"
import { artists } from "@/lib/artists-data"

const DEEZER_API_BASE = "https://api.deezer.com"

async function fetchFromDeezer(query: string, maxResults: number): Promise<VideoItem[]> {
  const url = new URL(`${DEEZER_API_BASE}/search/track`)
  url.searchParams.set("q", query)
  url.searchParams.set("limit", String(maxResults))

  const response = await fetch(url.toString(), {
    next: { revalidate: 3600 },
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

// Get chart/trending tracks from Deezer
async function getChartTracks(limit = 10) {
  const response = await fetch(`${DEEZER_API_BASE}/chart/0/tracks?limit=${limit}`, {
    next: { revalidate: 3600 },
  })

  if (!response.ok) {
    throw new Error(`Deezer API error: ${response.status}`)
  }

  const data = await response.json()
  return data.data || []
}

// Get playlists from Deezer charts
async function getChartPlaylists(limit = 10) {
  const response = await fetch(`${DEEZER_API_BASE}/chart/0/playlists?limit=${limit}`, {
    next: { revalidate: 3600 },
  })

  if (!response.ok) {
    throw new Error(`Deezer API error: ${response.status}`)
  }

  const data = await response.json()
  return data.data || []
}

// Get new releases/albums from Deezer charts
async function getChartAlbums(limit = 10) {
  const response = await fetch(`${DEEZER_API_BASE}/chart/0/albums?limit=${limit}`, {
    next: { revalidate: 3600 },
  })

  if (!response.ok) {
    throw new Error(`Deezer API error: ${response.status}`)
  }

  const data = await response.json()
  return data.data || []
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const language = searchParams.get("language") || "general"
  const type = searchParams.get("type") || "songs"

  try {
    let baseQuery = ""
    if (language === "latin" || language === "spanish") baseQuery = "reggaeton bad bunny"
    else if (language === "tamil") baseQuery = "tamil songs"
    else if (language === "hindi") baseQuery = "hindi bollywood"
    else if (language === "telugu") baseQuery = "telugu songs"
    else if (language === "malayalam") baseQuery = "malayalam songs"
    else if (language === "english") baseQuery = "pop hits"
    else baseQuery = "reggaeton latin"

    if (type === "playlists") {
      try {
        const playlists = await getChartPlaylists(8)
        const playlistItems = playlists.map((playlist: any) => ({
          id: playlist.id.toString(),
          name: playlist.title,
          tracks: [],
          thumbnailUrl: playlist.picture_big || playlist.picture_medium || "/playlist-cover.png",
          description: `${playlist.nb_tracks || 0} tracks`,
          deezer_url: playlist.link,
        }))
        return NextResponse.json({ type: "playlists", items: playlistItems })
      } catch {
        // Fallback to local artists
        const simulatedPlaylists = artists.slice(0, 8).map((a) => ({
          id: a.id,
          name: `${a.name} Mix`,
          tracks: [],
          thumbnailUrl: a.image,
          description: `A mix inspired by ${a.name}`,
        }))
        return NextResponse.json({ type: "playlists", items: simulatedPlaylists })
      }
    } else if (type === "single-release") {
      try {
        const albums = await getChartAlbums(5)
        const releaseItems = albums.map((album: any) => ({
          id: album.id.toString(),
          title: album.title,
          artist: album.artist?.name || "Unknown Artist",
          thumbnailUrl: album.cover_big || album.cover_medium || "/abstract-album-art.png",
          album: album.title,
          release_date: album.release_date || "2026",
          deezer_url: album.link,
        }))
        return NextResponse.json({ type: "single-release", items: releaseItems })
      } catch {
        // Fallback to local artists
        const allTracks = artists.flatMap((a) => a.tracks)
        const releaseItems = allTracks.slice(0, 5).map((t) => ({
          ...t,
          release_date: "2026-03-01",
        }))
        return NextResponse.json({ type: "single-release", items: releaseItems })
      }
    } else {
      // For "songs" (Daily Mixes) - search with base query
      try {
        const results = await fetchFromDeezer(baseQuery, 6)
        if (results.length > 0) {
          return NextResponse.json({ type: "songs", items: results })
        }
      } catch {
        // Fall through to local data
      }
      // Fallback to local artists
      const allTracks = artists.flatMap((a) => a.tracks)
      return NextResponse.json({ type: "songs", items: allTracks.slice(0, 6) })
    }
  } catch (error: any) {
    console.error("Deezer recommendations API error:", error)
    // Fallback to local artists
    const allTracks = artists.flatMap((a) => a.tracks)
    return NextResponse.json({ type: "songs", items: allTracks.slice(0, 6) })
  }
}
