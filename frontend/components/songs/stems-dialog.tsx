"use client";

import { Download, FileArchive, Music2, Pause, Play, Sparkles } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Spinner, StatusBadge } from "@/components/common";
import { Equalizer } from "@/components/cover-art";
import { usePlayer } from "@/components/player/player-provider";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { api, ApiError } from "@/lib/api";
import { formatDate, formatWait } from "@/lib/format";
import { useSession } from "@/lib/session";
import type { Song } from "@/lib/types";

const STEMS_V2 = "vocals, bass, drums, guitar, piano, keyboard, strings, flute, brass and woodwinds, synth, FX and other";
const STEMS_V1 = "vocals, drums, bass, instrumental and other";

/**
 * Feature 3 (FR-5.1 to FR-5.8): make stems once (charged), then play and
 * download each one, plus the WAV and MIDI ZIPs, until they expire after 30 days.
 */
export function StemsDialog({
  song,
  open,
  onOpenChange,
  stemsCost,
  onChange,
}: {
  song: Song;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stemsCost?: number;
  onChange: (song: Song) => void;
}) {
  const { refresh } = useSession();
  const player = usePlayer();
  const [busy, setBusy] = useState(false);
  const { stems } = song;
  const v1 = stems.model === "audio-separation-1";

  async function requestStems() {
    setBusy(true);
    try {
      const { data } = await api.post<Song>(`/songs/${song.id}/stems`);
      onChange(data);
      void refresh(); // balance changed
      toast.success("Stems are being made. This usually takes a minute or two.");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Could not start the stems.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">Stems · {song.title}</DialogTitle>
          <DialogDescription>Each instrument as its own track, for remixing and editing.</DialogDescription>
        </DialogHeader>

        {(stems.status === "none" || stems.status === "failed") && (
          <div className="space-y-4">
            {stems.status === "failed" && (
              <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {stems.error ?? "The stems could not be made. Your credits have been returned."}
              </p>
            )}
            <p className="text-sm">
              Up to {v1 ? "5" : "12"} stems: {v1 ? STEMS_V1 : STEMS_V2}. Only the instruments in the song are returned.
            </p>
            <p className="text-sm text-muted-foreground">
              Dholak and harmonium have no stem of their own and land in drums, keyboard or other. You get MP3s to play
              here, plus the original WAV files{v1 ? "" : " and MIDI"} as ZIPs. Stems are kept for 30 days.
            </p>
            <div className="flex items-center justify-between gap-4 rounded-xl border bg-muted/40 p-4">
              <div>
                <p className="text-sm font-medium">Charged once for this song</p>
                <p className="text-xs text-muted-foreground">Later downloads are free while the stems are kept.</p>
              </div>
              <Button variant="brand" size="lg" onClick={requestStems} disabled={busy}>
                {busy ? <Spinner /> : <Sparkles />}
                Make stems{stemsCost !== undefined ? ` · ${stemsCost} credits` : ""}
              </Button>
            </div>
          </div>
        )}

        {(stems.status === "queued" || stems.status === "generating") && (
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <StatusBadge status={stems.status} />
            <p className="text-sm text-muted-foreground">
              {stems.queue?.position
                ? `Position ${stems.queue.position} in line, ${formatWait(stems.queue.estimatedWaitSeconds)}. Stems are made one at a time.`
                : "Separating the tracks. This usually takes a minute or two."}
            </p>
            <p className="text-xs text-muted-foreground">You can close this window. The library updates on its own.</p>
          </div>
        )}

        {stems.status === "done" && (
          <div className="space-y-4">
            <ul className="max-h-80 divide-y overflow-y-auto rounded-xl border">
              {stems.tracks.map((t) => {
                const id = `${song.id}:${t.name}`;
                const current = player.isCurrent(id);
                return (
                  <li key={t.name} className="flex items-center gap-3 px-3 py-2">
                    <Button
                      size="icon"
                      variant={current ? "default" : "secondary"}
                      className="rounded-full"
                      aria-label={`${current && player.playing ? "Pause" : "Play"} ${t.name}`}
                      onClick={() =>
                        current
                          ? player.toggle()
                          : player.play({
                              id,
                              title: `${song.title} — ${t.name}`,
                              subtitle: "Stem",
                              src: t.streamUrl,
                              coverSeed: song.id,
                              downloadUrl: t.downloadUrl,
                            })
                      }
                    >
                      {current && player.playing ? <Pause className="fill-current" /> : <Play className="ml-0.5 fill-current" />}
                    </Button>
                    <span className="flex-1 text-sm font-medium capitalize">{t.name}</span>
                    {current && player.playing && <Equalizer className="text-primary" />}
                    <Button variant="ghost" size="sm" asChild>
                      <a href={t.downloadUrl}>
                        <Download /> MP3
                      </a>
                    </Button>
                  </li>
                );
              })}
            </ul>
            <div className="flex flex-wrap gap-2">
              {stems.wavZipUrl && (
                <Button variant="brand" asChild>
                  <a href={stems.wavZipUrl}>
                    <FileArchive /> All stems · WAV ZIP
                  </a>
                </Button>
              )}
              {stems.midiZipUrl && (
                <Button variant="outline" asChild>
                  <a href={stems.midiZipUrl}>
                    <Music2 /> MIDI ZIP
                  </a>
                </Button>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Kept until {formatDate(stems.expiresAt)}, then deleted. Download what you need before then.
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
