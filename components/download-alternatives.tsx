"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Download, ExternalLink, FileText } from "lucide-react"
import { usePlaylists } from "./playlist-context"
import type { VideoItem } from "./video-card"

export function DownloadAlternatives({ track }: { track: VideoItem }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <Download className="h-4 w-4" />
          Download Options
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-neutral-950 border-neutral-800">
        <DialogHeader>
          <DialogTitle>Download Options for "{track.title}"</DialogTitle>
        </DialogHeader>
        <div className="grid gap-3">
          <div className="text-sm text-neutral-400 mb-2">
            Direct MP3 download is not permitted. Here are legal alternatives:
          </div>

          <Button
            variant="outline"
            className="justify-start gap-3 bg-transparent"
            onClick={() => {
              const deezerUrl =
                track.deezer_url ||
                `https://www.deezer.com/search/${encodeURIComponent(`${track.title} ${track.artist}`)}`
              window.open(deezerUrl, "_blank")
            }}
          >
            <ExternalLink className="h-4 w-4" />
            Open on Deezer (use Deezer Premium for offline)
          </Button>

          <Button
            variant="outline"
            className="justify-start gap-3 bg-transparent"
            onClick={() => {
              const text = `${track.title} by ${track.artist}${track.album ? `\nAlbum: ${track.album}` : ""}\n${track.deezer_url || `https://www.deezer.com/search/${encodeURIComponent(`${track.title} ${track.artist}`)}`}`
              const blob = new Blob([text], { type: "text/plain" })
              const url = URL.createObjectURL(blob)
              const a = document.createElement("a")
              a.href = url
              a.download = `${track.title.replace(/[^a-zA-Z0-9]/g, "_")}.txt`
              a.click()
              URL.revokeObjectURL(url)
            }}
          >
            <FileText className="h-4 w-4" />
            Download track info as .txt
          </Button>

          <div className="text-xs text-neutral-500 mt-2">
            For legal MP3 downloads, consider:
            <ul className="list-disc list-inside mt-1 space-y-1">
              <li>Deezer Premium (offline downloads)</li>
              <li>Apple Music (offline playlists)</li>
              <li>Amazon Music Unlimited</li>
              <li>Bandcamp, SoundCloud Go+ for independent artists</li>
              <li>Purchase from iTunes, Amazon, or Google Play Music</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export function PlaylistDownloadAlternatives({ playlistId }: { playlistId: string }) {
  const { getPlaylist } = usePlaylists()
  const playlist = getPlaylist(playlistId)

  if (!playlist) return null

  const downloadPlaylistInfo = () => {
    const content = [
      `Playlist: ${playlist.name}`,
      `Created: ${new Date(playlist.createdAt).toLocaleDateString()}`,
      `Tracks: ${playlist.tracks.length}`,
      "",
      "Track List:",
      ...playlist.tracks.map(
        (track, i) =>
          `${i + 1}. ${track.title} by ${track.artist}${track.album ? ` (${track.album})` : ""}\n   ${track.deezer_url || `https://www.deezer.com/search/${encodeURIComponent(`${track.title} ${track.artist}`)}`}`,
      ),
      "",
      "Note: Use Deezer Premium, Apple Music, or other licensed services for offline downloads.",
    ].join("\n")

    const blob = new Blob([content], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${playlist.name.replace(/[^a-zA-Z0-9]/g, "_")}_playlist.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2 bg-transparent">
          <Download className="h-4 w-4" />
          Download Playlist
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-neutral-950 border-neutral-800">
        <DialogHeader>
          <DialogTitle>Download Playlist: {playlist.name}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-3">
          <div className="text-sm text-neutral-400 mb-2">
            Direct MP3 downloads are not available. Here are legal alternatives:
          </div>

          <Button variant="outline" className="justify-start gap-3 bg-transparent" onClick={downloadPlaylistInfo}>
            <FileText className="h-4 w-4" />
            Download playlist info as .txt ({playlist.tracks.length} tracks)
          </Button>

          <div className="text-xs text-neutral-500 mt-2">
            <strong>For legal music downloads:</strong>
            <ul className="list-disc list-inside mt-1 space-y-1">
              <li>
                <strong>Deezer Premium:</strong> Download playlists for offline use
              </li>
              <li>
                <strong>Apple Music:</strong> Download purchased or subscribed music
              </li>
              <li>
                <strong>Amazon Music:</strong> Download with subscription
              </li>
              <li>
                <strong>Bandcamp:</strong> Buy and download MP3s directly from artists
              </li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
