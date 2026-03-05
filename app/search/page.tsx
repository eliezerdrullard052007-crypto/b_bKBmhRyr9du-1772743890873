"use client"

import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import AppSidebar from "@/components/app-sidebar"
import MiniPlayer from "@/components/mini-player"
import { PlaylistProvider } from "@/components/playlist-context"
import { PlayerProvider } from "@/components/player-context"
import DarkModeEnforcer from "@/components/dark-mode"
import SearchPageContent from "@/components/search-page-content"
import { motion } from "framer-motion"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import BackgroundWaves from "@/components/background-waves" // Import the new component

export default function Page() {
  return (
    <PlaylistProvider>
      <PlayerProvider>
        <div className="min-h-svh bg-neutral-950 text-neutral-100 relative overflow-hidden">
          <DarkModeEnforcer />

          {/* Background Waves Component */}
          <BackgroundWaves />

          <SidebarProvider defaultOpen>
            <AppSidebar />
            <SidebarInset className="relative">
              <motion.header
                initial={{ y: -16, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ type: "spring", stiffness: 90, damping: 16, mass: 0.7 }}
                className="sticky top-0 z-20 flex items-center gap-3 px-4 sm:px-6 py-3 backdrop-blur supports-[backdrop-filter]:bg-neutral-950/65 bg-neutral-950/60 border-b border-neutral-800"
              >
                <SidebarTrigger />
                <div className="flex-1 max-w-3xl">{/* Placeholder or empty div if SearchBar is not needed here */}</div>
                <div className="flex items-center gap-2 ml-auto">
                  <Avatar className="size-8 bg-purple-600 text-white">
                    <AvatarFallback>Y</AvatarFallback>
                  </Avatar>
                  <Button variant="secondary" className="rounded-full bg-[#1DB954] text-black hover:bg-[#19a94f]">
                    All
                  </Button>
                  <Button variant="secondary" className="rounded-full bg-neutral-800 hover:bg-neutral-700">
                    Music
                  </Button>
                  <Button variant="secondary" className="rounded-full bg-neutral-800 hover:bg-neutral-700">
                    Podcasts
                  </Button>
                </div>
              </motion.header>

              <main className="px-4 sm:px-6 py-4 relative">
                <SearchPageContent />
              </main>

              <MiniPlayer />
            </SidebarInset>
          </SidebarProvider>
        </div>
      </PlayerProvider>
    </PlaylistProvider>
  )
}
