"use client";

import { createContext, use, useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";

/**
 * One audio element for the whole site, so playback continues while the user
 * moves between pages. Songs and stems call `play(track)`; the PlayerBar shows
 * the controls (FR-6.1: play, pause, seek, volume).
 */

export interface Track {
  /** Unique per playable item, e.g. a song id or `${songId}:${stemName}` */
  id: string;
  title: string;
  subtitle?: string;
  src: string;
  /** Seed for the generated cover art */
  coverSeed: string;
  downloadUrl?: string;
}

interface PlayerState {
  track: Track | null;
  playing: boolean;
  time: number;
  duration: number;
  volume: number;
  error: string | null;
}

interface PlayerValue extends PlayerState {
  play: (track: Track) => void;
  toggle: () => void;
  seek: (seconds: number) => void;
  setVolume: (volume: number) => void;
  close: () => void;
  isCurrent: (id: string) => boolean;
}

const PlayerContext = createContext<PlayerValue | null>(null);

const VOLUME_KEY = "gb:volume";

export function PlayerProvider({ children }: { children: ReactNode }) {
  const audio = useRef<HTMLAudioElement | null>(null);
  const [state, setState] = useState<PlayerState>({
    track: null,
    playing: false,
    time: 0,
    duration: 0,
    volume: 1,
    error: null,
  });

  useEffect(() => {
    const el = new Audio();
    el.preload = "metadata";
    try {
      const saved = Number(localStorage.getItem(VOLUME_KEY));
      if (saved >= 0 && saved <= 1 && localStorage.getItem(VOLUME_KEY) !== null) el.volume = saved;
    } catch {
      // storage unavailable — keep the default volume
    }
    const sync = (patch: Partial<PlayerState>) => setState((s) => ({ ...s, ...patch }));
    el.onplay = () => sync({ playing: true, error: null });
    el.onpause = () => sync({ playing: false });
    el.onended = () => sync({ playing: false, time: 0 });
    el.ontimeupdate = () => sync({ time: el.currentTime });
    el.onloadedmetadata = () => sync({ duration: el.duration });
    el.onvolumechange = () => sync({ volume: el.volume });
    el.onerror = () => sync({ playing: false, error: "This link has expired. Refresh the page to play again." });
    audio.current = el;
    sync({ volume: el.volume });
    return () => {
      el.pause();
      el.src = "";
    };
  }, []);

  const play = useCallback((track: Track) => {
    const el = audio.current;
    if (!el) return;
    setState((s) => {
      if (s.track?.id !== track.id) {
        el.src = track.src;
        return { ...s, track, time: 0, duration: 0, error: null };
      }
      return s;
    });
    void el.play().catch(() => undefined);
  }, []);

  const toggle = useCallback(() => {
    const el = audio.current;
    if (!el?.src) return;
    if (el.paused) void el.play().catch(() => undefined);
    else el.pause();
  }, []);

  const seek = useCallback((seconds: number) => {
    if (audio.current) audio.current.currentTime = seconds;
  }, []);

  const setVolume = useCallback((volume: number) => {
    if (audio.current) audio.current.volume = volume;
    try {
      localStorage.setItem(VOLUME_KEY, String(volume));
    } catch {
      // not saved — fine
    }
  }, []);

  const close = useCallback(() => {
    const el = audio.current;
    if (el) {
      el.pause();
      el.removeAttribute("src");
      el.load();
    }
    setState((s) => ({ ...s, track: null, playing: false, time: 0, duration: 0 }));
  }, []);

  const value = useMemo<PlayerValue>(
    () => ({ ...state, play, toggle, seek, setVolume, close, isCurrent: (id) => state.track?.id === id }),
    [state, play, toggle, seek, setVolume, close]
  );

  return <PlayerContext value={value}>{children}</PlayerContext>;
}

export function usePlayer(): PlayerValue {
  const ctx = use(PlayerContext);
  if (!ctx) throw new Error("usePlayer must be used within a PlayerProvider");
  return ctx;
}
