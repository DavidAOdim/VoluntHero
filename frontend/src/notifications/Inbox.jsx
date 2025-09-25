import { useMemo, useState } from "react";
import useNotifications from "./useNotifications";

export default function Inbox() {
  const { items, markRead, markAllRead, remove, clear } = useNotifications();
  const [filter, setFilter] = useState("all"); // all | unread | read

  const filtered = useMemo(() => {
    if (filter === "unread") return items.filter((n) => !n.read);
    if (filter === "read") return items.filter((n) => n.read);
    return items;
  }, [items, filter]);

  return (
    <div style={{ maxWidth: 920, margin: "24px auto", padding: "0 16px" }}>
      <h2 style={{ marginBottom: 12 }}>Notifications</h2>

      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <select aria-label="Filter notifications" value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="all">All</option>
          <option value="unread">Unread</option>
          <option value="read">Read</option>
        </select>

        <button onClick={markAllRead}>Mark all read</button>
        <button onClick={clear}>Clear all</button>
      </div>

      <div style={{ display: "grid", gap: 10 }}>
        {filtered.map((n) => (
          <article
            key={n.id}
            style={{
              border: "1px solid #2a2a2a",
              borderRadius: 10,
              padding: 12,
              background: n.read ? "#1f1f1f" : "#222",
              color: "#fff"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <strong>{n.title}</strong>
              <span style={{ fontSize: 12, padding: "2px 6px", borderRadius: 10, border: "1px solid #444", background: "#111" }}>
                {n.type}
              </span>
              <span style={{ marginLeft: "auto", fontSize: 12, color: "#aaa" }}>
                {new Date(n.createdAt).toLocaleString()}
              </span>
            </div>

            {n.body && <p style={{ margin: "6px 0 10px" }}>{n.body}</p>}

            <div style={{ display: "flex", gap: 8 }}>
              {!n.read && <button onClick={() => markRead(n.id, true)}>Mark read</button>}
              {n.read && <button onClick={() => markRead(n.id, false)}>Mark unread</button>}
              <button onClick={() => remove(n.id)}>Delete</button>
              {n.related?.eventId && (
                <a href={`/events/${n.related.eventId}`} style={{ marginLeft: "auto" }}>
                  View event
                </a>
              )}
            </div>
          </article>
        ))}

        {filtered.length === 0 && <div style={{ color: "#999" }}>No notifications.</div>}
      </div>
    </div>
  );
}
