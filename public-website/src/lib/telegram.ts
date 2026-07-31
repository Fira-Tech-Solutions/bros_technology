export interface TelegramWebApp {
  initData: string;
  initDataUnsafe: Record<string, unknown>;
  version: string;
  platform: string;
  colorScheme: "light" | "dark";
  themeParams: {
    bg_color?: string;
    text_color?: string;
    hint_color?: string;
    link_color?: string;
    button_color?: string;
    button_text_color?: string;
    secondary_bg_color?: string;
  };
  headerColor: string;
  backgroundColor: string;
  isExpanded: boolean;
  viewportHeight: number;
  viewportStableHeight: number;
  startParam?: string;
  ready: () => void;
  expand: () => void;
  close: () => void;
  sendData: (data: string) => void;
  switchInlineQuery: (query: string, choose_chat_types?: string[]) => void;
  openLink: (url: string, options?: { try_instant_view?: boolean }) => void;
  openTelegramLink: (url: string) => void;
  showConfirm: (message: string, callback?: (confirmed: boolean) => void) => void;
  showAlert: (message: string, callback?: () => void) => void;
  on: (eventType: string, callback: () => void) => void;
  off: (eventType: string, callback: () => void) => void;
  MainButton: {
    text: string;
    color: string;
    textColor: string;
    isVisible: boolean;
    isActive: boolean;
    isProgressVisible: boolean;
    setText: (text: string) => void;
    onClick: (callback: () => void) => void;
    offClick: (callback: () => void) => void;
    show: () => void;
    hide: () => void;
    enable: () => void;
    disable: () => void;
    showProgress: (leaveActive?: boolean) => void;
    hideProgress: () => void;
  };
  user?: {
    id: number;
    is_bot?: boolean;
    first_name: string;
    last_name?: string;
    username?: string;
    language_code?: string;
    is_premium?: boolean;
    photo_url?: string;
  };
}

declare global {
  interface Window {
    Telegram?: {
      WebApp?: TelegramWebApp;
    };
  }
}

export function getTelegramWebApp(): TelegramWebApp | undefined {
  if (typeof window === "undefined") return undefined;
  return window.Telegram?.WebApp;
}

export function isTelegramMiniApp(): boolean {
  if (typeof window === "undefined") return false;
  return !!window.Telegram?.WebApp;
}

export function getStartParam(): string | null {
  if (typeof window === "undefined") return null;
  const tg = window.Telegram?.WebApp;
  if (tg?.startParam) return tg.startParam;

  const params = new URLSearchParams(window.location.search);
  return params.get("startapp");
}
