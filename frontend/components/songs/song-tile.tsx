"use client";

import { AlertCircle, FileAudio, Layers, MoreHorizontal, Pause, Pencil, Play, Trash2 } from "lucide-react";
import { useState } from "react";
import { Spinner } from "@/components/common";
import { CoverArt, Equalizer, coverSrc } from "@/components/cover-art";
import { usePlayer } from "@/components/player/player-provider";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDuration, formatWait } from "@/lib/format";
import type { Song } from "@/lib/types";
import { cn } from "@/lib/utils";
import { DeleteDialog, RenameDialog, describeSong } from "./song-row";
import { StemsDialog } from "./stems-dialog";

/**
 * A song as a square painted cover, for the home wall (music-app-ux: "recent
 * work as artwork"). The playing song wears a gold ring.
 */
export function SongTile({
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
      subtitle: describeSong(song),
      src: song.audio.streamUrl,
      coverSeed: song.id,
      downloadUrl: song.audio.downloadUrl,
    });
  };

  return (
    <div className="group relative min-w-0">
      {/* The cover's own colours glow softly behind it */}
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-x-3 top-4 aspect-square scale-95 rounded-2xl bg-cover bg-center opacity-40 blur-2xl transition-opacity duration-500 group-hover:opacity-70",
          current && "opacity-80"
        )}
        style={{ backgroundImage: `url(${coverSrc(song.id)})` }}
      />
      <CoverArt
        seed={song.id}
        className={cn(
          "aspect-square w-full ring-offset-2 ring-offset-background transition-shadow",
          current && "ring-2 ring-gold"
        )}
        rounded="rounded-lg"
        sizes="(min-width: 1280px) 220px, (min-width: 640px) 30vw, 45vw"
      >
        {ready ? (
          <button
            type="button"
            onClick={play}
            aria-label={`${playing ? "Pause" : "Play"} ${song.title}`}
            className={cn(
              "absolute inset-0 grid place-items-center bg-black/0 transition-colors group-hover:bg-black/30 focus-visible:bg-black/30",
              playing && "bg-black/30"
            )}
          >
            <span
              className={cn(
                "grid size-11 place-items-center rounded-full bg-cta text-on-cta shadow-lg transition-all",
                playing ? "scale-100 opacity-100" : "scale-90 opacity-0 group-hover:scale-100 group-hover:opacity-100"
              )}
            >
              {playing ? <Pause className="size-5 fill-current" /> : <Play className="ml-0.5 size-5 fill-current" />}
            </span>
          </button>
        ) : (
          <div className="absolute inset-0 grid place-items-center bg-black/55 text-white">
            {working ? <Spinner className="size-6" /> : <AlertCircle className="size-6 text-sindoor" />}
          </div>
        )}
        {playing && <Equalizer className="absolute bottom-3 left-3 text-gold" />}
        {ready && !!song.durationMs && (
          <span className="pointer-events-none absolute right-2 bottom-2 rounded-md bg-black/60 px-1.5 py-0.5 text-xs text-white tabular-nums">
            {formatDuration(song.durationMs)}
          </span>
        )}
      </CoverArt>

      <div className="mt-3 flex items-start gap-2">
        <div className="min-w-0 flex-1">
          <p className={cn("truncate font-semibold", current && "text-gold")}>{song.title}</p>
          <p className="truncate text-sm text-ink-3">
            {working
              ? song.queue?.position
                ? `Number ${song.queue.position} in line, ${formatWait(song.queue.estimatedWaitSeconds)}`
                : "Being made now"
              : song.status === "failed"
                ? "Couldn't be made. Credits returned."
                : describeSong(song)}
          </p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon-sm" className="-mr-1 text-ink-3" aria-label={`More actions for ${song.title}`}>
              <MoreHorizontal />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            {ready && (
              <>
                <DropdownMenuItem asChild>
                  <a href={song.audio!.downloadUrl}>
                    <FileAudio /> Download MP3
                  </a>
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => setStemsOpen(true)}>
                  <Layers /> Stems
                  {song.stems.status === "done" && (
                    <span className="ml-auto text-xs text-ink-3">{song.stems.tracks.length} ready</span>
                  )}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
              </>
            )}
            <DropdownMenuItem onSelect={() => setRenameOpen(true)}>
              <Pencil /> Rename
            </DropdownMenuItem>
            <DropdownMenuItem variant="destructive" onSelect={() => setDeleteOpen(true)}>
              <Trash2 /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

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
