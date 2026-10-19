import dimensions from "@/data/media-dimensions.json";

type Props = {
  src: string;
  alt: string;
  priority?: boolean;
  className?: string;
  sizes?: string;
  style?: React.CSSProperties;
};

const dims = dimensions as Record<string, { width: number; height: number }>;

/**
 * Plain <img> with the source's real dimensions so the browser reserves space
 * (no layout shift). Static export has no image optimiser, and every source is
 * already a sized WebP produced by docs/release/media.cjs.
 */
export function Img({ src, alt, priority = false, className, sizes, style }: Props) {
  const d = dims[src];
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      width={d?.width}
      height={d?.height}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : undefined}
      decoding="async"
      className={className}
      sizes={sizes}
      style={style}
    />
  );
}
