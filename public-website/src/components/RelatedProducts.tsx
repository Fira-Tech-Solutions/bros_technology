import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { fetchProperties, formatPrice, type Property } from "@/lib/api/properties";
import { useLocale } from "@/providers/locale";

export function RelatedProducts({ currentId, category }: { currentId: string; category: string }) {
  const { t } = useLocale();
  const [products, setProducts] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!category) {
      setLoading(false);
      return;
    }

    setLoading(true);
    fetchProperties({ category, limit: "7" })
      .then((all) => {
        const related = all.filter((p) => p.id !== currentId).slice(0, 6);
        setProducts(related);
      })
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [currentId, category]);

  if (loading || products.length === 0) return null;

  return (
    <section className="mt-16 border-t border-border pt-16">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
            {t("related.badge")}
          </p>
          <h2 className="mt-2 font-display text-2xl md:text-3xl">
            {t("related.title", { category })}
          </h2>
        </div>
        <Link to="/catalog" search={{ category }} className="text-sm text-brand hover:underline">
          {t("related.viewAll")}
        </Link>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 md:gap-6">
        {products.map((p, i) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{
              type: "spring",
              stiffness: 80,
              damping: 18,
              delay: i * 0.08,
            }}
          >
            <Link
              to="/property/$id"
              params={{ id: p.id }}
              className="group block overflow-hidden rounded-2xl border border-border bg-card transition-colors hover:border-brand"
            >
              <div className="aspect-square overflow-hidden">
                <img
                  src={p.hero}
                  alt={p.title}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="p-3 md:p-4">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                  {p.brand || p.category}
                </p>
                <h3 className="mt-1 text-sm font-medium line-clamp-2 md:text-base">{p.title}</h3>
                <p className="mt-2 font-display text-base text-gradient-brand md:text-lg">
                  {formatPrice(p.price)}
                </p>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
