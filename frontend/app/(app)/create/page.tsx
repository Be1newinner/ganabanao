"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Alert, Button, Card, Field, Input, PageHeader, Select, Spinner, Textarea, cx } from "@/components/ui";
import { useFormSubmit } from "@/components/use-form";
import { api } from "@/lib/api";
import { useApi } from "@/lib/use-api";
import { useSession } from "@/lib/session";
import type { PublicSettings, Song } from "@/lib/types";

// FR-3.8: matches the API limits
const LYRICS_MAX = 2000;
const PROMPT_MAX = 500;

/** Feature 1 — Create Song form (FR-3.1). Option lists come from the admin settings. */
export default function CreateSongPage() {
  const router = useRouter();
  const { user, refresh } = useSession();
  const settings = useApi<PublicSettings>("/settings");
  const { busy, error, fieldErrors, run } = useFormSubmit();

  const [vocal, setVocal] = useState<"male" | "female" | "instrumental">("female");
  const [instruments, setInstruments] = useState<string[]>([]);
  const [lyrics, setLyrics] = useState("");
  const [prompt, setPrompt] = useState("");

  if (settings.loading) return <Spinner />;
  if (!settings.data) return <Alert tone="error">Could not load the form. {settings.error?.message}</Alert>;
  const { options, creditCosts } = settings.data;
  const cost = vocal === "instrumental" ? creditCosts.instrumental : creditCosts.generate;
  const tooFew = (user?.credits ?? 0) < cost;

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const text = (k: string) => (f.get(k) as string) || undefined;
    const res = await run(() =>
      api.post<Song>("/songs", {
        title: text("title"),
        language: f.get("language"),
        genre: text("genre"),
        mood: text("mood"),
        vocal,
        bpm: f.get("bpm") ? Number(f.get("bpm")) : undefined,
        taal: text("taal"),
        instruments,
        prompt,
        lyrics: vocal === "instrumental" ? "" : lyrics,
      })
    );
    if (res) {
      void refresh(); // balance changed
      router.push("/songs");
    }
  }

  return (
    <>
      <PageHeader
        title="Create a song"
        description="Each request makes one full song (up to 5 min 30 s). There is no preview step."
      />
      <Card>
        <form onSubmit={onSubmit} className="space-y-5" noValidate>
          {error && <Alert tone="error">{error}</Alert>}

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Title (optional)" htmlFor="title" error={fieldErrors.title}>
              <Input id="title" name="title" maxLength={120} placeholder="Taken from the first lyric line if empty" />
            </Field>
            <Field label="Language" htmlFor="language">
              <Select id="language" name="language" defaultValue="Bhojpuri">
                <option>Bhojpuri</option>
                <option>Hindi</option>
              </Select>
            </Field>
            <Field label="Genre" htmlFor="genre">
              <Select id="genre" name="genre" defaultValue="">
                <option value="">Any</option>
                {options.genres.map((o) => (
                  <option key={o}>{o}</option>
                ))}
              </Select>
            </Field>
            <Field label="Mood" htmlFor="mood">
              <Select id="mood" name="mood" defaultValue="">
                <option value="">Any</option>
                {options.moods.map((o) => (
                  <option key={o}>{o}</option>
                ))}
              </Select>
            </Field>
            <Field label="Taal" htmlFor="taal">
              <Select id="taal" name="taal" defaultValue="">
                <option value="">Any</option>
                {options.taals.map((o) => (
                  <option key={o}>{o}</option>
                ))}
              </Select>
            </Field>
            <Field label="BPM (optional)" htmlFor="bpm" error={fieldErrors.bpm} hint="40–220">
              <Input id="bpm" name="bpm" type="number" min={40} max={220} placeholder="e.g. 96" />
            </Field>
          </div>

          <fieldset>
            <legend className="mb-1.5 text-sm font-medium">Vocals</legend>
            <div className="flex flex-wrap gap-2">
              {(["female", "male", "instrumental"] as const).map((v) => (
                <label
                  key={v}
                  className={cx(
                    "cursor-pointer rounded-lg border px-4 py-2 text-sm capitalize",
                    vocal === v
                      ? "border-brand bg-brand-soft font-medium text-brand-strong"
                      : "border-border hover:bg-surface-muted"
                  )}
                >
                  <input
                    type="radio"
                    name="vocal"
                    value={v}
                    checked={vocal === v}
                    onChange={() => setVocal(v)}
                    className="sr-only"
                  />
                  {v === "instrumental" ? "Instrumental (no vocals)" : `${v} vocal`}
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend className="mb-1.5 text-sm font-medium">Instruments</legend>
            <div className="flex flex-wrap gap-2">
              {options.instruments.map((name) => {
                const on = instruments.includes(name);
                return (
                  <button
                    key={name}
                    type="button"
                    aria-pressed={on}
                    onClick={() => setInstruments((list) => (on ? list.filter((i) => i !== name) : [...list, name]))}
                    className={cx(
                      "rounded-full border px-3 py-1 text-sm",
                      on ? "border-brand bg-brand text-white" : "border-border hover:bg-surface-muted"
                    )}
                  >
                    {name}
                  </button>
                );
              })}
            </div>
          </fieldset>

          <Field
            label="Describe the song (optional)"
            htmlFor="prompt"
            error={fieldErrors.prompt}
            hint={`${prompt.length}/${PROMPT_MAX}`}
          >
            <Textarea
              id="prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              maxLength={PROMPT_MAX}
              className="min-h-20"
              placeholder="e.g. a joyful wedding song with a village feel"
            />
          </Field>

          {vocal !== "instrumental" && (
            <Field
              label="Lyrics"
              htmlFor="lyrics"
              error={fieldErrors.lyrics}
              hint={
                <>
                  {lyrics.length}/{LYRICS_MAX}. Use [Verse] and [Chorus] tags, or leave a blank line between parts and we
                  add them.
                </>
              }
            >
              <Textarea
                id="lyrics"
                value={lyrics}
                onChange={(e) => setLyrics(e.target.value)}
                maxLength={LYRICS_MAX}
                className="min-h-56 font-mono"
                placeholder={"[Verse]\n...\n\n[Chorus]\n..."}
              />
            </Field>
          )}

          <div className="flex flex-wrap items-center gap-4 border-t border-border pt-5">
            <Button type="submit" loading={busy} disabled={tooFew || !user?.emailVerified}>
              Create song · {cost} credits
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
          <p className="text-xs text-muted">
            Songs are AI-generated and can vary between tries. Bhojpuri pronunciation is not guaranteed. If a song fails,
            your credits are returned automatically.
          </p>
        </form>
      </Card>
    </>
  );
}
