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
}: {
  field: string;
  label: string;
  options: string[];
  value?: string;
  onChange: (field: string, val: string | undefined) => void;
}) {
  return (
    <FilterSection label={label} defaultOpen={false}>
      <select
        value={value || ""}
        onChange={(e) => onChange(field, e.target.value || undefined)}
        className="w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm text-foreground appearance-none cursor-pointer transition-colors hover:border-brand focus:border-brand focus:outline-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236B7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
          backgroundRepeat: "no-repeat",
          backgroundPosition: "right 12px center",
          paddingRight: "36px",
        }}
      >
        <option value="">All</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </FilterSection>
  );
}

function BooleanFilter({
  field,
  label,
  value,
  onChange,
}: {
  field: string;
  label: string;
  value?: boolean;
  onChange: (field: string, val: boolean | undefined) => void;
}) {
  return (
    <FilterSection label={label} defaultOpen={false}>
      <select
        value={value === undefined ? "" : value ? "true" : "false"}
        onChange={(e) => {
          if (e.target.value === "") onChange(field, undefined);
          else onChange(field, e.target.value === "true");
        }}
        className="w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm text-foreground appearance-none cursor-pointer transition-colors hover:border-brand focus:border-brand focus:outline-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236B7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
          backgroundRepeat: "no-repeat",
          backgroundPosition: "right 12px center",
          paddingRight: "36px",
        }}
      >
        <option value="">All</option>
        <option value="true">Yes</option>
        <option value="false">No</option>
      </select>
    </FilterSection>
  );
}

const FILTER_ORDER = [
  "brand",
  "model",
  "condition",
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
  condition: "Condition",
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
}: {
  value: FilterState;
  onChange: (next: FilterState) => void;
  onReset: () => void;
  filterOptions?: FilterOptions;
}) {
  const { t } = useLocale();
  const patch = (p: Partial<FilterState>) => onChange({ ...value, ...p });

  const fields = Object.keys(filterOptions || {});
  const sortedFields = [...fields].sort((a, b) => {
    const ai = FILTER_ORDER.indexOf(a);
    const bi = FILTER_ORDER.indexOf(b);
    return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
  });

  return (
    <div className="space-y-6">
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
        if (rule.type === "boolean") {
          return (
            <BooleanFilter
              key={field}
              field={field}
              label={LABEL_MAP[field] || rule.field}
              value={value[field] as boolean | undefined}
              onChange={(f, val) => patch({ [f]: val })}
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
