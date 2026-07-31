import { useState, useEffect, useRef } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { useTheme } from "@/providers/theme";

type Theme = "light" | "dark";

const IMAGES: Record<Theme, { desktop: string; mobile: string }> = {
  dark: {
    desktop: "/images/bros_desktop_dark_HD.jpg",
    mobile: "/images/bros_mobile_dark_HD.png",
  },
  light: {
    desktop: "/images/bros_desktop_light_HD.jpg",
    mobile: "/images/bros_mobile_light_HD.png",
  },
};

function useImagePreloader(src: string) {
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    setLoaded(false);
    const img = new Image();
    img.src = src;
    img.onload = () => setLoaded(true);
  }, [src]);
  return loaded;
}

function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useTransform(scrollYProgress, [0, 1], [0, 1]);
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) return null;

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 z-[100] h-[2px] origin-left"
      style={{
        scaleX,
        background: "var(--gradient-gold)",
      }}
    />
  );
}

function ScrollArrow() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
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
        <span className="text-[10px] uppercase tracking-[0.3em] text-white/50">Scroll</span>
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          className="text-white/40"
        >
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
  const shouldReduceMotion = useReducedMotion();

  const currentImage = IMAGES[theme];
  const desktopLoaded = useImagePreloader(currentImage.desktop);
  const mobileLoaded = useImagePreloader(currentImage.mobile);
  const isLoaded = desktopLoaded && mobileLoaded;

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  const bgY = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const bgScale = useTransform(scrollYProgress, [0, 1], [1, 1.08]);
  const bgRotateX = useTransform(scrollYProgress, [0, 1], [0, 2]);

  const parallaxStyle = shouldReduceMotion
    ? {}
    : {
        y: bgY,
        scale: bgScale,
        rotateX: bgRotateX,
        transformPerspective: 1000,
      };

  return (
    <>
      <ScrollProgress />

      <section
        ref={heroRef}
        className="relative h-[100svh] overflow-hidden"
        style={{ position: "sticky", top: 0, zIndex: 0 }}
      >
        {/* Image layer */}
        <motion.div className="absolute inset-0 z-0" style={parallaxStyle}>
          {/* Desktop */}
          <picture className="hidden md:block">
            <source srcSet={currentImage.desktop} media="(min-width: 768px)" />
            <img
              src={currentImage.desktop}
              alt="BROS Technology showroom"
              fetchPriority="high"
              className={`h-full w-full object-cover transition-opacity duration-700 ${
                isLoaded ? "opacity-100" : "opacity-0"
              }`}
            />
          </picture>

          {/* Mobile */}
          <picture className="block md:hidden">
            <source srcSet={currentImage.mobile} media="(max-width: 767px)" />
            <img
              src={currentImage.mobile}
              alt="BROS Technology showroom"
              fetchPriority="high"
              className={`h-full w-full object-cover transition-opacity duration-700 ${
                isLoaded ? "opacity-100" : "opacity-0"
              }`}
            />
          </picture>

          {/* LQIP blur-up crossfade */}
          {!isLoaded && (
            <div className="absolute inset-0 z-[1]">
              <img
                src={currentImage.mobile}
                alt=""
                aria-hidden="true"
                className="h-full w-full object-cover scale-110 blur-xl"
                style={{ imageRendering: "auto" }}
              />
            </div>
          )}
        </motion.div>

        {/* Subtle vignette for depth — no text scrim needed */}
        <div
          className="absolute inset-0 z-[1] pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.3) 100%)",
          }}
        />

        <ScrollArrow />
      </section>
    </>
  );
}
