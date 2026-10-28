"use client";

import { FileAudio, Repeat2, Upload, X, Zap } from "lucide-react";
import Link from "next/link";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { EmptyState, FormField, Notice, PageLoader, Panel, Spinner } from "@/components/common";
import { SongList, useSongs } from "@/components/songs/song-list";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useFormSubmit } from "@/components/use-form";
import { api } from "@/lib/api";
import { formatDuration } from "@/lib/format";
import { useSession } from "@/lib/session";
import type { PublicSettings, Song } from "@/lib/types";
import { useApi } from "@/lib/use-api";
import { cn } from "@/lib/utils";

const LYRICS_MAX = 2000;
const PROMPT_MAX = 500;

/** Reads the track length in the browser, so a wrong file is caught before upload. */
const readDuration = (file: File): Promise<number> =>
  new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const audio = new Audio();
    audio.preload = "metadata";
    audio.onloadedmetadata = () => {
      URL.revokeObjectURL(url);
      resolve(audio.duration);
    };
    audio.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("unreadable"));
    };
    audio.src = url;
  });

/** FR-4.1 limits (Mureka V8), used if the API does not send its own */
const DEFAULT_LIMITS = { minSeconds: 10, maxSeconds: 350, maxBytes: 10 * 1024 * 1024 };

const minSec = (s: number) => `${Math.floor(s / 60)} min${s % 60 ? ` ${s % 60} s` : ""}`;
const mb = (bytes: number) => `${(bytes / 1024 / 1024).toFixed(1)} MB`;

