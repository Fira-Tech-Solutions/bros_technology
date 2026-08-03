/**
 * Responsive hero art. Variants are produced by scripts/optimize-images.sh —
 * re-run it after replacing any source art in public/images/.
 *
 * The browser picks exactly one file via <picture> source negotiation:
 * AVIF where supported, then WebP, then a baseline JPEG.
 */

export type Theme = "light" | "dark";

const DESKTOP_WIDTHS = [1280, 1920, 2560] as const;
const MOBILE_WIDTHS = [640, 828, 1080] as const;

const srcSet = (kind: "desktop" | "mobile", theme: Theme, ext: string) =>
  (kind === "desktop" ? DESKTOP_WIDTHS : MOBILE_WIDTHS)
    .map((w) => `/images/hero/${kind}-${theme}-${w}.${ext} ${w}w`)
    .join(", ");

export function heroSources(theme: Theme) {
  return {
    desktop: {
      avif: srcSet("desktop", theme, "avif"),
      webp: srcSet("desktop", theme, "webp"),
      fallback: `/images/hero/desktop-${theme}-1600.jpg`,
      width: 2560,
      height: 1429,
    },
    mobile: {
      avif: srcSet("mobile", theme, "avif"),
      webp: srcSet("mobile", theme, "webp"),
      fallback: `/images/hero/mobile-${theme}-828.jpg`,
      width: 1080,
      height: 1935,
    },
  };
}

/** The single variant worth preloading for the initial paint, by theme. */
export const HERO_PRELOAD = {
  dark: {
    desktop: "/images/hero/desktop-dark-1920.avif",
    mobile: "/images/hero/mobile-dark-828.avif",
  },
  light: {
    desktop: "/images/hero/desktop-light-1920.avif",
    mobile: "/images/hero/mobile-light-828.avif",
  },
} as const;

/**
 * ~24px blurred thumbnails, inlined so the first paint needs no extra request.
 */
