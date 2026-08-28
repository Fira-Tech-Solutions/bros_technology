import { useState } from "react";
import { Slider } from "@/components/ui/slider";
import { ChevronDown, ChevronUp } from "lucide-react";
import { PRICE_BOUNDS, formatPrice } from "@/lib/api/properties";
import type { FilterOptions } from "@/lib/api/properties";
import { useLocale } from "@/providers/locale";

export type FilterState = {
  priceMin: number;
  priceMax: number;
  [key: string]: string | number | undefined;
};

export const DEFAULT_FILTERS: FilterState = {
  priceMin: PRICE_BOUNDS.min,
  priceMax: PRICE_BOUNDS.max,
};

export function countActiveFilters(f: FilterState) {
  let n = 0;
  if (f.priceMin > PRICE_BOUNDS.min || f.priceMax < PRICE_BOUNDS.max) n++;
  for (const [k, v] of Object.entries(f)) {
    if (k === "priceMin" || k === "priceMax") continue;
    if (v !== undefined && v !== "") n++;
  }
  return n;
}

function FilterSection({
  label,
  children,
  defaultOpen = true,
}: {
  label: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between py-2"
      >
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{label}</p>
        {open ? (
          <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
        )}
      </button>
      {open && <div className="mt-3">{children}</div>}
    </section>
  );
}

