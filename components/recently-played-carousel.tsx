"use client"
import { useRecentlyPlayed } from "@/hooks/use-recently-played"
import VideoCard from "./video-card"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { motion } from "framer-motion"

const itemVar = {
  hidden: { opacity: 0, y: 12, scale: 0.98 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 120, damping: 16 } },
}

export default function RecentlyPlayedCarousel() {
  const { recentlyPlayed } = useRecentlyPlayed()

  if (recentlyPlayed.length === 0) {
    return (
      <div className="rounded-lg border border-neutral-800 p-8 text-center text-neutral-400">
        No recently played songs. Start listening to add some!
      </div>
    )
  }

  return (
    <ScrollArea className="w-full whitespace-nowrap rounded-md group">
      {" "}
      {/* Added group class */}
      <div className="flex w-max space-x-4 p-1">
        {recentlyPlayed.map((item, i) => (
          <motion.div key={item.id} variants={itemVar} initial="hidden" animate="visible" custom={i}>
            <VideoCard item={item} className="w-[160px] sm:w-[180px] shrink-0" />
          </motion.div>
        ))}
      </div>
      <ScrollBar orientation="horizontal" className="bg-transparent group-hover:bg-neutral-800 transition-colors" />{" "}
      {/* Modified className */}
    </ScrollArea>
  )
}
