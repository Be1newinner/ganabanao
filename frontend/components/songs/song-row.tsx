"use client";

import { AlertCircle, Download, FileAudio, Layers, MoreHorizontal, Pause, Pencil, Play, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Spinner, StatusBadge } from "@/components/common";
import { CoverArt, Equalizer } from "@/components/cover-art";
import { usePlayer } from "@/components/player/player-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { api, ApiError } from "@/lib/api";
import { formatDateTime, formatDuration, formatWait } from "@/lib/format";
import type { Song } from "@/lib/types";
import { cn } from "@/lib/utils";
import { StemsDialog } from "./stems-dialog";

export const isActive = (s: Song) =>
  s.status === "queued" || s.status === "generating" || s.stems.status === "queued" || s.stems.status === "generating";

const songTags = (song: Song): string[] =>
  [
    song.feature === "remix" ? "Similar song" : song.input?.language,
    song.input?.genre,
    song.input?.mood,
    song.input?.vocal && (song.input.vocal === "instrumental" ? "Instrumental" : `${song.input.vocal} vocal`),
    song.input?.taal,
  ].filter((t): t is string => !!t);

/**
 * One song in the library (FR-3.6, FR-6.1, FR-6.4). Plays in the global player,
 * and offers Download → Single or Stems (FR-5.1).
 */
