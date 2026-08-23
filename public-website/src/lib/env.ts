export const env = {
  API_URL: import.meta.env.VITE_API_URL || "https://api.broslaptop.com",
  SITE_URL: (import.meta.env.VITE_SITE_URL || "https://broslaptop.com").replace(/\/$/, ""),
} as const;

/** Absolute site origin, no trailing slash. Use for canonical, og:url, and JSON-LD. */
export const SITE_URL = env.SITE_URL;

/** Resolve a site-relative path to an absolute URL (required by social crawlers for og:image). */
export const absoluteUrl = (path: string) =>
  path.startsWith("http") ? path : `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
