"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Alert, Button, Card, Field, PageHeader, Spinner, Textarea } from "@/components/ui";
import { useFormSubmit } from "@/components/use-form";
import { api } from "@/lib/api";
import { formatDuration } from "@/lib/format";
import { useApi } from "@/lib/use-api";
import { useSession } from "@/lib/session";
import type { PublicSettings, Song } from "@/lib/types";

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

const minSec = (s: number) => `${Math.floor(s / 60)} min ${s % 60 ? `${s % 60} s` : ""}`.trim();

/** Feature 2 — similar song from an uploaded track (FR-4.1 to FR-4.3, FR-4.7). */
export default function RemixPage() {
  const router = useRouter();
  const { user, refresh } = useSession();
  const settings = useApi<PublicSettings>("/settings");
  const { busy, error, fieldErrors, run, setError } = useFormSubmit();

  const [file, setFile] = useState<File | null>(null);
  const [fileInfo, setFileInfo] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [lyrics, setLyrics] = useState("");
  const [prompt, setPrompt] = useState("");
  const [rights, setRights] = useState(false);

  if (settings.loading) return <Spinner />;
  if (!settings.data) return <Alert tone="error">Could not load the form. {settings.error?.message}</Alert>;
  const { remix: limits, creditCosts } = settings.data;
  const cost = creditCosts.remix;
  const tooFew = (user?.credits ?? 0) < cost;

  async function pickFile(picked: File | undefined) {
    setFile(null);
    setFileInfo(null);
    setFileError(null);
    if (!picked) return;
    if (!/\.(mp3|m4a)$/i.test(picked.name)) return setFileError("Please choose an MP3 or M4A file.");
    if (picked.size > limits.maxBytes) {
      return setFileError(`This file is ${(picked.size / 1024 / 1024).toFixed(1)} MB. The limit is ${limits.maxBytes / 1024 / 1024} MB.`);
    }
    try {
      const seconds = await readDuration(picked);
      if (seconds < limits.minSeconds || seconds > limits.maxSeconds) {
        return setFileError(
          `The song must be between ${limits.minSeconds} seconds and ${minSec(limits.maxSeconds)} long. This one is ${formatDuration(seconds * 1000)}.`
        );
      }
      setFileInfo(`${formatDuration(seconds * 1000)} · ${(picked.size / 1024 / 1024).toFixed(1)} MB`);
    } catch {
      // Some browsers cannot read M4A metadata; the server checks the length anyway
      setFileInfo(`${(picked.size / 1024 / 1024).toFixed(1)} MB`);
    }
    setFile(picked);
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!file) return setError("Please choose a reference song.");
    const form = new FormData();
    form.append("lyrics", lyrics);
    form.append("prompt", prompt);
    form.append("rightsConfirmed", String(rights));
    const title = new FormData(e.currentTarget).get("title") as string;
    if (title) form.append("title", title);
    form.append("audio", file); // last, so the text fields are read first
    const res = await run(() => api.upload<Song>("/songs/remix", form));
    if (res) {
      void refresh();
      router.push("/songs");
    }
  }

  return (
    <>
      <PageHeader
        title="Make a similar song"
        description="Upload a song and write new lyrics. You get one new song with the same music and feel."
      />
      <Card>
        <form onSubmit={onSubmit} className="space-y-5" noValidate>
          {error && <Alert tone="error">{error}</Alert>}

          <Alert tone="info">
            The reference song needs vocals: instrumental-only tracks are not supported. MP3 or M4A, {limits.minSeconds}{" "}
            seconds to {minSec(limits.maxSeconds)}, up to {limits.maxBytes / 1024 / 1024} MB. Your upload is deleted after
            the new song is made.
          </Alert>

          <Field label="Reference song" htmlFor="audio" error={fileError ?? fieldErrors.audio} hint={fileInfo ?? undefined}>
            <input
              id="audio"
              type="file"
              accept=".mp3,.m4a,audio/mpeg,audio/mp4,audio/x-m4a"
              onChange={(e) => void pickFile(e.target.files?.[0])}
              className="block w-full text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-brand-soft file:px-4 file:py-2 file:text-sm file:font-medium file:text-brand-strong hover:file:bg-brand-soft/70"
            />
          </Field>

          <Field label="Title (optional)" htmlFor="title" error={fieldErrors.title}>
            <input
              id="title"
              name="title"
              maxLength={120}
              className="h-10 w-full rounded-lg border border-border bg-surface px-3 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
            />
          </Field>

          <Field
            label="Style prompt"
            htmlFor="prompt"
            error={fieldErrors.prompt}
            hint={`${prompt.length}/${PROMPT_MAX}. Include the vocal style, e.g. "Bhojpuri folk, energetic, female vocal".`}
          >
            <Textarea
              id="prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              maxLength={PROMPT_MAX}
              className="min-h-20"
            />
          </Field>

          <Field label="New lyrics" htmlFor="lyrics" error={fieldErrors.lyrics} hint={`${lyrics.length}/${LYRICS_MAX}`}>
            <Textarea
              id="lyrics"
              value={lyrics}
              onChange={(e) => setLyrics(e.target.value)}
              maxLength={LYRICS_MAX}
              className="min-h-48 font-mono"
              placeholder={"[Verse]\n...\n\n[Chorus]\n..."}
            />
          </Field>

          <div>
            <label className="flex items-start gap-2 text-sm">
              <input
                type="checkbox"
                checked={rights}
                onChange={(e) => setRights(e.target.checked)}
                className="mt-0.5 accent-brand"
              />
              <span>I own or have the rights to use this audio.</span>
            </label>
            {fieldErrors.rightsConfirmed && <p className="mt-1 text-sm text-danger">{fieldErrors.rightsConfirmed}</p>}
          </div>

          <div className="flex flex-wrap items-center gap-4 border-t border-border pt-5">
            <Button type="submit" loading={busy} disabled={!file || !rights || tooFew || !user?.emailVerified}>
              Make similar song · {cost} credits
            </Button>
            {tooFew && (
              <span className="text-sm text-danger">
                You have {user?.credits ?? 0} credits.{" "}
                <Link href="/billing" className="underline">
                  Buy credits
                </Link>
              </span>
            )}
          </div>
        </form>
      </Card>
    </>
  );
}
