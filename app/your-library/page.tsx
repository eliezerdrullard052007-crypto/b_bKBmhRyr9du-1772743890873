"use client"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import AppSidebar from "@/components/app-sidebar"
import MiniPlayer from "@/components/mini-player"
import { PlaylistProvider, usePlaylists } from "@/components/playlist-context"
import { PlayerProvider } from "@/components/player-context"
import { Button } from "@/components/ui/button"
import { ArrowLeft, LibraryBig, ListMusic, Heart } from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import DarkModeEnforcer from "@/components/dark-mode"
import { motion } from "framer-motion"

function YourLibraryContent() {
  const router = useRouter()
  const { playlists, state } = usePlaylists() // Access raw state to get favorite count

  const likedSongsCount = Object.keys(state.favorites).length

  const container = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { when: "beforeChildren", staggerChildren: 0.08 },
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
                <LibraryBig className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-base sm:text-lg font-semibold leading-tight">Your Library</h1>
                <p className="text-xs text-neutral-400">All your music in one place</p>
              </div>
            </div>
          </header>

          <main className="px-4 sm:px-6 py-5">
            <motion.div
              variants={container}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
            >
              {/* Liked Songs Card */}
              <motion.div variants={itemVar}>
                <Link href="/liked-songs">
                  <Card className="bg-neutral-900/80 border-neutral-800 hover:border-neutral-700 transition-colors cursor-pointer">
                    <CardContent className="p-4 flex items-center gap-4">
                      <div className="grid place-items-center size-16 rounded-md bg-gradient-to-br from-purple-600 to-pink-500 text-white">
                        <Heart className="h-8 w-8" />
                      </div>
                      <div>
                        <h2 className="text-lg font-semibold">Liked Songs</h2>
                        <p className="text-sm text-neutral-400">{likedSongsCount} songs</p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>

              {/* User Playlists */}
              {playlists.length === 0 ? (
                <motion.div variants={itemVar} className="col-span-full">
                  <div className="rounded-lg border border-neutral-800 p-8 text-center text-neutral-400">
                    You haven't created any playlists yet.
                  </div>
                </motion.div>
              ) : (
                playlists.map((p) => (
                  <motion.div key={p.id} variants={itemVar}>
                    <Link href={`/playlists/${p.id}`}>
                      <Card className="bg-neutral-900/80 border-neutral-800 hover:border-neutral-700 transition-colors cursor-pointer">
                        <CardContent className="p-4 flex items-center gap-4">
                          <div className="grid place-items-center size-16 rounded-md bg-neutral-700 text-white">
                            <ListMusic className="h-8 w-8" />
                          </div>
                          <div>
                            <h2 className="text-lg font-semibold truncate">{p.name}</h2>
                            <p className="text-sm text-neutral-400">{p.trackIds.length} songs</p>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  </motion.div>
                ))
              )}
            </motion.div>
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
        <YourLibraryContent />
      </PlayerProvider>
    </PlaylistProvider>
  )
}
