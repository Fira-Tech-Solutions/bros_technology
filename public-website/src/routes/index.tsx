import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, useReducedMotion, useInView } from "framer-motion";
import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import {
  ArrowRight,
  Sparkles,
  Smartphone,
  Laptop,
  Headphones,
  Watch,
  Tablet,
  Tag,
} from "lucide-react";
import { Nav } from "@/components/Nav";
import { HeroBackground } from "@/components/HeroBackground";
import { ContactSection } from "@/components/ContactSection";
import { PropertyCard, PropertyCardSkeleton } from "@/components/PropertyCard";
import { ErrorState } from "@/components/ErrorState";
import { WebPageJsonLd } from "@/components/JsonLd";
import { useProperties } from "@/hooks/use-properties";
import { fetchCategories, getIconName } from "@/lib/api/properties";
import type { Category } from "@/lib/api/properties";
import { useLocale } from "@/providers/locale";
import { isTelegramMiniApp } from "@/lib/telegram";
import { SITE_URL, absoluteUrl } from "@/lib/env";

const ICON_COMPONENTS: Record<
  string,
  React.ComponentType<{ size?: number; className?: string }>
> = {
  Smartphone,
  Laptop,
  Headphones,
  Watch,
  Tablet,
  Tag,
};

function AnimatedCounter({ target, suffix = "" }: { target: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    const duration = 2000;
    const steps = 60;
    const increment = target / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [isInView, target]);

  return (
    <span ref={ref}>
      {count.toLocaleString()}{suffix}
    </span>
  );
}

function StatsSection() {
  const { t } = useLocale();

  const stats = [
    { label: "Happy Customers", value: 2500, suffix: "+" },
    { label: "Products Sold", value: 4800, suffix: "+" },
    { label: "5-Star Reviews", value: 1200, suffix: "+" },
    { label: "Years of Trust", value: 5, suffix: "" },
  ];

  return (
    <section className="mx-auto max-w-7xl px-6 py-16">
      <div className="rounded-3xl border border-border bg-card p-8 md:p-12">
        <div className="mb-8 text-center">
          <p className="text-xs uppercase tracking-[0.25em] text-brand">
            Why Choose Us
          </p>
          <h2 className="mt-3 font-display text-3xl md:text-5xl">
            Trusted by Thousands
          </h2>
          <p className="mt-3 max-w-xl mx-auto text-muted-foreground">
            We provide genuine, brand-new electronics with warranty and reliable after-sales support across Ethiopia.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, type: "spring", stiffness: 80, damping: 18 }}
              className="text-center"
            >
              <p className="font-display text-4xl text-gradient-brand md:text-5xl">
                <AnimatedCounter target={stat.value} suffix={stat.suffix} />
              </p>
              <p className="mt-2 text-sm text-muted-foreground">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        <div className="mt-10 grid grid-cols-3 gap-4 text-center">
          {[
            { icon: "🛡️", text: "Warranty on all products" },
            { icon: "🚚", text: "Fast delivery nationwide" },
            { icon: "💬", text: "24/7 customer support" },
          ].map((item, i) => (
            <motion.div
              key={item.text}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 + i * 0.1 }}
              className="rounded-2xl border border-border bg-background/50 p-4"
            >
              <span className="text-2xl">{item.icon}</span>
              <p className="mt-2 text-xs text-muted-foreground md:text-sm">{item.text}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function useScrollReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    if (shouldReduceMotion || !ref.current) return;
    const el = ref.current;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("visible");
          observer.unobserve(el);
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [shouldReduceMotion]);

  return ref;
}

function RevealSection({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    if (shouldReduceMotion || !ref.current) return;
    const el = ref.current;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => el.classList.add("visible"), delay);
          observer.unobserve(el);
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -30px 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [delay, shouldReduceMotion]);

  return (
    <div
      ref={ref}
      className={`reveal ${className}`}
      style={shouldReduceMotion ? { opacity: 1, transform: "none" } : undefined}
    >
      {children}
    </div>
  );
}

const HOME_TITLE =
  "BROS Technology — Buy Laptops, iPhones, Samsung, iPads & MacBooks in Addis Ababa";
const HOME_DESCRIPTION =
  "Shop laptops, iPhones, Samsung phones, iPads, MacBooks, AirPods and smartwatches at BROS Technology. Best prices on new and used electronics in Addis Ababa, Ethiopia. Warranty included.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: HOME_TITLE },
      { name: "description", content: HOME_DESCRIPTION },
      { property: "og:title", content: HOME_TITLE },
      { property: "og:description", content: HOME_DESCRIPTION },
      { property: "og:type", content: "website" },
      { property: "og:url", content: SITE_URL },
      { property: "og:image", content: absoluteUrl("/images/hero/desktop-dark-1920.jpg") },
      { name: "twitter:title", content: HOME_TITLE },
      { name: "twitter:description", content: HOME_DESCRIPTION },
      { name: "twitter:image", content: absoluteUrl("/images/hero/desktop-dark-1920.jpg") },
    ],
    links: [{ rel: "canonical", href: SITE_URL }],
  }),
  component: Index,
});

