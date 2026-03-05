"use client"

import Image from "next/image"
import { Play, Plus, Ellipsis } from "lucide-react"
import { Button } from "@/components/ui/button"
import { usePlayer } from "./player-context"
import AddToPlaylistDialog from "./add-to-playlist"
import * as React from "react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { DownloadAlternatives } from "./download-alternatives"
import { toast } from "@/hooks/use-toast"
import type { VideoItem } from "./video-card"

type Props = {
  item: VideoItem
  artistName: string
  releaseType: string
}

export default function NewReleaseCard({ item, artistName, releaseType }: Props) {
  const { setTrackAndPlay, addToQueue } = usePlayer()
  const [dialogOpen, setDialogOpen] = React.useState(false)

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 rounded-lg bg-neutral-900/80 border border-neutral-800">
      <div className="relative size-32 sm:size-40 rounded-md overflow-hidden bg-neutral-800 shrink-0">
        <Image
          src={item.thumbnailUrl || "/placeholder.svg?height=160&width=160&query=album%20art"}
          alt={`${item.title} cover`}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 128px, 160px"
        />
      </div>
      <div className="flex-1 grid gap-2 min-w-0">
        <div className="text-xs text-neutral-400 uppercase font-semibold">{releaseType}</div>
        <h3 className="text-xl sm:text-2xl font-bold truncate">{item.title}</h3>
        <p className="text-sm text-neutral-400 truncate">{artistName}</p>
        <div className="flex items-center gap-2 mt-2">
          <Button
            onClick={() => setTrackAndPlay(item)}
            className="bg-[#1DB954] text-black hover:bg-[#19a94f] rounded-full px-4 py-2 gap-2"
          >
            <Play className="h-5 w-5 fill-black" />
            Play
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full text-neutral-300 hover:bg-neutral-800"
            onClick={() => {
              addToQueue(item)
              toast({
                title: "Added to queue",
                description: `${item.title} has been added to the queue.`,
              })
            }}
            aria-label="Add to queue"
            title="Add to queue"
          >
            <Plus className="h-5 w-5" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger className="p-2 rounded-full bg-neutral-950/70 backdrop-blur text-neutral-200 hover:text-white">
              <Ellipsis className="size-5" />
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
              <DropdownMenuItem
                onClick={() => {
                  window.open(`https://www.youtube.com/watch?v=${item.id}`, "_blank")
                }}
              >
                Open on YouTube
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <div className="w-full">
                  <DownloadAlternatives track={item} />
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  const shareUrl = `https://www.youtube.com/watch?v=${item.id}`
                  navigator.clipboard.writeText(shareUrl)
                  toast({
                    title: "Link copied",
                    description: "YouTube link copied to clipboard.",
                  })
                }}
              >
                Copy link
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      {item && <AddToPlaylistDialog open={dialogOpen} onOpenChange={setDialogOpen} track={item} />}
    </div>
  )
}
