"use client"

import type React from "react"

import { Button } from "@/components/ui/button"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  SidebarRail,
} from "@/components/ui/sidebar"
import { Home, Search, LibraryBig, ListMusic, Heart, Plus, History, Waves } from "lucide-react" // Import Waves icon
import { usePlaylists } from "./playlist-context"
import { useState } from "react"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { motion } from "framer-motion"
import QuotaMonitor from "./quota-monitor"
import ApiKeyManagerUI from "./api-key-manager-ui"
import NowPlayingQueue from "./now-playing-queue"

// Helper component for the animated wave effect
function AnimatedSidebarLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <SidebarMenuButton
      asChild
      className="relative overflow-hidden hover:bg-neutral-900/70 transition-colors"
      whileHover={{ backgroundColor: "#1DB954", color: "#000", scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
    >
      <Link href={href} className="flex items-center gap-2 min-w-0 relative z-10">
        {children}
        <motion.div
          className="absolute inset-0 z-0"
          initial={{ opacity: 0, backgroundPositionX: "100%", boxShadow: "0 0 0px rgba(29,185,84,0)" }}
          whileHover={{
            opacity: 1,
            backgroundPositionX: "-100%",
            boxShadow: "0 0 20px rgba(29,185,84,0.8)", // Increased blur and spread for stronger glow
            transition: {
              backgroundPositionX: {
                duration: 1.5,
                ease: "linear",
                repeat: Number.POSITIVE_INFINITY,
                repeatType: "loop",
              },
              opacity: { duration: 0.4 }, // Slightly slower opacity fade-in
              boxShadow: { duration: 0.4 },
            },
          }}
          style={{
            background:
              "linear-gradient(90deg, rgba(29,185,84,0) 0%, rgba(29,185,84,0.9) 15%, rgba(29,185,84,0.9) 85%, rgba(29,185,84,0) 100%)", // Increased opacity and wider solid part
            backgroundSize: "300% 100%", // Increased size for longer travel
            pointerEvents: "none",
          }}
        />
      </Link>
    </SidebarMenuButton>
  )
}

export default function AppSidebar() {
  const { playlists, createPlaylist } = usePlaylists()
  const [createPlaylistDialogOpen, setCreatePlaylistDialogOpen] = useState(false)
  const [newPlaylistName, setNewPlaylistName] = useState("New Playlist")

  return (
    <Sidebar variant="inset" collapsible="icon" className="text-neutral-200">
      <SidebarHeader>
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 120, damping: 18 }}
          className="flex items-center gap-2 px-2"
        >
          {/* Replaced the div with a Waves icon */}
          <Waves className="size-6 text-[#1DB954] drop-shadow-[0_0_15px_rgba(29,185,84,0.6)]" />
          <div className="font-semibold tracking-tight">Drullard Music</div>
        </motion.div>
      </SidebarHeader>

      <SidebarSeparator />

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <AnimatedSidebarLink href="/">
                  <Home />
                  <span>Home</span>
                </AnimatedSidebarLink>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <AnimatedSidebarLink href="/search">
                  <Search />
                  <span>Search</span>
                </AnimatedSidebarLink>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <AnimatedSidebarLink href="/your-library">
                  <LibraryBig />
                  <span>Your Library</span>
                </AnimatedSidebarLink>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <AnimatedSidebarLink href="/recents">
                  <History />
                  <span>Recents</span>
                </AnimatedSidebarLink>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        {/* API Management */}
        <SidebarGroup>
          <SidebarGroupContent>
            <div className="px-2 space-y-3">
              <QuotaMonitor />
              <ApiKeyManagerUI />
            </div>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        {/* Now Playing Queue */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs uppercase tracking-wider text-neutral-400">Queue</SidebarGroupLabel>
          <SidebarGroupContent>
            <div className="px-2">
              <NowPlayingQueue />
            </div>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        <SidebarGroup>
          <SidebarGroupLabel className="text-xs uppercase tracking-wider text-neutral-400">Playlists</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <Dialog open={createPlaylistDialogOpen} onOpenChange={setCreatePlaylistDialogOpen}>
                  <DialogTrigger asChild>
                    <SidebarMenuButton
                      className="relative overflow-hidden hover:bg-neutral-900/70 transition-colors"
                      whileHover={{ backgroundColor: "#1DB954", color: "#000", scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    >
                      <Plus />
                      <span>Create Playlist</span>
                      <motion.div
                        className="absolute inset-0 z-0"
                        initial={{ opacity: 0, backgroundPositionX: "100%", boxShadow: "0 0 0px rgba(29,185,84,0)" }}
                        whileHover={{
                          opacity: 1,
                          backgroundPositionX: "-100%",
                          boxShadow: "0 0 20px rgba(29,185,84,0.8)",
                          transition: {
                            backgroundPositionX: {
                              duration: 1.5,
                              ease: "linear",
                              repeat: Number.POSITIVE_INFINITY,
                              repeatType: "loop",
                            },
                            opacity: { duration: 0.4 },
                            boxShadow: { duration: 0.4 },
                          },
                        }}
                        style={{
                          background:
                            "linear-gradient(90deg, rgba(29,185,84,0) 0%, rgba(29,185,84,0.9) 15%, rgba(29,185,84,0.9) 85%, rgba(29,185,84,0) 100%)",
                          backgroundSize: "300% 100%",
                          pointerEvents: "none",
                        }}
                      />
                    </SidebarMenuButton>
                  </DialogTrigger>
                  <DialogContent className="bg-neutral-950 border-neutral-800">
                    <DialogHeader>
                      <DialogTitle>Create playlist</DialogTitle>
                    </DialogHeader>
                    <Input
                      value={newPlaylistName}
                      onChange={(e) => setNewPlaylistName(e.target.value)}
                      placeholder="Playlist name"
                      className="bg-neutral-900 border-neutral-800"
                    />
                    <DialogFooter>
                      <Button
                        onClick={() => {
                          const id = createPlaylist(newPlaylistName.trim() || "New Playlist")
                          if (id) setCreatePlaylistDialogOpen(false)
                        }}
                        className="bg-[#1DB954] text-black hover:bg-[#19a94f]"
                      >
                        Create
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <AnimatedSidebarLink href="/liked-songs">
                  <Heart />
                  <span>Liked Songs</span>
                </AnimatedSidebarLink>
              </SidebarMenuItem>

              {playlists.map((p, i) => (
                <motion.li
                  key={p.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="list-none"
                >
                  <AnimatedSidebarLink href={`/playlists/${p.id}`}>
                    <ListMusic />
                    <span className="truncate">{p.name}</span>
                  </AnimatedSidebarLink>
                </motion.li>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <div className="px-2 text-xs text-neutral-500">Made by Yesh...</div>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