function SelectFilter({
  field,
  label,
  options,
  value,
  onChange,
  isOpen,
  onToggle,
}: {
  field: string;
  label: string;
  options: string[];
  value?: string;
  onChange: (field: string, val: string | undefined) => void;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <section>
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between py-2"
      >
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{label}</p>
        {isOpen ? (
          <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
        )}
      </button>
      {isOpen && (
        <div className="mt-2 max-h-48 overflow-y-auto rounded-xl border border-border bg-card">
          <button
            type="button"
            onClick={() => {
              onChange(field, undefined);
              onToggle();
            }}
            className={`flex w-full items-center px-3 py-2.5 text-sm text-left transition-colors ${
              !value ? "bg-brand/10 text-brand font-medium" : "text-foreground hover:bg-accent"
            }`}
          >
            All
          </button>
          {options.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => {
                onChange(field, opt);
                onToggle();
              }}
              className={`flex w-full items-center px-3 py-2.5 text-sm text-left transition-colors border-t border-border ${
                value === opt
                  ? "bg-brand/10 text-brand font-medium"
                  : "text-foreground hover:bg-accent"
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </section>
  );
}

function BooleanFilter({
  field,
  label,
  value,
  onChange,
  isOpen,
  onToggle,
}: {
  field: string;
  label: string;
  value?: boolean;
  onChange: (field: string, val: boolean | undefined) => void;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <section>
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between py-2"
      >
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{label}</p>
        {isOpen ? (
          <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
        )}
      </button>
      {isOpen && (
        <div className="mt-2 max-h-48 overflow-y-auto rounded-xl border border-border bg-card">
          <button
            type="button"
            onClick={() => {
              onChange(field, undefined);
              onToggle();
            }}
            className={`flex w-full items-center px-3 py-2.5 text-sm text-left transition-colors ${
              value === undefined
                ? "bg-brand/10 text-brand font-medium"
                : "text-foreground hover:bg-accent"
            }`}
          >
            All
          </button>
          <button
            type="button"
            onClick={() => {
              onChange(field, true);
              onToggle();
            }}
            className={`flex w-full items-center px-3 py-2.5 text-sm text-left transition-colors border-t border-border ${
              value === true
                ? "bg-brand/10 text-brand font-medium"
                : "text-foreground hover:bg-accent"
            }`}
          >
            Yes
          </button>
          <button
            type="button"
            onClick={() => {
              onChange(field, false);
              onToggle();
            }}
            className={`flex w-full items-center px-3 py-2.5 text-sm text-left transition-colors border-t border-border ${
              value === false
                ? "bg-brand/10 text-brand font-medium"
                : "text-foreground hover:bg-accent"
            }`}
          >
            No
          </button>
        </div>
      )}
    </section>
  );
}

const FILTER_ORDER = [
  "brand",
  "model",
  "storage",
  "ram",
  "color",
  "processor",
  "screenSize",
  "os",
  "gpu",
  "storageType",
  "carrier",
  "connectivity",
  "caseSize",
  "batteryHealth",
  "year",
  "hasWarranty",
  "hasAppleCare",
];

const LABEL_MAP: Record<string, string> = {
  brand: "Brand",
  model: "Model",
  storage: "Storage",
  ram: "RAM",
  color: "Color",
  processor: "Processor",
  screenSize: "Screen Size",
  os: "Operating System",
  gpu: "GPU",
  storageType: "Storage Type",
  carrier: "Carrier",
  connectivity: "Connectivity",
  caseSize: "Case Size",
  batteryHealth: "Battery Health",
  year: "Year",
  hasWarranty: "Warranty",
  hasAppleCare: "Apple Care",
};

export function FilterPanel({
  value,
  onChange,
  onReset,
  filterOptions,
  categories,
  selectedCategory,
  onCategoryChange,
}: {
  value: FilterState;
  onChange: (next: FilterState) => void;
  onReset: () => void;
  filterOptions?: FilterOptions;
  categories?: string[];
  selectedCategory?: string;
  onCategoryChange?: (category: string) => void;
}) {
  const { t } = useLocale();
  const patch = (p: Partial<FilterState>) => onChange({ ...value, ...p });

  const [openFilter, setOpenFilter] = useState<string | null>(null);

  const fields = Object.keys(filterOptions || {});
  const sortedFields = [...fields].sort((a, b) => {
    const ai = FILTER_ORDER.indexOf(a);
    const bi = FILTER_ORDER.indexOf(b);
    return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
  });

  return (
    <div className="space-y-6">
      {/* Category Tabs */}
      {categories && categories.length > 0 && onCategoryChange && (
        <div className="space-y-3">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Category</p>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => {
              const isActive = (selectedCategory || "All") === cat;
              return (
                <button
                  key={cat}
                  onClick={() => onCategoryChange(cat)}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                    isActive
                      ? "bg-brand text-primary-foreground"
                      : "border border-border text-muted-foreground hover:bg-accent hover:text-foreground"
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Price Range */}
      <FilterSection label={t("filter.price")}>
        <div className="flex items-baseline justify-between">
          <p className="font-display text-sm text-foreground/90">
            {formatPrice(value.priceMin)} – {formatPrice(value.priceMax)}
          </p>
        </div>
        <div className="mt-4 px-1">
          <Slider
            min={PRICE_BOUNDS.min}
            max={PRICE_BOUNDS.max}
            step={1000}
            value={[value.priceMin, value.priceMax]}
            onValueChange={([min, max]) => patch({ priceMin: min, priceMax: max })}
          />
        </div>
      </FilterSection>

      {/* Category-specific filters */}
      {sortedFields.map((field) => {
        const rule = filterOptions![field];
        const isOpen = openFilter === field;
        const toggle = () => setOpenFilter(isOpen ? null : field);

        if (rule.type === "boolean") {
          return (
            <BooleanFilter
              key={field}
              field={field}
              label={LABEL_MAP[field] || rule.field}
              value={value[field] as boolean | undefined}
              onChange={(f, val) => patch({ [f]: val })}
              isOpen={isOpen}
              onToggle={toggle}
            />
          );
        }

        if (rule.type === "select" && rule.options?.length) {
          return (
            <SelectFilter
              key={field}
              field={field}
              label={LABEL_MAP[field] || rule.field}
              options={rule.options}
              value={value[field] as string | undefined}
              onChange={(f, val) => patch({ [f]: val })}
              isOpen={isOpen}
              onToggle={toggle}
            />
          );
        }

        if (rule.type === "string" && rule.options?.length) {
          return (
            <SelectFilter
              key={field}
              field={field}
              label={LABEL_MAP[field] || rule.field}
              options={rule.options}
              value={value[field] as string | undefined}
              onChange={(f, val) => patch({ [f]: val })}
              isOpen={isOpen}
              onToggle={toggle}
            />
          );
        }

        return null;
      })}

      <button
        onClick={onReset}
        className="w-full rounded-full border border-border py-2.5 text-sm text-muted-foreground hover:text-foreground hover:border-brand transition-colors"
      >
        {t("filter.resetAll")}
      </button>
    </div>
  );
}
