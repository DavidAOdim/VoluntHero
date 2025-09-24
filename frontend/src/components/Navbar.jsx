import React from "react";
import NotificationBell from "./Notifications/NotificationBell";

function Navbar() {
  return (
    <nav style={{ 
      padding: "1rem", 
      background: "#1976d2", 
      color: "#fff", 
      display: "flex", 
      justifyContent: "space-between", 
      alignItems: "center" 
    }}>
      <h2>VoluntHero</h2>
      <NotificationBell />
    </nav>
  );
}

export default Navbar;
