"use client";

import { useState } from "react";
import { SongList, useSongs } from "@/components/song-list";
import { Button, EmptyState, LinkButton, PageHeader, Select } from "@/components/ui";

const PAGE_SIZE = 10;

/** My Songs (FR-6.3): every job, newest first, filterable by feature and status. */
export default function SongsPage() {
  const [feature, setFeature] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);

  const query = new URLSearchParams({ page: String(page), limit: String(PAGE_SIZE) });
  if (feature) query.set("feature", feature);
  if (status) query.set("status", status);
  const songs = useSongs(`/songs?${query}`);
  const totalPages = songs.meta?.totalPages ?? 1;

  const filter = (set: (v: string) => void) => (e: React.ChangeEvent<HTMLSelectElement>) => {
    set(e.target.value);
    setPage(1);
  };

  return (
    <>
      <PageHeader
        title="My Songs"
        description="Status updates when you refresh. Songs stay here until you delete them."
        actions={
          <Button variant="secondary" size="sm" onClick={() => void songs.reload()} loading={songs.loading}>
            Refresh
          </Button>
        }
      />

      <div className="mb-5 flex flex-wrap gap-3">
        <Select value={feature} onChange={filter(setFeature)} className="w-auto" aria-label="Filter by tool">
          <option value="">All tools</option>
          <option value="generate">Text to song</option>
          <option value="remix">Similar song</option>
          <option value="stems">With stems</option>
        </Select>
        <Select value={status} onChange={filter(setStatus)} className="w-auto" aria-label="Filter by status">
          <option value="">Any status</option>
          <option value="queued">Queued</option>
          <option value="generating">Generating</option>
          <option value="done">Done</option>
          <option value="failed">Failed</option>
        </Select>
        {songs.meta && <span className="self-center text-sm text-muted">{songs.meta.total} songs</span>}
      </div>

      <SongList
        songs={songs.data}
        loading={songs.loading}
        error={songs.error}
        setSongs={(fn) => songs.setData((s) => fn(s))}
        empty={
          feature || status ? (
            <EmptyState title="No songs match these filters" />
          ) : (
            <EmptyState title="No songs yet">
              <LinkButton href="/create" className="mt-3">
                Create your first song
              </LinkButton>
            </EmptyState>
          )
        }
      />

      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-3">
          <Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            Previous
          </Button>
          <span className="text-sm text-muted">
            Page {page} of {totalPages}
          </span>
          <Button variant="secondary" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
            Next
          </Button>
        </div>
      )}
    </>
  );
}
