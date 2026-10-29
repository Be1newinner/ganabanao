"use client";

import { ChevronLeft, ChevronRight, Library, RefreshCw, Sparkles } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { EmptyState, PageHeader } from "@/components/common";
import { SongList, useSongs } from "@/components/songs/song-list";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const PAGE_SIZE = 12;

/** Library (FR-6.3): every job, newest first, filterable by tool and status. */
export function SongsView() {
  const [feature, setFeature] = useState("all");
  const [status, setStatus] = useState("any");
  const [page, setPage] = useState(1);

  const query = new URLSearchParams({ page: String(page), limit: String(PAGE_SIZE) });
  if (feature !== "all") query.set("feature", feature);
  if (status !== "any") query.set("status", status);
  const songs = useSongs(`/songs?${query}`);
  const totalPages = songs.meta?.totalPages ?? 1;

  return (
    <>
      <PageHeader
        title="Library"
        description={
          songs.meta ? `${songs.meta.total} songs · kept until you delete them` : "Songs stay here until you delete them."
        }
        actions={
          <>
            <Button variant="outline" onClick={() => void songs.reload()} disabled={songs.loading}>
              <RefreshCw className={songs.loading ? "animate-spin" : ""} /> Refresh
            </Button>
            <Button variant="brand" asChild>
              <Link href="/create">
                <Sparkles /> Create
              </Link>
            </Button>
          </>
        }
      />

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <Tabs
          value={feature}
          onValueChange={(v) => {
            setFeature(v);
            setPage(1);
          }}
        >
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="generate">Text to song</TabsTrigger>
            <TabsTrigger value="remix">Similar</TabsTrigger>
            <TabsTrigger value="stems">With stems</TabsTrigger>
          </TabsList>
        </Tabs>
        <Select
          value={status}
          onValueChange={(v) => {
            setStatus(v);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-40" aria-label="Filter by status">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="any">Any status</SelectItem>
            <SelectItem value="queued">In queue</SelectItem>
            <SelectItem value="generating">Creating</SelectItem>
            <SelectItem value="done">Ready</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <SongList
        songs={songs.data}
        loading={songs.loading}
        error={songs.error}
        setSongs={(fn) => songs.setData((s) => fn(s))}
        empty={
          feature !== "all" || status !== "any" ? (
            <EmptyState icon={<Library className="size-5" />} title="No songs match these filters" />
          ) : (
            <EmptyState icon={<Library className="size-5" />} title="Your library is empty">
              <Button variant="brand" className="mt-4" asChild>
                <Link href="/create">
                  <Sparkles /> Create your first song
                </Link>
              </Button>
            </EmptyState>
          )
        }
      />

      {totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-3">
          <Button variant="outline" size="icon" disabled={page <= 1} onClick={() => setPage((p) => p - 1)} aria-label="Previous page">
            <ChevronLeft />
          </Button>
          <span className="text-sm text-muted-foreground tabular-nums">
            Page {page} of {totalPages}
          </span>
          <Button variant="outline" size="icon" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)} aria-label="Next page">
            <ChevronRight />
          </Button>
        </div>
      )}
    </>
  );
}
