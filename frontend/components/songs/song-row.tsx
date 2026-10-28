"use client";

import { AlertCircle, Download, FileAudio, Layers, MoreHorizontal, Pause, Pencil, Play, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Spinner } from "@/components/common";
import { CoverArt, Equalizer } from "@/components/cover-art";
import { usePlayer } from "@/components/player/player-provider";
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

/** "Kajri, romantic, female voice" — plain words, duplicates removed (genre and mood can match). */
export const describeSong = (song: Song): string => {
  const parts = [
    song.feature === "remix" ? "Similar song" : song.input?.genre,
    song.input?.mood,
    song.input?.vocal && (song.input.vocal === "instrumental" ? "instrumental" : `${song.input.vocal} voice`),
    song.input?.taal && `${song.input.taal} taal`,
  ].filter((t): t is string => !!t);
  const seen = new Set<string>();
  const unique = parts.filter((p) => !seen.has(p.toLowerCase()) && seen.add(p.toLowerCase()));
  return unique.map((p, i) => (i === 0 ? p : p.toLowerCase())).join(", ") || song.input?.language || "Song";
};

/**
 * One song in the library (FR-3.6, FR-6.1, FR-6.4). Plays in the global player,
 * and offers Download → Single or Stems (FR-5.1).
 */
export function SongRow({
  song,
  index,
  stemsCost,
  onChange,
  onDelete,
}: {
  song: Song;
  /** Track number, shown when the list is a tracklist */
  index?: number;
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
      subtitle: describeSong(song),
      src: song.audio.streamUrl,
      coverSeed: song.id,
      downloadUrl: song.audio.downloadUrl,
    });
  };

  return (
    <div
      className={cn(
        "group flex items-center gap-4 border-b border-border py-3 pr-1 last:border-b-0",
        current && "bg-haldi/8"
      )}
    >
      {index !== undefined && (
        <span className="hidden w-6 text-right font-display text-xl text-muted-foreground tabular-nums sm:block">
          {playing ? <Equalizer className="ml-auto text-sindoor" /> : index}
        </span>
      )}

      <CoverArt seed={song.id} className="size-14 sm:size-16" sizes="64px">
        {ready ? (
          <button
            type="button"
            onClick={play}
            aria-label={`${playing ? "Pause" : "Play"} ${song.title}`}
            className={cn(
              "absolute inset-0 grid place-items-center bg-kajal/45 text-white transition-opacity",
              playing ? "opacity-100" : "opacity-0 group-hover:opacity-100 focus-visible:opacity-100"
            )}
          >
            {playing ? <Pause className="size-5 fill-current" /> : <Play className="ml-0.5 size-5 fill-current" />}
          </button>
        ) : (
          <div className="absolute inset-0 grid place-items-center bg-kajal/55 text-white">
            {working ? <Spinner className="size-5" /> : <AlertCircle className="size-5" />}
          </div>
        )}
      </CoverArt>

      <div className="min-w-0 flex-1">
        <button
          type="button"
          onClick={play}
          disabled={!ready}
          className={cn(
            "block max-w-full truncate text-left text-base font-semibold",
            ready && "hover:underline",
            current && "text-sindoor"
          )}
        >
          {song.title}
        </button>
        <p className="truncate text-sm text-muted-foreground">
          {describeSong(song)}
          {song.stems.status === "done" && `, ${song.stems.tracks.length} stems ready`}
        </p>
        {working && (
          <p className="mt-1 text-sm text-warning">
            {song.queue?.position
              ? `Number ${song.queue.position} in line, ${formatWait(song.queue.estimatedWaitSeconds)}`
              : "Being made now. This usually takes a few minutes."}
          </p>
        )}
        {song.status === "failed" && (
          <p className="mt-1 text-sm text-destructive">
            {song.error ?? "This song could not be made. Your credits have been returned."}
          </p>
        )}
      </div>

      <div className="hidden w-32 text-right md:block">
        <p className="text-sm tabular-nums">{ready ? formatDuration(song.durationMs) : ""}</p>
        <p className="text-xs text-muted-foreground">{formatDateTime(song.createdAt)}</p>
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