export const HERO_LQIP: Record<Theme, { mobile: string; desktop: string }> = {
  dark: {
    mobile:
      "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDABQODxIPDRQSEBIXFRQYHjIhHhwcHj0sLiQySUBMS0dARkVQWnNiUFVtVkVGZIhlbXd7gYKBTmCNl4x9lnN+gXz/2wBDARUXFx4aHjshITt8U0ZTfHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHz/wAARCAArABgDASIAAhEBAxEB/8QAGgAAAgMBAQAAAAAAAAAAAAAAAAMBBAUCBv/EACQQAAICAgEEAwADAAAAAAAAAAECAxEAIQQSIjFRE0FxUmHR/8QAFwEBAQEBAAAAAAAAAAAAAAAAAAIDAf/EABkRAQEBAAMAAAAAAAAAAAAAAAABEQIhQf/aAAwDAQACEQMRAD8A8sIA1tvXrHxRcVgW5M0iPdAKL17zrlcQIiOhFVvf95UCUb6bzRmtzpxe1hKxkJ2KNVX4MMmDjfOpkegRQG8MqXE2b6dK6CGzZJXt343ioqdSWA6QPWP43FPKCoIzIBGSQP3IWOFmKoFFGrJ1kr4y3qCFkTjHtYkN3br8wxfIb4Imjb7PlTd/7hnNMNWYwlficqaIJH37yxBxUPHLjps78bygQD5F5pwRxnjLaKdfxGKRnuA6MGAYdQ161hkEAFqFbwwP/9k=",
    desktop:
      "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDABQODxIPDRQSEBIXFRQYHjIhHhwcHj0sLiQySUBMS0dARkVQWnNiUFVtVkVGZIhlbXd7gYKBTmCNl4x9lnN+gXz/2wBDARUXFx4aHjshITt8U0ZTfHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHz/wAARCAASACADASIAAhEBAxEB/8QAGQAAAgMBAAAAAAAAAAAAAAAAAAMBAgQG/8QAIhAAAgIBBAIDAQAAAAAAAAAAAQIAESEDBBJBIlETFDFx/8QAFgEBAQEAAAAAAAAAAAAAAAAAAgAB/8QAGBEBAAMBAAAAAAAAAAAAAAAAAAECMUH/2gAMAwEAAhEDEQA/AOa+FtS2tSR7GTDT26s1m6vqN224XUVtMcmJH4RigcV6jEBQldQMTYocwBXdxjBSbLm/grtWSB6k/UIYgqR/RcZyYlFWx0fL9itZ6XNq10ezJjbpIiBiqqp9gSoAN2O4QisNVgoxgTPvVBRbAOT1CEPCjX//2Q==",
  },
  light: {
    mobile:
      "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDABQODxIPDRQSEBIXFRQYHjIhHhwcHj0sLiQySUBMS0dARkVQWnNiUFVtVkVGZIhlbXd7gYKBTmCNl4x9lnN+gXz/2wBDARUXFx4aHjshITt8U0ZTfHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHz/wAARCAArABgDASIAAhEBAxEB/8QAGAAAAwEBAAAAAAAAAAAAAAAAAAIEAwH/xAAoEAACAQQABQIHAAAAAAAAAAABAgMAERIhBBMxYXEiUQUjJEFSkaH/xAAVAQEBAAAAAAAAAAAAAAAAAAAAAf/EABcRAQEBAQAAAAAAAAAAAAAAAAABESH/2gAMAwEAAhEDEQA/AOyxvzLooItukOd9rurpYfqgoAxIphw6/j/aCKIs0vzEsd270VbHFlOwZB6QLb60VZ1K47vHPGZGzOOzj5qhp1QhLH1C97XArOaLKVWJAGOI/dYJ8T4blzMcrRSCNjrrvv2pDN5GkPEB+KlWKRQcRq2xRWU8cU/D8+MFWfQYHfX7260VeRLqqUpkhc237+aQx8EyFWVSrG5FtE+5omVWYZAHzSctL2wW3igeKKDBkiAwB0B0GqKI0VL4qB4opmj/2Q==",
    desktop:
      "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDABQODxIPDRQSEBIXFRQYHjIhHhwcHj0sLiQySUBMS0dARkVQWnNiUFVtVkVGZIhlbXd7gYKBTmCNl4x9lnN+gXz/2wBDARUXFx4aHjshITt8U0ZTfHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHz/wAARCAASACADASIAAhEBAxEB/8QAGQAAAgMBAAAAAAAAAAAAAAAAAAEDBAUC/8QAJxAAAgEDAwMDBQAAAAAAAAAAAQIRAAMhBBJBBTFREyIjQmFxkbH/xAAWAQEBAQAAAAAAAAAAAAAAAAABAgP/xAAYEQADAQEAAAAAAAAAAAAAAAAAARECMf/aAAwDAQACEQMRAD8AubWY8SOSM1IulRpLORPbNZOhvI1++oe77yTA7Afbwa0fX2ptSBcjDNmtWzJKMkOmtwrLcLSfMikLY+ooPzArg6m6LifIuzdlYzEVQ1/UQud1xDO0qP7RRlFolAZiAAY4FXEUE5ANFFOuk54N1WRgfqsvqSK1sSoOeRRRUlo//9k=",
  },
};

/** Optimized brand-marquee logos, AVIF/WebP with the original as fallback. */
export const BRAND_LOGOS = [
  { base: "airpods", fallback: "/images/brands/airpods.jpg", alt: "AirPods" },
  { base: "iphone", fallback: "/images/brands/iphone.jpg", alt: "iPhone" },
  { base: "macbook", fallback: "/images/brands/macbook.jpeg", alt: "MacBook" },
  { base: "Samsung", fallback: "/images/brands/Samsung.webp", alt: "Samsung" },
  { base: "Smartwatches", fallback: "/images/brands/Smartwatches.png", alt: "Smartwatches" },
] as const;
