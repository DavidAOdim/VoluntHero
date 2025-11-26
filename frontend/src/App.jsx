// src/App.jsx

import { useEffect, useState } from "react";
import "./App.css";

// === Import modularized components and helpers ===
import Navbar from "./components/Navbar";
import Home from "./components/Home";
import Login from "./components/Login";
import SelectAccountType from "./components/SelectAccountType";
import Register from "./components/Register";
import EventListPage from "./pages/EventListPage";
import MatchingPage from "./pages/admin/MatchingPage";
import ProfilePage from "./pages/ProfilePage";
import VolunteerHistory from "./components/VolunteerHistory";
import Inbox from "./notifications/Inbox";
import ReportsPage from "./pages/ReportsPage";

import { loadUsers } from "./utils/LocalStorageHelper";

/** ---- App (view switcher + session) ---- */
export default function App() {
  const [users, setUsers] = useState(loadUsers);
  const [view, setView] = useState("home");
  const [accountType, setAccountType] = useState("");

  const [authedUser, setAuthedUser] = useState(
    () => JSON.parse(localStorage.getItem("volunthero_session")) || {}
  );

  const [authedEmail, setAuthedEmail] = useState(() => {
    const session = localStorage.getItem("volunthero_session");
    return session ? JSON.parse(session).email : "";
  });

  // Sync authedUser whenever local storage changes
  useEffect(() => {
    const session = localStorage.getItem("volunthero_session");
    if (session) {
      const parsedSession = JSON.parse(session);
      setAuthedUser(parsedSession);
      setAuthedEmail(parsedSession.email);
    }
  });

  function handleLogin(email) {
    const session = JSON.parse(localStorage.getItem("volunthero_session"));
    setAuthedUser(session);
    setAuthedEmail(email);
  }

  function handleLogout() {
    setAuthedEmail("");
    localStorage.removeItem("volunthero_session");
    setView("home");
  }

  console.log("Authed User in App.jsx:", authedUser);

  // --- Render Switch ---
  let content;

  switch (view) {
    case "home":
      content = <Home onNavigate={setView} authedEmail={authedEmail} />;
      break;

    case "login":
      content = <Login onLogin={handleLogin} onNavigate={setView} />;
      break;

    case "register":
      if (!accountType) {
        content = <SelectAccountType onSelect={setAccountType} />;
      } else {
        content = <Register accountType={accountType} onNavigate={setView} />;
      }
      break;

    case "profile":
      content = <ProfilePage authedEmail={authedEmail} />;
      break;

    case "events":
      content = <EventListPage authedUser={authedUser} />;
      break;

    case "matching":
      content = <MatchingPage />;
      break;

    case "inbox":
      content = <Inbox onNavigate={setView} />;
      break;

    case "volunteer-history":
      content = <VolunteerHistory authedUser={authedUser} />;
      break;

    /* ⭐ New Reports Page ⭐ */
    case "reports":
      content = <ReportsPage />;
      break;

    default:
      content = <Home onNavigate={setView} authedEmail={authedEmail} />;
  }

  return (
    <>
      <Navbar
        onNavigate={setView}
        current={view}
        authedEmail={authedEmail}
        authedUser={authedUser}
        onLogout={handleLogout}
      />
      {content}
    </>
  );
}
