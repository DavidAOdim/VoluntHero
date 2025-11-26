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
import ForgotPassword from "./pages/ForgotPassword";

import { loadUsers } from "./utils/LocalStorageHelper";

/** ---- App (view switcher + session) ---- */
export default function App() {
  const [users, setUsers] = useState(loadUsers);
  const [view, setView] = useState("home");
  const [accountType, setAccountType] = useState("");

  const [sessionString, setSessionString] = useState(
    localStorage.getItem("volunthero_session")
  );

  const [authedUser, setAuthedUser] = useState(null);
  const [authedEmail, setAuthedEmail] = useState("");

  // Sync authedUser whenever local storage changes
  useEffect(() => {
    if (sessionString) {
      const parsedSession = JSON.parse(sessionString);
      setAuthedUser(parsedSession);
      setAuthedEmail(parsedSession.email);
    } else {
      setAuthedUser(null);
      setAuthedEmail("");
    }
  }, [sessionString]);

  function handleLogin(userData) {
    const str = JSON.stringify(userData);
    localStorage.setItem("volunthero_session", str);
    setSessionString(str);
  }

  function handleLogout() {
    localStorage.removeItem("volunthero_session");
    setSessionString(null);
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
      content = <VolunteerHistory authedEmail={authedEmail} />;
      break;
    case "reports":
      content = <ReportsPage />;
      break;
    case "forgotPassword":
      content = <ForgotPassword onNavigate={setView} />;
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
