import React, { useState } from "react";
import NotificationsIcon from "@mui/icons-material/Notifications";
import NotificationList from "./NotificationList";

// Mock notifications (replace with API later)
const mockNotifications = [
  { id: 1, type: "assignment", message: "Assigned to Food Drive Event", date: "2025-09-19" },
  { id: 2, type: "update", message: "Event location changed to Community Center", date: "2025-09-20" },
  { id: 3, type: "reminder", message: "Reminder: Park Cleanup tomorrow!", date: "2025-09-21" }
];

const NotificationBell = () => {
  const [open, setOpen] = useState(false);

  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      {/* Bell Icon */}
      <NotificationsIcon
        style={{ fontSize: "2rem", cursor: "pointer" }}
        onClick={() => setOpen(!open)}
      />

      {/* Dropdown List */}
      {open && (
        <div style={{
          position: "absolute",
          top: "2.5rem",
          right: 0,
          width: "300px",
          background: "#fff",
          border: "1px solid #ccc",
          borderRadius: "8px",
          boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
          zIndex: 1000,
          padding: "0.5rem"
        }}>
          <NotificationList notifications={mockNotifications} />
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
