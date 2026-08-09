import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useCallback, useEffect, useRef } from "react";
import { ArrowLeft, MapPin, Phone, MessageCircle, Send, Check, X, ChevronLeft, ChevronRight } from "lucide-react";
import { Nav } from "@/components/Nav";
import { ErrorState } from "@/components/ErrorState";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ProductJsonLd } from "@/components/JsonLd";
import { useProperty } from "@/hooks/use-properties";
import { formatPrice, trackInquiryClick, fetchProperty } from "@/lib/api/properties";
import { useLocale } from "@/providers/locale";
import { useSettings, DEFAULT_SETTINGS } from "@/hooks/use-settings";
import { isTelegramMiniApp } from "@/lib/telegram";
import { SITE_URL, absoluteUrl } from "@/lib/env";

export const Route = createFileRoute("/property/$id")({
  // Loads on the server for the initial request so crawlers that don't run JS
  // (Telegram, WhatsApp, Facebook) get real product meta tags in the HTML.
  loader: async ({ params }) => {
    try {
      return { product: await fetchProperty(params.id) };
    } catch {
      return { product: null };
    }
  },
  head: ({ loaderData, params }) => {
    const p = loaderData?.product;
    const url = `${SITE_URL}/property/${params.id}`;

    if (!p) {
      return {
        meta: [{ title: "Product Not Found — BROS Technology" }, { name: "robots", content: "noindex" }],
        links: [{ rel: "canonical", href: url }],
      };
    }

    const title = `${p.title} — ${formatPrice(p.price)} | BROS Technology`;
    const description =
      p.description?.trim() ||
      `Buy ${p.title} at BROS Technology in Addis Ababa, Ethiopia. ${formatPrice(p.price)}. Warranty included.`;
    const image = absoluteUrl(p.hero || p.gallery?.[0] || "/images/hero/desktop-dark-1920.jpg");
    const availability = (p.stockQuantity || 0) > 0 || p.inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock";

    return {
      meta: [
        { title },
        { name: "description", content: description },
        {
          name: "keywords",
          content: [p.title, p.brand, p.category, "Ethiopia", "Addis Ababa", "buy online"]
            .filter(Boolean)
            .join(", "),
        },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "product" },
        { property: "og:url", content: url },
        { property: "og:image", content: image },
        { property: "product:price:amount", content: String(p.price) },
        { property: "product:price:currency", content: "ETB" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: description },
        { name: "twitter:image", content: image },
      ],
      links: [{ rel: "canonical", href: url }],
    };
  },
  component: Detail,
});

