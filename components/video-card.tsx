"use client"

import Image from "next/image"
import { Ellipsis, Heart, Play, Share, ExternalLink } from "lucide-react"
import { usePlayer } from "./player-context"
import { cn } from "@/lib/utils"
import { usePlaylists } from "./playlist-context"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import * as React from "react"
import AddToPlaylistDialog from "./add-to-playlist"
import { DownloadAlternatives } from "./download-alternatives"
import { motion } from "framer-motion"
import { toast } from "@/hooks/use-toast"

export type VideoItem = {
  id: string
  title: string
  artist: string
  thumbnailUrl: string
  album?: string
  duration_ms?: number
  preview_url?: string | null
  external_urls?: any
  spotify_url?: string
}

type Props = {
  item: VideoItem
  className?: string
}

export default function VideoCard({ item, className }: Props) {
  const { setTrackAndPlay, addToQueue } = usePlayer()
  const { isFavorite, toggleFavorite } = usePlaylists()
  const [dialogOpen, setDialogOpen] = React.useState(false)

  const fav = isFavorite(item.id)

  const handleOpenSpotify = () => {
    if (item.spotify_url) {
      window.open(item.spotify_url, "_blank")
    } else {
      // Fallback to Spotify search
      const searchQuery = encodeURIComponent(`${item.title} ${item.artist}`)
      window.open(`https://open.spotify.com/search/${searchQuery}`, "_blank")
    }
  }

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02, boxShadow: "0 0 15px rgba(29, 185, 84, 0.4)" }}
      whileTap={{ scale: 0.99 }}
      transition={{ type: "spring", stiffness: 200, damping: 18 }}
      className={cn(
        "group relative text-left rounded-xl overflow-hidden bg-neutral-900/80 backdrop-blur-sm ring-1 ring-inset ring-neutral-800 hover:ring-emerald-500/50 transition-all",
        className,
      )}
    >
      <button
        onClick={() => setTrackAndPlay(item)}
        className="w-full text-left"
        aria-label={`Play ${item.title} by ${item.artist}`}
      >
        <div className="relative aspect-square">
          <Image
            src={item.thumbnailUrl || "/placeholder.svg?height=512&width=512&query=album%20art%20cover"}
            alt={`${item.title} thumbnail`}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity" />
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            whileHover={{ opacity: 1, y: 0 }}
            className="absolute right-2 bottom-2"
          >
            <div className="grid place-items-center size-10 rounded-full bg-[#1DB954] text-black shadow-lg">
              <Play className="size-5 fill-black" />
            </div>
          </motion.div>
        </div>
        <div className="p-2">
          <div className="text-sm font-medium truncate">{item.title}</div>
          <div className="text-xs text-neutral-400 truncate">{item.artist}</div>
          {item.album && <div className="text-xs text-neutral-500 truncate">{item.album}</div>}
        </div>
      </button>

      <div className="absolute top-2 left-2 flex gap-1">
        <button
          onClick={() => toggleFavorite(item)}
          className={cn(
            "p-1.5 rounded-full bg-neutral-950/70 backdrop-blur text-neutral-200 hover:text-white transition-colors",
            fav && "text-[#1DB954]",
          )}
          aria-label="Favorite"
          title="Favorite"
        >
          <Heart className={cn("size-4", fav && "fill-[#1DB954] text-[#1DB954]")} />
        </button>
      </div>

      <div className="absolute top-2 right-2">
        <DropdownMenu>
          <DropdownMenuTrigger className="p-1.5 rounded-full bg-neutral-950/70 backdrop-blur text-neutral-200 hover:text-white">
            <Ellipsis className="size-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-neutral-950 border-neutral-800">
            <DropdownMenuItem onClick={() => setTrackAndPlay(item)}>Play</DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                addToQueue(item)
                toast({
                  title: "Added to queue",
                  description: `${item.title} has been added to the queue.`,
                })
              }}
            >
              Add to queue
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setDialogOpen(true)}>Add to playlist</DropdownMenuItem>
            <DropdownMenuItem onClick={handleOpenSpotify}>
              <ExternalLink className="h-4 w-4 mr-2" />
              Open on Spotify
            </DropdownMenuItem>
            {item.preview_url && (
              <DropdownMenuItem
                onClick={() => {
                  const audio = new Audio(item.preview_url!)
                  audio.play().catch(console.error)
                  toast({
                    title: "Playing preview",
                    description: "30-second preview from Spotify",
                  })
                }}
              >
                Play 30s preview
              </DropdownMenuItem>
            )}
            <DropdownMenuItem asChild>
              <div className="w-full">
                <DownloadAlternatives track={item} />
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                const shareUrl =
                  item.spotify_url ||
                  `https://open.spotify.com/search/${encodeURIComponent(`${item.title} ${item.artist}`)}`
                navigator.clipboard.writeText(shareUrl)
                toast({
                  title: "Link copied",
                  description: "Spotify link copied to clipboard.",
                })
              }}
            >
              <Share className="h-4 w-4 mr-2" />
              Copy link
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <AddToPlaylistDialog open={dialogOpen} onOpenChange={setDialogOpen} track={item} />
    </motion.div>
  )
}