/** Feature 2 — similar song from an uploaded track (FR-4.1 to FR-4.3, FR-4.7). */
export default function RemixPage() {
  const { user, refresh } = useSession();
  const settings = useApi<PublicSettings>("/settings");
  const songs = useSongs("/songs?limit=8&feature=remix");
  const { busy, error, fieldErrors, run, setError } = useFormSubmit();
  const inputRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [fileInfo, setFileInfo] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [lyrics, setLyrics] = useState("");
  const [prompt, setPrompt] = useState("");
  const [title, setTitle] = useState("");
  const [rights, setRights] = useState(false);

  if (settings.loading) return <PageLoader />;
  if (!settings.data) return <Notice tone="error">Could not load the form. {settings.error?.message}</Notice>;
  const { creditCosts } = settings.data;
  const limits = settings.data.remix ?? DEFAULT_LIMITS;
  const cost = creditCosts.remix;
  const tooFew = (user?.credits ?? 0) < cost;

  async function pickFile(picked: File | undefined) {
    setFile(null);
    setFileInfo(null);
    setFileError(null);
    if (!picked) return;
    if (!/\.(mp3|m4a)$/i.test(picked.name)) return setFileError("Please choose an MP3 or M4A file.");
    if (picked.size > limits.maxBytes) {
      return setFileError(`This file is ${mb(picked.size)}. The limit is ${limits.maxBytes / 1024 / 1024} MB.`);
    }
    try {
      const seconds = await readDuration(picked);
      if (seconds < limits.minSeconds || seconds > limits.maxSeconds) {
        return setFileError(
          `The song must be between ${limits.minSeconds} seconds and ${minSec(limits.maxSeconds)} long. This one is ${formatDuration(seconds * 1000)}.`
        );
      }
      setFileInfo(`${formatDuration(seconds * 1000)} · ${mb(picked.size)}`);
    } catch {
      // Some browsers cannot read M4A metadata; the server checks the length anyway
      setFileInfo(mb(picked.size));
    }
    setFile(picked);
  }

  function clearFile() {
    setFile(null);
    setFileInfo(null);
    setFileError(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!file) return setError("Please choose a reference song.");
    const form = new FormData();
    form.append("lyrics", lyrics);
    form.append("prompt", prompt);
    form.append("rightsConfirmed", String(rights));
    if (title) form.append("title", title);
    form.append("audio", file);
    const res = await run(() => api.upload<Song>("/songs/remix", form));
    if (res) {
      songs.setData((list) => [res.data, ...(list ?? [])]);
      void refresh();
      clearFile();
      toast.success("Your similar song is on its way.");
    }
  }

  return (
    <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)]">
      <form onSubmit={onSubmit} className="space-y-5" noValidate>
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">Similar song</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Upload a song and write new lyrics. You get one new song with the same music and feel.
          </p>
        </div>

        {error && <Notice tone="error">{error}</Notice>}

        {/* Drop zone */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            void pickFile(e.dataTransfer.files[0]);
          }}
          className={cn(
            "rounded-2xl border-2 border-dashed p-6 text-center transition-colors",
            dragging ? "border-primary bg-primary/5" : "bg-card/60",
            fileError && "border-destructive/60"
          )}
        >
          <input
            ref={inputRef}
            id="audio"
            type="file"
            accept=".mp3,.m4a,audio/mpeg,audio/mp4,audio/x-m4a"
            className="sr-only"
            onChange={(e) => void pickFile(e.target.files?.[0])}
          />
          {file ? (
            <div className="flex items-center gap-4 text-left">
              <div className="grid size-12 shrink-0 place-items-center rounded-xl bg-brand-gradient text-white">
                <FileAudio className="size-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{file.name}</p>
                <p className="text-xs text-muted-foreground">{fileInfo}</p>
              </div>
              <Button type="button" variant="ghost" size="icon" onClick={clearFile} aria-label="Remove file">
                <X />
              </Button>
            </div>
          ) : (
            <label htmlFor="audio" className="flex cursor-pointer flex-col items-center">
              <span className="grid size-14 place-items-center rounded-full bg-muted">
                <Upload className="size-6 text-primary" />
              </span>
              <span className="mt-4 font-medium">Drop your reference song here, or click to browse</span>
              <span className="mt-1 text-xs text-muted-foreground">
                MP3 or M4A · {limits.minSeconds} s to {minSec(limits.maxSeconds)} · up to {limits.maxBytes / 1024 / 1024} MB
              </span>
            </label>
          )}
          {(fileError || fieldErrors.audio) && <p className="mt-3 text-sm text-destructive">{fileError ?? fieldErrors.audio}</p>}
        </div>

        <Notice>
          The song needs vocals: instrumental-only tracks are not supported. Your upload is deleted once the new song is
          made.
        </Notice>

        <Panel>
          <div className="space-y-5">
            <FormField
              label="Style prompt"
              htmlFor="prompt"
              error={fieldErrors.prompt}
              aside={`${prompt.length}/${PROMPT_MAX}`}
              hint='Include the vocal style, e.g. "Bhojpuri folk, energetic, female vocal".'
            >
              <Textarea id="prompt" value={prompt} onChange={(e) => setPrompt(e.target.value)} maxLength={PROMPT_MAX} className="min-h-20" />
            </FormField>
            <FormField label="New lyrics" htmlFor="lyrics" error={fieldErrors.lyrics} aside={`${lyrics.length}/${LYRICS_MAX}`}>
              <Textarea
                id="lyrics"
                value={lyrics}
                onChange={(e) => setLyrics(e.target.value)}
                maxLength={LYRICS_MAX}
                className="min-h-52 font-mono text-sm leading-relaxed"
                placeholder={"[Verse]\n…\n\n[Chorus]\n…"}
              />
            </FormField>
            <FormField label="Title (optional)" htmlFor="title" error={fieldErrors.title}>
              <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={120} />
            </FormField>
            <div>
              <div className="flex items-start gap-2">
                <Checkbox id="rights" checked={rights} onCheckedChange={(v) => setRights(v === true)} className="mt-0.5" />
                <Label htmlFor="rights" className="leading-snug font-normal">
                  I own or have the rights to use this audio.
                </Label>
              </div>
              {fieldErrors.rightsConfirmed && <p className="mt-1 text-sm text-destructive">{fieldErrors.rightsConfirmed}</p>}
            </div>
          </div>
        </Panel>

        <div className="sticky bottom-4 z-10 rounded-2xl border bg-background/90 p-3 shadow-2xl backdrop-blur-xl">
          <Button
            type="submit"
            variant="brand"
            size="xl"
            className="w-full"
            disabled={busy || !file || !rights || !lyrics.trim() || !prompt.trim() || tooFew || !user?.emailVerified}
          >
            {busy ? <Spinner /> : <Repeat2 />}
            {busy ? "Uploading…" : "Make similar song"}
            <span className="ml-1 inline-flex items-center gap-1 rounded-full bg-white/20 px-2 py-0.5 text-xs">
              <Zap className="size-3" /> {cost}
            </span>
          </Button>
          {tooFew && (
            <p className="mt-2 text-center text-xs text-destructive">
              You have {user?.credits ?? 0} credits.{" "}
              <Link href="/billing" className="underline">
                Buy credits
              </Link>
            </p>
          )}
        </div>
      </form>

      <aside className="xl:sticky xl:top-20 xl:self-start">
        <h2 className="mb-3 font-display text-lg font-semibold">Your similar songs</h2>
        <div className="rounded-2xl border bg-card/50 p-2">
          <SongList
            songs={songs.data}
            loading={songs.loading}
            error={songs.error}
            setSongs={(fn) => songs.setData((s) => fn(s))}
            empty={
              <EmptyState title="Nothing here yet" className="border-0">
                Similar songs you make appear here and update by themselves when they are ready.
              </EmptyState>
            }
          />
        </div>
      </aside>
    </div>
  );
}
