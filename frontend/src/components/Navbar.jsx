import React from "react";
// ⬇️ point to the new dependency-free bell we created
import NotificationBell from "../notifications/NotificationBell";

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
      {/* If this Navbar gets used, the bell will show (no navigation here). */}
      <NotificationBell />
    </nav>
  );
}

export default Navbar;
