// frontend/src/api/events.js

const BASE_URL = "http://localhost:8080/events";

// get all events
export async function fetchEvents() {
  const res = await fetch(BASE_URL);
  if (!res.ok) throw new Error("Failed to fetch events");
  return await res.json();
}

// get single event
export async function fetchEvent(id) {
  const res = await fetch(`${BASE_URL}/${id}`);
  if (!res.ok) throw new Error("Event not found");
  return await res.json();
}

// create event
export async function createEvent(eventData) {
  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(eventData),
  });

  // try to parse JSON message from server (may fail for empty responses)
  let data = null;
  try {
    data = await res.json();
  } catch (e) {
    // ignore parse error, keep data null
  }

  const serverMsg = data?.message ?? res.statusText ?? "No message";

  if (!res.ok) {
    console.error("Failed to create event:", serverMsg);
    throw new Error(data?.message ?? "Failed to create event");
  }

  console.log("Create event response message:", serverMsg);
  return data;
}

// update event
export async function updateEvent(id, eventData) {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(eventData),
  });
  if (!res.ok) throw new Error("Failed to update event");
  return await res.json();
}

// delete event
export async function deleteEvent(id) {
  const res = await fetch(`${BASE_URL}/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete event");
  return await res.json();
}
