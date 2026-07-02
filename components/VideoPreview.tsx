"use client";

import { useEffect, useRef } from "react";

type VideoPreviewProps = {
  src: string;
  poster?: string;
  controls?: boolean;
  className?: string;
};

export function VideoPreview({ src, poster, controls = false, className }: VideoPreviewProps) {
  const ref = useRef<HTMLVideoElement>(null);

  // React does not emit the `muted` attribute in server-rendered HTML,
  // which makes browsers block autoplay. Set it imperatively, then play.
  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    video.muted = true;
    video.play().catch(() => {
      /* autoplay rejected — poster stays visible */
    });
  }, []);

  return (
    <video
      ref={ref}
      src={src}
      poster={poster}
      autoPlay
      muted
      loop
      playsInline
      controls={controls}
      preload="auto"
      className={className}
    />
  );
}
