import { motion } from "framer-motion";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/providers/theme";

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
      className={`relative flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card transition-colors hover:bg-accent ${className}`}
    >
      <motion.span
        key={theme}
        initial={{ rotate: -90, scale: 0, opacity: 0 }}
        animate={{ rotate: 0, scale: 1, opacity: 1 }}
        exit={{ rotate: 90, scale: 0, opacity: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        className="absolute"
      >
        {isDark ? <Sun className="h-4 w-4 text-brand" /> : <Moon className="h-4 w-4 text-primary" />}
      </motion.span>
    </button>
  );
}
