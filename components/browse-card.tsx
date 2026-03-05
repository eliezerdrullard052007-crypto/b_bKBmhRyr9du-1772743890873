"use client"

import Image from "next/image"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import Link from "next/link"
import { Play } from "lucide-react"

type Props = {
  title: string
  imageUrl: string
  bgColor?: string // For the blend-like card
  className?: string
  href?: string // Optional href for navigation
  onClick?: () => void // Optional onClick handler for playability
}

export default function BrowseCard({ title, imageUrl, bgColor, className, href, onClick }: Props) {
  const content = (
    <motion.div
      whileHover={{ scale: 1.02, boxShadow: "0 0 15px rgba(29, 185, 84, 0.4)" }} // Enhanced hover effect
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 200, damping: 18 }}
      className={cn(
        "relative flex items-center rounded-md overflow-hidden group",
        "bg-neutral-800/70 hover:bg-neutral-700/70 transition-all ring-1 ring-inset ring-neutral-800 hover:ring-emerald-500/50", // Added hover:ring-emerald-500/50 and transition-all
        className,
        href || onClick ? "cursor-pointer" : "",
      )}
      style={{ backgroundColor: bgColor || undefined }}
      onClick={onClick}
    >
      <div className="relative h-16 w-16 shrink-0">
        <Image
          src={imageUrl || "/placeholder.svg?height=64&width=64&query=album%20art"}
          alt={`${title} cover`}
          fill
          className="object-cover"
          sizes="64px"
        />
      </div>
      <div className="flex-1 px-3 py-2 font-semibold text-sm truncate">{title}</div>

      {/* Play button overlay for playable cards */}
      {onClick && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          whileHover={{ opacity: 1, y: 0 }}
          className="absolute right-2 bottom-2"
        >
          <div className="grid place-items-center size-10 rounded-full bg-[#1DB954] text-black shadow-lg">
            <Play className="size-5 fill-black" />
          </div>
        </motion.div>
      )}
    </motion.div>
  )

  if (href) {
    return <Link href={href}>{content}</Link>
  }

  return content
}
