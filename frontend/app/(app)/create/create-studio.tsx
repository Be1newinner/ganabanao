"use client";

import { Mic2, Piano, Sparkles, Zap } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Chip, EmptyState, FormField, Notice, PageLoader, Panel, Spinner } from "@/components/common";
import { SongList, useSongs } from "@/components/songs/song-list";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useFormSubmit } from "@/components/use-form";
import { api } from "@/lib/api";
import { useSession } from "@/lib/session";
import type { PublicSettings, Song } from "@/lib/types";
import { useApi } from "@/lib/use-api";
import { cn } from "@/lib/utils";

// FR-3.8: matches the API limits
const LYRICS_MAX = 2000;
const PROMPT_MAX = 500;
const SECTIONS = ["Intro", "Verse", "Chorus", "Bridge", "Outro"];

type Vocal = "female" | "male";

/** Feature 1 — Create Song (FR-3.1 to FR-3.3). Option lists come from the admin settings. */
export function CreateStudio() {
  const initialPrompt = useSearchParams().get("prompt") ?? "";
  const { user, refresh } = useSession();
  const settings = useApi<PublicSettings>("/settings");
  const songs = useSongs("/songs?limit=8&feature=generate");
  const { busy, error, fieldErrors, run } = useFormSubmit();

  const [instrumental, setInstrumental] = useState(false);
  const [vocal, setVocal] = useState<Vocal>("female");
  const [language, setLanguage] = useState("Bhojpuri");
  const [genre, setGenre] = useState<string | null>(null);
  const [mood, setMood] = useState<string | null>(null);
  const [taal, setTaal] = useState<string | null>(null);
  const [instruments, setInstruments] = useState<string[]>([]);
  const [prompt, setPrompt] = useState(initialPrompt.slice(0, PROMPT_MAX));
  const [lyrics, setLyrics] = useState("");
  const [useBpm, setUseBpm] = useState(false);
  const [bpm, setBpm] = useState(96);
  const [title, setTitle] = useState("");

  if (settings.loading) return <PageLoader />;
  if (!settings.data) return <Notice tone="error">Could not load the form. {settings.error?.message}</Notice>;
  const { options, creditCosts } = settings.data;
  const cost = instrumental ? creditCosts.instrumental : creditCosts.generate;
  const tooFew = (user?.credits ?? 0) < cost;
  const toggleOne = (set: (v: string | null) => void, current: string | null, value: string) =>
    set(current === value ? null : value);

  const insertSection = (name: string) =>
    setLyrics((l) => `${l}${l && !l.endsWith("\n") ? "\n" : ""}${l ? "\n" : ""}[${name}]\n`.slice(0, LYRICS_MAX));

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const res = await run(() =>
      api.post<Song>("/songs", {
        title: title || undefined,
        language,
        genre: genre ?? undefined,
        mood: mood ?? undefined,
        vocal: instrumental ? "instrumental" : vocal,
        bpm: useBpm ? bpm : undefined,
        taal: taal ?? undefined,
        instruments,
        prompt,
        lyrics: instrumental ? "" : lyrics,
      })
    );
    if (res) {
      songs.setData((list) => [res.data, ...(list ?? [])]);
      void refresh(); // balance changed
      toast.success("Your song is on its way. It usually takes a few minutes.");
    }
  }

  return (
    <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)]">
      <form onSubmit={onSubmit} className="space-y-5" noValidate>
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">Create</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Each request makes one full song, up to 5 min 30 s. There is no preview step.
          </p>
        </div>

        {error && <Notice tone="error">{error}</Notice>}

        {/* Song or instrumental + voice */}
        <div className="flex flex-wrap items-center gap-3">
          <ToggleGroup
            type="single"
            variant="outline"
            value={instrumental ? "instrumental" : "song"}
            onValueChange={(v) => v && setInstrumental(v === "instrumental")}
          >
            <ToggleGroupItem value="song" className="px-4">
              <Mic2 /> Song
            </ToggleGroupItem>
            <ToggleGroupItem value="instrumental" className="px-4">
              <Piano /> Instrumental
            </ToggleGroupItem>
          </ToggleGroup>
          {!instrumental && (
            <ToggleGroup type="single" variant="outline" value={vocal} onValueChange={(v) => v && setVocal(v as Vocal)}>
              <ToggleGroupItem value="female" className="px-4">Female vocal</ToggleGroupItem>
              <ToggleGroupItem value="male" className="px-4">Male vocal</ToggleGroupItem>
            </ToggleGroup>
          )}
        </div>

        {!instrumental && (
          <Panel title="Lyrics" description="Use section tags like [Verse] and [Chorus], or leave a blank line between parts and we add them.">
            <div className="mb-3 flex flex-wrap gap-1.5">
              {SECTIONS.map((s) => (
                <Button key={s} type="button" variant="secondary" size="xs" onClick={() => insertSection(s)}>
                  + {s}
                </Button>
              ))}
            </div>
            <FormField label={<span className="sr-only">Lyrics</span>} htmlFor="lyrics" error={fieldErrors.lyrics} aside={`${lyrics.length}/${LYRICS_MAX}`}>
              <Textarea
                id="lyrics"
                value={lyrics}
                onChange={(e) => setLyrics(e.target.value)}
                maxLength={LYRICS_MAX}
                className="min-h-64 font-mono text-sm leading-relaxed"
                placeholder={"[Verse]\nAapan gaon ke maati…\n\n[Chorus]\n…"}
              />
            </FormField>
          </Panel>
        )}

        <Panel title="Style" description="Pick what fits. Everything here is optional.">
          <div className="space-y-5">
            <FormField label="Describe the sound" htmlFor="prompt" error={fieldErrors.prompt} aside={`${prompt.length}/${PROMPT_MAX}`}>
              <Textarea
                id="prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                maxLength={PROMPT_MAX}
                className="min-h-20"
                placeholder="e.g. joyful wedding song with a village feel, shehnai intro"
              />
            </FormField>
            <ChipRow label="Genre" items={options.genres} isOn={(g) => genre === g} onToggle={(g) => toggleOne(setGenre, genre, g)} />
            <ChipRow label="Mood" items={options.moods} isOn={(m) => mood === m} onToggle={(m) => toggleOne(setMood, mood, m)} />
            <ChipRow label="Taal" items={options.taals} isOn={(t) => taal === t} onToggle={(t) => toggleOne(setTaal, taal, t)} />
            <ChipRow
              label="Instruments"
              items={options.instruments}
              isOn={(i) => instruments.includes(i)}
              onToggle={(i) =>
                setInstruments((list) => (list.includes(i) ? list.filter((x) => x !== i) : [...list, i].slice(0, 12)))
              }
            />
          </div>
        </Panel>

        <Panel title="Details">
          <div className="grid gap-5 sm:grid-cols-2">
            <FormField label="Language" htmlFor="language">
              <ToggleGroup id="language" type="single" variant="outline" value={language} onValueChange={(v) => v && setLanguage(v)}>
                <ToggleGroupItem value="Bhojpuri" className="px-4">Bhojpuri</ToggleGroupItem>
                <ToggleGroupItem value="Hindi" className="px-4">Hindi</ToggleGroupItem>
              </ToggleGroup>
            </FormField>
            <FormField label="Title" htmlFor="title" error={fieldErrors.title} hint="Taken from the first lyric line if empty">
              <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={120} />
            </FormField>
            <div className="space-y-3 sm:col-span-2">
              <div className="flex items-center justify-between">
                <label htmlFor="use-bpm" className="text-sm font-medium">
                  Tempo {useBpm && <span className="ml-1 tabular-nums text-primary">{bpm} BPM</span>}
                </label>
                <Switch id="use-bpm" checked={useBpm} onCheckedChange={setUseBpm} />
              </div>
              <Slider
                value={[bpm]}
                min={40}
                max={220}
                step={1}
                onValueChange={([v]) => setBpm(v)}
                disabled={!useBpm}
                aria-label="BPM"
                className={cn(!useBpm && "opacity-40")}
              />
            </div>
          </div>
        </Panel>

        {/* Create button sticks to the bottom while scrolling the form */}
        <div className="sticky bottom-4 z-10 rounded-2xl border bg-background/90 p-3 shadow-2xl backdrop-blur-xl">
          <div className="flex flex-wrap items-center gap-3">
            <Button
              type="submit"
              variant="brand"
              size="xl"
              className="flex-1"
              disabled={busy || tooFew || !user?.emailVerified || (!instrumental && !lyrics.trim())}
            >
              {busy ? <Spinner /> : <Sparkles />}
              Create {instrumental ? "instrumental" : "song"}
              <span className="ml-1 inline-flex items-center gap-1 rounded-full bg-white/20 px-2 py-0.5 text-xs">
                <Zap className="size-3" /> {cost}
              </span>
            </Button>
          </div>
          {tooFew ? (
            <p className="mt-2 text-center text-xs text-destructive">
              You have {user?.credits ?? 0} credits.{" "}
              <Link href="/billing" className="underline">
                Buy credits
              </Link>
            </p>
          ) : (
            <p className="mt-2 text-center text-xs text-muted-foreground">
              AI-generated; results vary between tries and Bhojpuri pronunciation is not guaranteed. Failed songs are refunded.
            </p>
          )}
        </div>
      </form>

      {/* Workspace: latest songs, updating as they finish */}
      <aside className="xl:sticky xl:top-20 xl:self-start">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold">Your latest songs</h2>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/songs">Library</Link>
          </Button>
        </div>
        <div className="rounded-2xl border bg-card/50 p-2">
          <SongList
            songs={songs.data}
            loading={songs.loading}
            error={songs.error}
            setSongs={(fn) => songs.setData((s) => fn(s))}
            empty={
              <EmptyState title="Nothing here yet" className="border-0">
                Songs you create appear here and update by themselves when they are ready.
              </EmptyState>
            }
          />
        </div>
      </aside>
    </div>
  );
}

function ChipRow({
  label,
  items,
  isOn,
  onToggle,
}: {
  label: string;
  items: string[];
  isOn: (item: string) => boolean;
  onToggle: (item: string) => void;
}) {
  if (!items.length) return null;
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">{label}</p>
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <Chip key={item} selected={isOn(item)} onClick={() => onToggle(item)}>
            {item}
          </Chip>
        ))}
      </div>
    </div>
  );
}
