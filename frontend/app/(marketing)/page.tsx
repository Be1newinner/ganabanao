import { Check, ChevronDown, Layers, PenLine, Play, Repeat2, Sparkles } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { COVERS } from "@/components/cover-art";
import { CursorGlow, Parallax, Reveal, TiltCard, TypedPrompt, Typewriter } from "@/components/landing/motion";
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

const FACTS = [
  ["5:30", "full songs, not 30-second clips"],
  ["12", "stems from any song you make"],
  ["2", "languages: Bhojpuri and Hindi"],
  ["0", "credits lost when a song fails"],
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

const CHIPS = {
  Taal: ["Keherwa", "Dadra", "Rupak", "Teentaal", "Deepchandi"],
  Instruments: ["Dholak", "Harmonium", "Bansuri", "Shehnai", "Nal", "Jhaal", "Tabla"],
  Mood: ["Romantic", "Festive", "Devotional", "Sad", "Energetic"],
};

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

        {/* Facts — all true of the product */}
        <div className="relative mx-auto grid max-w-7xl grid-cols-2 gap-px overflow-hidden rounded-2xl border border-hairline bg-hairline sm:mx-6 lg:grid-cols-4 xl:mx-auto">
          {FACTS.map(([n, label], i) => (
            <Reveal key={label} delay={i * 80} className="bg-bg p-5 sm:p-6">
              <p className="font-display text-4xl text-gold sm:text-5xl">{n}</p>
              <p className="mt-1 text-sm text-ink-2">{label}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── Genre marquee ── */}
      <section aria-label="Styles you can make" className="relative mt-20 overflow-hidden py-6 [mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]">
        <div className="flex w-max animate-marquee gap-10 motion-reduce:animate-none">
          {[...MARQUEE, ...MARQUEE].map((g, i) => (
            <span key={i} className="flex items-center gap-10 font-display text-4xl text-ink/80 sm:text-5xl">
              {g}
              <span aria-hidden className="size-2.5 rounded-full bg-cta" />
            </span>
          ))}
        </div>
      </section>

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
                <div className="flex h-full flex-col overflow-hidden rounded-3xl border border-hairline bg-surface-1">
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <Image
                      src={art}
                      alt=""
                      fill
                      sizes="(min-width: 768px) 33vw, 100vw"
                      className="object-cover transition-transform duration-700 group-hover/tilt:scale-105"
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-surface-1 via-surface-1/20 to-transparent" />
                    <span className="absolute bottom-4 left-5 grid size-11 place-items-center rounded-full bg-cta text-on-cta shadow-lg">
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
                </div>
              </TiltCard>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── How it works (a real sequence, so numbered) ── */}
      <section id="how" className="relative scroll-mt-24 border-y border-hairline bg-sunken/60 py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <Reveal>
            <h2 className="font-display text-4xl sm:text-5xl">From words to a song in three steps</h2>
          </Reveal>
          <ol className="relative mt-14 grid gap-10 md:grid-cols-3">
            <span aria-hidden className="absolute top-7 right-[16%] left-[16%] hidden h-px bg-linear-to-r from-[#f6b444] via-[#ee6a8a] to-[#7c52f0] opacity-50 md:block" />
            {STEPS.map((s, i) => (
              <Reveal as="li" key={s.title} delay={i * 150} className="relative">
                <span className="relative z-10 grid size-14 place-items-center rounded-full border border-hairline bg-surface-2 font-display text-2xl text-gold shadow-[0_0_40px_-8px_#ee6a8a]">
                  {i + 1}
                </span>
                <h3 className="mt-6 font-display text-2xl">{s.title}</h3>
                <p className="mt-2 max-w-sm leading-relaxed text-ink-2">{s.body}</p>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* ── Stems ── */}
      <section id="stems" className="mx-auto grid max-w-7xl scroll-mt-24 items-center gap-12 px-4 py-24 sm:px-6 lg:grid-cols-[1fr_1.2fr]">
        <Reveal>
          <h2 className="font-display text-4xl leading-tight sm:text-5xl">Every instrument on its own track</h2>
          <p className="mt-5 max-w-lg text-lg leading-relaxed text-ink-2">
            Split any song you made into up to 12 stems. Play each one here, download MP3s, or grab the original WAV and
            MIDI files to finish your mix in any studio app.
          </p>
          <p className="mt-4 max-w-lg text-ink-3">
            Stems are made once per song and kept for 30 days. Later downloads of the same stems are free.
          </p>
        </Reveal>
        <Reveal delay={150}>
          <StemsMixer />
        </Reveal>
      </section>

      {/* ── Made for Bhojpuri ── */}
      <section className="relative overflow-hidden border-y border-hairline bg-sunken/60">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-24 sm:px-6 lg:grid-cols-2">
          <Reveal>
            <h2 className="font-display text-4xl leading-tight sm:text-5xl">Made for Bhojpuri, from the taal up</h2>
            <p className="mt-5 max-w-lg text-lg leading-relaxed text-ink-2">
              Choose the rhythm cycle, the instruments of the village mehfil and the mood of the occasion. Your choices
              shape every song.
            </p>
            <div className="mt-8 space-y-5">
              {Object.entries(CHIPS).map(([group, items]) => (
                <div key={group}>
                  <p className="mb-2 text-sm font-semibold text-ink">{group}</p>
                  <div className="flex flex-wrap gap-2">
                    {items.map((item) => (
                      <span key={item} className="rounded-full border border-hairline bg-surface-1 px-3 py-1.5 text-sm text-ink-2">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Reveal>

          {/* Parallax wall of covers */}
          <div aria-hidden className="relative h-[460px] [mask-image:linear-gradient(to_bottom,transparent,black_15%,black_85%,transparent)] sm:h-[560px]">
            <div className="absolute inset-0 grid grid-cols-3 gap-4">
              {[0.12, -0.1, 0.16].map((speed, col) => (
                <Parallax key={col} speed={speed} className="space-y-4">
                  {[0, 1, 2, 3].map((row) => {
                    const cover = COVERS[(col * 2 + row) % COVERS.length];
                    return (
                      <div key={row} className="overflow-hidden rounded-2xl ring-1 ring-white/10">
                        <Image src={`/art/covers/${cover}.jpg`} alt="" width={220} height={220} className="aspect-square w-full object-cover" />
                      </div>
                    );
                  })}
                </Parallax>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section id="pricing" className="relative mx-auto max-w-7xl scroll-mt-24 px-4 py-24 sm:px-6">
        <Reveal className="mb-14 text-center">
          <h2 className="font-display text-4xl sm:text-5xl">Simple, credit-based pricing</h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-ink-2">
            Every song, similar song and stem download uses credits. Choose a monthly plan or top up with a pack.
          </p>
        </Reveal>
        <Reveal delay={120}>
          <PricingTable />
        </Reveal>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" className="mx-auto max-w-3xl scroll-mt-24 px-4 py-16 sm:px-6">
        <Reveal>
          <h2 className="text-center font-display text-4xl sm:text-5xl">Questions and answers</h2>
        </Reveal>
        <div className="mt-10 divide-y divide-hairline rounded-2xl border border-hairline bg-surface-1/60">
          {FAQ.map((item, i) => (
            <Reveal key={item.q} delay={i * 60}>
              <details className="group px-5 py-1 sm:px-6">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 text-left font-medium [&::-webkit-details-marker]:hidden">
                  {item.q}
                  <ChevronDown className="size-5 shrink-0 text-ink-3 transition-transform group-open:rotate-180" />
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
          <div className="relative overflow-hidden rounded-[2rem] bg-[linear-gradient(115deg,#a8431a,#c2366c_40%,#6d3fd9_75%,#3b2a8f)] bg-[length:200%_100%] px-6 py-16 text-center text-white animate-gradient-pan sm:px-12 sm:py-20">
            <div aria-hidden className="absolute -top-24 -left-24 size-72 rounded-full bg-[#f6b444]/30 blur-3xl" />
            <div aria-hidden className="absolute -right-20 -bottom-28 size-80 rounded-full bg-[#ee6a8a]/30 blur-3xl" />
            <h2 className="relative mx-auto max-w-3xl font-display text-4xl leading-tight sm:text-6xl">Your next song is one line away</h2>
            <p className="relative mx-auto mt-5 max-w-xl text-lg text-white/85">
              Sign up with your email or Google account and start creating. Songs are made by AI, and every try sounds a
              little different.
            </p>
            <Button size="xl" className="relative mt-9 h-12 rounded-full bg-white px-8 text-base text-[#1b1407] hover:bg-white/90" asChild>
              <Link href="/signup">
                <Sparkles /> Start creating
              </Link>
            </Button>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
