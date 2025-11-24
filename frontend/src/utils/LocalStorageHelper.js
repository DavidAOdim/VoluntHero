// src/utils/localStorageHelpers.js

const LS_KEY = "volunthero_users";
const EVENT_KEY = "volunthero_events";

export function loadUsers() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveUsers(users) {
  localStorage.setItem(LS_KEY, JSON.stringify(users));
}

export function loadEvents() {
  try {
    const raw = localStorage.getItem(EVENT_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveEvents(events) {
  localStorage.setItem(EVENT_KEY, JSON.stringify(events));
}

export function getUser(users, email, role) {
  console.log(users[email.toLowerCase()] || null);
  return users[email.toLowerCase()] || null;
}

export function setUser(users, email, data) {
  const copy = { ...users, [email.toLowerCase()]: data };
  saveUsers(copy);
  return copy;
}
