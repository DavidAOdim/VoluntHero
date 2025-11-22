// src/AuthContext.jsx
import { createContext, useContext, useState, useEffect, useMemo } from "react";

// --- LocalStorage helpers move here from App.jsx ---
const LS_KEY = "volunthero_users";
function loadUsers() {
  /* ... your loadUsers logic ... */
}
function saveUsers(users) {
  /* ... your saveUsers logic ... */
}
function getUser(users, email) {
  /* ... your getUser logic ... */
}
function setUser(users, email, data) {
  /* ... your setUser logic ... */
}
// ---------------------------------------------------

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [users, setUsers] = useState(loadUsers);
  const [authedEmail, setAuthedEmail] = useState(
    () => localStorage.getItem("volunthero_session") || ""
  );

  useEffect(() => {
    saveUsers(users); // Keep users persisted to local storage
  }, [users]);

  const authedUser = useMemo(
    () => (authedEmail ? getUser(users, authedEmail) : null),
    [users, authedEmail]
  );

  function handleLogin(email) {
    setAuthedEmail(email);
    localStorage.setItem("volunthero_session", email);
  }

  function handleLogout() {
    setAuthedEmail("");
    localStorage.removeItem("volunthero_session");
  }

  const value = {
    authedEmail,
    authedUser,
    handleLogin,
    handleLogout,
    setUsers, // Register needs this
    users, // Profile needs this (temporarily until backend is fully used)
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