function Detail() {
  const { id } = Route.useParams();
  const { product: initialProduct } = Route.useLoaderData();
  const { data, isLoading, isError, refetch } = useProperty(id);
  // Fall back to server-loaded data so the first paint is fully rendered HTML.
  const p = data ?? initialProduct;
  const { t } = useLocale();
  const { data: s = DEFAULT_SETTINGS } = useSettings();

  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const touchStartX = useRef<number | null>(null);

  const openLightbox = (index: number) => setLightboxIndex(index);
  const closeLightbox = () => setLightboxIndex(null);
  const prevImage = useCallback(() => {
    if (lightboxIndex === null || !p) return;
    setLightboxIndex((lightboxIndex - 1 + p.gallery.length) % p.gallery.length);
  }, [lightboxIndex, p]);
  const nextImage = useCallback(() => {
    if (lightboxIndex === null || !p) return;
    setLightboxIndex((lightboxIndex + 1) % p.gallery.length);
  }, [lightboxIndex, p]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) nextImage();
      else prevImage();
    }
    touchStartX.current = null;
  };

  useEffect(() => {
    if (lightboxIndex === null) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") prevImage();
      if (e.key === "ArrowRight") nextImage();
    };
    window.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [lightboxIndex, prevImage, nextImage]);

  const SHOP_TELEGRAM = s.telegramHandle;
  const SHOP_WHATSAPP = s.whatsappNumber.replace(/[^0-9]/g, "");
  const SHOP_PHONES = [s.callNumber1, s.callNumber2];

  const handleInquiry = (method: "telegram" | "whatsapp" | "call") => {
    trackInquiryClick(id, method).catch(() => {});
  };

  if (isLoading && !p) {
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

  const whatsAppMessage = encodeURIComponent(
    `Hi, I'm interested in ${p.title} - ${formatPrice(p.price)}`,
  );

  return (
    <div className="min-h-screen bg-background pb-40 lg:pb-0">
      <ProductJsonLd
        name={p.title}
        price={formatPrice(p.price)}
        image={absoluteUrl(p.hero || p.gallery?.[0] || "/images/hero/desktop-dark-1920.jpg")}
        description={p.description?.trim() || undefined}
        brand={p.brand || undefined}
        condition={p.attributes?.condition || undefined}
        availability={(p.stockQuantity || 0) > 0 || p.inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"}
        url={`${SITE_URL}/property/${id}`}
      />
      <Nav />

      {/* Hero */}
      <section className="relative">
        <motion.div
          initial={{ opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="relative h-[60svh] w-full overflow-hidden lg:h-[80svh]"
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
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 80, damping: 18 }}
              className="flex items-center gap-3"
            >
              <span className="rounded-full glass px-3 py-1 text-xs uppercase tracking-widest text-foreground/90">
                {p.category}
              </span>
              {p.brand && (
                <span className="rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
                  {t("property.brandNew")}
                </span>
              )}
              {p.inStock ? (
                (p.stockQuantity || 0) > 0 && (p.stockQuantity || 0) <= 3 ? (
                  <span className="flex items-center gap-1.5 text-xs text-orange-500 font-semibold">
                    <span className="h-1.5 w-1.5 rounded-full bg-orange-500" />
                    Only {p.stockQuantity} left!
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 text-xs text-green-500">
                    <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                    {p.stockQuantity > 0 ? `${p.stockQuantity} in stock` : t("property.inStock")}
                  </span>
                )
              ) : (
                <span className="flex items-center gap-1.5 text-xs text-red-500">
                  <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                  {t("property.outOfStock")}
                </span>
              )}
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, type: "spring", stiffness: 70, damping: 18 }}
              className="mt-3 font-display text-4xl text-balance md:text-7xl"
            >
              {p.title}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, type: "spring", stiffness: 80, damping: 18 }}
              className="mt-3 font-display text-3xl text-gradient-brand"
            >
              {formatPrice(p.price)}
            </motion.p>
          </div>
        </div>
      </section>

      <div className="mx-auto mt-8 max-w-7xl px-6">
        <Breadcrumbs
          items={[
            { label: "Products", href: "/catalog" },
            ...(p.category
              ? [{ label: p.category, href: "/catalog", search: { category: p.category } }]
              : []),
            { label: p.title },
          ]}
        />
      </div>

      <div className="mx-auto mt-6 max-w-7xl gap-12 px-6 lg:grid lg:grid-cols-[1fr_360px]">
        <div>
          {/* Specs Table */}
          {p.features.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ type: "spring", stiffness: 80, damping: 18 }}
            >
              <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
                {t("property.specs")}
              </p>
              <div className="mt-6 overflow-hidden rounded-2xl border border-border">
                <table className="w-full text-sm">
                  <tbody>
                    {p.features.map((f, i) => {
                      const [label, ...valueParts] = f.split(": ");
                      const value = valueParts.join(": ");
                      return (
                        <tr key={i} className={i % 2 === 0 ? "bg-card/50" : "bg-card"}>
                          <td className="px-5 py-3 font-medium text-foreground/80">{label}</td>
                          <td className="px-5 py-3 text-muted-foreground">{value}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {/* Description */}
          <div className="mt-16">
            <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
              {t("property.description")}
            </p>
            <p className="mt-4 max-w-2xl text-balance text-xl leading-relaxed text-foreground/90 md:text-2xl">
              {p.description}
            </p>
          </div>

          {/* Gallery */}
          {p.gallery.length > 1 && (
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
                    <button
                      type="button"
                      onClick={() => openLightbox(i)}
                      className="h-full w-full cursor-zoom-in"
                    >
                      <img
                        src={src}
                        alt=""
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
                      />
                    </button>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Desktop sticky order sidebar */}
        <aside className="hidden lg:block">
          <div className="sticky top-28 rounded-3xl border border-border bg-card p-6 shadow-elegant">
            <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
              {t("property.orderNow")}
            </p>
            <p className="mt-3 font-display text-3xl text-gradient-brand">{formatPrice(p.price)}</p>

            <div className="mt-6 space-y-3">
              {/* Telegram */}
              <a
                href={`https://t.me/${SHOP_TELEGRAM}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => handleInquiry("telegram")}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-[#0088cc] py-3.5 text-sm font-medium text-white hover:bg-[#006da3] transition-colors"
              >
                <Send className="h-4 w-4" /> {t("property.orderViaTelegram")}
              </a>

              {/* WhatsApp */}
              <a
                href={`https://wa.me/${SHOP_WHATSAPP}?text=${whatsAppMessage}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => handleInquiry("whatsapp")}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-[#25D366] py-3.5 text-sm font-medium text-white hover:bg-[#1da851] transition-colors"
              >
                <MessageCircle className="h-4 w-4" /> {t("property.orderViaWhatsApp")}
              </a>

              {/* Call */}
              <a
                href={`tel:${SHOP_PHONES[0]}`}
                onClick={() => handleInquiry("call")}
                className="flex w-full items-center justify-center gap-2 rounded-full border border-border py-3.5 text-sm font-medium hover:bg-accent transition-colors"
              >
                <Phone className="h-4 w-4" /> {t("property.callToOrder")}
              </a>
            </div>

            <p className="mt-4 text-center text-xs text-muted-foreground">
              {SHOP_PHONES[0]} / {SHOP_PHONES[1]}
            </p>
          </div>
        </aside>
      </div>

      {/* Mobile sticky order bar */}
      {!isTelegramMiniApp() && (
        <div className="fixed bottom-20 left-3 right-3 z-40 lg:hidden">
          <div className="rounded-2xl glass border border-border p-3 shadow-elegant">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                  {t("property.from")}
                </p>
                <p className="font-display text-lg text-gradient-brand">{formatPrice(p.price)}</p>
              </div>
              <div className="flex gap-2">
                <a
                  href={`https://t.me/${SHOP_TELEGRAM}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => handleInquiry("telegram")}
                  className="rounded-full bg-[#0088cc] p-3 text-white"
                  aria-label="Telegram"
                >
                  <Send className="h-4 w-4" />
                </a>
                <a
                  href={`https://wa.me/${SHOP_WHATSAPP}?text=${whatsAppMessage}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => handleInquiry("whatsapp")}
                  className="rounded-full bg-[#25D366] p-3 text-white"
                  aria-label="WhatsApp"
                >
                  <MessageCircle className="h-4 w-4" />
                </a>
                <a
                  href={`tel:${SHOP_PHONES[0]}`}
                  onClick={() => handleInquiry("call")}
                  className="rounded-full border border-border p-3"
                  aria-label="Call"
                >
                  <Phone className="h-4 w-4" />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxIndex !== null && p && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm"
            onClick={closeLightbox}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            {/* Close */}
            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 z-10 rounded-full bg-white/10 p-2 text-white hover:bg-white/20 transition-colors"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Counter */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 rounded-full bg-white/10 px-3 py-1 text-xs text-white/80">
              {lightboxIndex + 1} / {p.gallery.length}
            </div>

            {/* Prev */}
            {p.gallery.length > 1 && (
              <button
                onClick={(e) => { e.stopPropagation(); prevImage(); }}
                className="absolute left-2 top-1/2 -translate-y-1/2 z-10 rounded-full bg-white/10 p-3 text-white hover:bg-white/20 transition-colors md:left-6"
                aria-label="Previous image"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
            )}

            {/* Image */}
            <motion.img
              key={lightboxIndex}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              src={p.gallery[lightboxIndex]}
              alt=""
              className="max-h-[85vh] max-w-[90vw] rounded-lg object-contain select-none"
            />

            {/* Next */}
            {p.gallery.length > 1 && (
              <button
                onClick={(e) => { e.stopPropagation(); nextImage(); }}
                className="absolute right-2 top-1/2 -translate-y-1/2 z-10 rounded-full bg-white/10 p-3 text-white hover:bg-white/20 transition-colors md:right-6"
                aria-label="Next image"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            )}

            {/* Thumbnails */}
            {p.gallery.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex gap-2">
                {p.gallery.map((src, i) => (
                  <button
                    key={i}
                    onClick={(e) => { e.stopPropagation(); setLightboxIndex(i); }}
                    className={`h-12 w-12 overflow-hidden rounded-lg border-2 transition-all ${
                      i === lightboxIndex ? "border-white scale-110" : "border-white/30 opacity-60 hover:opacity-100"
                    }`}
                  >
                    <img src={src} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