export function SongRow({
  song,
  stemsCost,
  onChange,
  onDelete,
}: {
  song: Song;
  stemsCost?: number;
  onChange: (song: Song) => void;
  onDelete: (id: string) => void;
}) {
  const player = usePlayer();
  const [stemsOpen, setStemsOpen] = useState(false);
  const [renameOpen, setRenameOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const current = player.isCurrent(song.id);
  const playing = current && player.playing;
  const ready = song.status === "done" && !!song.audio;
  const working = song.status === "queued" || song.status === "generating";

  const play = () => {
    if (!song.audio) return;
    if (current) return player.toggle();
    player.play({
      id: song.id,
      title: song.title,
      subtitle: songTags(song).slice(0, 3).join(" · "),
      src: song.audio.streamUrl,
      coverSeed: song.id,
      downloadUrl: song.audio.downloadUrl,
    });
  };

  return (
    <div
      className={cn(
        "group flex items-center gap-4 rounded-xl p-2 pr-3 transition-colors hover:bg-card",
        current && "bg-card"
      )}
    >
      <CoverArt seed={song.id} className="size-16 sm:size-18">
        {ready ? (
          <button
            type="button"
            onClick={play}
            aria-label={`${playing ? "Pause" : "Play"} ${song.title}`}
            className={cn(
              "absolute inset-0 grid place-items-center bg-black/35 text-white transition-opacity",
              playing ? "opacity-100" : "opacity-0 group-hover:opacity-100 focus-visible:opacity-100"
            )}
          >
            {playing ? <Pause className="size-6 fill-current" /> : <Play className="ml-0.5 size-6 fill-current" />}
          </button>
        ) : (
          <div className="absolute inset-0 grid place-items-center bg-black/45 text-white">
            {working ? <Spinner className="size-5" /> : <AlertCircle className="size-5" />}
          </div>
        )}
      </CoverArt>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          {playing && <Equalizer className="text-primary" />}
          <button
            type="button"
            onClick={play}
            disabled={!ready}
            className={cn("truncate text-left font-medium", ready && "hover:underline", current && "text-primary")}
          >
            {song.title}
          </button>
          {song.stems.status === "done" && (
            <Badge variant="outline" className="hidden gap-1 sm:inline-flex">
              <Layers className="size-3" /> {song.stems.tracks.length} stems
            </Badge>
          )}
        </div>
        <div className="mt-1 flex flex-wrap gap-1.5">
          {songTags(song).map((tag) => (
            <span key={tag} className="rounded-md bg-muted px-1.5 py-0.5 text-[11px] text-muted-foreground capitalize">
              {tag}
            </span>
          ))}
        </div>
        {working && (
          <p className="mt-1.5 text-xs text-muted-foreground">
            {song.queue?.position
              ? `Position ${song.queue.position} in line · ${formatWait(song.queue.estimatedWaitSeconds)}`
              : "Creating your song · usually a few minutes"}
          </p>
        )}
        {song.status === "failed" && (
          <p className="mt-1.5 text-xs text-destructive">
            {song.error ?? "This song could not be made. Your credits have been returned."}
          </p>
        )}
      </div>

      <div className="hidden w-28 flex-col items-end gap-1 text-right md:flex">
        {working || song.status === "failed" ? (
          <StatusBadge status={song.status} />
        ) : (
          <span className="text-sm tabular-nums text-muted-foreground">{formatDuration(song.durationMs)}</span>
        )}
        <span className="text-[11px] text-muted-foreground">{formatDateTime(song.createdAt)}</span>
      </div>

      {ready && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="hidden sm:inline-flex">
              <Download /> Download
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-60">
            <DropdownMenuLabel>Download</DropdownMenuLabel>
            <DropdownMenuItem asChild>
              <a href={song.audio!.downloadUrl}>
                <FileAudio /> Single · MP3
              </a>
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => setStemsOpen(true)}>
              <Layers />
              Stems
              <span className="ml-auto text-xs text-muted-foreground">
                {song.stems.status === "done"
                  ? `${song.stems.tracks.length} ready`
                  : song.stems.status === "queued" || song.stems.status === "generating"
                    ? "making…"
                    : stemsCost !== undefined
                      ? `${stemsCost} credits`
                      : ""}
              </span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" aria-label={`More actions for ${song.title}`}>
            <MoreHorizontal />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {ready && (
            <>
              <DropdownMenuItem asChild className="sm:hidden">
                <a href={song.audio!.downloadUrl}>
                  <FileAudio /> Download MP3
                </a>
              </DropdownMenuItem>
              <DropdownMenuItem className="sm:hidden" onSelect={() => setStemsOpen(true)}>
                <Layers /> Stems
              </DropdownMenuItem>
            </>
          )}
          <DropdownMenuItem onSelect={() => setRenameOpen(true)}>
            <Pencil /> Rename
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive" onSelect={() => setDeleteOpen(true)}>
            <Trash2 /> Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {ready && (
        <StemsDialog song={song} open={stemsOpen} onOpenChange={setStemsOpen} stemsCost={stemsCost} onChange={onChange} />
      )}
      <RenameDialog song={song} open={renameOpen} onOpenChange={setRenameOpen} onChange={onChange} />
      <DeleteDialog
        song={song}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onDeleted={() => {
          if (current) player.close();
          onDelete(song.id);
        }}
      />
    </div>
  );
}

function RenameDialog({
  song,
  open,
  onOpenChange,
  onChange,
}: {
  song: Song;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onChange: (song: Song) => void;
}) {
  const [title, setTitle] = useState(song.title);
  const [busy, setBusy] = useState(false);

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (o) setTitle(song.title);
        onOpenChange(o);
      }}
    >
      <DialogContent className="sm:max-w-md">
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            setBusy(true);
            try {
              const { data } = await api.patch<Song>(`/songs/${song.id}`, { title });
              onChange(data);
              onOpenChange(false);
            } catch (err) {
              toast.error(err instanceof ApiError ? err.message : "Could not rename the song.");
            } finally {
              setBusy(false);
            }
          }}
        >
          <DialogHeader>
            <DialogTitle>Rename song</DialogTitle>
          </DialogHeader>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={120} autoFocus className="my-4" aria-label="Title" />
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={busy || !title.trim()}>
              {busy && <Spinner />} Save
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function DeleteDialog({
  song,
  open,
  onOpenChange,
  onDeleted,
}: {
  song: Song;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDeleted: () => void;
}) {
  const [busy, setBusy] = useState(false);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Delete “{song.title}”?</DialogTitle>
          <DialogDescription>The song and its stems are deleted for good. This cannot be undone.</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            disabled={busy}
            onClick={async () => {
              setBusy(true);
              try {
                await api.delete(`/songs/${song.id}`);
                onOpenChange(false);
                onDeleted();
                toast.success("Song deleted");
              } catch (err) {
                toast.error(err instanceof ApiError ? err.message : "Could not delete the song.");
              } finally {
                setBusy(false);
              }
            }}
          >
            {busy && <Spinner />} Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
