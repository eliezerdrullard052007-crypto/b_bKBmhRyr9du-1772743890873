"use client"
import { usePlayer } from "./player-context"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { motion, AnimatePresence } from "framer-motion"

export default function NowPlayingQueue() {
  const { queue, currentTrack, setTrackAndPlay, clearQueue } = usePlayer()

  const itemVar = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 120, damping: 16 } },
    exit: { opacity: 0, x: -20, transition: { duration: 0.2 } },
  }

  return (
    <div className="grid gap-3">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold">Now Playing Queue</h3>
        {queue.length > 0 && (
          <Button variant="ghost" size="sm" onClick={clearQueue} className="text-xs text-neutral-400 hover:text-white">
            Clear All
          </Button>
        )}
      </div>
      <ScrollArea className="h-48 rounded border border-neutral-800 group">
        {" "}
        {/* Added group class */}
        <div className="p-2 grid gap-2">
          {currentTrack && (
            <div className="flex items-center gap-3 px-2 py-1 rounded-md bg-emerald-900/30 border border-emerald-700">
              <div className="relative h-8 w-8 rounded-sm overflow-hidden bg-neutral-800 shrink-0">
                <Image
                  src={currentTrack.thumbnailUrl || "/placeholder.svg?height=64&width=64&query=album%20art"}
                  alt={`${currentTrack.title} art`}
                  fill
                  className="object-cover"
                  sizes="32px"
                />
              </div>
              <div className="min-w-0">
                <div className="text-sm font-medium truncate">{currentTrack.title}</div>
                <div className="text-xs text-neutral-400 truncate">Now Playing</div>
              </div>
            </div>
          )}
          {currentTrack && queue.length > 0 && <Separator className="bg-neutral-800 my-1" />}
          <AnimatePresence initial={false}>
            {queue.length === 0 && !currentTrack ? (
              <div className="text-sm text-neutral-500 px-1">Queue is empty. Add songs from search results!</div>
            ) : (
              queue.map((track) => (
                <motion.div
                  key={track.id}
                  variants={itemVar}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="flex items-center gap-3 px-2 py-1 rounded-md hover:bg-neutral-900 transition-colors cursor-pointer"
                  onClick={() => setTrackAndPlay(track)}
                >
                  <div className="relative h-8 w-8 rounded-sm overflow-hidden bg-neutral-800 shrink-0">
                    <Image
                      src={track.thumbnailUrl || "/placeholder.svg?height=64&width=64&query=album%20art"}
                      alt={`${track.title} art`}
                      fill
                      className="object-cover"
                      sizes="32px"
                    />
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-medium truncate">{track.title}</div>
                    <div className="text-xs text-neutral-400 truncate">{track.artist}</div>
                  </div>
                  {/* Removed individual remove button for simplicity, clear all is available */}
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
        <ScrollBar className="bg-transparent group-hover:bg-neutral-800 transition-colors" />{" "}
        {/* Added ScrollBar and modified className */}
      </ScrollArea>
    </div>
  )
}
