import { useContext, useRef } from "react";
import { NotificationsContext } from "./NotificationsContext";

export default function useNotifications() {
  const ctx = useContext(NotificationsContext);
  const warned = useRef(false);

  if (!ctx) {
    if (import.meta.env.DEV && !warned.current) {
      console.warn("[notifications] Provider not found. Using no-ops so UI won’t crash.");
      warned.current = true;
    }
    return {
      items: [],
      unreadCount: 0,
      add: () => {},
      markRead: () => {},
      markAllRead: () => {},
      remove: () => {},
      clear: () => {},
    };
  }
  return ctx;
}
