// frontend/src/pages/admin/MatchingPage.jsx
import { useEffect, useState } from "react";
import axios from "axios";

export default function MatchingPage() {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState("");
  const [matches, setMatches] = useState([]);
  const [assigned, setAssigned] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    loadEvents();
  }, []);

  async function loadEvents() {
    try {
      const res = await axios.get("http://localhost:8080/events");
      setEvents(res.data);
    } catch (err) {
      console.error("Load events error:", err);
      setError("Failed to load events.");
    }
  }

  async function fetchMatches() {
    setError("");
    setMatches([]);
    setAssigned([]);

    if (!selectedEvent) return;

    try {
      const res = await axios.get(
        `http://localhost:8080/matching/event/${selectedEvent}`
      );
      setMatches(res.data.matches || []);
      await loadAssigned(selectedEvent);
    } catch (err) {
      console.error("Fetch matches error:", err);
      setError("Failed to fetch matches.");
    }
  }

  async function loadAssigned(eventIdParam) {
    const eventId = eventIdParam || selectedEvent;
    if (!eventId) return;

    try {
      const res = await axios.get(
        `http://localhost:8080/matching/assigned/${eventId}`
      );
      setAssigned(res.data.assigned || []);
    } catch (err) {
      console.error("Fetch assigned error:", err);
      // don't block UI
    }
  }

  async function assignVolunteer(match) {
    if (!selectedEvent) return;

    try {
      const res = await axios.post("http://localhost:8080/matching", {
        volunteerEmail: match.volunteerEmail,
        volunteerName: match.volunteerName,
        eventId: selectedEvent,
      });

      console.log("Assign response:", res.data);
      alert("Volunteer assigned successfully!");

      await loadAssigned();
    } catch (err) {
      console.error("Assign error:", err.response?.data || err);
      alert("Failed to assign volunteer.");
    }
  }

  return (
    <div className="matching-page">
      <h2>Volunteer Matching (Admin)</h2>

      <select
        value={selectedEvent}
        onChange={(e) => setSelectedEvent(e.target.value)}
      >
        <option value="">-- Choose an event --</option>
        {events.map((e) => (
          <option key={e.id} value={e.id}>
            {e.title} — {e.location}
          </option>
        ))}
      </select>

      <button onClick={fetchMatches}>Find Matches</button>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <h3>Matches</h3>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Skills</th>
            <th>Match %</th>
            <th>Reason</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {matches.length === 0 && (
            <tr>
              <td colSpan="5">No matches found.</td>
            </tr>
          )}

          {matches.map((m, i) => (
            <tr key={i}>
              <td>{m.volunteerName}</td>
              <td>{(m.skills || []).join(", ")}</td>
              <td>{m.matchScore}</td>
              <td>{m.reason}</td>
              <td>
                <button onClick={() => assignVolunteer(m)}>Assign</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3>Already Assigned</h3>
      <ul>
        {assigned.length === 0 && <li>No volunteers assigned yet.</li>}
        {assigned.map((a) => (
          <li key={a.id}>
            {a.volunteerName} → {a.eventName} ({a.eventDate})
          </li>
        ))}
      </ul>
    </div>
  );
}


