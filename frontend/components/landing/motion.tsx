"use client";

import {
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
  type ElementType,
  type ReactNode,
} from "react";
import { cn } from "@/lib/utils";

/*
 * Small motion helpers for the landing page. Every effect checks
 * prefers-reduced-motion; pointer effects only run with a fine pointer (mouse).
 */

const subscribeMotion = (cb: () => void) => {
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
};

/** True when the user asked the system to reduce motion. */
export function useReducedMotion(): boolean {
  return useSyncExternalStore(
    subscribeMotion,
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    () => false
  );
}

const finePointer = () => typeof window !== "undefined" && window.matchMedia("(pointer: fine)").matches;

// ─── Reveal on scroll ─────────────────────────────────────────────────────────

/** Fades and lifts its children into view the first time they scroll on screen. */
export function Reveal({
  children,
  delay = 0,
  as: Tag = "div",
  className,
}: {
  children: ReactNode;
  delay?: number;
  as?: ElementType;
  className?: string;
}) {
  const ref = useRef<HTMLElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px -10% 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <Tag
      ref={ref}
      style={{ transitionDelay: `${delay}ms` } as CSSProperties}
      className={cn(
        "transition-[opacity,translate,filter] duration-[900ms] ease-[cubic-bezier(0.2,0.7,0.1,1)] motion-reduce:transition-none",
        shown ? "translate-y-0 opacity-100 blur-0" : "translate-y-8 opacity-0 blur-[2px] motion-reduce:translate-y-0 motion-reduce:opacity-100 motion-reduce:blur-0",
        className
      )}
    >
      {children}
    </Tag>
  );
}

// ─── Parallax ─────────────────────────────────────────────────────────────────

/** Moves its children at `speed` × scroll (negative = upward). One rAF per frame. */
export function Parallax({ children, speed = 0.15, className }: { children: ReactNode; speed?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el || reduced) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const rect = el.getBoundingClientRect();
      const offset = rect.top + rect.height / 2 - window.innerHeight / 2;
      el.style.transform = `translate3d(0, ${(-offset * speed).toFixed(1)}px, 0)`;
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [speed, reduced]);

  return (
    <div ref={ref} className={cn("will-change-transform", className)}>
      {children}
    </div>
  );
}

// ─── Typewriter ───────────────────────────────────────────────────────────────

/** Types and erases each word in turn. Screen readers get the first word only, once. */
export function Typewriter({ words, className }: { words: string[]; className?: string }) {
  const reduced = useReducedMotion();
  const [text, setText] = useState(words[0]);

  useEffect(() => {
    if (reduced) return;
    let i = 0;
    let len = words[0].length;
    let deleting = false;
    let timer: ReturnType<typeof setTimeout>;
    const tick = () => {
      const word = words[i];
      if (!deleting) {
        len++;
        setText(word.slice(0, len));
        if (len >= word.length) {
          deleting = true;
          timer = setTimeout(tick, 1800);
          return;
        }
        timer = setTimeout(tick, 85);
      } else {
        len--;
        setText(word.slice(0, len));
        if (len <= 0) {
          deleting = false;
          i = (i + 1) % words.length;
          timer = setTimeout(tick, 280);
          return;
        }
        timer = setTimeout(tick, 40);
      }
    };
    timer = setTimeout(() => {
      deleting = true;
      tick();
    }, 2200);
    return () => clearTimeout(timer);
  }, [words, reduced]);

  return (
    <span className={className}>
      <span aria-hidden>{reduced ? words[0] : text}</span>
      {/* Solid colour: inside gradient text, currentColor is transparent */}
      <span aria-hidden className="ml-1 inline-block h-[0.85em] w-[4px] animate-pulse rounded-full bg-[#ee6a8a] align-[-0.05em]" />
      <span className="sr-only">{words[0]}</span>
    </span>
  );
}

