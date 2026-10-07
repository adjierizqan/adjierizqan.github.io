"use client";
import { useEffect, useRef } from "react";

/** One muted, visibility-triggered attempt per mount. Native controls always win. */
export function VisibilityVideo({ src, poster }: { src: string; poster?: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const video = ref.current;
    if (!video || !("IntersectionObserver" in window)) return;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    let attempted = false;
    let visible = false;
    let disposed = false;
    const stopAutomatic = () => {
      if (reduced.matches) video.pause();
    };
    // Any explicit interaction gives ownership to the visitor, including pausing
    // before our first intersection callback or choosing to enable audio.
    const takeControl = () => { attempted = true; };
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting && entry.intersectionRatio >= .45;
      if (!entry.isIntersecting || entry.intersectionRatio < .1) video.pause();
      if (!visible || reduced.matches || attempted || document.hidden) return;
      attempted = true;
      video.muted = true;
      void video.play().then(() => {
        if (disposed || !visible || reduced.matches || document.hidden) video.pause();
      }).catch(() => { /* Autoplay policy: leave the poster and controls available. */ });
    }, { threshold: [0, .1, .45] });
    const background = () => { if (document.hidden) video.pause(); };
    observer.observe(video);
    video.addEventListener("pointerdown", takeControl);
    video.addEventListener("keydown", takeControl);
    reduced.addEventListener("change", stopAutomatic);
    document.addEventListener("visibilitychange", background);
    return () => {
      disposed = true;
      observer.disconnect();
      video.pause();
      video.removeEventListener("pointerdown", takeControl);
      video.removeEventListener("keydown", takeControl);
      reduced.removeEventListener("change", stopAutomatic);
      document.removeEventListener("visibilitychange", background);
    };
  }, []);
  return <video ref={ref} controls muted playsInline preload="none" poster={poster} aria-label="Porsche 3D original configurator recording">
    <source src={src} type="video/mp4" />
  </video>;
}
