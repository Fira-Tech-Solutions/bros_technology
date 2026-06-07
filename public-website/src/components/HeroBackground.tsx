import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocale } from "@/providers/locale";

const images = [
  {
    src: "/images/aba-geda.jpg",
    titleKey: "hero.bg.abaGeda.title" as const,
    descKey: "hero.bg.abaGeda.description" as const,
  },
  {
    src: "/images/posta.jpg",
    titleKey: "hero.bg.posta.title" as const,
    descKey: "hero.bg.posta.description" as const,
  },
];

export function HeroBackground() {
  const [current, setCurrent] = useState(0);
  const { t } = useLocale();

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % images.length);
  }, []);

  useEffect(() => {
    const timer = setInterval(next, 6000);
    return () => clearInterval(timer);
  }, [next]);

  return (
    <div className="absolute inset-0 z-0 overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 1.2, ease: "easeInOut" }}
          className="absolute inset-0"
        >
          <img
            src={images[current].src}
            alt={t(images[current].titleKey)}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-black/40" />
        </motion.div>
      </AnimatePresence>

      <div className="absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 gap-3">
        {images.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`h-2 rounded-full transition-all duration-300 ${
              i === current ? "w-8 bg-gold" : "w-2 bg-white/40 hover:bg-white/60"
            }`}
            aria-label={`Slide ${i + 1}`}
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="absolute bottom-16 left-6 z-10 max-w-xs text-white/80 md:left-12"
        >
          <p className="text-xs uppercase tracking-[0.2em] text-gold">
            {t(images[current].titleKey)}
          </p>
          <p className="mt-1 text-sm text-white/60">
            {t(images[current].descKey)}
          </p>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
