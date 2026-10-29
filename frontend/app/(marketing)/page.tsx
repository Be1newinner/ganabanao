import { Check, ChevronDown, Layers, PenLine, Play, Repeat2, Sparkles } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { COVERS } from "@/components/cover-art";
import {
  CountUp,
  CursorGlow,
  Magnetic,
  Parallax,
  Reveal,
  ScrollVelocity,
  SpotlightCard,
  TiltCard,
  TypedPrompt,
  Typewriter,
} from "@/components/landing/motion";
import { PromptBuilder } from "@/components/landing/prompt-builder";
import { StepTrack } from "@/components/landing/step-track";
import { StemsMixer } from "@/components/landing/stems-mixer";
import { Vinyl } from "@/components/landing/vinyl";
import { PricingTable } from "@/components/pricing-table";
import { Button } from "@/components/ui/button";

/*
 * Landing page — direction "Madhubani vinyl" (design-direction skill, scored 22/25):
 * a spinning 3D record whose label is a Madhubani painting, lit by the festival
 * gradients. Dark only. Copy is a placeholder until the client supplies the final
 * text (FR-1.1); it states only what the product actually does.
 */

const GENRES = ["Kajri", "Chaita", "Holi anthem", "Chhath geet", "love song", "Purvi folk"];

const PROMPTS = [
  "A Kajri for the first rain, female voice, bansuri and dholak",
  "Chhath morning geet, slow, harmonium and jhaal",
  "Holi dance number at 124 BPM, male voice, dholak and synth",
];

const MARQUEE = ["Kajri", "Chaita", "Holi", "Chhath geet", "Sohar", "Purvi", "Biraha", "Jhumar", "Nirgun", "Bhajan", "Lok geet", "Vivah geet"];

const FACTS: { value: number; format?: "time"; label: string }[] = [
  { value: 330, format: "time", label: "full songs, not 30-second clips" },
  { value: 12, label: "stems from any song you make" },
  { value: 2, label: "languages: Bhojpuri and Hindi" },
  { value: 0, label: "credits lost when a song fails" },
];

const TOOLS = [
  {
    icon: PenLine,
    art: "/art/tool-lyrics.jpg",
    title: "Write a song",
    body: "Bring your lyrics, choose the genre, mood, taal, tempo and instruments, and get one complete song with vocals.",
    points: ["Female, male or instrumental", "Up to 2,000 characters of lyrics", "Verse and chorus tags added for you"],
  },
  {
    icon: Repeat2,
    art: "/art/tool-remix.jpg",
    title: "Make a similar song",
    body: "Upload a song you have the rights to, write new words, and get a new song that keeps its music and feel.",
    points: ["MP3 or M4A, up to 10 MB", "Your upload is deleted afterwards", "New lyrics, same vibe"],
  },
  {
    icon: Layers,
    art: "/art/covers/peacock-2-v2.jpg",
    title: "Download single or stems",
    body: "Take any song as one MP3, or split it into separate instruments for your own mix in any studio app.",
    points: ["Up to 12 stems as MP3 and WAV", "MIDI for the parts that have it", "Kept for 30 days, charged once"],
  },
];

const STEPS = [
  { title: "Write the words", body: "Paste your lyrics, or describe the song you hear in your head in one line." },
  { title: "Choose the feel", body: "Pick the genre, mood, taal, voice and instruments. Kajri in Keherwa with dholak and bansuri? Yes." },
  { title: "Listen and take it home", body: "Play your full song in minutes. Download the MP3, or split it into stems for the studio." },
];

const FAQ = [
  {
    q: "Does it really sing in Bhojpuri?",
    a: "Yes, it sings your Bhojpuri or Hindi lyrics. It is AI, so pronunciation and accent can vary from one try to the next, and you can always make another version.",
  },
  {
    q: "How long does a song take?",
    a: "Usually a few minutes. When many people are creating at once, you will see your place in line and an estimated wait.",
  },
  {
    q: "What happens if a song fails?",
    a: "The credits it used come back to your account automatically, and you are told why it failed in plain words.",
  },
  {
    q: "What are stems?",
    a: "Separate tracks for each part of the song: vocals, drums, bass, keyboard, flute and more. Dholak and harmonium land in drums, keyboard or other, as they have no stem of their own.",
  },
  {
    q: "How do I pay?",
    a: "Choose a monthly plan or buy a credit pack. Payments go through Razorpay, so you can use UPI, cards or net banking.",
  },
  {
    q: "Can I upload any song to make a similar one?",
    a: "Only songs you own or have the rights to use. You confirm this with every upload, and the file is deleted once your new song is made.",
  },
];

