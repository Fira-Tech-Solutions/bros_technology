import { env } from "@/lib/env";

const API_BASE = env.API_URL;

export type Category = {
  id: string;
  name: string;
  displayName: string;
  icon: string;
};

export type Property = {
  id: string;
  title: string;
  price: number;
  inStock: boolean;
  brand: string;
  category: string;
  tags: string[];
  hero: string;
  gallery: string[];
  description: string;
  features: string[];
};

export type PropertyFilters = {
  category?: string;
  q?: string;
  priceMin?: number;
  priceMax?: number;
  limit?: string;
};

export async function fetchProperties(params?: PropertyFilters): Promise<Property[]> {
  const searchParams = new URLSearchParams();
  if (params?.category && params.category !== "All") searchParams.set("category", params.category);
  if (params?.q) searchParams.set("q", params.q);
  if (typeof params?.priceMin === "number") searchParams.set("priceMin", String(params.priceMin));
  if (typeof params?.priceMax === "number") searchParams.set("priceMax", String(params.priceMax));
  if (params?.limit) searchParams.set("limit", params.limit);

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

export const PRICE_BOUNDS = { min: 0, max: 5_000_000 } as const;

export const formatPrice = (n: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "ETB",
    maximumFractionDigits: 0,
  }).format(n);

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
