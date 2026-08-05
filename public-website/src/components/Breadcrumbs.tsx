import { Link } from "@tanstack/react-router";
import { ChevronRight, Home } from "lucide-react";
import { SITE_URL } from "@/lib/env";

interface BreadcrumbItem {
  label: string;
  href?: string;
  /** Search params for the link target, e.g. `{ category: "Laptops" }`. */
  search?: Record<string, string | undefined>;
}

/** Builds the absolute URL used in the BreadcrumbList structured data. */
function itemUrl({ href, search }: BreadcrumbItem) {
  if (!href) return undefined;
  const qs = new URLSearchParams(
    Object.entries(search ?? {}).filter(([, v]) => v !== undefined) as [string, string][],
  ).toString();
  return `${SITE_URL}${href}${qs ? `?${qs}` : ""}`;
}

export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: SITE_URL,
      },
      ...items.map((item, i) => {
        const url = itemUrl(item);
        return {
          "@type": "ListItem",
          position: i + 2,
          name: item.label,
          ...(url ? { item: url } : {}),
        };
      }),
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-xs text-muted-foreground">
        <Link to="/" className="flex items-center gap-1 hover:text-foreground transition-colors">
          <Home className="h-3 w-3" />
          <span>Home</span>
        </Link>
        {items.map((item, i) => (
          <span key={i} className="flex items-center gap-1">
            <ChevronRight className="h-3 w-3" />
            {item.href ? (
              <Link
                to={item.href}
                search={item.search}
                className="hover:text-foreground transition-colors"
              >
                {item.label}
              </Link>
            ) : (
              <span className="text-foreground font-medium">{item.label}</span>
            )}
          </span>
        ))}
      </nav>
    </>
  );
}
