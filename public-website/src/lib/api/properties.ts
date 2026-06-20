const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

export type Category = {
  id: string;
  name: string;
  displayName: string;
  icon: string;
};

type Agent = {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  profileImage: string | null;
  facebook: string | null;
  twitter: string | null;
  instagram: string | null;
  linkedin: string | null;
  telegram: string | null;
  whatsapp: string | null;
  tiktok: string | null;
  youtube: string | null;
  website: string | null;
  customSocials: Array<{ platform: string; link: string }>;
};

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
  agent: Agent | null;
};

export type PropertyFilters = {
  category?: string;
  q?: string;
  priceMin?: number;
  priceMax?: number;
  beds?: number;
  baths?: number;
  amenities?: string[];
  limit?: string;
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
  if (params?.limit) searchParams.set("limit", params.limit);

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

const ICON_MAP: Record<string, string> = {
  home: "Home",
  building2: "Building2",
  car: "Car",
  bike: "Bike",
  truck: "Truck",
  smartphone: "Smartphone",
  laptop: "Laptop",
  sofa: "Sofa",
  gem: "Gem",
  shoppingBag: "ShoppingBag",
  briefcase: "Briefcase",
  landmark: "Landmark",
  treePine: "TreePine",
  graduationCap: "GraduationCap",
  heart: "Heart",
  shield: "Shield",
  wrench: "Wrench",
  palette: "Palette",
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
