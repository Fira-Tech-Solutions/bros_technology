import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowLeft, Bed, Bath, Maximize2, MapPin, Phone, Calendar, Check } from "lucide-react";
import { Nav } from "@/components/Nav";
import { ErrorState } from "@/components/ErrorState";
import { useProperty } from "@/hooks/use-properties";
import { formatPrice } from "@/lib/api/properties";

export const Route = createFileRoute("/property/$id")({
  component: Detail,
});

function Detail() {
  const { id } = Route.useParams();
  const { data: p, isLoading, isError, refetch } = useProperty(id);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background pt-24">
        <Nav />
        <div className="mx-auto max-w-7xl px-6">
          <div className="h-[60vh] animate-pulse rounded-3xl bg-muted" />
          <div className="mt-8 h-12 w-2/3 animate-pulse rounded bg-muted" />
        </div>
      </div>
    );
  }
  if (isError || !p) {
    return (
      <div className="min-h-screen bg-background pt-24">
        <Nav />
        <div className="mx-auto max-w-7xl px-6">
          <ErrorState message="Residence not found." onRetry={() => refetch()} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-40">
      <Nav />

      {/* Hero */}
      <section className="relative">
        <motion.div
          initial={{ opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="relative h-[80svh] w-full overflow-hidden"
        >
          <img src={p.hero} alt={p.title} className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-background/40" />
        </motion.div>

        <div className="absolute inset-x-0 top-20 z-10 px-6 md:top-32">
          <div className="mx-auto max-w-7xl">
            <Link to="/catalog" className="inline-flex items-center gap-2 rounded-full glass px-4 py-2 text-xs">
              <ArrowLeft className="h-3.5 w-3.5" /> Back to collection
            </Link>
          </div>
        </div>

        <div className="absolute inset-x-0 bottom-0 z-10 px-6 pb-12 md:pb-20">
          <div className="mx-auto max-w-7xl">
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 80, damping: 18 }}
              className="flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-muted-foreground"
            >
              <MapPin className="h-3 w-3" /> {p.location}
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, type: "spring", stiffness: 70, damping: 18 }}
              className="mt-3 font-display text-5xl text-balance md:text-8xl"
            >
              {p.title}
            </motion.h1>
          </div>
        </div>
      </section>

      <div className="mx-auto mt-12 grid max-w-7xl gap-12 px-6 lg:grid-cols-[1fr_360px]">
        <div>
          {/* Specs */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ type: "spring", stiffness: 80, damping: 18 }}
            className="grid grid-cols-2 gap-4 md:grid-cols-4"
          >
            {[
              { icon: Bed, label: "Beds", value: p.beds },
              { icon: Bath, label: "Baths", value: p.baths },
              { icon: Maximize2, label: "Area", value: `${p.area.toLocaleString()} ft²` },
              { label: "Price", value: formatPrice(p.price), gold: true },
            ].map((s, i) => (
              <div key={i} className="rounded-2xl border border-border bg-card p-5">
                <p className="text-xs uppercase tracking-widest text-muted-foreground">{s.label}</p>
                <p className={`mt-2 font-display text-2xl ${s.gold ? "text-gradient-gold" : ""}`}>{s.value}</p>
              </div>
            ))}
          </motion.div>

          {/* Description */}
          <div className="mt-16">
            <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">The residence</p>
            <p className="mt-4 max-w-2xl text-balance text-xl leading-relaxed text-foreground/90 md:text-2xl">
              {p.description}
            </p>
          </div>

          {/* Gallery */}
          <div className="mt-16">
            <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Gallery</p>
            <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-5">
              {p.gallery.map((src, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ type: "spring", stiffness: 80, damping: 18, delay: i * 0.06 }}
                  className={`overflow-hidden rounded-2xl ${i === 0 ? "col-span-2 row-span-2 aspect-square md:aspect-[4/3]" : "aspect-square"}`}
                >
                  <img src={src} alt="" loading="lazy" className="h-full w-full object-cover transition-transform duration-700 hover:scale-105" />
                </motion.div>
              ))}
            </div>
          </div>

          {/* Features */}
          <div className="mt-16">
            <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Features</p>
            <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-2">
              {p.features.map((f) => (
                <div key={f} className="flex items-center gap-3 rounded-xl border border-border bg-card px-5 py-4">
                  <Check className="h-4 w-4 text-gold" />
                  <span className="text-sm">{f}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Map */}
          <div className="mt-16">
            <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Location</p>
            <div className="mt-6 aspect-[16/9] overflow-hidden rounded-2xl border border-border">
              <iframe
                title="Map"
                width="100%"
                height="100%"
                style={{ border: 0, filter: "invert(0.9) hue-rotate(180deg) saturate(0.6)" }}
                loading="lazy"
                src={`https://www.openstreetmap.org/export/embed.html?bbox=${p.coords.lng - 0.05},${p.coords.lat - 0.03},${p.coords.lng + 0.05},${p.coords.lat + 0.03}&layer=mapnik&marker=${p.coords.lat},${p.coords.lng}`}
              />
            </div>
          </div>
        </div>

        {/* Desktop sticky contact */}
        <aside className="hidden lg:block">
          <div className="sticky top-28 rounded-3xl border border-border bg-card p-6 shadow-elegant">
            <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Enquire privately</p>
            <p className="mt-3 font-display text-3xl text-gradient-gold">{formatPrice(p.price)}</p>
            <div className="mt-5 space-y-3">
              <input placeholder="Name" className="w-full rounded-full border border-border bg-background px-4 py-3 text-sm focus:border-gold focus:outline-none" />
              <input placeholder="Email" className="w-full rounded-full border border-border bg-background px-4 py-3 text-sm focus:border-gold focus:outline-none" />
              <textarea rows={3} placeholder="A note" className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm focus:border-gold focus:outline-none" />
            </div>
            <button className="mt-5 w-full rounded-full bg-gradient-gold py-3 text-sm font-medium text-primary-foreground">
              Request a viewing
            </button>
            <button className="mt-2 w-full rounded-full border border-border py-3 text-sm hover:bg-accent">
              <Phone className="mr-2 inline h-4 w-4" /> Call concierge
            </button>
          </div>
        </aside>
      </div>

      {/* Mobile sticky deck */}
      <div className="fixed bottom-20 left-3 right-3 z-40 lg:hidden">
        <div className="flex items-center justify-between gap-3 rounded-2xl glass border border-border p-3 shadow-elegant">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">From</p>
            <p className="font-display text-lg text-gradient-gold">{formatPrice(p.price)}</p>
          </div>
          <div className="flex gap-2">
            <button className="rounded-full border border-border p-3" aria-label="Call">
              <Phone className="h-4 w-4" />
            </button>
            <button className="inline-flex items-center gap-2 rounded-full bg-gradient-gold px-4 py-3 text-sm font-medium text-primary-foreground">
              <Calendar className="h-4 w-4" /> Book viewing
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