function Index() {
  const { t } = useLocale();
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    fetchCategories()
      .then(setCategories)
      .catch(() => {});
  }, []);

  const allCategories = [
    {
      id: "all",
      name: "All",
      displayName: t("catalog.allProducts") || "All",
      icon: "tag",
    } as Category,
    ...categories,
  ];

  const { data, isLoading, isError, refetch } = useProperties();

  return (
    <div className="min-h-screen bg-background">
      <WebPageJsonLd name={HOME_TITLE} description={HOME_DESCRIPTION} />
      <Nav />

      {/* HERO — sticky parallax background */}
      <HeroBackground />

      {/* Content scrolls over the sticky hero */}
      <div className="relative z-10 bg-background">
        {/* CATEGORIES */}
        <section id="categories" className="mx-auto max-w-7xl px-6 py-16">
          <RevealSection>
            <div className="flex items-end justify-between gap-6">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  {t("categories.browse")}
                </p>
                <h2 className="mt-2 font-display text-3xl md:text-4xl">{t("categories.title")}</h2>
              </div>
            </div>
          </RevealSection>
          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 md:gap-4">
            {allCategories.map((c, i) => {
              const iconName = getIconName(c.icon);
              const IconComp = ICON_COMPONENTS[iconName] || Tag;
              return (
                <RevealSection key={c.id} delay={i * 50}>
                  <Link
                    to="/catalog"
                    search={{ category: c.name === "All" ? undefined : c.displayName }}
                    className="card-lift flex items-center gap-3 whitespace-nowrap rounded-2xl border border-border bg-card px-5 py-5"
                  >
                    <IconComp size={22} className="text-brand shrink-0" />
                    <span className="font-display text-base md:text-lg">{c.displayName}</span>
                  </Link>
                </RevealSection>
              );
            })}
          </div>
        </section>

        {/* FEATURED */}
        <section id="featured" className="mx-auto max-w-7xl px-6 py-16">
          <RevealSection>
            <div className="mb-10 flex items-end justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  {t("featured.badge")}
                </p>
                <h2 className="mt-2 font-display text-3xl md:text-5xl">{t("featured.title")}</h2>
              </div>
              <Link
                to="/catalog"
                className="hidden md:inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
              >
                {t("featured.viewAll")}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </RevealSection>

          {isError ? (
            <ErrorState onRetry={() => refetch()} message="We couldn't reach the products." />
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {isLoading
                ? Array.from({ length: 6 }).map((_, i) => <PropertyCardSkeleton key={i} />)
                : data?.slice(0, 6).map((p, i) => (
                    <RevealSection key={p.id} delay={i * 80}>
                      <PropertyCard p={p} index={i} />
                    </RevealSection>
                  ))}
            </div>
          )}
        </section>

        {/* BRAND MARQUEE */}
        <section className="overflow-hidden border-y border-border py-8">
          <motion.div
            animate={{ x: ["0%", "-50%"] }}
            transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
            className="flex gap-10 items-center"
          >
            {Array.from({ length: 2 }).flatMap((_, k) =>
              [
                { src: "/images/brands/airpods.jpg", alt: "AirPods" },
                { src: "/images/brands/iphone.jpg", alt: "iPhone" },
                { src: "/images/brands/macbook.jpeg", alt: "MacBook" },
                { src: "/images/brands/Samsung.webp", alt: "Samsung" },
                { src: "/images/brands/Smartwatches.png", alt: "Smartwatches" },
              ].map((img, i) => (
                <div
                  key={`${k}-${i}`}
                  className="shrink-0 h-20 w-36 overflow-hidden rounded-xl border border-border bg-card md:h-28 md:w-48"
                >
                  <img
                    src={img.src}
                    alt={img.alt}
                    className="h-full w-full object-cover opacity-70 grayscale-[30%] transition-all duration-500 hover:opacity-100 hover:grayscale-0 hover:scale-110"
                    loading="lazy"
                  />
                </div>
              )),
            )}
          </motion.div>
        </section>

        {/* STATS */}
        <StatsSection />

        {/* SEO CONTENT */}
        <section className="mx-auto max-w-7xl px-6 py-16">
          <RevealSection>
            <div className="rounded-3xl border border-border bg-card p-8 md:p-12">
              <div className="grid gap-10 lg:grid-cols-2">
                <div>
                  <p className="text-xs uppercase tracking-[0.25em] text-brand">
                    About BROS Technology
                  </p>
                  <h2 className="mt-3 font-display text-2xl md:text-4xl">
                    Your Trusted Electronics Store in Addis Ababa
                  </h2>
                  <p className="mt-4 leading-relaxed text-muted-foreground">
                    BROS Technology is Ethiopia&apos;s premier destination for laptops, smartphones,
                    tablets, and accessories. Whether you&apos;re looking for a brand-new MacBook,
                    a Samsung Galaxy, an iPhone, or a reliable Dell laptop for work, we have
                    something for every budget and need.
                  </p>
                  <p className="mt-3 leading-relaxed text-muted-foreground">
                    All our products come with warranty, and our expert team in Addis Ababa is
                    ready to help you find the perfect device. We stock top brands including
                    Apple, Samsung, Dell, Lenovo, HP, and more.
                  </p>
                </div>
                <div className="space-y-4">
                  <h3 className="font-display text-lg">What We Offer</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
                      Laptops — Dell, Lenovo, HP, MacBook for students and professionals
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
                      iPhones & Samsung — Latest models with warranty
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
                      iPads & MacBooks — For creatives and students
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
                      AirPods & Smartwatches — Premium audio and wearables
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
                      Nationwide delivery across Ethiopia
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </RevealSection>
        </section>

        <ContactSection />
      </div>
    </div>
  );
}
