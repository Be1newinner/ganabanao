import { ArrowRight, Layers, Mic2, Music4, Repeat2, Sparkles, Wand2 } from "lucide-react";
import Link from "next/link";
import { CoverArt } from "@/components/cover-art";
import { SampleTile } from "@/components/sample-tile";
import { Button } from "@/components/ui/button";
import { SAMPLE_SONGS } from "@/lib/samples";

/*
 * Landing page (FR-1.1). Headline and feature copy are placeholders until the
 * client supplies the final text, logo and brand colours.
 */

const FEATURES = [
  {
    icon: Wand2,
    title: "Text to Bhojpuri song",
    body: "Write your lyrics, pick a genre, mood, vocals, tempo, taal and instruments. Get a complete song of up to five and a half minutes.",
  },
  {
    icon: Repeat2,
    title: "Same vibe, new lyrics",
    body: "Upload a song you have the rights to use, write new words, and get a new song with the same music and feel.",
  },
  {
    icon: Layers,
    title: "Single or stems",
    body: "Download any song as one MP3, or split it into up to 12 stems as MP3, WAV and MIDI for your own mix.",
  },
];

const STEPS = [
  { n: "01", title: "Write", body: "Paste your lyrics or describe the song you hear in your head." },
  { n: "02", title: "Shape", body: "Choose genre, mood, taal, vocals and instruments." },
  { n: "03", title: "Listen & download", body: "Play it, keep the best take, download it or its stems." },
];

const STEMS = ["Vocals", "Drums", "Bass", "Guitar", "Piano", "Keyboard", "Strings", "Flute", "Brass & woodwinds", "Synth", "FX", "Other"];

const PROMPT_IDEAS = ["Chaita folk song, female vocal, dholak", "Devotional bhajan at sunrise", "Wedding dance anthem, 120 BPM"];

export default function LandingPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div aria-hidden className="absolute inset-0 -z-10 bg-aurora" />
        <div className="mx-auto max-w-6xl px-4 pt-20 pb-24 text-center sm:pt-28">
          <p className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border bg-background/60 px-4 py-1.5 text-sm backdrop-blur">
            <Sparkles className="size-4 text-primary" /> AI music, made for Bhojpuri
          </p>
          <h1 className="mx-auto max-w-4xl font-display text-5xl font-extrabold tracking-tight text-balance sm:text-7xl">
            Your lyrics. Your <span className="text-brand-gradient">Bhojpuri hit.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground text-pretty">
            Turn words into full songs with vocals and dholak in minutes. Make new versions of tracks you love, and take
            any song apart into stems.
          </p>

          {/* Prompt box — leads into the app */}
          <div className="mx-auto mt-10 max-w-2xl rounded-2xl border bg-card/80 p-2 text-left shadow-2xl shadow-brand-3/10 backdrop-blur">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="flex flex-1 items-center gap-3 px-3 py-2 text-muted-foreground">
                <Music4 className="size-5 shrink-0 text-primary" />
                <span className="truncate">Describe your song… a romantic Kajri with female vocals</span>
              </div>
              <Button variant="brand" size="xl" asChild>
                <Link href="/signup">
                  Create <ArrowRight />
                </Link>
              </Button>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {PROMPT_IDEAS.map((idea) => (
              <Link
                key={idea}
                href="/signup"
                className="rounded-full border bg-background/60 px-3 py-1 text-xs text-muted-foreground backdrop-blur hover:border-primary/40 hover:text-foreground"
              >
                {idea}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Samples */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-3xl font-bold tracking-tight">Made with AI</h2>
            <p className="mt-1 text-muted-foreground">
              {SAMPLE_SONGS.length ? "Press play on a few songs made here." : "Sample songs are coming soon."}
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {SAMPLE_SONGS.length
            ? SAMPLE_SONGS.map((s) => <SampleTile key={s.src} {...s} />)
            : ["Holi", "Chaita", "Kajri", "Bhajan", "Shaadi"].map((name) => (
                <div key={name}>
                  <CoverArt seed={name} className="aspect-square w-full" rounded="rounded-2xl">
                    <span className="absolute bottom-3 left-3 rounded-full bg-black/40 px-2 py-0.5 text-xs text-white backdrop-blur">
                      Coming soon
                    </span>
                  </CoverArt>
                  <p className="mt-2 text-sm font-medium">{name} sample</p>
                </div>
              ))}
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-center font-display text-3xl font-bold tracking-tight sm:text-4xl">
          Three tools. <span className="text-brand-gradient">One studio.</span>
        </h2>
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, body }) => (
            <div
              key={title}
              className="group rounded-2xl border bg-card p-6 transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-xl hover:shadow-brand-2/5"
            >
              <div className="mb-5 grid size-12 place-items-center rounded-xl bg-brand-gradient text-white shadow-lg shadow-brand-2/20">
                <Icon className="size-5" />
              </div>
              <h3 className="font-display text-xl font-semibold">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="border-y bg-muted/30">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-16 md:grid-cols-3">
          {STEPS.map((s) => (
            <div key={s.n}>
              <p className="font-display text-4xl font-extrabold text-brand-gradient">{s.n}</p>
              <h3 className="mt-3 font-display text-lg font-semibold">{s.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Stems */}
      <section className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-20 md:grid-cols-2">
        <div>
          <p className="mb-3 text-xs font-semibold tracking-widest text-primary uppercase">Stems</p>
          <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">Every instrument, on its own track</h2>
          <p className="mt-4 text-muted-foreground">
            Split any song you made into up to 12 stems. Play them here, download MP3s, or grab the original WAV and MIDI
            files to finish your mix in any studio app.
          </p>
          <Button variant="outline" size="xl" className="mt-6" asChild>
            <Link href="/pricing">See what it costs</Link>
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {STEMS.map((s, i) => (
            <span
              key={s}
              className="flex items-center gap-2 rounded-full border bg-card px-4 py-2 text-sm"
              style={{ opacity: 1 - i * 0.04 }}
            >
              <span className="size-2 rounded-full bg-brand-gradient" />
              {s}
            </span>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-4 pb-24">
        <div className="relative overflow-hidden rounded-3xl bg-brand-gradient px-6 py-16 text-center text-white sm:px-12">
          <Mic2 aria-hidden className="absolute -top-6 -right-6 size-40 opacity-15" />
          <h2 className="font-display text-3xl font-bold sm:text-4xl">Your next song is one prompt away</h2>
          <p className="mx-auto mt-3 max-w-xl text-white/85">
            Sign up with email or Google. Songs are made by AI, and quality can vary from one try to the next.
          </p>
          <Button size="xl" className="mt-8 bg-white text-black hover:bg-white/90" asChild>
            <Link href="/signup">
              Start creating <ArrowRight />
            </Link>
          </Button>
        </div>
      </section>
    </>
  );
}
