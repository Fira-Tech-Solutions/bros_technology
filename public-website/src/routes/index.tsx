import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, useScroll, useTransform } from "framer-motion";
import { useEffect, useState, useRef } from "react";
import {
  ArrowRight,
  Sparkles,
  Home,
  Building2,
  Car,
  Bike,
  Truck,
  Smartphone,
  Laptop,
  Sofa,
  Gem,
  ShoppingBag,
  Briefcase,
  Landmark,
  TreePine,
  GraduationCap,
  Heart,
  Shield,
  Wrench,
  Palette,
  Tag,
} from "lucide-react";
import { Nav } from "@/components/Nav";
import { PropertyCard, PropertyCardSkeleton } from "@/components/PropertyCard";
import { ErrorState } from "@/components/ErrorState";
import { useProperties } from "@/hooks/use-properties";
import { fetchCategories, getIconName } from "@/lib/api/properties";
import type { Category } from "@/lib/api/properties";
import { useLocale } from "@/providers/locale";
import { HeroBackground } from "@/components/HeroBackground";

const ICON_COMPONENTS: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  Home, Building2, Car, Bike, Truck, Smartphone, Laptop, Sofa, Gem,
  ShoppingBag, Briefcase, Landmark, TreePine, GraduationCap, Heart,
  Shield, Wrench, Palette, Tag,
};

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const { t } = useLocale();
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    fetchCategories().then(setCategories).catch(() => {});
  }, []);

  const allCategories = [{ id: "all", name: "All", displayName: t("catalog.allResidences") || "All", icon: "tag" } as Category, ...categories];

  const { data, isLoading, isError, refetch } = useProperties();

  return (
    <div className="min-h-screen bg-background">
      <Nav />

      {/* HERO */}
      <section ref={heroRef} className="relative min-h-[100svh] overflow-hidden bg-gradient-hero">
        <HeroBackground />
        <motion.div
          style={{ y, opacity }}
          className="relative z-10 mx-auto flex min-h-[100svh] max-w-7xl flex-col items-start justify-end px-6 pb-32 pt-40 md:items-center md:justify-center md:pb-0 md:text-center"
        >
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 80, damping: 18, delay: 0.2 }}
            className="inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-xs uppercase tracking-[0.2em] text-muted-foreground"
          >
            <Sparkles className="h-3 w-3 text-gold" /> {t("hero.badge")}
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 70, damping: 18, delay: 0.35 }}
            className="mt-6 max-w-3xl text-balance font-display text-5xl leading-[1.05] text-foreground md:text-7xl lg:text-8xl"
          >
            {t("hero.title")}{" "}
            <em className="text-gradient-gold not-italic">{t("hero.titleAccent")}</em>.
          </motion.h1>
          {t("hero.description") && (
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 70, damping: 18, delay: 0.5 }}
              className="mt-5 max-w-xl text-balance text-base text-muted-foreground md:text-lg"
            >
              {t("hero.description")}
            </motion.p>
          )}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 70, damping: 18, delay: 0.65 }}
            className="mt-10 flex flex-wrap gap-3 md:justify-center"
          >
            <Link
              to="/catalog"
              className="group inline-flex items-center gap-2 rounded-full bg-gradient-gold px-6 py-3 text-sm font-medium text-primary-foreground shadow-glow transition-all hover:shadow-glow-lg"
            >
              {t("hero.cta")}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <a
              href="#featured"
              className="inline-flex items-center gap-2 rounded-full border border-border px-6 py-3 text-sm text-foreground hover:bg-accent transition-colors"
            >
              {t("hero.featured")}
            </a>
          </motion.div>
        </motion.div>
      </section>

      {/* QUICK FILTERS */}
      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="flex items-end justify-between gap-6">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              {t("categories.browse")}
            </p>
            <h2 className="mt-2 font-display text-3xl md:text-4xl">{t("categories.title")}</h2>
          </div>
        </div>
        <div className="mt-8 flex gap-3 overflow-x-auto no-scrollbar pb-2 md:flex-wrap md:overflow-visible">
          {allCategories.map((c, i) => {
            const iconName = getIconName(c.icon);
            const IconComp = ICON_COMPONENTS[iconName] || Tag;
            return (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ type: "spring", stiffness: 90, damping: 18, delay: i * 0.04 }}
              >
                <Link
                  to="/catalog"
                  search={{ category: c.name === "All" ? undefined : c.displayName }}
                  className="flex items-center gap-3 whitespace-nowrap rounded-2xl border border-border bg-card px-5 py-4 hover:border-gold hover:shadow-glow transition-all"
                >
                  <IconComp size={20} className="text-gold shrink-0" />
                  <span className="font-display text-lg">{c.displayName}</span>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* FEATURED */}
      <section id="featured" className="mx-auto max-w-7xl px-6 py-16">
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
            {t("featured.viewAll")}<ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {isError ? (
          <ErrorState onRetry={() => refetch()} message="We couldn't reach the residences." />
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {isLoading
              ? Array.from({ length: 6 }).map((_, i) => <PropertyCardSkeleton key={i} />)
              : data?.slice(0, 6).map((p, i) => <PropertyCard key={p.id} p={p} index={i} />)}
          </div>
        )}
      </section>

      {/* INFINITE MARQUEE */}
      <section className="overflow-hidden border-y border-border py-10">
        <motion.div
          animate={{ x: ["0%", "-50%"] }}
          transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
          className="flex gap-16 whitespace-nowrap font-display text-5xl text-muted-foreground/40 md:text-7xl"
        >
          {Array.from({ length: 2 }).flatMap((_, k) =>
            ["Malibu", "Tribeca", "Shoreditch", "Tuscany", "Niseko", "Ibiza"].map((c) => (
              <span key={k + c}>
                {c} <span className="text-gold">✦</span>
              </span>
            )),
          )}
        </motion.div>
      </section>

      <Footer />
    </div>
  );
}

function Footer() {
  const { t } = useLocale();
  return (
    <footer id="contact" className="mx-auto max-w-7xl px-6 py-20">
      <div className="grid gap-10 rounded-3xl border border-border bg-card p-10 md:grid-cols-2 md:p-16">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            {t("footer.badge")}
          </p>
          <h3 className="mt-3 font-display text-3xl md:text-5xl">{t("footer.title")}</h3>
        </div>
        <div className="flex flex-col gap-4">
          <input
            placeholder={t("footer.emailPlaceholder")}
            className="rounded-full border border-border bg-background px-5 py-3 text-sm placeholder:text-muted-foreground focus:border-gold focus:outline-none"
          />
          <button className="rounded-full bg-gradient-gold px-6 py-3 text-sm font-medium text-primary-foreground">
            {t("footer.cta")}
          </button>
          <p className="text-xs text-muted-foreground">
            {t("footer.copyright", { year: new Date().getFullYear() })}
          </p>
        </div>
      </div>
      <div className="h-24 md:h-0" />
    </footer>
  );
}
