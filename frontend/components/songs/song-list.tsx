"use client";

import type { ReactNode } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useApi } from "@/lib/use-api";
import type { PublicSettings, Song } from "@/lib/types";
import { SongRow, isActive } from "./song-row";

/** Loads songs for `path`; refreshes every 15 s only while a job is running. */
export function useSongs(path: string) {
  return useApi<Song[]>(path, { refreshEvery: 15_000, shouldRefresh: (songs) => songs.some(isActive) });
}

export function SongListSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="flex items-center gap-4 p-2">
          <Skeleton className="size-16 rounded-lg sm:size-18" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function SongList({
  songs,
  loading,
  error,
  setSongs,
  empty,
}: {
  songs: Song[] | undefined;
  loading: boolean;
  error?: { message: string };
  setSongs: (fn: (songs: Song[] | undefined) => Song[] | undefined) => void;
  empty: ReactNode;
}) {
  const settings = useApi<PublicSettings>("/settings");
  if (loading && !songs) return <SongListSkeleton />;
  if (error && !songs) return <p className="text-sm text-destructive">{error.message}</p>;
  if (!songs?.length) return <>{empty}</>;
  return (
    <div className="space-y-1">
      {songs.map((song) => (
        <SongRow
          key={song.id}
          song={song}
          stemsCost={settings.data?.creditCosts.stems}
          onChange={(updated) => setSongs((list) => list?.map((s) => (s.id === updated.id ? updated : s)))}
          onDelete={(id) => setSongs((list) => list?.filter((s) => s.id !== id))}
        />
      ))}
    </div>
  );
}
