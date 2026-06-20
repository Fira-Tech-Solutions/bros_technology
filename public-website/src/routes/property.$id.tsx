import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowLeft, Bed, Bath, Maximize2, MapPin, Phone, Calendar, Check, MessageCircle, Globe, Send } from "lucide-react";
import { Nav } from "@/components/Nav";
import { ErrorState } from "@/components/ErrorState";
import { useProperty } from "@/hooks/use-properties";
import { formatPrice } from "@/lib/api/properties";
import { useLocale } from "@/providers/locale";

const SOCIAL_ICONS: Record<string, { svg: string; color: string; label: string; baseUrl: string }> = {
  phone: { svg: "M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z", color: "#25D366", label: "Call", baseUrl: "tel:" },
  whatsapp: { svg: "M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z", color: "#25D366", label: "WhatsApp", baseUrl: "https://wa.me/" },
  telegram: { svg: "M21.198 2.433a2.242 2.242 0 00-1.022.215l-17.12 6.734a1.1 1.1 0 00.042 2.098l4.357 1.408 1.837 5.743a.8.8 0 001.36.38l2.178-1.758 4.014 2.965a1.1 1.1 0 001.718-.536l3.38-15.693a1.1 1.1 0 00-1.377-1.314z", color: "#0088cc", label: "Telegram", baseUrl: "https://t.me/" },
  facebook: { svg: "M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z", color: "#1877F2", label: "Facebook", baseUrl: "https://facebook.com/" },
  instagram: { svg: "M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 01-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 017.8 2m-.2 2A3.6 3.6 0 004 7.6v8.8C4 18.39 5.61 20 7.6 20h8.8a3.6 3.6 0 003.6-3.6V7.6C20 5.61 18.39 4 16.4 4H7.6m9.65 1.5a1.25 1.25 0 110 2.5 1.25 1.25 0 010-2.5M12 7a5 5 0 110 10 5 5 0 010-10m0 2a3 3 0 100 6 3 3 0 000-6z", color: "#E4405F", label: "Instagram", baseUrl: "https://instagram.com/" },
  twitter: { svg: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z", color: "#000000", label: "X / Twitter", baseUrl: "https://x.com/" },
  tiktok: { svg: "M16.6 5.82s.51.5 0 0A4.278 4.278 0 0115.54 3h-3.09v12.4a2.592 2.592 0 01-2.59 2.5c-1.42 0-2.6-1.16-2.6-2.6 0-1.72 1.66-3.01 3.37-2.48V9.66c-3.45-.46-6.47 2.22-6.47 5.64 0 3.33 2.76 5.7 5.69 5.7 3.14 0 5.69-2.55 5.69-5.7V9.01a7.35 7.35 0 004.3 1.38V7.3s-1.88.09-3.24-1.48z", color: "#000000", label: "TikTok", baseUrl: "https://tiktok.com/@" },
  youtube: { svg: "M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z", color: "#FF0000", label: "YouTube", baseUrl: "https://youtube.com/" },
  linkedin: { svg: "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z", color: "#0A66C2", label: "LinkedIn", baseUrl: "https://linkedin.com/in/" },
  website: { svg: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z", color: "#6B7280", label: "Website", baseUrl: "https://" },
};

type SocialLink = { key: string; value: string; svg: string; color: string; label: string; baseUrl: string };

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
                    className="h-14 w-14 rounded-full object-cover ring-2 ring-gold/30"
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
            
            {/* Primary Contact Actions */}
            <div className="mt-5 space-y-3">
              {p.agent?.phone && (
                <a
                  href={`tel:${p.agent.phone}`}
                  className="flex w-full items-center justify-center gap-2 rounded-full border border-border py-3 text-sm hover:bg-accent transition-colors"
                >
                  <Phone className="h-4 w-4" /> Call Agent
                </a>
              )}
              {p.agent?.whatsapp && (
                <a
                  href={`https://wa.me/${p.agent.whatsapp.replace(/[^0-9]/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-full items-center justify-center gap-2 rounded-full bg-green-600 py-3 text-sm font-medium text-white hover:bg-green-700 transition-colors"
                >
                  <MessageCircle className="h-4 w-4" /> WhatsApp
                </a>
              )}
              {p.agent?.telegram && (
                <a
                  href={`https://t.me/${p.agent.telegram.replace("@", "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-full items-center justify-center gap-2 rounded-full bg-blue-500 py-3 text-sm font-medium text-white hover:bg-blue-600 transition-colors"
                >
                  <Send className="h-4 w-4" /> Telegram
                </a>
              )}
            </div>

            {/* Dynamic Social Links */}
            {(() => {
              const socials = [
                p.agent?.facebook && { key: "facebook", value: p.agent.facebook, ...SOCIAL_ICONS.facebook },
                p.agent?.instagram && { key: "instagram", value: p.agent.instagram, ...SOCIAL_ICONS.instagram },
                p.agent?.twitter && { key: "twitter", value: p.agent.twitter, ...SOCIAL_ICONS.twitter },
                p.agent?.tiktok && { key: "tiktok", value: p.agent.tiktok, ...SOCIAL_ICONS.tiktok },
                p.agent?.youtube && { key: "youtube", value: p.agent.youtube, ...SOCIAL_ICONS.youtube },
                p.agent?.linkedin && { key: "linkedin", value: p.agent.linkedin, ...SOCIAL_ICONS.linkedin },
              p.agent?.website && { key: "website", value: p.agent.website, ...SOCIAL_ICONS.website },
              ...(p.agent?.customSocials || []).map((c, i) => ({
                key: `custom-${i}`,
                value: c.link,
                svg: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z",
                color: "#6B7280",
                label: c.platform,
                baseUrl: "https://",
              })),
              ].filter((x): x is SocialLink => !!x);

              if (socials.length === 0) return null;

              return (
                <div className="mt-5 border-t border-border pt-5">
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-3">Connect</p>
                  <div className="flex flex-wrap gap-2">
                    {socials.map((s) => (
                      <a
                        key={s!.key}
                        href={s!.value.startsWith("http") ? s!.value : `${s!.baseUrl}${s!.value.replace("@", "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex items-center gap-2 rounded-full border border-border px-3 py-1.5 text-xs transition-all hover:scale-105 hover:shadow-md"
                        style={{ borderColor: `${s!.color}40` }}
                      >
                        <svg
                          className="h-3.5 w-3.5 transition-transform group-hover:scale-110"
                          viewBox="0 0 24 24"
                          fill={s!.color}
                        >
                          <path d={s!.svg} />
                        </svg>
                        <span className="font-medium" style={{ color: s!.color }}>{s!.label}</span>
                      </a>
                    ))}
                  </div>
                </div>
              );
            })()}

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
        <div className="rounded-2xl glass border border-border p-3 shadow-elegant">
          <div className="flex items-center justify-between gap-3">
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

          {/* Mobile Social Links */}
          {(() => {
            const socials = [
              p.agent?.facebook && { key: "facebook", value: p.agent.facebook, ...SOCIAL_ICONS.facebook },
              p.agent?.instagram && { key: "instagram", value: p.agent.instagram, ...SOCIAL_ICONS.instagram },
              p.agent?.twitter && { key: "twitter", value: p.agent.twitter, ...SOCIAL_ICONS.twitter },
              p.agent?.tiktok && { key: "tiktok", value: p.agent.tiktok, ...SOCIAL_ICONS.tiktok },
              p.agent?.youtube && { key: "youtube", value: p.agent.youtube, ...SOCIAL_ICONS.youtube },
              p.agent?.linkedin && { key: "linkedin", value: p.agent.linkedin, ...SOCIAL_ICONS.linkedin },
              p.agent?.website && { key: "website", value: p.agent.website, ...SOCIAL_ICONS.website },
            ].filter((x): x is SocialLink => !!x);

            if (socials.length === 0) return null;

            return (
              <div className="mt-3 flex flex-wrap gap-2 border-t border-border/50 pt-3">
                {socials.map((s) => (
                  <a
                    key={s!.key}
                    href={s!.value.startsWith("http") ? s!.value : `${s!.baseUrl}${s!.value.replace("@", "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 rounded-full border border-border px-2.5 py-1 text-[11px] transition-all hover:scale-105"
                    style={{ borderColor: `${s!.color}40` }}
                  >
                    <svg
                      className="h-3 w-3"
                      viewBox="0 0 24 24"
                      fill={s!.color}
                    >
                      <path d={s!.svg} />
                    </svg>
                    <span className="font-medium" style={{ color: s!.color }}>{s!.label}</span>
                  </a>
                ))}
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
}
