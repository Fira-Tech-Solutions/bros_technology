import { useState, useEffect, useMemo } from "react";
import {
  getTelegramWebApp,
  isTelegramMiniApp,
  getStartParam,
  type TelegramWebApp,
} from "@/lib/telegram";

interface TelegramWebAppState {
  tg: TelegramWebApp | null;
  isInTelegram: boolean;
  user: TelegramWebApp["user"] | null;
  colorScheme: "light" | "dark";
  themeParams: TelegramWebApp["themeParams"] | null;
  startParam: string | null;
  isReady: boolean;
}

const initialState: TelegramWebAppState = {
  tg: null,
  isInTelegram: false,
  user: null,
  colorScheme: "dark",
  themeParams: null,
  startParam: null,
  isReady: false,
};

export function useTelegramWebApp(): TelegramWebAppState {
  const [state, setState] = useState<TelegramWebAppState>(initialState);

  useEffect(() => {
    const tg = getTelegramWebApp();
    const isInTg = isTelegramMiniApp();

    if (!isInTg || !tg) {
      setState((prev) => ({ ...prev, isInTelegram: false, isReady: true }));
      return;
    }

    try {
      tg.ready();
      tg.expand();
    } catch {
      // Telegram SDK not available or already initialized
    }

    setState({
      tg,
      isInTelegram: true,
      user: tg.user ?? null,
      colorScheme: tg.colorScheme ?? "dark",
      themeParams: tg.themeParams ?? null,
      startParam: getStartParam(),
      isReady: true,
    });

    const handler = () => {
      setState((prev) => ({
        ...prev,
        colorScheme: tg.colorScheme ?? prev.colorScheme,
        themeParams: tg.themeParams ?? prev.themeParams,
      }));
    };

    if (typeof tg.on === "function") {
      tg.on("themeChanged", handler);
    }

    return () => {
      if (typeof tg.off === "function") {
        tg.off("themeChanged", handler);
      }
    };
  }, []);

  return state;
}
