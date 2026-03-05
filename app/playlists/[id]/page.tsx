"use client"
import { useParams, useRouter } from "next/navigation"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import AppSidebar from "@/components/app-sidebar"
import MiniPlayer from "@/components/mini-player"
import { PlaylistProvider, usePlaylists } from "@/components/playlist-context"
import { PlayerProvider } from "@/components/player-context"
import PlaylistRow from "@/components/playlist-row"
import { Button } from "@/components/ui/button"
import { ArrowLeft, ListMusic, Play } from "lucide-react"
import { DndContext, closestCenter, type DragEndEvent, PointerSensor, useSensor, useSensors } from "@dnd-kit/core"
import { SortableContext, verticalListSortingStrategy, arrayMove } from "@dnd-kit/sortable"
import { Separator } from "@/components/ui/separator"
import DarkModeEnforcer from "@/components/dark-mode"
// Removed import { PlaylistDownloadAlternatives } from "@/components/download-alternatives"

function PlaylistContent() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const id = params?.id
  const { getPlaylist, removeFromPlaylist, reorderPlaylist } = usePlaylists()

  const playlist = id ? getPlaylist(id) : undefined
  const tracks = playlist?.tracks ?? []

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }))

  const ids = tracks.map((t) => t.id)

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id || !playlist) return
    const oldIndex = ids.indexOf(String(active.id))
    const newIndex = ids.indexOf(String(over.id))
    if (oldIndex === -1 || newIndex === -1) return
    const newOrder = arrayMove(ids, oldIndex, newIndex)
    reorderPlaylist(playlist.id, newOrder)
  }

  if (!playlist) {
    return (
      <div className="p-6">
        <div className="text-sm text-neutral-400">Playlist not found.</div>
        <Button className="mt-3" variant="secondary" onClick={() => router.push("/")}>
          Go home
        </Button>
      </div>
    )
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
                <ListMusic className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-base sm:text-lg font-semibold leading-tight">{playlist.name}</h1>
                <p className="text-xs text-neutral-400">Tracks: {tracks.length}</p>
              </div>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <Button
                className="bg-[#1DB954] text-black hover:bg-[#19a94f]"
                onClick={() => {
                  if (tracks[0]) {
                    // For now, just focus the first play button
                    const anchor = document.querySelector<HTMLButtonElement>('[aria-label="Play"]')
                    anchor?.focus()
                  }
                }}
                title="Play All"
              >
                <Play className="mr-2 h-4 w-4" />
                Play All
              </Button>
              {/* Removed PlaylistDownloadAlternatives component */}
            </div>
          </header>

          <main className="px-4 sm:px-6 py-5">
            {tracks.length === 0 ? (
              <div className="rounded-lg border border-neutral-800 p-8 text-center text-neutral-400">
                This playlist is empty. Use "Add to playlist" from any track to populate it.
              </div>
            ) : (
              <>
                <div className="text-xs text-neutral-400 mb-3">Drag tracks to reorder. Click trash to remove.</div>
                <Separator className="bg-neutral-800 mb-4" />
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
                  <SortableContext items={ids} strategy={verticalListSortingStrategy}>
                    <div className="grid gap-2">
                      {tracks.map((t, i) => (
                        <PlaylistRow
                          key={t.id}
                          track={t}
                          index={i}
                          onRemove={(tid) => removeFromPlaylist(playlist.id, tid)}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              </>
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
        <PlaylistContent />
      </PlayerProvider>
    </PlaylistProvider>
  )
}
