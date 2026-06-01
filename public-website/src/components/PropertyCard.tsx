import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import type { Property } from "@/lib/api/properties";
import { formatPrice } from "@/lib/api/properties";
import { Bed, Bath, Maximize2 } from "lucide-react";

export function PropertyCard({ p, index = 0 }: { p: Property; index?: number }) {
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
        className="group block overflow-hidden rounded-2xl bg-card border border-border shadow-elegant"
      >
        <div className="relative aspect-[4/3] overflow-hidden">
          <img
            src={p.hero}
            alt={p.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
          <span className="absolute left-4 top-4 rounded-full glass px-3 py-1 text-xs uppercase tracking-widest text-foreground/90">
            {p.category}
          </span>
          <div className="absolute bottom-4 left-4 right-4">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">{p.location}</p>
            <h3 className="font-display text-2xl text-foreground">{p.title}</h3>
          </div>
        </div>
        <div className="flex items-center justify-between p-5">
          <div className="flex gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5"><Bed className="h-3.5 w-3.5" />{p.beds}</span>
            <span className="flex items-center gap-1.5"><Bath className="h-3.5 w-3.5" />{p.baths}</span>
            <span className="flex items-center gap-1.5"><Maximize2 className="h-3.5 w-3.5" />{p.area.toLocaleString()} ft²</span>
          </div>
          <span className="text-gradient-gold font-display text-lg">{formatPrice(p.price)}</span>
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
