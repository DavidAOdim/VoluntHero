// src/App.jsx

import { useEffect, useState } from "react";
import "./App.css";

// === Import modularized components and helpers ===
import Navbar from "./components/Navbar"; // was Header
import Home from "./components/Home";
import Login from "./components/Login";
import SelectAccountType from "./components/SelectAccountType";
import Register from "./components/Register";
// import Profile from "./components/Profile"; // The old in-file component is replaced by ProfilePage
import EventListPage from "./pages/EventListPage"; // Consolidated event logic
import MatchingPage from "./pages/admin/MatchingPage";
import ProfilePage from "./pages/ProfilePage";
import VolunteerHistory from "./components/VolunteerHistory";
import Inbox from "./notifications/Inbox";

import { loadUsers, saveUsers, getUser } from "./utils/LocalStorageHelper"; // Local storage helpers

/** ---- App (view switcher + session) ---- */
export default function App() {
  const [users, setUsers] = useState(loadUsers);
  const [view, setView] = useState("home");
  const [accountType, setAccountType] = useState("");

  // NOTE: Event state management is moved into EventListPage.jsx

  const [authedEmail, setAuthedEmail] = useState(
    () => localStorage.getItem("volunthero_session") || ""
  );

  // authedUser depends on users state, so it's a derived value
  const authedUser = authedEmail ? getUser(users, authedEmail) : null;

  useEffect(() => {
    saveUsers(users);
  }, [users]);

  function handleLogin(email) {
    setAuthedEmail(email);
    localStorage.setItem("volunthero_session", email);
  }

  function handleLogout() {
    setAuthedEmail("");
    localStorage.removeItem("volunthero_session");
    setView("home");
  }

  // --- Render Switch ---
  let content;

  switch (view) {
    case "home":
      content = <Home onNavigate={setView} authedEmail={authedEmail} />;
      break;
    case "login":
      // Note: Removed the unused 'users' prop
      content = <Login onLogin={handleLogin} onNavigate={setView} />;
      break;
    case "register":
      if (!accountType) {
        content = <SelectAccountType onSelect={setAccountType} />;
      } else {
        // Note: Removed the unused 'users', 'setUsers', 'accountType' props
        content = <Register onNavigate={setView} />;
      }
      break;
    case "profile":
      // ProfilePage is responsible for its own data fetching/saving
      content = <ProfilePage authedEmail={authedEmail} />;
      break;
    case "events":
      // Use EventListPage for general event listing
      content = <EventListPage authedUser={authedUser} isManage={false} />;
      break;
    case "manage-events":
      // Use EventListPage, but pass a prop to show admin tools (creation form)
      content = <EventListPage authedUser={authedUser} isManage={true} />;
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
