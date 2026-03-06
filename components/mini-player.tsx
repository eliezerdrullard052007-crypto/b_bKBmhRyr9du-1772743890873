"use client"

import React from "react"
import Image from "next/image"
import { Pause, Play, SkipBack, SkipForward, ListPlus } from "lucide-react"
import { Slider } from "@/components/ui/slider"
import { usePlayer } from "./player-context"
import { formatTime } from "@/lib/time-format"
import { cn } from "@/lib/utils"
import { usePlaylists } from "./playlist-context"
import AddToPlaylistDialog from "./add-to-playlist"
import { AnimatePresence, motion } from "framer-motion"
import { useRecentlyPlayed } from "@/hooks/use-recently-played"

export default function MiniPlayer() {
  const { currentTrack, isPlaying, setIsPlaying, volume, setVolume, playNext, queue } = usePlayer()
  const { isFavorite, toggleFavorite } = usePlaylists()
  const { addRecentlyPlayed } = useRecentlyPlayed()
  const fav = currentTrack ? isFavorite(currentTrack.id) : false

  const audioRef = React.useRef<HTMLAudioElement | null>(null)
  const [ready, setReady] = React.useState(false)
  const [progress, setProgress] = React.useState(0)
  const [duration, setDuration] = React.useState(0)
  const [seeking, setSeeking] = React.useState(false)
  const [dialogOpen, setDialogOpen] = React.useState(false)

  // Create and manage HTML5 Audio element
  React.useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio()
      audioRef.current.crossOrigin = "anonymous"
    }

    const audio = audioRef.current

    const handleLoadedMetadata = () => {
      setReady(true)
      setDuration(audio.duration || 30) // Deezer previews are 30 seconds
    }

    const handleTimeUpdate = () => {
      if (!seeking) {
        setProgress(audio.currentTime)
      }
    }

    const handleEnded = () => {
      setIsPlaying(false)
      setProgress(0)
      playNext()
    }

    const handlePlay = () => {
      setIsPlaying(true)
      if (currentTrack) {
        addRecentlyPlayed(currentTrack)
      }
    }

    const handlePause = () => {
      setIsPlaying(false)
    }

    const handleCanPlay = () => {
      setReady(true)
    }

    audio.addEventListener("loadedmetadata", handleLoadedMetadata)
    audio.addEventListener("timeupdate", handleTimeUpdate)
    audio.addEventListener("ended", handleEnded)
    audio.addEventListener("play", handlePlay)
    audio.addEventListener("pause", handlePause)
    audio.addEventListener("canplay", handleCanPlay)

    return () => {
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata)
      audio.removeEventListener("timeupdate", handleTimeUpdate)
      audio.removeEventListener("ended", handleEnded)
      audio.removeEventListener("play", handlePlay)
      audio.removeEventListener("pause", handlePause)
      audio.removeEventListener("canplay", handleCanPlay)
    }
  }, [setIsPlaying, playNext, seeking, currentTrack, addRecentlyPlayed])

  // Load track when it changes
  React.useEffect(() => {
    if (!audioRef.current || !currentTrack) return
    
    const audio = audioRef.current
    setReady(false)
    setProgress(0)
    
    // Use preview_url from Deezer if available
    if (currentTrack.preview_url) {
      audio.src = currentTrack.preview_url
      audio.load()
      if (isPlaying) {
        audio.play().catch(console.error)
      }
    }
  }, [currentTrack])

  // Play/pause sync
  React.useEffect(() => {
    if (!audioRef.current || !ready) return
    
    const audio = audioRef.current
    if (isPlaying) {
      audio.play().catch(console.error)
    } else {
      audio.pause()
    }
  }, [isPlaying, ready])

  // Volume sync
  React.useEffect(() => {
    if (!audioRef.current) return
    audioRef.current.volume = volume / 100
  }, [volume])

  const onSeekCommit = (val: number[]) => {
    if (!audioRef.current || !ready) return
    audioRef.current.currentTime = val[0]
    setProgress(val[0])
    setSeeking(false)
  }

  return (
    <>
      <AnimatePresence>
        {currentTrack ? (
          <motion.div
            key="mini"
            initial={{ y: 96, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 96, opacity: 0 }}
            transition={{ type: "spring", stiffness: 140, damping: 20 }}
            aria-live="polite"
            className={cn(
              "fixed inset-x-0 bottom-0 border-t border-neutral-800/80 bg-neutral-950/85 backdrop-blur",
              "px-3 sm:px-4 py-2 sm:py-3 pb-[max(env(safe-area-inset-bottom),0px)]",
              "shadow-[0_-10px_40px_rgba(0,0,0,0.45)]",
            )}
          >
            <div className="grid grid-cols-[auto_1fr_auto] items-center gap-3 sm:gap-4 max-w-screen-2xl mx-auto">
              <div className="flex items-center gap-3 min-w-0">
                <div className="relative size-12 rounded-md overflow-hidden bg-neutral-900">
                  <Image
                    src={currentTrack.thumbnailUrl || "/placeholder.svg?height=96&width=96&query=album%20art"}
                    alt={`${currentTrack.title} art`}
                    fill
                    className="object-cover"
                    sizes="48px"
                  />
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-medium leading-tight truncate">{currentTrack.title}</div>
                  <div className="text-xs text-neutral-400 leading-none truncate">{currentTrack.artist}</div>
                </div>
                <button
                  className={cn("ml-2 p-2 rounded-full hover:bg-neutral-900 text-neutral-300", fav && "text-[#1DB954]")}
                  aria-label="Like"
                  title="Like"
                  onClick={() => toggleFavorite(currentTrack)}
                >
                  <span className="relative inline-block">
                    <span className={cn("absolute inset-0 rounded-full", fav && "animate-ping bg-[#1DB954]/20")} />
                    <svg className={cn("size-4", fav && "fill-[#1DB954] text-[#1DB954]")} viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M16.5,3C14.76,3 13.09,3.81 12,5.09C10.91,3.81 9.24,3 7.5,3C4.42,3 2,5.42 2,8.5C2,12.28 5.4,15.36 10.55,20.04L12,21.35L13.45,20.04C18.6,15.36 22,12.28 22,8.5C22,5.42 19.58,3 16.5,3Z"
                      />
                    </svg>
                  </span>
                </button>
                <button
                  className="p-2 rounded-full hover:bg-neutral-900 text-neutral-300"
                  aria-label="Add to playlist"
                  title="Add to playlist"
                  onClick={() => setDialogOpen(true)}
                >
                  <ListPlus className="size-4" />
                </button>
              </div>

              <div className="flex flex-col gap-1 sm:gap-2">
                <div className="flex items-center justify-center gap-2 sm:gap-3">
                  <button
                    disabled // Disabled for now, as previous track history is not implemented
                    className="p-2 rounded-full hover:bg-neutral-900 text-neutral-400 disabled:opacity-40"
                  >
                    <SkipBack className="size-5" />
                  </button>
                  <button
                    onClick={() => {
                      if (!ready) return
                      setIsPlaying(!isPlaying)
                    }}
                    className="p-2 rounded-full bg-[#1DB954] text-black hover:bg-[#19a94f] transition-colors"
                    aria-label={isPlaying ? "Pause" : "Play"}
                    title={isPlaying ? "Pause" : "Play"}
                  >
                    {isPlaying ? <Pause className="size-5" /> : <Play className="size-5 fill-black" />}
                  </button>
                  <button
                    onClick={playNext} // Play next track in queue
                    disabled={queue.length === 0} // Disable if queue is empty
                    className="p-2 rounded-full hover:bg-neutral-900 text-neutral-400 disabled:opacity-40"
                  >
                    <SkipForward className="size-5" />
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-[10px] tabular-nums text-neutral-400 w-9 text-right">{formatTime(progress)}</div>
                  <Slider
                    max={Math.max(duration, 1)}
                    step={1}
                    value={[Math.min(progress, duration || 0)]}
                    onValueChange={(v) => {
                      setSeeking(true)
                      setProgress(v[0])
                    }}
                    onValueCommit={onSeekCommit}
                    className="[&>span:first-child]:h-1 [&>span:first-child]:bg-neutral-800 [&_[role=slider]]:bg-[#1DB954] [&_[role=slider]]:w-3 [&_[role=slider]]:h-3 [&_[role=slider]]:border-0"
                    aria-label="Seek"
                  />
                  <div className="text-[10px] tabular-nums text-neutral-400 w-9">{formatTime(duration)}</div>
                </div>
              </div>

              <div className="hidden sm:flex items-center gap-2 min-w-[140px] justify-end">
                <span className="sr-only">Volume</span>
                <Slider
                  max={100}
                  step={1}
                  value={[volume]}
                  onValueChange={(v) => setVolume(v[0])}
                  className="w-[120px] [&>span:first-child]:h-1 [&>span:first-child]:bg-neutral-800 [&_[role=slider]]:bg-[#1DB954] [&_[role=slider]]:w-3 [&_[role=slider]]:h-3 [&_[role=slider]]:border-0"
                  aria-label="Volume"
                />
              </div>
            </div>

            {currentTrack && (
              <AddToPlaylistDialog open={dialogOpen} onOpenChange={setDialogOpen} track={currentTrack} />
            )}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  )
}
