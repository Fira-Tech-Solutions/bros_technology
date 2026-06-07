// Mock REST service layer. Swap fetch base URL for real backend later.
export type Property = {
  id: string;
  title: string;
  location: string;
  price: number;
  beds: number;
  baths: number;
  area: number; // sqft
  category: "Villa" | "Penthouse" | "Loft" | "Estate" | "Retreat";
  tags: string[];
  hero: string;
  gallery: string[];
  description: string;
  coords: { lat: number; lng: number };
  features: string[];
};

const img = (seed: string, w = 1600, h = 1000) =>
  `https://images.unsplash.com/${seed}?auto=format&fit=crop&w=${w}&h=${h}&q=80`;

const DATA: Property[] = [
  {
    id: "aurora-house",
    title: "Aurora House",
    location: "Malibu, California",
    price: 12400000,
    beds: 5, baths: 6, area: 7800,
    category: "Villa",
    tags: ["Oceanfront", "Infinity Pool", "Smart Home"],
    hero: img("photo-1600585154340-be6161a56a0c"),
    gallery: [
      img("photo-1600585154340-be6161a56a0c"),
      img("photo-1600596542815-ffad4c1539a9"),
      img("photo-1613490493576-7fde63acd811"),
      img("photo-1600607687939-ce8a6c25118c"),
    ],
    description:
      "A cliffside sanctuary of glass and travertine, Aurora House folds the Pacific into every room. Designed as a quiet machine for living.",
    coords: { lat: 34.0259, lng: -118.7798 },
    features: ["Private beach access", "Wine cellar", "Cinema", "Spa & sauna", "EV charging", "Helipad"],
  },
  {
    id: "noir-penthouse",
    title: "Noir Penthouse",
    location: "Tribeca, New York",
    price: 8900000,
    beds: 3, baths: 4, area: 4200,
    category: "Penthouse",
    tags: ["Skyline", "Private Elevator", "Terrace"],
    hero: img("photo-1545324418-cc1a3fa10c00"),
    gallery: [
      img("photo-1545324418-cc1a3fa10c00"),
      img("photo-1502672260266-1c1ef2d93688"),
      img("photo-1560448204-e02f11c3d0e2"),
      img("photo-1493809842364-78817add7ffb"),
    ],
    description:
      "Hovering above the cobblestones of Tribeca, Noir is a study in restraint — blackened steel, smoked oak, and the city as wallpaper.",
    coords: { lat: 40.7163, lng: -74.0086 },
    features: ["Private elevator", "Wrap terrace", "Chef's kitchen", "Library", "Steam room"],
  },
  {
    id: "monolith-loft",
    title: "Monolith Loft",
    location: "Shoreditch, London",
    price: 3200000,
    beds: 2, baths: 2, area: 2100,
    category: "Loft",
    tags: ["Industrial", "Skylights", "Studio"],
    hero: img("photo-1505691938895-1758d7feb511"),
    gallery: [
      img("photo-1505691938895-1758d7feb511"),
      img("photo-1494203484021-3c454daf695d"),
      img("photo-1484154218962-a197022b5858"),
      img("photo-1522708323590-d24dbb6b0267"),
    ],
    description:
      "A converted print works reborn as a quiet, light-filled loft. Concrete columns, cast-iron windows, and an art-ready double height.",
    coords: { lat: 51.5265, lng: -0.0785 },
    features: ["Double-height living", "Mezzanine studio", "Original brickwork", "Bike storage"],
  },
  {
    id: "cypress-estate",
    title: "Cypress Estate",
    location: "Tuscany, Italy",
    price: 6750000,
    beds: 7, baths: 8, area: 11000,
    category: "Estate",
    tags: ["Vineyard", "Historic", "Pool"],
    hero: img("photo-1568605114967-8130f3a36994"),
    gallery: [
      img("photo-1568605114967-8130f3a36994"),
      img("photo-1512917774080-9991f1c4c750"),
      img("photo-1600047509807-ba8f99d2cdde"),
      img("photo-1600585154526-990dced4db0d"),
    ],
    description:
      "A 16th-century villa reimagined for a slower century. Olive groves, frescoed ceilings, and a working cantina down the cypress avenue.",
    coords: { lat: 43.7711, lng: 11.2486 },
    features: ["Vineyard", "Frescoed salon", "Pool & pool house", "Guest cottage", "Olive grove"],
  },
  {
    id: "drift-retreat",
    title: "Drift Retreat",
    location: "Niseko, Japan",
    price: 4100000,
    beds: 4, baths: 4, area: 3600,
    category: "Retreat",
    tags: ["Ski-in", "Onsen", "Forest"],
    hero: img("photo-1600566753190-17f0baa2a6c3"),
    gallery: [
      img("photo-1600566753190-17f0baa2a6c3"),
      img("photo-1502005229762-cf1b2da7c5d6"),
      img("photo-1519642918688-7e43b19245d8"),
      img("photo-1505693416388-ac5ce068fe85"),
    ],
    description:
      "Charred cedar wraps a quiet retreat at the edge of the birch forest. Step out to powder; return to the private onsen.",
    coords: { lat: 42.8048, lng: 140.6874 },
    features: ["Private onsen", "Boot room", "Ski-in/ski-out", "Heated floors"],
  },
  {
    id: "lumen-villa",
    title: "Lumen Villa",
    location: "Ibiza, Spain",
    price: 5400000,
    beds: 5, baths: 5, area: 5200,
    category: "Villa",
    tags: ["Sea View", "Pool", "Sunset"],
    hero: img("photo-1613490493576-7fde63acd811"),
    gallery: [
      img("photo-1613490493576-7fde63acd811"),
      img("photo-1600210492493-0946911123ea"),
      img("photo-1600573472556-e636c2acda88"),
      img("photo-1600607687644-c7171b42498f"),
    ],
    description:
      "White-washed geometry meets the Balearic horizon. Lumen catches every hour of light, from first to last.",
    coords: { lat: 38.9067, lng: 1.4206 },
    features: ["Infinity pool", "Outdoor kitchen", "Sunset terrace", "Beach club access"],
  },
];

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export type PropertyFilters = {
  category?: string;
  q?: string;
  priceMin?: number;
  priceMax?: number;
  beds?: number;          // minimum beds
  baths?: number;         // minimum baths
  amenities?: string[];   // must include all
};

export async function fetchProperties(params?: PropertyFilters): Promise<Property[]> {
  await delay(450);
  let out = DATA;
  if (params?.category && params.category !== "All") {
    out = out.filter((p) => p.category === params.category);
  }
  if (params?.q) {
    const q = params.q.toLowerCase();
    out = out.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.location.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q))
    );
  }
  if (typeof params?.priceMin === "number") out = out.filter((p) => p.price >= params.priceMin!);
  if (typeof params?.priceMax === "number") out = out.filter((p) => p.price <= params.priceMax!);
  if (params?.beds) out = out.filter((p) => p.beds >= params.beds!);
  if (params?.baths) out = out.filter((p) => p.baths >= params.baths!);
  if (params?.amenities?.length) {
    out = out.filter((p) =>
      params.amenities!.every((a) =>
        [...p.tags, ...p.features].some((x) => x.toLowerCase() === a.toLowerCase())
      )
    );
  }
  return out;
}

export async function fetchProperty(id: string): Promise<Property | null> {
  await delay(350);
  return DATA.find((p) => p.id === id) ?? null;
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

export const PRICE_BOUNDS = { min: 1_000_000, max: 15_000_000 } as const;

export const formatPrice = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);

