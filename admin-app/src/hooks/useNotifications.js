import { useEffect, useRef, useState } from "react";
import { Platform } from "react-native";

import { getNotifications } from "../api/notifications";

let lastNotificationCount = 0;
let canUseNativeNotifications = false;

try {
  const Constants = require("expo-constants").default;
  const isExpoGo = Constants?.executionEnvironment === "storeClient";
  canUseNativeNotifications = !isExpoGo && Platform.OS !== "web";
} catch {
  canUseNativeNotifications = Platform.OS === "ios" || Platform.OS === "android";
}

export default function useNotifications() {
  const [unreadCount, setUnreadCount] = useState(0);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (canUseNativeNotifications) {
      requestNativePermission();
    } else if (Platform.OS === "web") {
      requestWebPermission();
    }

    const check = async () => {
      try {
        const { data } = await getNotifications({ limit: 1 });
        const count = data?.data?.unreadCount || 0;
        setUnreadCount(count);

        if (count > lastNotificationCount && lastNotificationCount >= 0) {
          const newItems = count - lastNotificationCount;
          const detail = await getNotifications({ limit: Math.min(newItems, 5) });
          const notifs = detail?.data?.data?.notifications || [];
          for (const n of notifs) {
            if (!n.isRead) {
              if (canUseNativeNotifications) {
                showNativeNotification(n.title, n.body || "", n.data);
              } else if (Platform.OS === "web") {
                showWebNotification(n.title, n.body || "");
              }
            }
          }
        }
        lastNotificationCount = count;
      } catch {}
    };

    check();
    intervalRef.current = setInterval(check, 30000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      lastNotificationCount = 0;
    };
  }, []);

  return { unreadCount };
}

function requestWebPermission() {
  try {
    if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  } catch {}
}

async function requestNativePermission() {
  try {
    const Notifications = await import("expo-notifications");

    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });

    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name: "Default",
        importance: Notifications.AndroidImportance?.HIGH ?? 4,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#1878B4",
      });
    }

    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== "granted") {
      console.log("Notification permission not granted");
    }
  } catch {}
}

function showWebNotification(title, body) {
  try {
    if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
      new Notification(title, { body });
    }
  } catch {}
}

async function showNativeNotification(title, body, data = {}) {
  try {
    const Notifications = await import("expo-notifications");
    await Notifications.scheduleNotificationAsync({
      content: { title, body, data, sound: true },
      trigger: null,
    });
  } catch {}
}
