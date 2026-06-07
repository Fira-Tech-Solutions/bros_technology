import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { AMENITIES, PRICE_BOUNDS, formatPrice } from "@/lib/api/properties";
import { useLocale } from "@/providers/locale";

export type FilterState = {
  priceMin: number;
  priceMax: number;
  beds: number;
  baths: number;
  amenities: string[];
};

export const DEFAULT_FILTERS: FilterState = {
  priceMin: PRICE_BOUNDS.min,
  priceMax: PRICE_BOUNDS.max,
  beds: 0,
  baths: 0,
  amenities: [],
};

export function countActiveFilters(f: FilterState) {
  let n = 0;
  if (f.priceMin > PRICE_BOUNDS.min || f.priceMax < PRICE_BOUNDS.max) n++;
  if (f.beds > 0) n++;
  if (f.baths > 0) n++;
  if (f.amenities.length) n++;
  return n;
}

const BED_OPTIONS = [0, 1, 2, 3, 4, 5];

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

  const toggleAmenity = (a: string) => {
    const has = value.amenities.includes(a);
    patch({ amenities: has ? value.amenities.filter((x) => x !== a) : [...value.amenities, a] });
  };

  return (
    <div className="space-y-8">
      <section>
        <div className="flex items-baseline justify-between">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            {t("filter.price")}
          </p>
          <p className="font-display text-sm text-foreground/90">
            {formatPrice(value.priceMin)} – {formatPrice(value.priceMax)}
          </p>
        </div>
        <div className="mt-5 px-1">
          <Slider
            min={PRICE_BOUNDS.min}
            max={PRICE_BOUNDS.max}
            step={100_000}
            value={[value.priceMin, value.priceMax]}
            onValueChange={([min, max]) => patch({ priceMin: min, priceMax: max })}
          />
        </div>
      </section>

      <section>
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
          {t("filter.bedrooms")}
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {BED_OPTIONS.map((n) => {
            const active = value.beds === n;
            return (
              <button
                key={n}
                onClick={() => patch({ beds: n })}
                className={`min-w-11 rounded-full border px-4 py-2 text-sm transition-colors ${
                  active
                    ? "border-gold bg-gradient-gold text-primary-foreground"
                    : "border-border bg-card text-muted-foreground hover:text-foreground"
                }`}
              >
                {n === 0 ? t("filter.any") : `${n}+`}
              </button>
            );
          })}
        </div>
      </section>

      <section>
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
          {t("filter.bathrooms")}
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {BED_OPTIONS.map((n) => {
            const active = value.baths === n;
            return (
              <button
                key={n}
                onClick={() => patch({ baths: n })}
                className={`min-w-11 rounded-full border px-4 py-2 text-sm transition-colors ${
                  active
                    ? "border-gold bg-gradient-gold text-primary-foreground"
                    : "border-border bg-card text-muted-foreground hover:text-foreground"
                }`}
              >
                {n === 0 ? t("filter.any") : `${n}+`}
              </button>
            );
          })}
        </div>
      </section>

      <section>
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
          {t("filter.amenities")}
        </p>
        <div className="mt-3 grid grid-cols-1 gap-2.5">
          {AMENITIES.map((a) => {
            const checked = value.amenities.includes(a);
            return (
              <label
                key={a}
                className="flex cursor-pointer items-center gap-3 rounded-xl border border-border bg-card/50 px-3 py-2.5 text-sm hover:border-gold/50 transition-colors"
              >
                <Checkbox checked={checked} onCheckedChange={() => toggleAmenity(a)} />
                <span className="text-foreground/90">{a}</span>
              </label>
            );
          })}
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
