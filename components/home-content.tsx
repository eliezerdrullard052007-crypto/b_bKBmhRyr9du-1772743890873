"use client"
import { Separator } from "@/components/ui/separator"
import { motion } from "framer-motion"
import BrowseCard from "./browse-card"
import RecentlyPlayedCarousel from "./recently-played-carousel"
import BrowseSections from "./browse-sections"
import { usePlaylists } from "./playlist-context"
import RecommendedPlaylistsSection from "./recommended-playlists-section"
import DailyMixesSection from "./daily-mixes-section"
import NewReleaseSection from "./new-release-section"
import ArtistProfilesSection from "./artist-profiles-section"
import PopularTracksSection from "./popular-tracks-section"

export default function HomeContent() {
  const { playlists, getPlaylist } = usePlaylists()

  function getGreeting() {
    const hour = new Date().getHours()
    if (hour < 12) return "Good morning"
    if (hour < 18) return "Good afternoon"
    if (hour < 22) return "Good evening"
    return "Good night"
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="grid gap-6"
    >
      {/* Dynamic greeting */}
      <section className="grid gap-4">
        <h2 className="text-2xl font-bold">{getGreeting()}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {playlists.slice(0, 8).map((p) => (
            <BrowseCard
              key={p.id}
              title={p.name}
              imageUrl={getPlaylist(p.id)?.tracks[0]?.thumbnailUrl || "/playlist-cover.png"}
              bgColor="#282828"
              className="h-16"
              href={`/playlists/${p.id}`}
            />
          ))}
          {playlists.length === 0 && (
            <div className="col-span-full text-sm text-neutral-500 px-1 py-4 text-center">
              No playlists yet. Create one from the sidebar!
            </div>
          )}
        </div>
      </section>

      <Separator className="bg-neutral-800" />

      {/* Popular Artists - Spotify style circular profiles */}
      <section className="grid gap-3">
        <h2 className="text-xl font-semibold">Popular artists</h2>
        <ArtistProfilesSection />
      </section>

      <Separator className="bg-neutral-800" />

      {/* Popular Tracks - Spotify style song list */}
      <section className="grid gap-3">
        <h2 className="text-xl font-semibold">Popular tracks</h2>
        <PopularTracksSection />
      </section>

      <Separator className="bg-neutral-800" />

      {/* New release section */}
      <section className="grid gap-3">
        <h2 className="text-xl font-semibold">New release for you</h2>
        <NewReleaseSection />
      </section>

      <Separator className="bg-neutral-800" />

      {/* Jump back in */}
      <section className="grid gap-3">
        <h2 className="text-xl font-semibold">Jump back in</h2>
        <RecentlyPlayedCarousel />
      </section>

      <Separator className="bg-neutral-800" />

      {/* Made for you */}
      <section className="grid gap-3">
        <h2 className="text-xl font-semibold">Made for you</h2>
        <RecommendedPlaylistsSection />
      </section>

      <Separator className="bg-neutral-800" />

      {/* Daily Mixes */}
      <section className="grid gap-3">
        <h2 className="text-xl font-semibold">Daily Mixes</h2>
        <DailyMixesSection />
      </section>

      <Separator className="bg-neutral-800" />

      {/* Browse by Language */}
      <section className="grid gap-3">
        <h2 className="text-xl font-semibold">Browse by Language</h2>
        <BrowseSections />
      </section>
    </motion.div>
  )
}
