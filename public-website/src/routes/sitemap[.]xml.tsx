import { createFileRoute } from "@tanstack/react-router";

import { fetchProperties, fetchCategories } from "@/lib/api/properties";
import { SITE_URL } from "@/lib/env";

type UrlEntry = {
  loc: string;
  changefreq: "daily" | "weekly" | "monthly";
  priority: string;
  lastmod?: string;
};

const escapeXml = (s: string) =>
  s.replace(/[<>&'"]/g, (c) =>
    ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" })[c] as string,
  );

// encodeURIComponent leaves !'()* alone; percent-encoding them keeps the query
// string free of characters that would otherwise need XML entity escaping.
const encodeParam = (s: string) =>
  encodeURIComponent(s).replace(/[!'()*]/g, (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`);

function renderSitemap(entries: UrlEntry[]) {
  const urls = entries
    .map(
      ({ loc, changefreq, priority, lastmod }) =>
        `  <url>\n` +
        `    <loc>${escapeXml(loc)}</loc>\n` +
        (lastmod ? `    <lastmod>${lastmod}</lastmod>\n` : "") +
        `    <changefreq>${changefreq}</changefreq>\n` +
        `    <priority>${priority}</priority>\n` +
        `  </url>`,
    )
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const today = new Date().toISOString().slice(0, 10);

        const entries: UrlEntry[] = [
          { loc: `${SITE_URL}/`, lastmod: today, changefreq: "weekly", priority: "1.0" },
          { loc: `${SITE_URL}/catalog`, lastmod: today, changefreq: "daily", priority: "0.9" },
        ];

        // A sitemap missing product URLs is worse than one missing categories,
        // so each source is fetched independently and failures degrade quietly.
        const [categories, products] = await Promise.all([
          fetchCategories().catch(() => []),
          fetchProperties({ limit: "5000" }).catch(() => []),
        ]);

        for (const c of categories) {
          entries.push({
            loc: `${SITE_URL}/catalog?category=${encodeParam(c.displayName)}`,
            lastmod: today,
            changefreq: "daily",
            priority: "0.8",
          });
        }

        for (const p of products) {
          entries.push({
            loc: `${SITE_URL}/property/${p.id}`,
            lastmod: today,
            changefreq: "daily",
            priority: "0.7",
          });
        }

        return new Response(renderSitemap(entries), {
          headers: {
            "Content-Type": "application/xml; charset=utf-8",
            // Cached at the edge for an hour; stale copies keep serving while revalidating.
            "Cache-Control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
          },
        });
      },
    },
  },
});
