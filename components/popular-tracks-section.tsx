"use client"

import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { Play, Heart, Clock } from "lucide-react"
import { usePlayer } from "./player-context"
import { usePlaylists } from "./playlist-context"
import { cn } from "@/lib/utils"
import { artists } from "@/lib/artists-data"
import type { VideoItem } from "./video-card"

// Collect top tracks from each artist
const popularTracks: VideoItem[] = artists.flatMap((a) => a.tracks.slice(0, 1)).slice(0, 8)

function formatDuration(ms: number) {
  const minutes = Math.floor(ms / 60000)
  const seconds = Math.floor((ms % 60000) / 1000)
  return `${minutes}:${seconds.toString().padStart(2, "0")}`
}

const rowVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: { delay: i * 0.05, type: "spring", stiffness: 120, damping: 16 },
  }),
}

export default function PopularTracksSection() {
  const { setTrackAndPlay } = usePlayer()
  const { isFavorite, toggleFavorite } = usePlaylists()

  return (
    <div className="flex flex-col">
      {/* Table header */}
      <div className="grid grid-cols-[32px_1fr_1fr_80px] gap-4 px-4 py-2 text-xs font-medium text-neutral-500 uppercase tracking-wider border-b border-neutral-800">
        <span>#</span>
        <span>Title</span>
        <span className="hidden sm:block">Album</span>
        <span className="flex items-center justify-end">
          <Clock className="size-4" />
        </span>
      </div>

      {/* Track rows */}
      {popularTracks.map((track, i) => {
        const fav = isFavorite(track.id)
        return (
          <motion.div
            key={track.id}
            variants={rowVariants}
            initial="hidden"
            animate="visible"
            custom={i}
            className="group grid grid-cols-[32px_1fr_1fr_80px] gap-4 items-center px-4 py-2.5 rounded-md hover:bg-neutral-800/60 transition-colors cursor-pointer"
            onClick={() => setTrackAndPlay(track)}
          >
            {/* Track number / Play icon */}
            <div className="flex items-center justify-center text-sm text-neutral-400">
              <span className="group-hover:hidden">{i + 1}</span>
              <Play className="hidden group-hover:block size-4 fill-neutral-100 text-neutral-100" />
            </div>

            {/* Title + Artist */}
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
                <div className="text-sm font-medium text-neutral-100 truncate group-hover:text-[#1DB954] transition-colors">
                  {track.title}
                </div>
                <div className="text-xs text-neutral-400 truncate">
                  <Link
                    href={`/artists/${artists.find((a) => a.name === track.artist)?.id || "1"}`}
                    onClick={(e) => e.stopPropagation()}
                    className="hover:text-neutral-100 hover:underline transition-colors"
                  >
                    {track.artist}
                  </Link>
                </div>
              </div>
            </div>

            {/* Album */}
            <div className="hidden sm:block text-sm text-neutral-400 truncate hover:text-neutral-200 transition-colors">
              {track.album}
            </div>

            {/* Actions + Duration */}
            <div className="flex items-center justify-end gap-2">
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
              <span className="text-sm text-neutral-400 tabular-nums">
                {track.duration_ms ? formatDuration(track.duration_ms) : "--:--"}
              </span>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}
