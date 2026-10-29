"use client";

import { Pause, Play, Volume2, VolumeX } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * A playable stems demo. Press play and a short Keherwa groove is synthesised in
 * the browser (Web Audio, no files): each stem has its own gain and analyser, so
 * its meter shows its real level and muting it really silences it.
 */

type StemId = "vocals" | "drums" | "bass" | "keys" | "flute" | "strings";

const CHANNELS: { id: StemId; name: string; color: string }[] = [
  { id: "vocals", name: "Vocals", color: "#f6b444" },
  { id: "drums", name: "Drums & dholak", color: "#f2785a" },
  { id: "bass", name: "Bass", color: "#ee6a8a" },
  { id: "keys", name: "Keyboard & harmonium", color: "#c77dff" },
  { id: "flute", name: "Flute", color: "#9b7bff" },
  { id: "strings", name: "Strings", color: "#6fd3c1" },
];

const BARS = 32;
const BPM = 96;
const BEAT = 60 / BPM / 2; // 8 matras per bar of Keherwa, as eighth notes

const midi = (n: number) => 440 * Math.pow(2, (n - 69) / 12);
// Bhupali-like pentatonic around D: D E F# A B
const CHORDS = [[50, 57, 62, 66], [47, 54, 59, 62], [43, 50, 55, 59], [45, 52, 57, 61]]; // D, Bm, G, A
const VOCAL = [74, 76, 78, 76, 74, 71, 74, null, 78, 81, 78, 76, 74, null, 71, 69];
const FLUTE = [null, null, 86, 88, 90, null, 88, 86, null, null, 83, 86, 88, null, null, null];
// Keherwa: dha ge na ti | na ka dhi na
const DRUMS: ("dha" | "na" | "ge" | null)[] = ["dha", "ge", "na", "na", "na", "ge", "dha", "na"];

interface Engine {
  ctx: AudioContext;
  gains: Record<StemId, GainNode>;
  analysers: Record<StemId, AnalyserNode>;
  noise: AudioBuffer;
  timer: number;
  step: number;
  nextTime: number;
}

function createEngine(): Engine {
  const ctx = new AudioContext();
  const comp = ctx.createDynamicsCompressor();
  const master = ctx.createGain();
  master.gain.value = 0.7;
  comp.connect(master).connect(ctx.destination);

  const gains = {} as Record<StemId, GainNode>;
  const analysers = {} as Record<StemId, AnalyserNode>;
  for (const ch of CHANNELS) {
    const g = ctx.createGain();
    const a = ctx.createAnalyser();
    a.fftSize = 128;
    a.smoothingTimeConstant = 0.75;
    g.connect(a).connect(comp);
    gains[ch.id] = g;
    analysers[ch.id] = a;
  }

  const noise = ctx.createBuffer(1, ctx.sampleRate * 0.5, ctx.sampleRate);
  const data = noise.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;

  return { ctx, gains, analysers, noise, timer: 0, step: 0, nextTime: 0 };
}

function tone(
  e: Engine,
  out: AudioNode,
  t: number,
  freq: number,
  dur: number,
  { type = "sine", peak = 0.3, attack = 0.01, vibrato = 0, filter }: {
    type?: OscillatorType;
    peak?: number;
    attack?: number;
    vibrato?: number;
    filter?: { type: BiquadFilterType; freq: number; q?: number };
  } = {}
) {
  const { ctx } = e;
  const osc = ctx.createOscillator();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  if (vibrato) {
    const lfo = ctx.createOscillator();
    const depth = ctx.createGain();
    lfo.frequency.value = 5.2;
    depth.gain.value = freq * vibrato;
    lfo.connect(depth).connect(osc.frequency);
    lfo.start(t);
    lfo.stop(t + dur + 0.1);
  }
  const env = ctx.createGain();
  env.gain.setValueAtTime(0.0001, t);
  env.gain.exponentialRampToValueAtTime(peak, t + attack);
  env.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  let node: AudioNode = osc;
  if (filter) {
    const f = ctx.createBiquadFilter();
    f.type = filter.type;
    f.frequency.value = filter.freq;
    f.Q.value = filter.q ?? 1;
    node.connect(f);
    node = f;
  }
  node.connect(env).connect(out);
  osc.start(t);
  osc.stop(t + dur + 0.05);
}

