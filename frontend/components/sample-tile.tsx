"use client";

import { Pause, Play } from "lucide-react";
import { CoverArt, Equalizer } from "@/components/cover-art";
import { usePlayer } from "@/components/player/player-provider";

/** A landing-page sample song that plays in the global player. */
export function SampleTile({ title, description, src }: { title: string; description: string; src: string }) {
  const player = usePlayer();
  const current = player.isCurrent(src);
  const playing = current && player.playing;

  return (
    <button
      type="button"
      className="group text-left"
      onClick={() =>
        current ? player.toggle() : player.play({ id: src, title, subtitle: description, src, coverSeed: title })
      }
    >
      <CoverArt seed={title} className="aspect-square w-full" rounded="rounded-2xl">
        <span className="absolute inset-0 grid place-items-center bg-black/0 transition-colors group-hover:bg-black/30">
          <span className="grid size-12 scale-90 place-items-center rounded-full bg-white text-black opacity-0 shadow-xl transition-all group-hover:scale-100 group-hover:opacity-100">
            {playing ? <Pause className="size-5 fill-current" /> : <Play className="ml-0.5 size-5 fill-current" />}
          </span>
        </span>
        {playing && <Equalizer className="absolute bottom-3 left-3 text-white" />}
      </CoverArt>
      <p className="mt-2 truncate text-sm font-medium">{title}</p>
      <p className="truncate text-xs text-muted-foreground">{description}</p>
    </button>
  );
}