export default function LandingPage() {
  return (
    <div className="relative overflow-x-clip">
      <CursorGlow />

      {/* ── Hero ── */}
      <section className="relative">
        <div aria-hidden className="pointer-events-none absolute inset-x-0 -top-16 h-[760px] bg-aurora-glow" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-6 px-4 pt-10 pb-16 sm:px-6 lg:grid-cols-[1.05fr_1fr] lg:pt-16 lg:pb-24">
          <div>
            <Reveal>
              <p className="inline-flex items-center gap-2 rounded-full border border-hairline bg-surface-1/70 px-4 py-1.5 text-sm text-ink-2 backdrop-blur">
                <Sparkles className="size-4 text-gold" /> An AI music studio for Bhojpuri
              </p>
            </Reveal>
            <Reveal delay={80}>
              <h1 className="mt-6 font-display text-[2.7rem] leading-[1.02] sm:text-6xl xl:text-7xl">
                Turn your lyrics into a{" "}
                <Typewriter words={GENRES} className="animate-gradient-pan text-festival" />
              </h1>
            </Reveal>
            <Reveal delay={160}>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-2">
                Write the words, choose the taal and the instruments, and hear a full song with vocals in minutes. Then
                take it apart into stems for your own mix.
              </p>
            </Reveal>
            <Reveal delay={240}>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button variant="brand" size="xl" className="h-12 rounded-full px-7 text-base" asChild>
                  <Link href="/signup">
                    <Sparkles /> Start creating
                  </Link>
                </Button>
                <Button variant="outline" size="xl" className="h-12 rounded-full px-6 text-base" asChild>
                  <Link href="#how">
                    <Play className="fill-current" /> See how it works
                  </Link>
                </Button>
              </div>
            </Reveal>
            <Reveal delay={320}>
              <div className="mt-10 max-w-xl rounded-2xl border border-hairline bg-surface-1/70 p-4 backdrop-blur">
                <p className="text-xs text-ink-3">Describe your song</p>
                <p className="mt-1 min-h-[3.2em] text-[17px] leading-relaxed text-ink">
                  <TypedPrompt prompts={PROMPTS} />
                </p>
              </div>
            </Reveal>
          </div>

          {/* 3D record with floating covers */}
          {/* On phones the record comes first, so the opening screen shows it with the headline */}
          <Reveal delay={200} className="relative order-first mx-auto -mt-4 -mb-6 aspect-square w-full max-w-[340px] sm:max-w-[460px] lg:order-none lg:my-0 lg:max-w-[600px]">
            <Parallax speed={0.06} className="absolute top-[4%] left-[2%] z-10 w-[22%]">
              <div className="animate-float rotate-[-8deg] overflow-hidden rounded-xl shadow-2xl ring-1 ring-white/10">
                <Image src={`/art/covers/${COVERS[0]}.jpg`} alt="" width={160} height={160} className="aspect-square w-full object-cover" />
              </div>
            </Parallax>
            <Parallax speed={-0.08} className="absolute right-[0%] bottom-[10%] z-10 w-[24%]">
              <div className="animate-float rotate-[7deg] overflow-hidden rounded-xl shadow-2xl ring-1 ring-white/10 [animation-delay:-3s]">
                <Image src={`/art/covers/${COVERS[3]}.jpg`} alt="" width={160} height={160} className="aspect-square w-full object-cover" />
              </div>
            </Parallax>
            <div className="absolute inset-0">
              <Vinyl />
            </div>
          </Reveal>
        </div>

        {/* Facts — all true of the product; numbers count up when seen */}
        <div className="relative mx-auto grid max-w-7xl grid-cols-2 gap-3 px-4 sm:px-6 lg:grid-cols-4 lg:gap-4">
          {FACTS.map((f, i) => (
            <Reveal key={f.label} delay={i * 80}>
              <SpotlightCard className="h-full" innerClassName="p-5 sm:p-6">
                <p className="font-display text-4xl text-gold sm:text-5xl">
                  <CountUp to={f.value} format={f.format} />
                </p>
                <p className="mt-1 text-sm text-ink-2">{f.label}</p>
              </SpotlightCard>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── Genre marquee: two rows, opposite ways, leaning with scroll speed ── */}
      <ScrollVelocity className="relative mt-20 space-y-4 overflow-hidden py-6 [mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]">
        {[0, 1].map((row) => (
          <div key={row} aria-hidden={row === 1} className="[transform:skewX(calc(var(--velocity,0)*-8deg))]">
            <div
              className={
                row === 0
                  ? "flex w-max animate-marquee gap-10 hover:[animation-play-state:paused] motion-reduce:animate-none"
                  : "flex w-max animate-marquee-reverse gap-10 hover:[animation-play-state:paused] motion-reduce:animate-none"
              }
            >
              {[...MARQUEE, ...MARQUEE].map((g, i) => (
                <span
                  key={i}
                  className={
                    row === 0
                      ? "flex items-center gap-10 font-display text-4xl text-ink/85 sm:text-6xl"
                      : "flex items-center gap-10 font-display text-4xl text-transparent [-webkit-text-stroke:1px_rgb(242_236_227/0.35)] sm:text-6xl"
                  }
                >
                  {g}
                  <span aria-hidden className="size-2.5 rounded-full bg-cta" />
                </span>
              ))}
            </div>
          </div>
        ))}
        <p className="sr-only">Styles you can make: {MARQUEE.join(", ")}</p>
      </ScrollVelocity>

      {/* ── Three tools ── */}
      <section id="tools" className="mx-auto max-w-7xl scroll-mt-24 px-4 py-24 sm:px-6">
        <Reveal>
          <h2 className="max-w-3xl font-display text-4xl leading-tight sm:text-5xl">Three tools, one studio</h2>
          <p className="mt-4 max-w-2xl text-lg text-ink-2">
            Everything shares one account, one credit balance and one library of your songs.
          </p>
        </Reveal>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {TOOLS.map(({ icon: Icon, art, title, body, points }, i) => (
            <Reveal key={title} delay={i * 120}>
              <TiltCard className="h-full rounded-3xl">
                <SpotlightCard className="h-full" innerClassName="flex flex-col">
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <Image
                      src={art}
                      alt=""
                      fill
                      sizes="(min-width: 768px) 33vw, 100vw"
                      className="scale-110 object-cover transition-transform duration-700 ease-out group-hover/tilt:translate-x-[calc((var(--mx,50%)-50%)*-0.08)] group-hover/tilt:translate-y-[calc((var(--my,50%)-50%)*-0.08)] group-hover/tilt:scale-[1.18]"
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-surface-1 via-surface-1/20 to-transparent" />
                    <span className="absolute bottom-4 left-5 grid size-11 place-items-center rounded-full bg-cta text-on-cta shadow-lg transition-transform duration-500 group-hover/tilt:-translate-y-1 group-hover/tilt:rotate-[-8deg]">
                      <Icon className="size-5" />
                    </span>
                  </div>
                  <div className="flex flex-1 flex-col p-6">
                    <h3 className="font-display text-2xl">{title}</h3>
                    <p className="mt-3 leading-relaxed text-ink-2">{body}</p>
                    <ul className="mt-5 space-y-2 text-sm text-ink-2">
                      {points.map((p) => (
                        <li key={p} className="flex gap-2">
                          <Check className="mt-0.5 size-4 shrink-0 text-gold" /> {p}
                        </li>
                      ))}
                    </ul>
                  </div>
                </SpotlightCard>
              </TiltCard>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── How it works: a real sequence, on a line that fills as you scroll ── */}
      <section id="how" className="relative scroll-mt-24 overflow-hidden border-y border-hairline bg-sunken/60 py-24">
        <Parallax speed={-0.12} className="pointer-events-none absolute -top-32 -left-32 size-[420px] rounded-full bg-[#7c52f0]/15 blur-3xl">
          <span />
        </Parallax>
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
          <Reveal>
            <h2 className="font-display text-4xl sm:text-5xl">From words to a song in three steps</h2>
          </Reveal>
          <StepTrack steps={STEPS} />
        </div>
      </section>

      {/* ── Stems: a playable demo ── */}
      <section id="stems" className="relative mx-auto grid max-w-7xl scroll-mt-24 items-center gap-12 px-4 py-24 sm:px-6 lg:grid-cols-[1fr_1.2fr]">
        <Reveal>
          <h2 className="font-display text-4xl leading-tight sm:text-5xl">Every instrument on its own track</h2>
          <p className="mt-5 max-w-lg text-lg leading-relaxed text-ink-2">
            Split any song you made into up to 12 stems. Play each one here, download MP3s, or grab the original WAV and
            MIDI files to finish your mix in any studio app.
          </p>
          <p className="mt-4 max-w-lg text-ink-3">
            Try it: press play on the demo groove and mute the stems one by one. Stems are made once per song and kept for
            30 days.
          </p>
        </Reveal>
        <Reveal delay={150}>
          <StemsMixer />
        </Reveal>
      </section>

      {/* ── Made for Bhojpuri: build a prompt, beside a 3D wall of covers ── */}
      <section className="relative overflow-hidden border-y border-hairline bg-sunken/60">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-24 sm:px-6 lg:grid-cols-2">
          <Reveal>
            <h2 className="font-display text-4xl leading-tight sm:text-5xl">Made for Bhojpuri, from the taal up</h2>
            <p className="mt-5 mb-8 max-w-lg text-lg leading-relaxed text-ink-2">
              Pick the rhythm cycle, the instruments of the village mehfil and the mood of the occasion. Watch your song
              take shape.
            </p>
            <PromptBuilder />
          </Reveal>

          <div aria-hidden className="relative h-[460px] [perspective:1100px] sm:h-[600px]">
            <div className="absolute inset-0 [mask-image:linear-gradient(to_bottom,transparent,black_15%,black_85%,transparent)]">
              <div className="grid h-full grid-cols-3 gap-4 [transform:rotateX(18deg)_rotateZ(-6deg)_scale(1.08)] [transform-style:preserve-3d]">
                {[0.12, -0.1, 0.16].map((speed, col) => (
                  <Parallax key={col} speed={speed} className="space-y-4">
                    {[0, 1, 2, 3].map((row) => {
                      const cover = COVERS[(col * 2 + row) % COVERS.length];
                      return (
                        <div
                          key={row}
                          className="overflow-hidden rounded-2xl shadow-[0_20px_40px_-20px_rgb(0_0_0/0.8)] ring-1 ring-white/10 transition-transform duration-500 hover:[transform:translateZ(40px)_scale(1.04)]"
                        >
                          <Image src={`/art/covers/${cover}.jpg`} alt="" width={220} height={220} className="aspect-square w-full object-cover" />
                        </div>
                      );
                    })}
                  </Parallax>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section id="pricing" className="relative scroll-mt-24 overflow-hidden py-24">
        <Parallax speed={0.1} className="pointer-events-none absolute top-20 -right-40 size-[520px] rounded-full bg-[#ee6a8a]/12 blur-3xl">
          <span />
        </Parallax>
        <Parallax speed={-0.08} className="pointer-events-none absolute bottom-0 -left-40 size-[460px] rounded-full bg-[#f6b444]/10 blur-3xl">
          <span />
        </Parallax>
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
          <Reveal className="mb-14 text-center">
            <h2 className="font-display text-4xl sm:text-5xl">Simple, credit-based pricing</h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-ink-2">
              Every song, similar song and stem download uses credits. Choose a monthly plan or top up with a pack.
            </p>
          </Reveal>
          <Reveal delay={120}>
            <PricingTable />
          </Reveal>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" className="mx-auto max-w-3xl scroll-mt-24 px-4 py-16 sm:px-6">
        <Reveal>
          <h2 className="text-center font-display text-4xl sm:text-5xl">Questions and answers</h2>
        </Reveal>
        <div className="mt-10 space-y-3">
          {FAQ.map((item, i) => (
            <Reveal key={item.q} delay={i * 60}>
              <details className="faq group rounded-2xl border border-hairline bg-surface-1/60 px-5 transition-colors open:border-[#ee6a8a]/40 open:bg-surface-1 hover:border-ink-3/40 sm:px-6">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 text-left font-medium [&::-webkit-details-marker]:hidden">
                  {item.q}
                  <span className="grid size-8 shrink-0 place-items-center rounded-full bg-surface-2 transition-all duration-300 group-open:rotate-180 group-open:bg-cta group-open:text-on-cta">
                    <ChevronDown className="size-4" />
                  </span>
                </summary>
                <p className="pb-5 leading-relaxed text-ink-2">{item.a}</p>
              </details>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── Final call to action ── */}
      <section className="mx-auto max-w-7xl px-4 pt-12 sm:px-6">
        <Reveal>
          <SpotlightCard className="rounded-[2rem]" innerClassName="rounded-[calc(2rem-1px)] bg-transparent">
            <div className="relative overflow-hidden bg-[linear-gradient(115deg,#a8431a,#c2366c_40%,#6d3fd9_75%,#3b2a8f)] bg-[length:200%_100%] px-6 py-16 text-center text-white animate-gradient-pan sm:px-12 sm:py-20">
              <Parallax speed={-0.15} className="absolute -top-24 -left-24 size-72 rounded-full bg-[#f6b444]/30 blur-3xl">
                <span />
              </Parallax>
              <Parallax speed={0.12} className="absolute -right-20 -bottom-28 size-80 rounded-full bg-[#ee6a8a]/30 blur-3xl">
                <span />
              </Parallax>
              <h2 className="relative mx-auto max-w-3xl font-display text-4xl leading-tight sm:text-6xl">Your next song is one line away</h2>
              <p className="relative mx-auto mt-5 max-w-xl text-lg text-white/85">
                Sign up with your email or Google account and start creating. Songs are made by AI, and every try sounds a
                little different.
              </p>
              <Magnetic strength={0.35} className="relative mt-9">
                <Button size="xl" className="h-12 rounded-full bg-white px-8 text-base text-[#1b1407] shadow-[0_12px_40px_-10px_rgb(255_255_255/0.6)] hover:bg-white/90" asChild>
                  <Link href="/signup">
                    <Sparkles /> Start creating
                  </Link>
                </Button>
              </Magnetic>
            </div>
          </SpotlightCard>
        </Reveal>
      </section>
    </div>
  );
}