function drum(e: Engine, t: number, stroke: "dha" | "na" | "ge") {
  const { ctx, gains } = e;
  if (stroke === "dha" || stroke === "ge") {
    // Low resonant bayan: falling pitch
    const osc = ctx.createOscillator();
    const env = ctx.createGain();
    osc.frequency.setValueAtTime(stroke === "dha" ? 150 : 120, t);
    osc.frequency.exponentialRampToValueAtTime(58, t + 0.35);
    env.gain.setValueAtTime(stroke === "dha" ? 0.9 : 0.55, t);
    env.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
    osc.connect(env).connect(gains.drums);
    osc.start(t);
    osc.stop(t + 0.45);
  }
  if (stroke === "dha" || stroke === "na") {
    // Bright dayan tap: short tone plus filtered noise
    tone(e, gains.drums, t, 620, 0.12, { type: "triangle", peak: 0.25, attack: 0.002 });
    const src = ctx.createBufferSource();
    src.buffer = e.noise;
    const bp = ctx.createBiquadFilter();
    bp.type = "bandpass";
    bp.frequency.value = 3200;
    bp.Q.value = 1.2;
    const env = ctx.createGain();
    env.gain.setValueAtTime(0.35, t);
    env.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
    src.connect(bp).connect(env).connect(gains.drums);
    src.start(t);
    src.stop(t + 0.1);
  }
}

function schedule(e: Engine) {
  const { ctx, gains } = e;
  while (e.nextTime < ctx.currentTime + 0.12) {
    const t = e.nextTime;
    const s = e.step;
    const bar = Math.floor(s / 8) % CHORDS.length;
    const beat = s % 8;
    const chord = CHORDS[bar];

    const stroke = DRUMS[beat];
    if (stroke) drum(e, t, stroke);

    if (beat === 0 || beat === 4) tone(e, gains.bass, t, midi(chord[0] - 12), BEAT * 3.6, { type: "sine", peak: 0.55, attack: 0.02 });

    if (beat === 0) {
      for (const n of chord.slice(1)) {
        // Harmonium: reedy sawtooth, filtered
        tone(e, gains.keys, t, midi(n), BEAT * 7.6, { type: "sawtooth", peak: 0.07, attack: 0.06, filter: { type: "lowpass", freq: 1400 } });
        // Strings pad: slow, soft, an octave up
        tone(e, gains.strings, t, midi(n + 12), BEAT * 7.9, { type: "triangle", peak: 0.05, attack: 0.5 });
      }
    }

    const v = VOCAL[s % VOCAL.length];
    if (v && beat % 2 === 0) {
      tone(e, gains.vocals, t, midi(v - 12), BEAT * 1.9, {
        type: "sawtooth",
        peak: 0.12,
        attack: 0.05,
        vibrato: 0.006,
        filter: { type: "bandpass", freq: 900, q: 2.5 },
      });
    }

    const f = FLUTE[s % FLUTE.length];
    if (f && s % 32 >= 16) tone(e, gains.flute, t, midi(f), BEAT * 1.8, { type: "sine", peak: 0.18, attack: 0.04, vibrato: 0.008 });

    e.step++;
    e.nextTime += BEAT;
  }
}

