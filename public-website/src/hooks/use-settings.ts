import { useQuery } from "@tanstack/react-query";
import { env } from "@/lib/env";

export interface Settings {
  siteName: string;
  whatsappNumber: string;
  callNumber1: string;
  callNumber2: string;
  telegramHandle: string;
  adminTelegramUsername: string;
  miniAppUrl: string;
  contactEmail: string;
  facebookUrl: string;
  instagramUrl: string;
  tiktokUrl: string;
  youtubeUrl: string;
  location: string;
  businessHours: string;
  shopGoogleMapUrl: string;
  shopMapAddress: string;
}

export const DEFAULT_SETTINGS: Settings = {
  siteName: "BROS Technology",
  whatsappNumber: "+251972195934",
  callNumber1: "+251972195934",
  callNumber2: "+251980564814",
  telegramHandle: "brostechnology",
  adminTelegramUsername: "",
  miniAppUrl: "",
  contactEmail: "girmasamuel200@gmail.com",
  facebookUrl: "https://facebook.com/brostechnology",
  instagramUrl: "https://instagram.com/brostechnology",
  tiktokUrl: "https://tiktok.com/@brostechnology",
  youtubeUrl: "https://youtube.com/@brostechnology",
  location: "Addis Ababa, Ethiopia",
  businessHours: "Mon \u2013 Sat, 9:00 AM \u2013 7:00 PM",
  shopGoogleMapUrl: "",
  shopMapAddress: "",
};

async function fetchSettings(): Promise<Settings> {
  const res = await fetch(`${env.API_URL}/api/settings`);
  if (!res.ok) return DEFAULT_SETTINGS;
  const json = await res.json();
  return { ...DEFAULT_SETTINGS, ...json.data };
}

export function useSettings() {
  return useQuery({
    queryKey: ["settings"],
    queryFn: fetchSettings,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    placeholderData: DEFAULT_SETTINGS,
  });
}
