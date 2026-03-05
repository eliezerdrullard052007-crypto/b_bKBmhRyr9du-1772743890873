"use client"

import * as React from "react"
import { usePlaylists } from "./playlist-context"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { VideoItem } from "./video-card"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"

export default function AddToPlaylistDialog({
  open,
  onOpenChange,
  track,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  track: VideoItem
}) {
  const { playlists, addToPlaylist, createPlaylist } = usePlaylists()
  const [newName, setNewName] = React.useState("")

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-neutral-950 border-neutral-800 max-w-md">
        <DialogHeader>
          <DialogTitle>Add to playlist</DialogTitle>
        </DialogHeader>
        <div className="grid gap-3">
          <Label className="text-neutral-400">Choose existing</Label>
          <ScrollArea className="h-40 rounded border border-neutral-800 group">
            {" "}
            {/* Added group class */}
            <div className="p-2 grid gap-2">
              {playlists.length === 0 ? (
                <div className="text-sm text-neutral-500 px-1">No playlists yet.</div>
              ) : (
                playlists.map((p) => (
                  <Button
                    key={p.id}
                    variant="ghost"
                    className="justify-start truncate hover:bg-neutral-900"
                    onClick={() => {
                      addToPlaylist(p.id, track)
                      onOpenChange(false)
                    }}
                  >
                    {p.name}
                  </Button>
                ))
              )}
            </div>
            <ScrollBar className="bg-transparent group-hover:bg-neutral-800 transition-colors" />{" "}
            {/* Added ScrollBar and modified className */}
          </ScrollArea>

          <div className="grid gap-2">
            <Label htmlFor="newName" className="text-neutral-400">
              Or create new
            </Label>
            <div className="flex gap-2">
              <Input
                id="newName"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Playlist name"
                className="bg-neutral-900 border-neutral-800"
              />
              <Button
                onClick={() => {
                  const id = createPlaylist(newName.trim() || "New Playlist")
                  addToPlaylist(id, track)
                  onOpenChange(false)
                }}
                className="bg-[#1DB954] text-black hover:bg-[#19a94f]"
              >
                Add
              </Button>
            </div>
          </div>
        </div>
        <DialogFooter />
      </DialogContent>
    </Dialog>
  )
}