export function StemsMixer() {
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState<Set<StemId>>(new Set());
  const engine = useRef<Engine | null>(null);
  const meters = useRef<Record<string, HTMLSpanElement[]>>({});

  // Meter animation from the analysers while playing
  useEffect(() => {
    if (!playing) return;
    const buf = new Uint8Array(64);
    let frame = 0;
    const draw = () => {
      const e = engine.current;
      if (e) {
        for (const ch of CHANNELS) {
          e.analysers[ch.id].getByteFrequencyData(buf);
          const bars = meters.current[ch.id] ?? [];
          // Centre-out: the middle bars show the low bins where most musical energy is
          bars.forEach((el, i) => {
            const d = Math.abs(i - (BARS - 1) / 2) / ((BARS - 1) / 2);
            const v = Math.min(1, (buf[Math.floor(d * 16)] / 255) * 1.35);
            el.style.transform = `scaleY(${Math.max(0.08, v).toFixed(3)})`;
          });
        }
      }
      frame = requestAnimationFrame(draw);
    };
    frame = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(frame);
  }, [playing]);

  useEffect(
    () => () => {
      const e = engine.current;
      if (e) {
        clearInterval(e.timer);
        void e.ctx.close();
      }
    },
    []
  );

  const toggle = async () => {
    let e = engine.current;
    if (!e) {
      e = createEngine();
      engine.current = e;
      for (const id of muted) e.gains[id].gain.value = 0;
    }
    if (playing) {
      clearInterval(e.timer);
      await e.ctx.suspend();
      setPlaying(false);
      return;
    }
    await e.ctx.resume();
    e.nextTime = e.ctx.currentTime + 0.05;
    e.timer = window.setInterval(() => schedule(e!), 25);
    setPlaying(true);
  };

  const toggleMute = (id: StemId) => {
    setMuted((m) => {
      const next = new Set(m);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      const e = engine.current;
      if (e) e.gains[id].gain.setTargetAtTime(next.has(id) ? 0 : 1, e.ctx.currentTime, 0.03);
      return next;
    });
  };

  return (
    <div className="relative rounded-3xl border border-hairline bg-surface-1/80 p-4 shadow-[0_30px_90px_-40px_rgb(124_82_240/0.6)] backdrop-blur sm:p-6">
      <div className="mb-4 flex items-center gap-4">
        <button
          type="button"
          onClick={() => void toggle()}
          aria-label={playing ? "Pause the demo groove" : "Play the demo groove"}
          className={cn(
            "grid size-14 shrink-0 place-items-center rounded-full bg-cta text-on-cta shadow-[0_10px_30px_-8px_#ee6a8a] transition-transform hover:scale-105 active:scale-95",
            !playing && "animate-[pulse_2.4s_ease-in-out_infinite]"
          )}
        >
          {playing ? <Pause className="size-6 fill-current" /> : <Play className="ml-1 size-6 fill-current" />}
        </button>
        <div className="min-w-0">
          <p className="font-medium">Demo groove, 6 stems</p>
          <p className="text-sm text-ink-3">{playing ? "Tap a stem to mute or bring it back" : "Press play, then tap stems to mute them"}</p>
        </div>
      </div>
      <ul className="space-y-1.5">
        {CHANNELS.map((ch) => {
          const off = muted.has(ch.id);
          return (
            <li key={ch.id}>
              <button
                type="button"
                aria-pressed={!off}
                onClick={() => toggleMute(ch.id)}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-surface-2"
              >
                {off ? <VolumeX className="size-4 shrink-0 text-ink-3" /> : <Volume2 className="size-4 shrink-0" style={{ color: ch.color }} />}
                <span className={cn("w-32 shrink-0 truncate text-sm sm:w-48", off && "text-ink-3 line-through")}>{ch.name}</span>
                <span aria-hidden className="flex h-8 flex-1 items-center gap-[3px] overflow-hidden">
                  {Array.from({ length: BARS }, (_, i) => (
                    <span
                      key={i}
                      ref={(el) => {
                        if (!el) return;
                        (meters.current[ch.id] ??= [])[i] = el;
                      }}
                      className="h-full flex-1 origin-center rounded-full transition-[opacity] duration-300"
                      style={{
                        background: ch.color,
                        opacity: off ? 0.12 : playing ? 0.9 : 0.35,
                        transform: `scaleY(${playing ? 0.08 : 0.15 + (((i * 31 + ch.id.length * 11) % 20) / 20) * 0.5})`,
                      }}
                    />
                  ))}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
