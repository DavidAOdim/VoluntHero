// src/main.jsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import NotificationsProvider from "./notifications/NotificationsProvider";
import { EventProvider } from "./eventContext"; // ✅ import your EventProvider

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <NotificationsProvider>
      <EventProvider>
        <App />
      </EventProvider>
    </NotificationsProvider>
  </StrictMode>
);