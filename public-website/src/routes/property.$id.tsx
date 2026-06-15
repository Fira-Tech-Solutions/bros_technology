import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowLeft, Bed, Bath, Maximize2, MapPin, Phone, Calendar, Check, Mail, MessageCircle, ExternalLink } from "lucide-react";
import { Nav } from "@/components/Nav";
import { ErrorState } from "@/components/ErrorState";
import { useProperty } from "@/hooks/use-properties";
import { formatPrice } from "@/lib/api/properties";
import { useLocale } from "@/providers/locale";

export const Route = createFileRoute("/property/$id")({
  component: Detail,
});

function Detail() {
  const { id } = Route.useParams();
  const { data: p, isLoading, isError, refetch } = useProperty(id);
  const { t } = useLocale();

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
          <ErrorState message={t("error.notFound")} onRetry={() => refetch()} />
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
            <Link
              to="/catalog"
              className="inline-flex items-center gap-2 rounded-full glass px-4 py-2 text-xs"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> {t("property.backToCollection")}
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
              { icon: Bed, label: t("filter.bedrooms"), value: p.beds },
              { icon: Bath, label: t("filter.bathrooms"), value: p.baths },
              { icon: Maximize2, label: "Area", value: `${p.area.toLocaleString()} ft²` },
              { label: t("filter.price"), value: formatPrice(p.price), gold: true },
            ].map((s, i) => (
              <div key={i} className="rounded-2xl border border-border bg-card p-5">
                <p className="text-xs uppercase tracking-widest text-muted-foreground">{s.label}</p>
                <p className={`mt-2 font-display text-2xl ${s.gold ? "text-gradient-gold" : ""}`}>
                  {s.value}
                </p>
              </div>
            ))}
          </motion.div>

          {/* Description */}
          <div className="mt-16">
            <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
              {t("property.theResidence")}
            </p>
            <p className="mt-4 max-w-2xl text-balance text-xl leading-relaxed text-foreground/90 md:text-2xl">
              {p.description}
            </p>
          </div>

          {/* Gallery */}
          <div className="mt-16">
            <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
              {t("property.gallery")}
            </p>
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
                  <img
                    src={src}
                    alt=""
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
                  />
                </motion.div>
              ))}
            </div>
          </div>

          {/* Features */}
          <div className="mt-16">
            <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
              {t("property.features")}
            </p>
            <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-2">
              {p.features.map((f) => (
                <div
                  key={f}
                  className="flex items-center gap-3 rounded-xl border border-border bg-card px-5 py-4"
                >
                  <Check className="h-4 w-4 text-gold" />
                  <span className="text-sm">{f}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Map */}
          <div className="mt-16">
            <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
              {t("property.location")}
            </p>
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
            {/* Agent Info */}
            {p.agent && (
              <div className="mb-6 flex items-center gap-4">
                {p.agent.profileImage ? (
                  <img
                    src={p.agent.profileImage}
                    alt={p.agent.name}
                    className="h-14 w-14 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-gold">
                    <span className="text-lg font-bold text-primary-foreground">
                      {p.agent.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <div>
                  <p className="font-medium">{p.agent.name}</p>
                  <p className="text-xs text-muted-foreground">Agent</p>
                </div>
              </div>
            )}

            <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
              {t("property.enquire")}
            </p>
            <p className="mt-3 font-display text-3xl text-gradient-gold">{formatPrice(p.price)}</p>
            
            {/* Contact Actions */}
            <div className="mt-5 space-y-3">
              {p.agent?.phone && (
                <a
                  href={`tel:${p.agent.phone}`}
                  className="flex w-full items-center justify-center gap-2 rounded-full border border-border py-3 text-sm hover:bg-accent"
                >
                  <Phone className="h-4 w-4" /> Call Agent
                </a>
              )}
              {p.agent?.whatsapp && (
                <a
                  href={`https://wa.me/${p.agent.whatsapp.replace(/[^0-9]/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-full items-center justify-center gap-2 rounded-full bg-green-600 py-3 text-sm font-medium text-white hover:bg-green-700"
                >
                  <MessageCircle className="h-4 w-4" /> WhatsApp
                </a>
              )}
              {p.agent?.telegram && (
                <a
                  href={`https://t.me/${p.agent.telegram.replace("@", "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-full items-center justify-center gap-2 rounded-full bg-blue-500 py-3 text-sm font-medium text-white hover:bg-blue-600"
                >
                  <Send className="h-4 w-4" /> Telegram
                </a>
              )}
            </div>

            {/* Social Links */}
            {p.agent && (
              <div className="mt-5 flex flex-wrap gap-2">
                {p.agent.facebook && (
                  <a
                    href={p.agent.facebook.startsWith("http") ? p.agent.facebook : `https://facebook.com/${p.agent.facebook}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-full border border-border px-3 py-1.5 text-xs hover:bg-accent"
                  >
                    Facebook
                  </a>
                )}
                {p.agent.instagram && (
                  <a
                    href={p.agent.instagram.startsWith("http") ? p.agent.instagram : `https://instagram.com/${p.agent.instagram}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-full border border-border px-3 py-1.5 text-xs hover:bg-accent"
                  >
                    Instagram
                  </a>
                )}
                {p.agent.twitter && (
                  <a
                    href={p.agent.twitter.startsWith("http") ? p.agent.twitter : `https://x.com/${p.agent.twitter}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-full border border-border px-3 py-1.5 text-xs hover:bg-accent"
                  >
                    Twitter
                  </a>
                )}
                {p.agent.website && (
                  <a
                    href={p.agent.website.startsWith("http") ? p.agent.website : `https://${p.agent.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-full border border-border px-3 py-1.5 text-xs hover:bg-accent"
                  >
                    <ExternalLink className="mr-1 inline h-3 w-3" /> Website
                  </a>
                )}
              </div>
            )}

            {/* Enquiry Form */}
            <div className="mt-6 border-t border-border pt-6">
              <div className="space-y-3">
                <input
                  placeholder={t("property.namePlaceholder")}
                  className="w-full rounded-full border border-border bg-background px-4 py-3 text-sm focus:border-gold focus:outline-none"
                />
                <input
                  placeholder={t("property.emailPlaceholder")}
                  className="w-full rounded-full border border-border bg-background px-4 py-3 text-sm focus:border-gold focus:outline-none"
                />
                <textarea
                  rows={3}
                  placeholder={t("property.notePlaceholder")}
                  className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm focus:border-gold focus:outline-none"
                />
              </div>
              <button className="mt-5 w-full rounded-full bg-gradient-gold py-3 text-sm font-medium text-primary-foreground">
                {t("property.requestViewing")}
              </button>
            </div>
          </div>
        </aside>
      </div>

      {/* Mobile sticky deck */}
      <div className="fixed bottom-20 left-3 right-3 z-40 lg:hidden">
        <div className="flex items-center justify-between gap-3 rounded-2xl glass border border-border p-3 shadow-elegant">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
              {t("property.from")}
            </p>
            <p className="font-display text-lg text-gradient-gold">{formatPrice(p.price)}</p>
          </div>
          <div className="flex gap-2">
            {p.agent?.phone && (
              <a href={`tel:${p.agent.phone}`} className="rounded-full border border-border p-3" aria-label="Call">
                <Phone className="h-4 w-4" />
              </a>
            )}
            {p.agent?.whatsapp && (
              <a
                href={`https://wa.me/${p.agent.whatsapp.replace(/[^0-9]/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full bg-green-600 p-3 text-white"
                aria-label="WhatsApp"
              >
                <MessageCircle className="h-4 w-4" />
              </a>
            )}
            <button className="inline-flex items-center gap-2 rounded-full bg-gradient-gold px-4 py-3 text-sm font-medium text-primary-foreground">
              <Calendar className="h-4 w-4" /> {t("property.bookViewing")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
