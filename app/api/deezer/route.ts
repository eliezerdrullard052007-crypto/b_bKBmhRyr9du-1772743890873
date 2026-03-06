import { NextResponse } from "next/server"

// Deezer API proxy to avoid CORS issues
const DEEZER_API_BASE = "https://api.deezer.com"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const endpoint = searchParams.get("endpoint") || ""
  const q = searchParams.get("q") || ""
  const limit = searchParams.get("limit") || "24"

  try {
    let url: string

    if (endpoint === "search") {
      url = `${DEEZER_API_BASE}/search/track?q=${encodeURIComponent(q)}&limit=${limit}`
    } else if (endpoint === "chart/tracks") {
      url = `${DEEZER_API_BASE}/chart/0/tracks?limit=${limit}`
    } else if (endpoint === "chart/albums") {
      url = `${DEEZER_API_BASE}/chart/0/albums?limit=${limit}`
    } else if (endpoint === "chart/playlists") {
      url = `${DEEZER_API_BASE}/chart/0/playlists?limit=${limit}`
    } else {
      return NextResponse.json({ error: "Invalid endpoint" }, { status: 400 })
    }

    const response = await fetch(url, {
      headers: {
        "Accept": "application/json",
      },
    })

    if (!response.ok) {
      return NextResponse.json({ error: `Deezer API error: ${response.status}` }, { status: response.status })
    }

    const data = await response.json()

    return NextResponse.json(data)
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch from Deezer" }, { status: 500 })
  }
}
