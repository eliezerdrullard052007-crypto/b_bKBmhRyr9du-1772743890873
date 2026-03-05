"use client"

import type * as React from "react"
import Image from "next/image"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { GripVertical, Trash2, Play, ExternalLink } from "lucide-react"
import type { VideoItem } from "./video-card"
import { Button } from "@/components/ui/button"
import { usePlayer } from "./player-context"
import { cn } from "@/lib/utils"

export default function PlaylistRow({
  track,
  onRemove,
  index,
}: {
  track: VideoItem
  onRemove: (id: string) => void
  index: number
}) {
  const { setTrackAndPlay } = usePlayer()
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: track.id,
  })

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "grid grid-cols-[auto_1fr_auto] items-center gap-3 sm:gap-4 px-2 sm:px-3 py-2 rounded-lg",
        "bg-neutral-900/60 hover:bg-neutral-900 transition-colors ring-1 ring-inset ring-neutral-800",
        isDragging && "opacity-80 ring-emerald-500/50",
      )}
    >
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing p-2 text-neutral-400 hover:text-neutral-200"
        aria-label="Drag handle"
        title="Drag to reorder"
      >
        <GripVertical className="h-4 w-4" />
      </button>

      <div className="flex items-center gap-3 min-w-0">
        <div className="relative h-12 w-12 rounded-md overflow-hidden bg-neutral-800 shrink-0">
          <Image
            src={track.thumbnailUrl || "/placeholder.svg?height=96&width=96&query=album%20art"}
            alt={`${track.title} art`}
            fill
            className="object-cover"
            sizes="48px"
          />
        </div>
        <div className="min-w-0">
          <div className="text-sm font-medium truncate">{track.title}</div>
          <div className="text-xs text-neutral-400 truncate">{track.artist}</div>
        </div>
      </div>

      <div className="flex items-center gap-1 sm:gap-2">
        <Button
          size="icon"
          variant="ghost"
          className="h-8 w-8 text-neutral-200 hover:text-black hover:bg-[#1DB954]"
          onClick={() => setTrackAndPlay(track)}
          aria-label="Play"
          title="Play"
        >
          <Play className="h-4 w-4" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          className="h-8 w-8 text-neutral-300"
          onClick={() => window.open(`https://www.youtube.com/watch?v=${track.id}`, "_blank")}
          aria-label="Open on YouTube"
          title="Open on YouTube"
        >
          <ExternalLink className="h-4 w-4" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          className="h-8 w-8 text-red-400 hover:text-red-50 hover:bg-red-600/80"
          onClick={() => onRemove(track.id)}
          aria-label="Remove"
          title="Remove from playlist"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
