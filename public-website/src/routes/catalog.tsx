import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import { z } from "zod";
import { LayoutGrid, List, SlidersHorizontal, Search, X, Command, SearchX } from "lucide-react";
import { Nav } from "@/components/Nav";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { PropertyCard, PropertyCardSkeleton } from "@/components/PropertyCard";
import { ErrorState } from "@/components/ErrorState";
import { useProperties } from "@/hooks/use-properties";
import { useDebounce } from "@/hooks/use-debounce";
import { fetchCategories, fetchFilterOptions, PRICE_BOUNDS, formatPrice } from "@/lib/api/properties";
import type { Category, FilterOptions } from "@/lib/api/properties";
import { useLocale } from "@/providers/locale";
import {
  FilterPanel,
  DEFAULT_FILTERS,
  countActiveFilters,
  type FilterState,
} from "@/components/FilterPanel";

const searchSchema = z.object({
  category: z.string().optional(),
  q: z.string().optional(),
  priceMin: z.number().optional(),
  priceMax: z.number().optional(),
  brand: z.string().optional(),
  condition: z.string().optional(),
  storage: z.string().optional(),
  ram: z.string().optional(),
  color: z.string().optional(),
  processor: z.string().optional(),
  screenSize: z.string().optional(),
  os: z.string().optional(),
  model: z.string().optional(),
  connectivity: z.string().optional(),
  caseSize: z.string().optional(),
  hasWarranty: z.boolean().optional(),
  hasAppleCare: z.boolean().optional(),
});
type Search = z.infer<typeof searchSchema>;

const ATTRIBUTE_KEYS = [
  "brand",
  "condition",
  "storage",
  "ram",
  "color",
  "processor",
  "screenSize",
  "os",
  "model",
  "connectivity",
  "caseSize",
  "hasWarranty",
  "hasAppleCare",
] as const;

export const Route = createFileRoute("/catalog")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      {
        title: "Buy Laptops, iPhones, Samsung, iPads, MacBooks & Accessories — BROS Technology Ethiopia",
      },
      {
        name: "description",
        content:
          "Browse and buy laptops, iPhones, Samsung phones, iPads, MacBooks, AirPods, and smartwatches at BROS Technology. Best prices in Addis Ababa, Ethiopia with warranty.",
      },
      {
        name: "keywords",
        content:
          "buy laptop Ethiopia, iPhone price Ethiopia, Samsung phone Addis Ababa, MacBook price, iPad Ethiopia, AirPods price, smartwatch Ethiopia, electronics store",
      },
      { property: "og:title", content: "Buy Laptops, iPhones, Samsung & Electronics — BROS Technology" },
      {
        property: "og:description",
        content:
          "Browse laptops, iPhones, Samsung, iPads, MacBooks, AirPods & smartwatches at best prices in Ethiopia.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://brostechnology.com/catalog" },
      { property: "og:image", content: "/images/hero/desktop-dark-1920.jpg" },
    ],
    links: [{ rel: "canonical", href: "https://brostechnology.com/catalog" }],
    scripts: [
      {
        type: "application/ld+json",
        innerHTML: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "Buy Laptops, iPhones, Samsung & Electronics — BROS Technology Ethiopia",
          description:
            "Browse and buy laptops, iPhones, Samsung phones, iPads, MacBooks, AirPods, and smartwatches at BROS Technology in Addis Ababa, Ethiopia.",
          url: "https://brostechnology.com/catalog",
          isPartOf: {
            "@type": "WebSite",
            name: "BROS Technology",
            url: "https://brostechnology.com",
          },
          breadcrumb: {
            "@type": "BreadcrumbList",
            itemListElement: [
              {
                "@type": "ListItem",
                position: 1,
                name: "Home",
                item: "https://brostechnology.com",
              },
              {
                "@type": "ListItem",
                position: 2,
                name: "Products",
                item: "https://brostechnology.com/catalog",
              },
            ],
          },
        }),
      },
    ],
  }),
  component: Catalog,
});

