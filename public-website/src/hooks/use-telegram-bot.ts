import { useQuery } from "@tanstack/react-query";
import { env } from "@/lib/env";

interface TelegramBotInfo {
  username: string;
  firstName: string;
  id: number;
}

const FALLBACK_USERNAME = env.TELEGRAM_BOT_USERNAME;

async function fetchTelegramBot(): Promise<TelegramBotInfo> {
  const res = await fetch(`${env.API_URL}/api/public/telegram-bot`);
  if (!res.ok) {
    return { username: FALLBACK_USERNAME, firstName: "BROS Technology", id: 0 };
  }
  const json = await res.json();
  return json.data || { username: FALLBACK_USERNAME, firstName: "BROS Technology", id: 0 };
}

export function useTelegramBot() {
  return useQuery({
    queryKey: ["telegram-bot"],
    queryFn: fetchTelegramBot,
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    placeholderData: { username: FALLBACK_USERNAME, firstName: "BROS Technology", id: 0 },
  });
}
