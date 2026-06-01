import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, useScroll, useTransform } from "framer-motion";
import { lazy, Suspense, useRef } from "react";
import { ArrowRight, Sparkles } from "lucide-react";
import { Nav } from "@/components/Nav";
import { PropertyCard, PropertyCardSkeleton } from "@/components/PropertyCard";
import { ErrorState } from "@/components/ErrorState";
import { useProperties } from "@/hooks/use-properties";
import { CATEGORIES } from "@/lib/api/properties";

const HeroCanvas = lazy(() => import("@/components/three/HeroCanvas"));

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Æther — Architectural Living, Curated" },
      { name: "description", content: "An immersive portfolio of architectural residences worldwide." },
    ],
  }),
  component: Index,
});

function Index() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  const { data, isLoading, isError, refetch } = useProperties();

  return (
    <div className="min-h-screen bg-background">
      <Nav />

      {/* HERO */}
      <section ref={heroRef} className="relative min-h-[100svh] overflow-hidden bg-gradient-hero">
        <Suspense fallback={null}>
          <HeroCanvas />
        </Suspense>
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
            <Sparkles className="h-3 w-3 text-gold" /> A new chapter in residence
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 70, damping: 18, delay: 0.35 }}
            className="mt-6 max-w-3xl text-balance font-display text-5xl leading-[1.05] text-foreground md:text-7xl lg:text-8xl"
          >
            Architecture, <em className="text-gradient-gold not-italic">distilled</em>.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 70, damping: 18, delay: 0.5 }}
            className="mt-5 max-w-xl text-balance text-base text-muted-foreground md:text-lg"
          >
            A quiet portfolio of residences in the places that matter — chosen for light, line, and lasting craft.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 70, damping: 18, delay: 0.65 }}
            className="mt-10 flex flex-wrap gap-3 md:justify-center"
          >
            <Link
              to="/catalog"
              className="group inline-flex items-center gap-2 rounded-full bg-gradient-gold px-6 py-3 text-sm font-medium text-primary-foreground shadow-glow"
            >
              Explore the collection
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <a
              href="#featured"
              className="inline-flex items-center gap-2 rounded-full border border-border px-6 py-3 text-sm text-foreground hover:bg-accent transition-colors"
            >
              Featured
            </a>
          </motion.div>
        </motion.div>
      </section>

      {/* QUICK FILTERS */}
      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="flex items-end justify-between gap-6">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Browse</p>
            <h2 className="mt-2 font-display text-3xl md:text-4xl">By disposition</h2>
          </div>
        </div>
        <div className="mt-8 flex gap-3 overflow-x-auto no-scrollbar pb-2 md:flex-wrap md:overflow-visible">
          {CATEGORIES.map((c, i) => (
            <motion.div
              key={c}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ type: "spring", stiffness: 90, damping: 18, delay: i * 0.04 }}
            >
              <Link
                to="/catalog"
                search={{ category: c === "All" ? undefined : c }}
                className="block whitespace-nowrap rounded-2xl border border-border bg-card px-6 py-5 hover:border-gold hover:shadow-glow transition-all"
              >
                <span className="font-display text-xl">{c}</span>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* FEATURED */}
      <section id="featured" className="mx-auto max-w-7xl px-6 py-16">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Selected</p>
            <h2 className="mt-2 font-display text-3xl md:text-5xl">Currently in residence</h2>
          </div>
          <Link to="/catalog" className="hidden md:inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            View all <ArrowRight className="h-4 w-4" />
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
              <span key={k + c}>{c} <span className="text-gold">✦</span></span>
            ))
          )}
        </motion.div>
      </section>

      <Footer />
    </div>
  );
}

function Footer() {
  return (
    <footer id="contact" className="mx-auto max-w-7xl px-6 py-20">
      <div className="grid gap-10 rounded-3xl border border-border bg-card p-10 md:grid-cols-2 md:p-16">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">In conversation</p>
          <h3 className="mt-3 font-display text-3xl md:text-5xl">Begin a private viewing.</h3>
        </div>
        <div className="flex flex-col gap-4">
          <input
            placeholder="Your email"
            className="rounded-full border border-border bg-background px-5 py-3 text-sm placeholder:text-muted-foreground focus:border-gold focus:outline-none"
          />
          <button className="rounded-full bg-gradient-gold px-6 py-3 text-sm font-medium text-primary-foreground">
            Request an appointment
          </button>
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Æther Residences. All addresses by invitation.
          </p>
        </div>
      </div>
      <div className="h-24 md:h-0" />
    </footer>
  );
}
