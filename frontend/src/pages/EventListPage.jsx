// src/pages/EventListPage.jsx (Consolidated functionality)

import { useState, useEffect } from "react";
import { fetchEvents, createEvent, deleteEvent } from "../api/eventsServer";
import { SKILLS } from "../utils/constants"; // Import constants
import useNotifications from "../notifications/useNotifications"; // Import notifications hook

// --- Component: Event Creation Form (previously EventManager) ---
function EventCreationForm({ events, setEvents, authedUser }) {
  const { add } = useNotifications();
  const [form, setForm] = useState({
    name: "",
    description: "",
    location: "",
    skills: [],
    urgency: "",
    date: "",
  });
  const [errors, setErrors] = useState({});
  const [msg, setMsg] = useState("");

  function updateField(k, v) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function validate() {
    // Basic validation from original App.jsx (you might move this to utils/validation.js later)
    const e = {};
    if (!form.name || form.name.length > 100)
      e.name = "Event name required (max 100).";
    if (!form.description) e.description = "Description required.";
    if (!form.location) e.location = "Location required.";
    if (!form.skills.length) e.skills = "Select at least one skill.";
    if (!form.urgency) e.urgency = "Urgency required.";
    if (!form.date) e.date = "Date required.";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit(e) {
    e.preventDefault();
    setMsg("");
    if (!validate()) return;

    const newEvent = {
      title: form.name,
      description: form.description,
      location: form.location,
      skills: form.skills,
      urgency: form.urgency,
      date: form.date,
    };

    createEvent(newEvent)
      .then((savedEvent) => {
        setEvents((prev) => [...prev, savedEvent]);
        setMsg("Event created successfully.");
        setForm({
          name: "",
          description: "",
          location: "",
          skills: [],
          urgency: "",
          date: "",
        });
        add({
          title: "Event Created",
          body: `“${savedEvent.name}” on ${savedEvent.date} was created.`,
          type: "info",
          related: { eventId: savedEvent.id },
        });
      })
      .catch((err) => {
        console.error(err);
        setMsg("Failed to create event.");
      });
  }

  // Admin check for rendering
  if (!authedUser || authedUser.role !== "admin") {
    return (
      <div className="card">
        <h2>Create Event</h2>
        <p className="muted">Only administrators can create events.</p>
      </div>
    );
  }

  // Event Creation Form JSX
  return (
    <div className="card">
      <h2>Create Event</h2>
      <form onSubmit={handleSubmit}>
        {/* ... (rest of the form fields: name, description, location, skills, urgency, date) ... */}
        <label>Event Name *</label>
        <input
          value={form.name}
          onChange={(e) => updateField("name", e.target.value)}
          maxLength={100}
          required
        />

        <label>Description *</label>
        <textarea
          rows={3}
          value={form.description}
          onChange={(e) => updateField("description", e.target.value)}
          required
        />

        <label>Location *</label>
        <textarea
          rows={2}
          value={form.location}
          onChange={(e) => updateField("location", e.target.value)}
          required
        />

        <label>Required Skills *</label>
        <select
          multiple
          value={form.skills}
          onChange={(e) =>
            updateField(
              "skills",
              Array.from(e.target.selectedOptions, (o) => o.value)
            )
          }
          required
        >
          {SKILLS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>

        <label>Urgency *</label>
        <select
          value={form.urgency}
          onChange={(e) => updateField("urgency", e.target.value)}
          required
        >
          <option value="">Select urgency</option>
          <option>Low</option>
          <option>Medium</option>
          <option>High</option>
        </select>

        <label>Event Date *</label>
        <input
          type="date"
          value={form.date}
          onChange={(e) => updateField("date", e.target.value)}
          required
        />

        {msg && <p style={{ color: "green" }}>{msg}</p>}
        <button type="submit">Create Event</button>
      </form>
    </div>
  );
}

// --- Component: Event Listing (previously EventList) ---
function EventListing({ events, authedUser, setEvents }) {
  function handleDelete(id) {
    deleteEvent(id)
      .then(() => setEvents((prev) => prev.filter((e) => e.id !== id)))
      .catch((err) => console.error("Failed to delete event:", err));
  }

  if (!events?.length) {
    return <p className="muted">No events available yet.</p>;
  }

  return (
    <div className="events-grid">
      {events.map((evt) => (
        <article
          key={evt.id}
          className={`event-card urgency-${(
            evt.urgency || "low"
          ).toLowerCase()}`}
        >
          {/* ... (rest of the EventList JSX for rendering an event card) ... */}
          <div className="event-bubble" aria-hidden="true">
            <span className="bubble-emoji">
              {evt.urgency === "High"
                ? "⭐"
                : evt.urgency === "Medium"
                ? "📅"
                : "🫶"}
            </span>
          </div>
          <div className="event-body">
            <header className="event-head">
              <h3 className="event-title">{evt.name}</h3>
              <span className="event-date-badge">{evt.date}</span>
            </header>
            <p className="event-desc">{evt.description}</p>
            <div className="event-meta">
              <span className="event-location">📍 {evt.location}</span>
              <span
                className={`event-urgency-tag urgency-${(
                  evt.urgency || "low"
                ).toLowerCase()}`}
              >
                {evt.urgency || "Low"}
              </span>
            </div>
            {evt.skills?.length ? (
              <ul className="skill-chips">
                {evt.skills.map((s) => (
                  <li key={s} className="chip">
                    {s}
                  </li>
                ))}
              </ul>
            ) : null}
            {authedUser?.role === "admin" && (
              <div className="event-actions">
                <button
                  className="btn-ghost"
                  onClick={() => handleDelete(evt.id)}
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        </article>
      ))}
    </div>
  );
}

// --- Main Page Component (exported) ---
export default function EventListPage({ authedUser }) {
  const [events, setEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(true);

  // Initial fetch of events
  useEffect(() => {
    setLoadingEvents(true);
    fetchEvents()
      .then((data) => setEvents(data))
      .catch((err) => console.error("Failed to fetch events:", err))
      .finally(() => setLoadingEvents(false));
  }, []);

  // Helper to filter events based on the view
  const isManageView = authedUser?.role === "admin";
  const title = isManageView ? "Manage Events" : "Available Events";

  return (
    <main className="container">
      <h2>{title}</h2>

      {/* Show Creation form only for Admins */}
      {isManageView && (
        <EventCreationForm
          events={events}
          setEvents={setEvents}
          authedUser={authedUser}
        />
      )}

      <section style={{ marginTop: "20px" }}>
        <h3>{isManageView ? "All Events" : "Current Listings"}</h3>
        {loadingEvents ? (
          <p>Loading events...</p>
        ) : (
          <EventListing
            events={events}
            authedUser={authedUser}
            setEvents={setEvents}
          />
        )}
      </section>
    </main>
  );
}

