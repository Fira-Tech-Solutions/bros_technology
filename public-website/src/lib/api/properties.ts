const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

export type Property = {
  id: string;
  title: string;
  location: string;
  price: number;
  beds: number;
  baths: number;
  area: number;
  category: string;
  tags: string[];
  hero: string;
  gallery: string[];
  description: string;
  coords: { lat: number; lng: number };
  features: string[];
};

export type PropertyFilters = {
  category?: string;
  q?: string;
  priceMin?: number;
  priceMax?: number;
  beds?: number;
  baths?: number;
  amenities?: string[];
};

export async function fetchProperties(params?: PropertyFilters): Promise<Property[]> {
  const searchParams = new URLSearchParams();
  if (params?.category && params.category !== "All") searchParams.set("category", params.category);
  if (params?.q) searchParams.set("q", params.q);
  if (typeof params?.priceMin === "number") searchParams.set("priceMin", String(params.priceMin));
  if (typeof params?.priceMax === "number") searchParams.set("priceMax", String(params.priceMax));
  if (params?.beds) searchParams.set("beds", String(params.beds));
  if (params?.baths) searchParams.set("baths", String(params.baths));
  if (params?.amenities?.length) searchParams.set("amenities", params.amenities.join(","));

  const qs = searchParams.toString();
  const url = `${API_BASE}/api/public/listings${qs ? `?${qs}` : ""}`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch properties: ${res.status}`);

  const json = await res.json();
  return json.data || [];
}

export async function fetchProperty(id: string): Promise<Property | null> {
  const res = await fetch(`${API_BASE}/api/public/listings/${id}`);
  if (!res.ok) return null;

  const json = await res.json();
  return json.data || null;
}

export async function fetchCategories(): Promise<string[]> {
  const res = await fetch(`${API_BASE}/api/categories`);
  if (!res.ok) return ["All"];

  const json = await res.json();
  const cats = (json.data || []).map((c: { displayName: string }) => c.displayName);
  return ["All", ...cats];
}

export const CATEGORIES = ["All", "Villa", "Penthouse", "Loft", "Estate", "Retreat"] as const;

export const AMENITIES = [
  "Infinity Pool",
  "Pool",
  "Smart Home",
  "Terrace",
  "Vineyard",
  "Onsen",
  "Sea View",
  "Skyline",
  "Ski-in",
] as const;

export const PRICE_BOUNDS = { min: 0, max: 100_000_000 } as const;

export const formatPrice = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