function Catalog() {
  const search = Route.useSearch();
  const { category = "All", q = "" } = search;
  const navigate = useNavigate({ from: "/catalog" });
  const [layout, setLayout] = useState<"grid" | "list">("grid");
  const [filterOpen, setFilterOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({});
  const { t, locale } = useLocale();

  useEffect(() => {
    fetchCategories()
      .then(setCategories)
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (category === "All") {
      setFilterOptions({});
      return;
    }
    fetchFilterOptions(category)
      .then(setFilterOptions)
      .catch(() => setFilterOptions({}));
  }, [category]);

  const categoryNames = useMemo(() => {
    return ["All", ...categories.map((c) => c.displayName)];
  }, [categories]);

  const [qInput, setQInput] = useState(q);
  const debouncedQ = useDebounce(qInput, 300);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (debouncedQ === (search.q ?? "")) return;
    navigate({
      search: (s: Search) => ({ ...s, q: debouncedQ || undefined }),
      replace: true,
    });
  }, [debouncedQ]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchRef.current?.focus();
        searchRef.current?.select();
      }
      if (e.key === "Escape" && document.activeElement === searchRef.current) {
        setQInput("");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const filters: FilterState = useMemo(
    () => ({
      priceMin: search.priceMin ?? DEFAULT_FILTERS.priceMin,
      priceMax: search.priceMax ?? DEFAULT_FILTERS.priceMax,
      brand: search.brand,
      condition: search.condition,
      storage: search.storage,
      ram: search.ram,
      color: search.color,
      processor: search.processor,
      screenSize: search.screenSize,
      os: search.os,
      model: search.model,
      connectivity: search.connectivity,
      caseSize: search.caseSize,
      hasWarranty: search.hasWarranty,
      hasAppleCare: search.hasAppleCare,
    }),
    [
      search.priceMin,
      search.priceMax,
      search.brand,
      search.condition,
      search.storage,
      search.ram,
      search.color,
      search.processor,
      search.screenSize,
      search.os,
      search.model,
      search.connectivity,
      search.caseSize,
      search.hasWarranty,
      search.hasAppleCare,
    ],
  );
  const activeCount = countActiveFilters(filters);

  const setFilters = (next: FilterState) =>
    navigate({
      search: (s: Search) => {
        const params: Record<string, unknown> = {
          category: s.category,
          q: s.q,
        };
        if (next.priceMin > PRICE_BOUNDS.min) params.priceMin = next.priceMin;
        if (next.priceMax < PRICE_BOUNDS.max) params.priceMax = next.priceMax;
        for (const key of ATTRIBUTE_KEYS) {
          const val = next[key];
          if (val !== undefined && val !== "" && val !== null) {
            params[key] = val;
          }
        }
        return params as Search;
      },
      replace: true,
    });

  const resetFilters = () =>
    navigate({
      search: (s: Search) => ({
        category: s.category,
        q: s.q,
      }),
      replace: true,
    });

  const resetAll = () => {
    setQInput("");
    navigate({ search: () => ({}), replace: true });
  };

  const setCategory = (c: string) =>
    navigate({
      search: (s: Search) => ({
        category: c === "All" ? undefined : c,
        q: s.q,
      }),
      replace: true,
    });

  const { data, isLoading, isFetching, isError, refetch } = useProperties({
    category,
    q: debouncedQ,
    priceMin: search.priceMin,
    priceMax: search.priceMax,
    brand: search.brand,
    condition: search.condition,
    storage: search.storage,
    ram: search.ram,
    color: search.color,
    processor: search.processor,
    screenSize: search.screenSize,
    os: search.os,
    model: search.model,
    connectivity: search.connectivity,
    caseSize: search.caseSize,
  });

  const count = data?.length ?? 0;

  return (
    <div className="min-h-screen bg-background pb-32 pt-24 md:pt-32">
      <Nav />
      <div className="mx-auto max-w-7xl px-5 md:px-6">
        <Breadcrumbs
          items={
            category === "All"
              ? [{ label: "Products" }]
              : [{ label: "Products", href: "/catalog" }, { label: category }]
          }
        />
        {/* Header + Global search */}
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              {t("catalog.badge")}
            </p>
            <h1 className="mt-2 font-display text-4xl md:text-6xl">
              {category === "All" ? t("catalog.allProducts") : category}
            </h1>
            <motion.p
              key={`${count}-${isLoading}`}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-2 text-sm text-muted-foreground"
            >
              {isLoading
                ? t("catalog.gathering")
                : t("catalog.showing", { count }) +
                  " " +
                  t(count === 1 ? "catalog.product" : "catalog.products")}
              {isFetching && !isLoading && (
                <span className="ml-2 text-brand/80">{t("catalog.updating")}</span>
              )}
            </motion.p>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative flex-1 md:w-80">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                ref={searchRef}
                value={qInput}
                onChange={(e) => setQInput(e.target.value)}
                placeholder={t("catalog.searchPlaceholder")}
                className="w-full rounded-full border border-border bg-card py-3 pl-11 pr-24 text-sm transition-colors focus:border-brand focus:outline-none"
              />
              <AnimatePresence>
                {qInput && (
                  <motion.button
                    type="button"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    onClick={() => {
                      setQInput("");
                      searchRef.current?.focus();
                    }}
                    aria-label="Clear search"
                    className="absolute right-14 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
                  >
                    <X className="h-3.5 w-3.5" />
                  </motion.button>
                )}
              </AnimatePresence>
              <kbd className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 items-center gap-1 rounded-md border border-border bg-background/60 px-1.5 py-0.5 text-[10px] text-muted-foreground md:inline-flex">
                <Command className="h-3 w-3" /> K
              </kbd>
            </div>

            <div className="hidden md:flex rounded-full border border-border bg-card p-1">
              <button
                onClick={() => setLayout("grid")}
                aria-label="Grid view"
                className={`rounded-full p-2 transition-colors ${layout === "grid" ? "bg-accent" : ""}`}
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setLayout("list")}
                aria-label="List view"
                className={`rounded-full p-2 transition-colors ${layout === "list" ? "bg-accent" : ""}`}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Horizontal swipeable category switcher */}
        <div className="-mx-5 mt-8 overflow-x-auto px-5 no-scrollbar md:mx-0 md:px-0">
          <LayoutGroup id="category-switcher">
            <div className="flex w-max gap-2 md:flex-wrap">
              {categoryNames.map((c) => {
                const active = (category ?? "All") === c;
                return (
                  <button
                    key={c}
                    onClick={() => setCategory(c)}
                    className="relative rounded-full border border-border px-4 py-2 text-sm transition-colors"
                  >
                    {active && (
                      <motion.span
                        layoutId="category-pill"
                        transition={{ type: "spring", stiffness: 380, damping: 32 }}
                        className="absolute inset-0 rounded-full bg-gradient-brand shadow-glow"
                      />
                    )}
                    <span
                      className={`relative z-10 ${
                        active
                          ? "text-primary-foreground font-medium"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {c}
                    </span>
                  </button>
                );
              })}
            </div>
          </LayoutGroup>
        </div>

        {/* Body: sidebar (desktop) + results */}
        <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-[280px_1fr]">
          {/* Desktop sidebar */}
          <aside className="hidden md:block">
            <div className="sticky top-28 rounded-2xl border border-border bg-card/40 p-5">
              <div className="mb-5 flex items-center justify-between">
                <h3 className="font-display text-xl">{t("catalog.refine")}</h3>
                {activeCount > 0 && (
                  <span className="rounded-full bg-brand/12 px-2 py-0.5 text-xs text-brand">
                    {activeCount} {t("catalog.active")}
                  </span>
                )}
              </div>
              <FilterPanel
                value={filters}
                onChange={setFilters}
                onReset={resetFilters}
                filterOptions={filterOptions}
              />
            </div>
          </aside>

          {/* Results */}
          <div>
            {isError ? (
              <ErrorState onRetry={() => refetch()} />
            ) : isLoading ? (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <PropertyCardSkeleton key={i} />
                ))}
              </div>
            ) : count === 0 ? (
              <EmptyState onReset={resetAll} />
            ) : layout === "list" ? (
              <div className="flex flex-col gap-4">
                {data!.map((p) => (
                  <Link
                    key={p.id}
                    to="/property/$id"
                    params={{ id: p.id }}
                    className="group flex gap-5 overflow-hidden rounded-2xl border border-border bg-card p-3 transition-colors hover:border-brand"
                  >
                    <img
                      src={p.hero}
                      alt={p.title}
                      className="h-32 w-44 flex-shrink-0 rounded-xl object-cover"
                      loading="lazy"
                    />
                    <div className="flex flex-1 flex-col justify-between py-2">
                      <div>
                        <p className="text-xs uppercase tracking-widest text-muted-foreground">
                          {p.brand || p.category}
                        </p>
                        <h3 className="font-display text-2xl">{p.title}</h3>
                      </div>
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-xs ${p.inStock ? "text-green-500" : "text-red-500"}`}
                        >
                          {p.inStock ? t("property.inStock") : t("property.outOfStock")}
                        </span>
                        <span className="text-gradient-brand font-display text-lg">
                          {formatPrice(p.price)}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                {data!.map((p, i) => (
                  <PropertyCard key={p.id} p={p} index={i} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile sticky filter button */}
      <motion.button
        onClick={() => setFilterOpen(true)}
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 22, delay: 0.2 }}
        className="fixed bottom-24 left-1/2 z-40 flex -translate-x-1/2 items-center gap-2 rounded-full bg-gradient-brand px-5 py-3 text-sm font-medium text-primary-foreground shadow-glow md:hidden"
      >
        <SlidersHorizontal className="h-4 w-4" />
        {t("catalog.filters")}
        {activeCount > 0 ? ` (${activeCount} ${t("catalog.active")})` : ""}
      </motion.button>

      {/* Mobile filter sheet */}
      <AnimatePresence>
        {filterOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setFilterOpen(false)}
              className="fixed inset-0 z-[60] bg-background/70 backdrop-blur-sm md:hidden"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 280, damping: 32 }}
              className="fixed bottom-0 left-0 right-0 z-[61] max-h-[88vh] overflow-y-auto rounded-t-3xl border-t border-border bg-card p-6 pb-10 md:hidden"
            >
              <div className="sticky top-0 -mx-6 -mt-6 mb-2 bg-card px-6 pb-3 pt-4">
                <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-border" />
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-display text-2xl">{t("catalog.refine")}</h3>
                    <p className="text-xs text-muted-foreground">
                      {isLoading
                        ? "\u2026"
                        : `${count} ${t(count === 1 ? "catalog.product" : "catalog.products")}`}
                      {activeCount > 0 ? ` \u00B7 ${activeCount} ${t("catalog.active")}` : ""}
                    </p>
                  </div>
                  <button
                    onClick={() => setFilterOpen(false)}
                    className="rounded-full p-2 hover:bg-accent"
                    aria-label="Close filters"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <FilterPanel
                value={filters}
                onChange={setFilters}
                onReset={resetFilters}
                filterOptions={filterOptions}
              />

              <button
                onClick={() => setFilterOpen(false)}
                className="mt-8 w-full rounded-full bg-gradient-brand py-3.5 text-sm font-medium text-primary-foreground"
              >
                {t("catalog.showResults", {
                  count,
                  type: t(count === 1 ? "catalog.product" : "catalog.products"),
                })}
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function EmptyState({ onReset }: { onReset: () => void }) {
  const { t } = useLocale();
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 120, damping: 18 }}
      className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-card/40 py-24 text-center"
    >
      <motion.div
        animate={{ rotate: [0, -8, 8, -4, 0] }}
        transition={{ duration: 1.2, repeat: Infinity, repeatDelay: 2.5 }}
        className="mb-5 grid h-16 w-16 place-content-center rounded-full bg-brand/10 text-brand"
      >
        <SearchX className="h-7 w-7" />
      </motion.div>
      <h3 className="font-display text-3xl">{t("empty.title")}</h3>
      <p className="mt-2 max-w-sm px-6 text-sm text-muted-foreground">{t("empty.description")}</p>
      <button
        onClick={onReset}
        className="mt-6 rounded-full bg-gradient-brand px-6 py-2.5 text-sm font-medium text-primary-foreground shadow-glow"
      >
        {t("empty.resetAll")}
      </button>
    </motion.div>
  );
}
