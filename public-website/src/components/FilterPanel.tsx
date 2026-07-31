import { Slider } from "@/components/ui/slider";
import { PRICE_BOUNDS, formatPrice } from "@/lib/api/properties";
import { useLocale } from "@/providers/locale";

export type FilterState = {
  priceMin: number;
  priceMax: number;
};

export const DEFAULT_FILTERS: FilterState = {
  priceMin: PRICE_BOUNDS.min,
  priceMax: PRICE_BOUNDS.max,
};

export function countActiveFilters(f: FilterState) {
  let n = 0;
  if (f.priceMin > PRICE_BOUNDS.min || f.priceMax < PRICE_BOUNDS.max) n++;
  return n;
}

export function FilterPanel({
  value,
  onChange,
  onReset,
}: {
  value: FilterState;
  onChange: (next: FilterState) => void;
  onReset: () => void;
}) {
  const { t } = useLocale();
  const patch = (p: Partial<FilterState>) => onChange({ ...value, ...p });

  return (
    <div className="space-y-8">
      <section>
        <div className="flex items-baseline justify-between">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            {t("filter.price")}
          </p>
          <p className="font-display text-sm text-foreground/90">
            {formatPrice(value.priceMin)} \u2013 {formatPrice(value.priceMax)}
          </p>
        </div>
        <div className="mt-5 px-1">
          <Slider
            min={PRICE_BOUNDS.min}
            max={PRICE_BOUNDS.max}
            step={1000}
            value={[value.priceMin, value.priceMax]}
            onValueChange={([min, max]) => patch({ priceMin: min, priceMax: max })}
          />
        </div>
      </section>

      <button
        onClick={onReset}
        className="w-full rounded-full border border-border py-2.5 text-sm text-muted-foreground hover:text-foreground hover:border-gold transition-colors"
      >
        {t("filter.resetAll")}
      </button>
    </div>
  );
}
