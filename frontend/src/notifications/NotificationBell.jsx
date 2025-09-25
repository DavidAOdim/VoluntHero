import useNotifications from "./useNotifications";

export default function NotificationBell({ onClick }) {
  const { unreadCount } = useNotifications();

  return (
    <button
      onClick={onClick}
      aria-label="Notifications"
      title="Notifications"
      style={{
        position: "relative",
        border: "none",
        background: "transparent",
        cursor: "pointer",
        padding: 6,
        lineHeight: 1
      }}
    >
      <span style={{ fontSize: 22 }}>🔔</span>
      {unreadCount > 0 && (
        <span
          style={{
            position: "absolute",
            top: -2,
            right: -2,
            background: "#d32f2f",
            color: "#fff",
            minWidth: 18,
            height: 18,
            borderRadius: 9,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 12,
            padding: "0 4px",
            fontWeight: 700,
            boxShadow: "0 0 0 2px #111"
          }}
        >
          {unreadCount}
        </span>
      )}
    </button>
  );
}
