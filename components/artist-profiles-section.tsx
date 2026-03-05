"use client"

import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { Play } from "lucide-react"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { artists } from "@/lib/artists-data"

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 16, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 120, damping: 16 },
  },
}

export default function ArtistProfilesSection() {
  return (
    <ScrollArea className="w-full whitespace-nowrap">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex gap-5 p-1"
      >
        {artists.map((artist) => (
          <motion.div
            key={artist.id}
            variants={itemVariants}
            className="shrink-0 w-[130px] sm:w-[150px]"
          >
            <Link
              href={`/artists/${artist.id}`}
              className="group flex flex-col items-center gap-3 cursor-pointer"
            >
              <div className="relative">
                <div className="relative size-[120px] sm:size-[140px] rounded-full overflow-hidden ring-2 ring-neutral-800 group-hover:ring-[#1DB954] transition-all duration-300 shadow-lg group-hover:shadow-[0_0_20px_rgba(29,185,84,0.3)]">
                  <Image
                    src={artist.image}
                    alt={artist.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                    sizes="140px"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300" />
                </div>
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileHover={{ opacity: 1, scale: 1 }}
                  className="absolute bottom-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                >
                  <div className="grid place-items-center size-10 rounded-full bg-[#1DB954] text-black shadow-xl">
                    <Play className="size-5 fill-black ml-0.5" />
                  </div>
                </motion.div>
              </div>
              <div className="flex flex-col items-center gap-0.5 whitespace-normal text-center">
                <span className="text-sm font-semibold text-neutral-100 group-hover:text-[#1DB954] transition-colors truncate max-w-full">
                  {artist.name}
                </span>
                <span className="text-xs text-neutral-500">Artist</span>
              </div>
            </Link>
          </motion.div>
        ))}
      </motion.div>
      <ScrollBar orientation="horizontal" className="bg-transparent" />
    </ScrollArea>
  )
}
