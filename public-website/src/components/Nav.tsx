import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Search, Home, LayoutGrid, Phone, MapPin } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguagePicker } from "@/components/LanguagePicker";
import { useLocale } from "@/providers/locale";
import { isTelegramMiniApp } from "@/lib/telegram";
import { useSettings, DEFAULT_SETTINGS } from "@/hooks/use-settings";

export function Nav() {
  const { t } = useLocale();
  const { data: s = DEFAULT_SETTINGS } = useSettings();
  if (isTelegramMiniApp()) return null;

  const mapLabel = s.shopMapAddress || s.location;

  return (
    <>
      {/* Desktop top nav */}
      <motion.header
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 80, damping: 16 }}
        className="fixed top-0 z-50 hidden w-full md:block"
      >
        <div className="mx-auto mt-4 flex max-w-7xl items-center justify-between rounded-full glass px-6 py-3">
          <Link to="/" className="font-display text-xl tracking-wide">
            BROS<span className="text-gradient-gold"> Technology</span>
          </Link>
          <nav className="flex items-center gap-8 text-sm">
            <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">
              {t("nav.home")}
            </Link>
            <Link
              to="/catalog"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              {t("nav.catalog")}
            </Link>
            <a
              href="#contact"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              {t("nav.contact")}
            </a>
            {s.shopGoogleMapUrl && (
              <a
                href={s.shopGoogleMapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-muted-foreground hover:text-gold transition-colors"
              >
                <MapPin className="h-3.5 w-3.5" />
                <span>{mapLabel}</span>
              </a>
            )}
          </nav>
          <div className="flex items-center gap-2">
            <LanguagePicker />
            <ThemeToggle />
            <Link
              to="/catalog"
              className="inline-flex items-center gap-2 rounded-full bg-gradient-gold px-4 py-2 text-sm font-medium text-primary-foreground"
            >
              <Search className="h-4 w-4" /> {t("nav.discover")}
            </Link>
          </div>
        </div>
      </motion.header>

      {/* Mobile top brand */}
      <div className="fixed top-0 z-50 flex w-full items-center justify-between px-5 py-4 md:hidden glass">
        <Link to="/" className="font-display text-xl">
          BROS<span className="text-gradient-gold"> Technology</span>
        </Link>
        <div className="flex items-center gap-2">
          <LanguagePicker />
          <ThemeToggle />
          <Link
            to="/catalog"
            className="rounded-full bg-gradient-gold px-3 py-1.5 text-xs font-medium text-primary-foreground"
          >
            {t("nav.discover")}
          </Link>
        </div>
      </div>

      {/* Mobile bottom dock */}
      <nav className="fixed bottom-4 left-1/2 z-50 flex -translate-x-1/2 items-center gap-1 rounded-full glass border border-border px-2 py-2 md:hidden">
        <DockLink to="/" icon={<Home className="h-5 w-5" />} label={t("nav.home")} />
        <DockLink
          to="/catalog"
          icon={<LayoutGrid className="h-5 w-5" />}
          label={t("nav.catalog")}
        />
        <a
          href="#contact"
          className="flex flex-col items-center gap-0.5 rounded-full px-4 py-1.5 text-[10px] text-muted-foreground"
        >
          <Phone className="h-5 w-5" /> {t("nav.contact")}
        </a>
        {s.shopGoogleMapUrl && (
          <a
            href={s.shopGoogleMapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center gap-0.5 rounded-full px-4 py-1.5 text-[10px] text-muted-foreground"
          >
            <MapPin className="h-5 w-5" /> Map
          </a>
        )}
      </nav>
    </>
  );
}

function DockLink({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) {
  return (
    <Link
      to={to}
      activeOptions={{ exact: to === "/" }}
      activeProps={{ className: "bg-accent text-foreground" }}
      className="flex flex-col items-center gap-0.5 rounded-full px-4 py-1.5 text-[10px] text-muted-foreground transition-colors"
    >
      {icon}
      {label}
    </Link>
  );
}
