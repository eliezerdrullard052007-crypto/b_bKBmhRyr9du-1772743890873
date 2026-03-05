"use client"

import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import AppSidebar from "@/components/app-sidebar"
import MiniPlayer from "@/components/mini-player"
import { PlaylistProvider, usePlaylists } from "@/components/playlist-context"
import { PlayerProvider, usePlayer } from "@/components/player-context"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Play, Shuffle, Heart, Clock, Ellipsis, Pause } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import DarkModeEnforcer from "@/components/dark-mode"
import { getArtistById } from "@/lib/artists-data"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import AddToPlaylistDialog from "@/components/add-to-playlist"
import type { VideoItem } from "@/components/video-card"
import React from "react"

function formatDuration(ms: number) {
  const minutes = Math.floor(ms / 60000)
  const seconds = Math.floor((ms % 60000) / 1000)
  return `${minutes}:${seconds.toString().padStart(2, "0")}`
}

function formatListeners(num: string) {
  return num
}

function ArtistPageContent() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const artist = params?.id ? getArtistById(params.id) : undefined
  const { setTrackAndPlay, currentTrack, isPlaying, setIsPlaying } = usePlayer()
  const { isFavorite, toggleFavorite } = usePlaylists()
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [dialogTrack, setDialogTrack] = React.useState<VideoItem | null>(null)
  const [showAll, setShowAll] = React.useState(false)

  if (!artist) {
    return (
      <div className="min-h-svh bg-neutral-950 text-neutral-100">
        <DarkModeEnforcer />
        <SidebarProvider defaultOpen>
          <AppSidebar />
          <SidebarInset>
            <div className="p-6">
              <div className="text-sm text-neutral-400">Artist not found.</div>
              <Button className="mt-3" variant="secondary" onClick={() => router.push("/")}>
                Go home
              </Button>
            </div>
            <MiniPlayer />
          </SidebarInset>
        </SidebarProvider>
      </div>
    )
  }

  const displayedTracks = showAll ? artist.tracks : artist.tracks.slice(0, 5)
  const isPlayingArtist = currentTrack && artist.tracks.some((t) => t.id === currentTrack.id)

  const handlePlayAll = () => {
    if (artist.tracks.length > 0) {
      setTrackAndPlay(artist.tracks[0])
    }
  }

  const handleShuffle = () => {
    if (artist.tracks.length > 0) {
      const shuffled = [...artist.tracks].sort(() => Math.random() - 0.5)
      setTrackAndPlay(shuffled[0])
    }
  }

  return (
    <div className="min-h-svh bg-neutral-950 text-neutral-100">
      <DarkModeEnforcer />
      <SidebarProvider defaultOpen>
        <AppSidebar />
        <SidebarInset>
          <header className="sticky top-0 z-20 flex items-center gap-3 px-4 sm:px-6 py-3 backdrop-blur supports-[backdrop-filter]:bg-neutral-950/70 bg-neutral-950/60 border-b border-neutral-800">
            <SidebarTrigger />
            <Button variant="ghost" size="icon" onClick={() => router.push("/")} className="text-neutral-300">
              <ArrowLeft className="h-5 w-5" />
              <span className="sr-only">Back</span>
            </Button>
            <h1 className="text-base sm:text-lg font-semibold truncate">{artist.name}</h1>
          </header>

          <main className="relative">
            {/* Hero Banner */}
            <div className="relative h-[280px] sm:h-[340px] overflow-hidden">
              <Image
                src={artist.image}
                alt={artist.name}
                fill
                className="object-cover object-top"
                sizes="100vw"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/60 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 px-4 sm:px-6 pb-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <svg className="size-5 text-[#3b82f6]" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    <span className="text-xs font-medium text-neutral-300">Verified Artist</span>
                  </div>
                  <h2 className="text-4xl sm:text-6xl font-black tracking-tight text-balance">{artist.name}</h2>
                  <p className="text-sm text-neutral-300 mt-2">
                    {formatListeners(artist.listeners)} monthly listeners
                  </p>
                </motion.div>
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex items-center gap-4 px-4 sm:px-6 py-4">
              <Button
                onClick={handlePlayAll}
                className="size-14 rounded-full bg-[#1DB954] text-black hover:bg-[#1ed760] hover:scale-105 transition-all shadow-lg"
                aria-label="Play all"
              >
                {isPlayingArtist && isPlaying ? (
                  <Pause className="size-6 fill-black" />
                ) : (
                  <Play className="size-6 fill-black ml-1" />
                )}
              </Button>
              <Button
                onClick={handleShuffle}
                variant="ghost"
                className="text-neutral-400 hover:text-neutral-100"
                aria-label="Shuffle"
              >
                <Shuffle className="size-6" />
              </Button>
            </div>

            {/* About / Bio */}
            <div className="px-4 sm:px-6 pb-4">
              <p className="text-sm text-neutral-400 max-w-2xl leading-relaxed">{artist.bio}</p>
              <div className="flex flex-wrap gap-2 mt-3">
                {artist.genres.map((genre) => (
                  <span
                    key={genre}
                    className="text-xs font-medium px-3 py-1 rounded-full bg-neutral-800 text-neutral-300"
                  >
                    {genre}
                  </span>
                ))}
              </div>
            </div>

            <Separator className="bg-neutral-800 mx-4 sm:mx-6" />

            {/* Popular Tracks */}
            <div className="px-4 sm:px-6 py-4">
              <h3 className="text-lg font-bold mb-4">Popular</h3>

              {/* Table header */}
              <div className="grid grid-cols-[32px_1fr_1fr_48px_80px] gap-4 px-4 py-2 text-xs font-medium text-neutral-500 uppercase tracking-wider border-b border-neutral-800">
                <span>#</span>
                <span>Title</span>
                <span className="hidden sm:block">Album</span>
                <span />
                <span className="flex items-center justify-end">
                  <Clock className="size-4" />
                </span>
              </div>

              {/* Track rows */}
              {displayedTracks.map((track, i) => {
                const fav = isFavorite(track.id)
                const isCurrentTrack = currentTrack?.id === track.id
                return (
                  <motion.div
                    key={track.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04, type: "spring", stiffness: 120, damping: 16 }}
                    className={cn(
                      "group grid grid-cols-[32px_1fr_1fr_48px_80px] gap-4 items-center px-4 py-2.5 rounded-md hover:bg-neutral-800/60 transition-colors cursor-pointer",
                      isCurrentTrack && "bg-neutral-800/40"
                    )}
                    onClick={() => setTrackAndPlay(track)}
                  >
                    {/* Number / Play */}
                    <div className="flex items-center justify-center text-sm text-neutral-400">
                      {isCurrentTrack && isPlaying ? (
                        <div className="flex items-end gap-[2px] h-4">
                          <span className="w-[3px] bg-[#1DB954] animate-pulse rounded-full" style={{ height: "60%" }} />
                          <span className="w-[3px] bg-[#1DB954] animate-pulse rounded-full" style={{ height: "100%", animationDelay: "0.15s" }} />
                          <span className="w-[3px] bg-[#1DB954] animate-pulse rounded-full" style={{ height: "40%", animationDelay: "0.3s" }} />
                        </div>
                      ) : (
                        <>
                          <span className={cn("group-hover:hidden", isCurrentTrack && "text-[#1DB954]")}>{i + 1}</span>
                          <Play className="hidden group-hover:block size-4 fill-neutral-100 text-neutral-100" />
                        </>
                      )}
                    </div>

                    {/* Title + Album art */}
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative size-10 shrink-0 rounded overflow-hidden">
                        <Image
                          src={track.thumbnailUrl}
                          alt={track.title}
                          fill
                          className="object-cover"
                          sizes="40px"
                        />
                      </div>
                      <div className="min-w-0">
                        <div className={cn(
                          "text-sm font-medium truncate transition-colors",
                          isCurrentTrack ? "text-[#1DB954]" : "text-neutral-100 group-hover:text-[#1DB954]"
                        )}>
                          {track.title}
                        </div>
                        <div className="text-xs text-neutral-400 truncate">{track.artist}</div>
                      </div>
                    </div>

                    {/* Album */}
                    <div className="hidden sm:block text-sm text-neutral-400 truncate hover:text-neutral-200 transition-colors">
                      {track.album}
                    </div>

                    {/* Favorite + Menu */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleFavorite(track)
                        }}
                        className={cn(
                          "opacity-0 group-hover:opacity-100 transition-opacity p-1",
                          fav && "opacity-100"
                        )}
                        aria-label="Favorite"
                      >
                        <Heart
                          className={cn(
                            "size-4 text-neutral-400 hover:text-neutral-100 transition-colors",
                            fav && "fill-[#1DB954] text-[#1DB954]"
                          )}
                        />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setDialogTrack(track)
                          setDialogOpen(true)
                        }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1"
                        aria-label="More options"
                      >
                        <Ellipsis className="size-4 text-neutral-400 hover:text-neutral-100 transition-colors" />
                      </button>
                    </div>

                    {/* Duration */}
                    <div className="flex items-center justify-end">
                      <span className="text-sm text-neutral-400 tabular-nums">
                        {track.duration_ms ? formatDuration(track.duration_ms) : "--:--"}
                      </span>
                    </div>
                  </motion.div>
                )
              })}

              {/* Show more / less */}
              {artist.tracks.length > 5 && (
                <button
                  onClick={() => setShowAll(!showAll)}
                  className="mt-3 text-sm font-bold text-neutral-400 hover:text-neutral-100 transition-colors px-4"
                >
                  {showAll ? "Show less" : "See more"}
                </button>
              )}
            </div>

            <Separator className="bg-neutral-800 mx-4 sm:mx-6" />

            {/* Discography summary */}
            <div className="px-4 sm:px-6 py-6">
              <h3 className="text-lg font-bold mb-4">Discography</h3>
              <div className="flex gap-4 overflow-x-auto pb-2">
                {[...new Set(artist.tracks.map((t) => t.album))].map((album) => {
                  const albumTracks = artist.tracks.filter((t) => t.album === album)
                  const cover = albumTracks[0]?.thumbnailUrl
                  return (
                    <motion.div
                      key={album}
                      whileHover={{ y: -4, scale: 1.02 }}
                      className="flex flex-col items-center gap-2 shrink-0 w-[140px] cursor-pointer group"
                      onClick={() => {
                        if (albumTracks[0]) setTrackAndPlay(albumTracks[0])
                      }}
                    >
                      <div className="relative size-[140px] rounded-lg overflow-hidden shadow-lg">
                        <Image src={cover || "/playlist-cover.png"} alt={album || "Album"} fill className="object-cover" sizes="140px" />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors grid place-items-center">
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity grid place-items-center size-12 rounded-full bg-[#1DB954] text-black shadow-xl">
                            <Play className="size-5 fill-black ml-0.5" />
                          </div>
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm font-medium text-neutral-100 truncate max-w-[140px]">{album}</div>
                        <div className="text-xs text-neutral-500">{albumTracks.length} tracks</div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </div>
          </main>

          <MiniPlayer />
        </SidebarInset>
      </SidebarProvider>

      {dialogTrack && (
        <AddToPlaylistDialog open={dialogOpen} onOpenChange={setDialogOpen} track={dialogTrack} />
      )}
    </div>
  )
}

export default function ArtistPage() {
  return (
    <PlaylistProvider>
      <PlayerProvider>
        <ArtistPageContent />
      </PlayerProvider>
    </PlaylistProvider>
  )
}
