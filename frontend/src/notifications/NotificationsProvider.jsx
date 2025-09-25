import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { NotificationsContext } from "./NotificationsContext";
import * as api from "./mockNotificationService";

export default function NotificationsProvider({ children }) {
  // If you want persistence, flip USE_LS to true
  const USE_LS = false;

  const [items, setItems] = useState(() => {
    if (USE_LS) {
      const saved = localStorage.getItem("vh_notifications");
      if (saved) return JSON.parse(saved);
    }
    return api.seedInitial();
  });

  useEffect(() => {
    if (USE_LS) {
      localStorage.setItem("vh_notifications", JSON.stringify(items));
    }
  }, [items]);

  const [toasts, setToasts] = useState([]);
  const nextIdRef = useRef(items.reduce((m, n) => Math.max(m, n.id), 0) + 1);

  const pushToast = useCallback((toast) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2,8)}`;
    const entry = { id, ...toast };
    setToasts((t) => [...t, entry]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4000);
  }, []);

  const add = useCallback((partial) => {
    const newItem = {
      id: nextIdRef.current++,
      title: partial.title ?? "Notification",
      body: partial.body ?? "",
      type: partial.type ?? "info",        // info | success | warning | error
      read: false,
      createdAt: new Date().toISOString(),
      related: partial.related ?? null,    // { eventId, volunteerId, ... }
    };
    setItems((s) => [newItem, ...s]);
    pushToast({ title: newItem.title, body: newItem.body, type: newItem.type });
    return newItem;
  }, [pushToast]);

  const markRead = useCallback((id, read = true) => {
    setItems((s) => s.map((n) => (n.id === id ? { ...n, read } : n)));
  }, []);

  const markAllRead = useCallback(() => {
    setItems((s) => s.map((n) => ({ ...n, read: true })));
  }, []);

  const remove = useCallback((id) => {
    setItems((s) => s.filter((n) => n.id !== id));
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const unreadCount = items.filter((n) => !n.read).length;

  const value = useMemo(() => ({
    items,
    unreadCount,
    add,
    markRead,
    markAllRead,
    remove,
    clear,
  }), [items, unreadCount, add, markRead, markAllRead, remove, clear]);

  return (
    <NotificationsContext.Provider value={value}>
      {children}
      {/* Toast layer */}
      <div style={{
        position: "fixed", top: 16, right: 16, display: "flex",
        flexDirection: "column", gap: 8, zIndex: 9999
      }}>
        {toasts.map((t) => (
          <Toast key={t.id} title={t.title} body={t.body} type={t.type} />
        ))}
      </div>
    </NotificationsContext.Provider>
  );
}

function Toast({ title, body, type }) {
  const border = type === "success" ? "2px solid #2e7d32"
              : type === "warning" ? "2px solid #ed6c02"
              : type === "error"   ? "2px solid #d32f2f"
              : "1px solid #999";
  return (
    <div style={{
      minWidth: 280, maxWidth: 420, padding: "12px 14px",
      borderRadius: 10, background: "#fff",
      color: "#111",                 // ← added for readable text on white
      boxShadow: "0 6px 24px rgba(0,0,0,.12)",
      border
    }}>
      <div style={{ fontWeight: 700, marginBottom: 6 }}>{title}</div>
      {body ? <div style={{ fontSize: 14, lineHeight: 1.4 }}>{body}</div> : null}
    </div>
  );
}