/** A demo prompt box that types an idea, pauses, then types the next. */
export function TypedPrompt({ prompts }: { prompts: string[] }) {
  const reduced = useReducedMotion();
  const [text, setText] = useState(reduced ? prompts[0] : "");

  useEffect(() => {
    if (reduced) return;
    let i = 0;
    let len = 0;
    let timer: ReturnType<typeof setTimeout>;
    const tick = () => {
      const p = prompts[i];
      len++;
      setText(p.slice(0, len));
      if (len >= p.length) {
        timer = setTimeout(() => {
          i = (i + 1) % prompts.length;
          len = 0;
          tick();
        }, 2600);
        return;
      }
      timer = setTimeout(tick, 38);
    };
    timer = setTimeout(tick, 900);
    return () => clearTimeout(timer);
  }, [prompts, reduced]);

  return (
    <span>
      {text}
      <span aria-hidden className="ml-0.5 inline-block h-[1.1em] w-[2px] animate-pulse bg-gold align-[-0.15em]" />
    </span>
  );
}

// ─── Cursor glow ──────────────────────────────────────────────────────────────

/** A soft festival-coloured light that follows the mouse across the page. */
export function CursorGlow() {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el || reduced || !finePointer()) return;
    let x = window.innerWidth / 2;
    let y = window.innerHeight / 3;
    let cx = x;
    let cy = y;
    let frame = 0;
    const loop = () => {
      cx += (x - cx) * 0.12;
      cy += (y - cy) * 0.12;
      el.style.transform = `translate3d(${cx - 300}px, ${cy - 300}px, 0)`;
      frame = requestAnimationFrame(loop);
    };
    const onMove = (e: PointerEvent) => {
      x = e.clientX;
      y = e.clientY;
      el.style.opacity = "1";
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    frame = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onMove);
    };
  }, [reduced]);

  return (
    <div
      ref={ref}
      aria-hidden
      className="pointer-events-none fixed top-0 left-0 z-0 size-[600px] rounded-full opacity-0 mix-blend-screen transition-opacity duration-700"
      style={{
        background:
          "radial-gradient(circle, rgb(238 106 138 / 0.16) 0%, rgb(124 82 240 / 0.10) 35%, transparent 65%)",
      }}
    />
  );
}

// ─── Tilt card ────────────────────────────────────────────────────────────────

/** Tilts in 3D toward the cursor and lights a spotlight where the pointer is. */
export function TiltCard({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  return (
    <div
      ref={ref}
      onPointerMove={(e) => {
        const el = ref.current;
        if (!el || reduced || e.pointerType !== "mouse") return;
        const r = el.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width;
        const py = (e.clientY - r.top) / r.height;
        el.style.setProperty("--mx", `${px * 100}%`);
        el.style.setProperty("--my", `${py * 100}%`);
        el.style.transform = `perspective(900px) rotateX(${(0.5 - py) * 8}deg) rotateY(${(px - 0.5) * 10}deg) translateZ(0)`;
      }}
      onPointerLeave={() => {
        const el = ref.current;
        if (el) el.style.transform = "";
      }}
      className={cn(
        "group/tilt relative transition-transform duration-300 ease-out [transform-style:preserve-3d]",
        className
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-10 rounded-[inherit] opacity-0 transition-opacity duration-300 group-hover/tilt:opacity-100"
        style={{
          background: "radial-gradient(420px circle at var(--mx, 50%) var(--my, 50%), rgb(255 255 255 / 0.08), transparent 45%)",
        }}
      />
      {children}
    </div>
  );
}

// ─── Scroll progress ──────────────────────────────────────────────────────────

/** A thin festival-gradient bar at the top showing how far down the page you are. */
export function ScrollProgress() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (ref.current) ref.current.style.transform = `scaleX(${max > 0 ? window.scrollY / max : 0})`;
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);
  return <div ref={ref} aria-hidden className="fixed inset-x-0 top-0 z-50 h-0.5 origin-left scale-x-0 bg-cta" />;
}
