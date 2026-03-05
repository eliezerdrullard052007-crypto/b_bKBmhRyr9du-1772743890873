"use client"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import AppSidebar from "@/components/app-sidebar"
import MiniPlayer from "@/components/mini-player"
import { PlaylistProvider } from "@/components/playlist-context"
import { PlayerProvider } from "@/components/player-context"
import { Button } from "@/components/ui/button"
import { ArrowLeft, History } from "lucide-react"
import { useRouter } from "next/navigation"
import VideoCard from "@/components/video-card"
import DarkModeEnforcer from "@/components/dark-mode"
import { motion } from "framer-motion"
import { useRecentlyPlayed } from "@/hooks/use-recently-played" // Import the hook

function RecentsContent() {
  const router = useRouter()
  const { recentlyPlayed } = useRecentlyPlayed() // Get recently played tracks

  const container = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { when: "beforeChildren", staggerChildren: 0.04 },
    },
  }

  const itemVar = {
    hidden: { opacity: 0, y: 12, scale: 0.98 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 120, damping: 16 } },
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
            <div className="flex items-center gap-3">
              <div className="grid place-items-center h-9 w-9 rounded-md bg-[#1DB954] text-black">
                <History className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-base sm:text-lg font-semibold leading-tight">Recents</h1>
                <p className="text-xs text-neutral-400">Recently played songs</p>
              </div>
            </div>
          </header>

          <main className="px-4 sm:px-6 py-5">
            {recentlyPlayed.length === 0 ? (
              <div className="rounded-lg border border-neutral-800 p-8 text-center text-neutral-400">
                No recently played songs. Start listening to add some!
              </div>
            ) : (
              <motion.div
                variants={container}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4"
              >
                {recentlyPlayed.map((item) => (
                  <motion.div key={item.id} variants={itemVar}>
                    <VideoCard item={item} />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </main>

          <MiniPlayer />
        </SidebarInset>
      </SidebarProvider>
    </div>
  )
}

export default function Page() {
  return (
    <PlaylistProvider>
      <PlayerProvider>
        <RecentsContent />
      </PlayerProvider>
    </PlaylistProvider>
  )
}
