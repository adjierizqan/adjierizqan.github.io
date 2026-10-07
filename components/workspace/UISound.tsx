"use client";

import { useSyncExternalStore } from "react";
import { L } from "@/lib/i18n";

type Sound = "tap" | "open" | "close" | "success";
const KEY = "aw-ui-muted";
const EVENT = "aw:soundchange";
let context: AudioContext | undefined;
let memoryMuted = false;
const listeners = (notify: () => void) => {
  window.addEventListener(EVENT, notify);
  window.addEventListener("storage", notify);
  return () => { window.removeEventListener(EVENT, notify); window.removeEventListener("storage", notify); };
};
function isMuted() {
  try { return localStorage.getItem(KEY) === "true"; } catch { return memoryMuted; }
}

/** Only call synchronously from meaningful user actions. No effects, hover or timers.
 * Quiet filtered noise, generated here; no recordings, pitch sequence or external assets. */
export function playUISound(kind: Sound) {
  if (typeof window === "undefined" || isMuted() || !navigator.userActivation?.isActive) return;
  try {
    context ??= new AudioContext();
    if (context.state === "suspended") void context.resume().catch(() => {});
    const duration = { tap: .035, open: .075, close: .05, success: .09 }[kind];
    const buffer = context.createBuffer(1, Math.ceil(context.sampleRate * duration), context.sampleRate);
    const samples = buffer.getChannelData(0);
    for (let i = 0; i < samples.length; i++) samples[i] = (Math.random() * 2 - 1);
    const source = context.createBufferSource();
    source.buffer = buffer;
    const filter = context.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = { tap: 900, open: 1400, close: 650, success: 1700 }[kind];
    filter.Q.value = .5;
    const gain = context.createGain();
    const now = context.currentTime;
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(.045, now + .004);
    gain.gain.exponentialRampToValueAtTime(.0001, now + duration);
    source.connect(filter).connect(gain).connect(context.destination);
    source.onended = () => { source.disconnect(); filter.disconnect(); gain.disconnect(); };
    source.start(now);
    source.stop(now + duration);
  } catch { /* Audio is optional; controls must still complete their action. */ }
}

export function SoundButton() {
  const muted = useSyncExternalStore(listeners, isMuted, () => false);
  return <button type="button" className="aw-ui-sound" aria-pressed={!muted}
    aria-label={muted ? L("Unmute UI sounds", "Aktifkan suara UI") : L("Mute UI sounds", "Bisukan suara UI")}
    title={L("UI sounds", "Suara UI")} onClick={() => {
      memoryMuted = !muted;
      try { localStorage.setItem(KEY, String(memoryMuted)); } catch { /* session memory fallback */ }
      window.dispatchEvent(new Event(EVENT));
      if (!memoryMuted) playUISound("tap");
    }}>
    <svg viewBox="0 0 20 20" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M3 8h3l4-3v10l-4-3H3Z" />{muted ? <path d="m13 7 5 6m0-6-5 6" /> : <path d="M13 7a5 5 0 0 1 0 6m3-8a8 8 0 0 1 0 10" />}</svg>
    <span>{muted ? L("Muted", "Bisu") : L("Sound", "Suara")}</span>
  </button>;
}
