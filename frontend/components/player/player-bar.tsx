"use client";

import { Download, Pause, Play, Volume2, VolumeX, X } from "lucide-react";
import { CoverArt } from "@/components/cover-art";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { formatDuration } from "@/lib/format";
import { cn } from "@/lib/utils";
import { usePlayer } from "./player-provider";

/** Bottom player bar, visible while a track is loaded (FR-6.1: play, pause, seek, volume). */
export function PlayerBar({ className }: { className?: string }) {
  const p = usePlayer();
  if (!p.track) return null;
  const { track } = p;

  return (
    <div
      className={cn(
        "fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/85 backdrop-blur-xl supports-[backdrop-filter]:bg-background/70",
        className
      )}
    >
      {/* Thin progress line on top, useful on phones where the slider is hidden */}
      <div className="h-0.5 bg-muted sm:hidden">
        <div className="h-full bg-sindoor" style={{ width: p.duration ? `${(p.time / p.duration) * 100}%` : 0 }} />
      </div>
      <div className="mx-auto flex h-18 max-w-screen-2xl items-center gap-3 px-3 sm:gap-5 sm:px-5">
        <div className="flex min-w-0 flex-1 items-center gap-3 sm:w-72 sm:flex-none">
          <CoverArt seed={track.coverSeed} className="size-11" sizes="44px" />
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{track.title}</p>
            <p className="truncate text-xs text-muted-foreground">{p.error ?? track.subtitle}</p>
          </div>
        </div>

        <div className="flex flex-none items-center gap-3 sm:flex-1">
          <Button
            size="icon-lg"
            className="size-10 rounded-full bg-sindoor text-primary-foreground hover:bg-[color-mix(in_oklab,var(--sindoor),black_14%)]"
            onClick={p.toggle}
            aria-label={p.playing ? "Pause" : "Play"}
          >
            {p.playing ? <Pause className="size-4 fill-current" /> : <Play className="ml-0.5 size-4 fill-current" />}
          </Button>
          <div className="hidden flex-1 items-center gap-3 sm:flex">
            <span className="w-10 text-right text-xs tabular-nums text-muted-foreground">{formatDuration(p.time * 1000) || "0:00"}</span>
            <Slider
              value={[p.time]}
              max={p.duration || 1}
              step={0.1}
              onValueChange={([v]) => p.seek(v)}
              aria-label="Seek"
              className="flex-1"
            />
            <span className="w-10 text-xs tabular-nums text-muted-foreground">{formatDuration(p.duration * 1000) || "–:––"}</span>
          </div>
        </div>

        <div className="hidden items-center gap-2 md:flex md:w-56 md:justify-end">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => p.setVolume(p.volume > 0 ? 0 : 1)}
            aria-label={p.volume > 0 ? "Mute" : "Unmute"}
          >
            {p.volume > 0 ? <Volume2 /> : <VolumeX />}
          </Button>
          <Slider
            value={[p.volume]}
            max={1}
            step={0.05}
            onValueChange={([v]) => p.setVolume(v)}
            aria-label="Volume"
            className="w-24"
          />
          {track.downloadUrl && (
            <Button variant="ghost" size="icon" asChild>
              <a href={track.downloadUrl} aria-label="Download MP3">
                <Download />
              </a>
            </Button>
          )}
        </div>
        <Button variant="ghost" size="icon" onClick={p.close} aria-label="Close player">
          <X />
        </Button>
      </div>
    </div>
  );
}
