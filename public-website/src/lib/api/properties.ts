import { env } from "@/lib/env";

const API_BASE = env.API_URL;

export type SchemaRule = {
  field: string;
  type: "string" | "number" | "select" | "boolean";
  required?: boolean;
  options?: string[];
};

export type Category = {
  id: string;
  name: string;
  displayName: string;
  icon: string;
  schemaRules?: SchemaRule[];
};

export type Property = {
  id: string;
  title: string;
  price: number;
  originalPrice?: number | null;
  discountPercent?: number | null;
  isFeatured?: boolean;
  isBestSeller?: boolean;
  isHotDeal?: boolean;
  priority?: "TOP_PRIORITY" | "BEST_SELLER" | "HOT_DEAL" | "FEATURED" | "NORMAL";
  badge?: string | null;
  promoNote?: string | null;
  inStock: boolean;
  stockQuantity: number;
  brand: string;
  category: string;
  categoryId: string;
  attributes: Record<string, unknown>;
  tags: string[];
  hero: string;
  gallery: string[];
  description: string;
  features: string[];
  createdAt?: string;
};

export type PropertyFilters = {
  category?: string;
  q?: string;
  priceMin?: number;
  priceMax?: number;
  brand?: string;
  storage?: string;
  ram?: string;
  color?: string;
  processor?: string;
  screenSize?: string;
  os?: string;
  model?: string;
  connectivity?: string;
  caseSize?: string;
  limit?: string;
};

export type FilterOptions = Record<string, SchemaRule & { options: string[] }>;

export async function fetchProperties(params?: PropertyFilters): Promise<Property[]> {
  const searchParams = new URLSearchParams();
  if (params?.category && params.category !== "All") searchParams.set("category", params.category);
  if (params?.q) searchParams.set("q", params.q);
  if (typeof params?.priceMin === "number") searchParams.set("priceMin", String(params.priceMin));
  if (typeof params?.priceMax === "number") searchParams.set("priceMax", String(params.priceMax));
  if (params?.brand) searchParams.set("brand", params.brand);
  if (params?.storage) searchParams.set("storage", params.storage);
  if (params?.ram) searchParams.set("ram", params.ram);
  if (params?.color) searchParams.set("color", params.color);
  if (params?.processor) searchParams.set("processor", params.processor);
  if (params?.screenSize) searchParams.set("screenSize", params.screenSize);
  if (params?.os) searchParams.set("os", params.os);
  if (params?.model) searchParams.set("model", params.model);
  if (params?.connectivity) searchParams.set("connectivity", params.connectivity);
  if (params?.caseSize) searchParams.set("caseSize", params.caseSize);
  if (params?.limit) searchParams.set("limit", params.limit);
  else searchParams.set("limit", "300");

  const qs = searchParams.toString();
  const url = `${API_BASE}/api/public/listings${qs ? `?${qs}` : ""}`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch products: ${res.status}`);

  const json = await res.json();
  return json.data || [];
}

export async function fetchProperty(id: string): Promise<Property | null> {
  const res = await fetch(`${API_BASE}/api/public/listings/${id}`);
  if (!res.ok) return null;

  const json = await res.json();
  return json.data || null;
}

export async function trackInquiryClick(
  id: string,
  method: "telegram" | "whatsapp" | "call",
): Promise<void> {
  await fetch(`${API_BASE}/api/public/listings/${id}/inquiry`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ method }),
  });
}

export const PRICE_BOUNDS = { min: 0, max: 500_000 } as const;

export const formatPrice = (n: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "ETB",
    maximumFractionDigits: 0,
  }).format(n);

export function optimizeImageUrl(
  url: string,
  options?: { width?: number; quality?: number },
): string {
  if (!url || !url.includes("res.cloudinary.com")) return url;

  const parts = url.split("/upload/");
  if (parts.length !== 2) return url;

  const transformations = [
    "f_auto",
    "q_auto",
    options?.width ? `w_${options.width}` : null,
    options?.quality ? `q_${options.quality}` : null,
  ]
    .filter(Boolean)
    .join(",");

  return `${parts[0]}/upload/${transformations}/${parts[1]}`;
}

const ICON_MAP: Record<string, string> = {
  smartphone: "Smartphone",
  laptop: "Laptop",
  headphones: "Headphones",
  watch: "Watch",
  tablet: "Tablet",
  tag: "Tag",
};

export function getIconName(icon: string): string {
  return ICON_MAP[icon] || "Tag";
}

export async function fetchCategories(): Promise<Category[]> {
  const res = await fetch(`${API_BASE}/api/categories`);
  if (!res.ok) return [];

  const json = await res.json();
  return json.data || [];
}

export async function fetchFilterOptions(category?: string): Promise<FilterOptions> {
  if (!category || category === "All") return {};

  const searchParams = new URLSearchParams();
  searchParams.set("category", category);

  const res = await fetch(`${API_BASE}/api/public/filter-options?${searchParams.toString()}`);
  if (!res.ok) return {};

  const json = await res.json();
  return json.data || {};
}
