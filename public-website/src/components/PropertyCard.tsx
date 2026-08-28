import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Star, Flame, Sparkles, Tag } from "lucide-react";
import type { Property } from "@/lib/api/properties";
import { formatPrice } from "@/lib/api/properties";
import { useLocale } from "@/providers/locale";

export function PropertyCard({ p, index = 0 }: { p: Property; index?: number }) {
  const { t } = useLocale();

  const isBestSeller = p.isBestSeller || p.priority === "BEST_SELLER";
  const isTopPriority = p.priority === "TOP_PRIORITY" || p.isFeatured;
  const isHotDeal = p.isHotDeal || p.priority === "HOT_DEAL" || (p.discountPercent && p.discountPercent >= 10);
  const hasDiscount = (p.originalPrice && p.originalPrice > p.price) || (p.discountPercent && p.discountPercent > 0);

  // Determine glow styling
  const glowClass = isBestSeller
    ? "priority-gold-glow card-light-sweep"
    : isTopPriority
    ? "priority-cyan-glow card-light-sweep"
    : isHotDeal
    ? "priority-hot-glow card-light-sweep"
    : "";

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ type: "spring", stiffness: 90, damping: 18, delay: index * 0.05 }}
    >
      <Link
        to="/property/$id"
        params={{ id: p.id }}
        className={`group block overflow-hidden rounded-2xl bg-card border border-border shadow-elegant transition-all duration-300 ${glowClass}`}
      >
        <div className="relative aspect-[4/3] overflow-hidden">
          <img
            src={p.hero}
            alt={p.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/85 via-background/20 to-transparent" />

          {/* Top-Left: Category Badge */}
          <span className="absolute left-3.5 top-3.5 rounded-full glass px-3 py-1 text-xs uppercase tracking-widest text-foreground/90 font-medium z-10 backdrop-blur-md">
            {p.category}
          </span>

          {/* Top-Right: Marketing / Priority Decorated Badge */}
          {(p.badge || isBestSeller || isTopPriority || hasDiscount) && (
            <div className="absolute right-3.5 top-3.5 z-10 flex flex-col items-end gap-1.5">
              {isBestSeller && (
                <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold tracking-wide text-amber-950 bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-300 shadow-md badge-shimmer">
                  <Star className="h-3.5 w-3.5 fill-amber-950 text-amber-950" />
                  {p.badge || "Best Seller"}
                </span>
              )}

              {!isBestSeller && isTopPriority && (
                <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold tracking-wide text-white bg-gradient-to-r from-cyan-500 via-sky-400 to-blue-600 shadow-md badge-shimmer">
                  <Sparkles className="h-3.5 w-3.5 fill-white text-white" />
                  {p.badge || "Top Choice"}
                </span>
              )}

              {!isBestSeller && !isTopPriority && hasDiscount && (
                <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold tracking-wide text-white bg-gradient-to-r from-red-500 via-rose-500 to-orange-500 shadow-md badge-shimmer animate-pulse">
                  <Flame className="h-3.5 w-3.5 fill-white text-white" />
                  {p.discountPercent ? `${p.discountPercent}% OFF` : p.badge || "Special Offer"}
                </span>
              )}

              {!isBestSeller && !isTopPriority && !hasDiscount && p.badge && (
                <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold tracking-wide text-white bg-brand shadow-md">
                  <Tag className="h-3.5 w-3.5" />
                  {p.badge}
                </span>
              )}
            </div>
          )}

          {/* Bottom Overlay Title & Brand */}
          <div className="absolute bottom-3.5 left-3.5 right-3.5 z-10">
            <h3 className="font-display text-xl sm:text-2xl text-foreground font-semibold line-clamp-1 leading-snug drop-shadow-sm">
              {p.title}
            </h3>
            {p.brand && <p className="text-xs text-muted-foreground font-medium mt-0.5">{p.brand}</p>}
          </div>
        </div>

        {/* Card Footer: Stock & Price / Discount Display */}
        <div className="flex items-center justify-between p-4 sm:p-5">
          <div className="flex items-center gap-2">
            {p.inStock ? (
              (p.stockQuantity || 0) > 0 && (p.stockQuantity || 0) <= 3 ? (
                <span className="flex items-center gap-1.5 text-xs text-orange-500 font-semibold">
                  <span className="h-1.5 w-1.5 rounded-full bg-orange-500 animate-ping" />
                  Only {p.stockQuantity} left!
                </span>
              ) : (
                <span className="flex items-center gap-1.5 text-xs text-green-500 font-medium">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                  {p.stockQuantity > 0 ? `${p.stockQuantity} in stock` : t("property.inStock")}
                </span>
              )
            ) : (
              <span className="flex items-center gap-1.5 text-xs text-red-500 font-medium">
                <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                {t("property.outOfStock")}
              </span>
            )}
          </div>

          {/* Price with Strikethrough Discount Ad if available */}
          <div className="flex flex-col items-end">
            {p.originalPrice && p.originalPrice > p.price && (
              <span className="text-xs text-muted-foreground line-through font-sans">
                {formatPrice(p.originalPrice)}
              </span>
            )}
            <span className="text-gradient-brand font-display text-lg sm:text-xl font-bold">
              {formatPrice(p.price)}
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export function PropertyCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl bg-card border border-border">
      <div className="aspect-[4/3] animate-pulse bg-muted" />
      <div className="space-y-2 p-5">
        <div className="h-3 w-1/3 animate-pulse rounded bg-muted" />
        <div className="h-5 w-2/3 animate-pulse rounded bg-muted" />
      </div>
    </div>
  );
}
