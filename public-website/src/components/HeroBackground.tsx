import { useState, useRef, useEffect } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { useTheme } from "@/providers/theme";
import { heroSources, HERO_LQIP } from "@/lib/hero-images";

function ScrollProgressInner() {
  const { scrollYProgress } = useScroll();
  const scaleX = useTransform(scrollYProgress, [0, 1], [0, 1]);
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) return null;

  return (
    <motion.div
      aria-hidden="true"
      className="fixed top-0 left-0 right-0 z-[100] h-[2px] origin-left"
      style={{ scaleX, background: "var(--gradient-brand)" }}
    />
  );
}

function ScrollProgress() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return <ScrollProgressInner />;
}

function ScrollArrow() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      aria-hidden="true"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1.5, duration: 0.6 }}
      className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2"
    >
      <motion.div
        animate={shouldReduceMotion ? {} : { y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        className="flex flex-col items-center gap-2"
      >
        <span className="text-[10px] uppercase tracking-[0.3em] text-white/60">Scroll</span>
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="text-white/50">
          <path
            d="M10 4v12m0 0l-4-4m4 4l4-4"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </motion.div>
    </motion.div>
  );
}

export function HeroBackground() {
  const { theme } = useTheme();
  const heroRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const shouldReduceMotion = useReducedMotion();
  const [loaded, setLoaded] = useState(false);

  const sources = heroSources(theme);
  const lqip = HERO_LQIP[theme];

  // The hero is server-rendered and preloaded, so the browser usually finishes
  // decoding it before React hydrates and attaches onLoad — that handler then
  // never fires and the placeholder stays up forever. Ask the element directly.
  useEffect(() => {
    const img = imgRef.current;
    if (img?.complete && img.naturalWidth > 0) setLoaded(true);
  }, [theme]);

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  const bgY = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const bgScale = useTransform(scrollYProgress, [0, 1], [1, 1.08]);

  const parallaxStyle = shouldReduceMotion
    ? {}
    : { y: bgY, scale: bgScale, transformPerspective: 1000 };

  return (
    <>
      <ScrollProgress />

      <section
        ref={heroRef}
        aria-label="BROS Technology showroom"
        className="relative h-[100svh] overflow-hidden"
        style={{ position: "sticky", top: 0, zIndex: 0 }}
      >
        <motion.div className="absolute inset-0 z-0" style={parallaxStyle}>
          {/*
            Inline blurred placeholder — costs no request and paints before the
            hero decodes. Faded out by the opacity transition once it lands.
          */}
          <img
            src={lqip.mobile}
            alt=""
            aria-hidden="true"
            className={`absolute inset-0 h-full w-full scale-110 object-cover blur-xl transition-opacity duration-500 md:hidden ${
              loaded ? "opacity-0" : "opacity-100"
            }`}
          />
          <img
            src={lqip.desktop}
            alt=""
            aria-hidden="true"
            className={`absolute inset-0 hidden h-full w-full scale-110 object-cover blur-xl transition-opacity duration-500 md:block ${
              loaded ? "opacity-0" : "opacity-100"
            }`}
          />

          {/*
            One <picture>, so the browser downloads exactly one file: the
            portrait crop under 768px, the landscape crop above it, in the best
            format it supports. Previously both crops were fetched in full.
          */}
          <picture>
            <source
              type="image/avif"
              media="(max-width: 767px)"
              srcSet={sources.mobile.avif}
              sizes="100vw"
            />
            <source
              type="image/webp"
              media="(max-width: 767px)"
              srcSet={sources.mobile.webp}
              sizes="100vw"
            />
            <source media="(max-width: 767px)" srcSet={sources.mobile.fallback} />
            <source type="image/avif" srcSet={sources.desktop.avif} sizes="100vw" />
            <source type="image/webp" srcSet={sources.desktop.webp} sizes="100vw" />
            <img
              ref={imgRef}
              src={sources.desktop.fallback}
              alt=""
              width={sources.desktop.width}
              height={sources.desktop.height}
              fetchPriority="high"
              decoding="async"
              onLoad={() => setLoaded(true)}
              // A broken hero shouldn't leave a permanently blurred screen.
              onError={() => setLoaded(true)}
              className={`relative h-full w-full object-cover transition-opacity duration-700 ${
                loaded ? "opacity-100" : "opacity-0"
              }`}
            />
          </picture>
        </motion.div>

        {/* Subtle vignette for depth */}
        <div
          aria-hidden="true"
          className="absolute inset-0 z-[1] pointer-events-none"
          style={{
            background: "radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.3) 100%)",
          }}
        />

        <ScrollArrow />
      </section>
    </>
  );
}
