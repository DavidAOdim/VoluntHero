import { useEffect, useState } from "react";
import axios from "axios";

export default function VolunteerHistory({ authedUser }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const email = authedUser?.email;

  useEffect(() => {
    if (!email) return;
    loadHistory();
  }, [email]);

  async function loadHistory() {
    try {
      const res = await axios.get(
        `http://localhost:8080/history/email/${email}`
      );

      setHistory(res.data.data || []);
    } catch (err) {
      console.error("History load error:", err);
      setHistory([]);
    }

    setLoading(false);
  }

  function formatDate(d) {
    const date = new Date(d);
    if (!isNaN(date)) {
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    }
    return d;
  }

  if (loading) return <p>Loading history...</p>;
  if (!history.length) return <p>No volunteer history found.</p>;

  return (
    <div style={{ padding: "20px" }}>
      <h2 style={{ marginBottom: "20px" }}>Volunteer History</h2>

      <div
        style={{
          display: "grid",
          gap: "18px",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
        }}
      >
        {history.map((record) => (
          <div
            key={record.id}
            style={{
              background: "#1f2937",
              padding: "18px",
              borderRadius: "12px",
              boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
              transition: "transform 0.2s ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.02)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1.0)")}
          >
            <h3 style={{ marginBottom: "6px", color: "#fff" }}>
              {record.eventName}
            </h3>

            <p style={{ margin: "4px 0", color: "#cbd5e1" }}>
              📅 {formatDate(record.eventDate)}
            </p>

            <p style={{ margin: "4px 0", color: "#cbd5e1" }}>
              ⏱ Hours volunteered: {record.hoursVolunteered}
            </p>

            <span
              style={{
                display: "inline-block",
                marginTop: "10px",
                padding: "6px 12px",
                borderRadius: "8px",
                backgroundColor: "#3b82f6",
                color: "white",
                fontSize: "0.85rem",
              }}
            >
              {record.participationStatus}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// import { useEffect, useState } from "react";
// import axios from "axios";

// export default function VolunteerHistory({ authedUser }) {
//   const [history, setHistory] = useState([]);
//   const [loading, setLoading] = useState(true);

//   const email = authedUser?.email;

//   useEffect(() => {
//     if (!email) return;
//     loadHistory();
//   }, [email]);

//   async function loadHistory() {
//     try {
//       const res = await axios.get(
//         `http://localhost:8080/history/email/${email}`
//       );

//       setHistory(res.data.data || []);
//     } catch (err) {
//       console.error("History load error:", err);
//       setHistory([]);
//     }

//     setLoading(false);
//   }

//   if (!email) {
//     return <p>Please log in to view your history.</p>;
//   }

//   if (loading) {
//     return <p>Loading history...</p>;
//   }

//   function formatDate(d) {
//     const date = new Date(d);
//     if (!isNaN(date)) {
//       return date.toLocaleDateString("en-US", {
//         year: "numeric",
//         month: "short",
//         day: "numeric",
//       });
//     }
//     return d;
//   }

//   function StatusBadge({ status }) {
//     const colors = {
//       registered: "#3b82f6",
//       completed: "#22c55e",
//       cancelled: "#ef4444",
//       "in-progress": "#eab308",
//     };

//     return (
//       <span
//         style={{
//           backgroundColor: colors[status] || "#6b7280",
//           padding: "4px 10px",
//           borderRadius: "8px",
//           color: "white",
//           fontSize: "0.8rem",
//         }}
//       >
//         {status}
//       </span>
//     );
//   }

//   return (
//     <div className="volunteer-history" style={{ padding: "20px" }}>
//       <h2 style={{ marginBottom: "20px" }}>Volunteer History</h2>

//       {history.length === 0 ? (
//         <p>No volunteer history found.</p>
//       ) : (
//         <table style={{ width: "100%", borderCollapse: "collapse" }}>
//           <thead>
//             <tr style={{ textAlign: "left" }}>
//               <th style={{ padding: "8px" }}>Event</th>
//               <th style={{ padding: "8px" }}>Date</th>
//               <th style={{ padding: "8px" }}>Status</th>
//               <th style={{ padding: "8px" }}>Hours</th>
//             </tr>
//           </thead>

//           <tbody>
//             {history.map((record) => (
//               <tr key={record.id} style={{ borderTop: "1px solid #333" }}>
//                 <td style={{ padding: "8px" }}>{record.eventName}</td>
//                 <td style={{ padding: "8px" }}>
//                   {formatDate(record.eventDate)}
//                 </td>
//                 <td style={{ padding: "8px" }}>
//                   <StatusBadge status={record.participationStatus} />
//                 </td>
//                 <td style={{ padding: "8px" }}>{record.hoursVolunteered}</td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       )}
//     </div>
//   );
// }


// import { useEffect, useState } from "react";
// import axios from "axios";

// export default function VolunteerHistory({ authedUser }) {
//   const [history, setHistory] = useState([]);
//   const [loading, setLoading] = useState(true);

//   const email = authedUser?.email;

//   useEffect(() => {
//     if (!email) return;
//     loadHistory();
//   }, [email]);

//   async function loadHistory() {
//     try {
//       const res = await axios.get(
//         `http://localhost:8080/history/email/${email}`
//       );

//       if (res.data && res.data.success) {
//         setHistory(res.data.data || []);
//       } else {
//         setHistory([]);
//       }
//     } catch (err) {
//       console.error("History load error:", err);
//       setHistory([]);
//     }

//     setLoading(false);
//   }

//   if (!email) {
//     return <p>Please log in to view your history.</p>;
//   }

//   if (loading) {
//     return <p>Loading history...</p>;
//   }

//   return (
//     <div className="volunteer-history">
//       <h2>Volunteer History</h2>

//       {history.length === 0 ? (
//         <p>No volunteer history found.</p>
//       ) : (
//         <table>
//           <thead>
//             <tr>
//               <th>Event</th>
//               <th>Date</th>
//               <th>Status</th>
//               <th>Hours</th>
//             </tr>
//           </thead>

//           <tbody>
//             {history.map((record) => (
//               <tr key={record.id}>
//                 <td>{record.eventName}</td>
//                 <td>{formatDate(record.eventDate)}</td>
//                 <td>{record.participationStatus}</td>
//                 <td>{record.hoursVolunteered}</td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       )}
//     </div>
//   );
// }

// // Helper function to format yyyy-mm-dd
// function formatDate(raw) {
//   if (!raw) return "";
//   const d = new Date(raw);
//   return d.toLocaleDateString();
// }



// import { useEffect, useState } from "react";
// import axios from "axios";

// export default function VolunteerHistory({ authedUser }) {
//   const [history, setHistory] = useState([]);
//   const [loading, setLoading] = useState(true);

//   const email = authedUser?.email;

//   useEffect(() => {
//     if (!email) return;
//     loadHistory();
//   }, [email]);

//   async function loadHistory() {
//     try {
//       const res = await axios.get(
//         `http://localhost:8080/history/email/${email}`
//       );

//       if (res.data && res.data.data) {
//         setHistory(res.data.data);
//       } else {
//         setHistory([]);
//       }
//     } catch (err) {
//       console.error("History load error:", err);
//       setHistory([]);
//     }

//     setLoading(false);
//   }

//   if (!email) {
//     return <p>Please log in to view your history.</p>;
//   }

//   if (loading) {
//     return <p>Loading history...</p>;
//   }

//   return (
//     <div className="volunteer-history">
//       <h2>Volunteer History</h2>

//       {history.length === 0 ? (
//         <p>No volunteer history found.</p>
//       ) : (
//         <table>
//           <thead>
//             <tr>
//               <th>Event</th>
//               <th>Date</th>
//               <th>Status</th>
//               <th>Hours</th>
//             </tr>
//           </thead>

//           <tbody>
//             {history.map((record) => (
//               <tr key={record.id}>
//                 <td>{record.eventName}</td>
//                 <td>{record.eventDate}</td>
//                 <td>{record.participationStatus}</td>
//                 <td>{record.hoursVolunteered}</td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       )}
//     </div>
//   );
// }

// import { useEffect, useState } from "react";
// import axios from "axios";

// export default function VolunteerHistory({ authedUser }) {
//   const [history, setHistory] = useState([]);
//   const [loading, setLoading] = useState(true);

//   const email = authedUser?.email;

//   useEffect(() => {
//     if (!email) return;
//     loadHistory();
//   }, [email]);

//   async function loadHistory() {
//     try {
//       const res = await axios.get(
//         `http://localhost:8080/volunteer-history/${authedUser.email}`
//       );

//       if (res.data && res.data.data) {
//         setHistory(res.data.data);
//       } else {
//         setHistory([]);
//       }
//     } catch (err) {
//       console.error("History load error:", err);
//       setHistory([]);
//     }

//     setLoading(false);
//   }

//   if (!email) {
//     return <p>Please log in to view your history.</p>;
//   }

//   if (loading) {
//     return <p>Loading history...</p>;
//   }

//   return (
//     <div className="volunteer-history">
//       <h2>Volunteer History</h2>

//       {history.length === 0 ? (
//         <p>No volunteer history found.</p>
//       ) : (
//         <table>
//           <thead>
//             <tr>
//               <th>Event</th>
//               <th>Date</th>
//               <th>Status</th>
//               <th>Hours</th>
//             </tr>
//           </thead>

//           <tbody>
//             {history.map((record) => (
//               <tr key={record.id}>
//                 <td>{record.eventName}</td>
//                 <td>{record.eventDate}</td>
//                 <td>{record.participationStatus}</td>
//                 <td>{record.hoursVolunteered}</td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       )}
//     </div>
//   );
// }


// // src/components/VolunteerHistory.jsx
// import { useEffect, useState } from "react";

// export default function VolunteerHistory({ authedUser }) {
//   const [history, setHistory] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");

//   const email = authedUser?.email;

//   useEffect(() => {
//     if (!email) {
//       setError("No user email found.");
//       setLoading(false);
//       return;
//     }

//     async function fetchHistory() {
//       try {
//         const res = await fetch(
//           `http://localhost:8080/volunteer-history/${email}`
//         );

//         if (!res.ok) {
//           throw new Error(`Server responded with ${res.status}`);
//         }

//         const data = await res.json();
//         setHistory(data.history || []);
//       } catch (err) {
//         console.error("History fetch error:", err);
//         setError("Failed to load volunteer history.");
//       } finally {
//         setLoading(false);
//       }
//     }

//     fetchHistory();
//   }, [email]);

//   return (
//     <div className="page-container">
//       <h1 className="page-title">Volunteer History</h1>

//       {loading && <p>Loading history...</p>}
//       {error && <p className="error-text">{error}</p>}

//       {!loading && !error && history.length === 0 && (
//         <p>No volunteer history yet.</p>
//       )}

//       {!loading && history.length > 0 && (
//         <table className="history-table">
//           <thead>
//             <tr>
//               <th>Event</th>
//               <th>Date</th>
//               <th>Location</th>
//               <th>Status</th>
//               <th>Hours</th>
//             </tr>
//           </thead>
//           <tbody>
//             {history.map((row) => (
//               <tr key={row.id}>
//                 <td>{row.eventName}</td>
//                 <td>{row.eventDate}</td>
//                 <td>{row.eventLocation}</td>
//                 <td>{row.participationStatus}</td>
//                 <td>{row.hoursVolunteered}</td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       )}
//     </div>
//   );
// }


// // frontend/src/components/VolunteerHistory.jsx
// import { useEffect, useState } from "react";

// export default function VolunteerHistory({ authedUser }) {
//   const [history, setHistory] = useState([]);

//   useEffect(() => {
//     if (!authedUser?.email) return;

//     fetch(`http://localhost:8080/history/${authedUser.email}`)
//       .then((res) => res.json())
//       .then((data) => setHistory(data || []))
//       .catch(() => setHistory([]));
//   }, [authedUser]);

//   return (
//     <div className="page">
//       <h1>Volunteer History</h1>

//       {history.length === 0 ? (
//         <p>No volunteer history yet.</p>
//       ) : (
//         <table>
//           <thead>
//             <tr>
//               <th>Event</th>
//               <th>Date</th>
//               <th>Status</th>
//               <th>Hours</th>
//             </tr>
//           </thead>
//           <tbody>
//             {history.map((h) => (
//               <tr key={h.id}>
//                 <td>{h.eventName}</td>
//                 <td>{h.eventDate}</td>
//                 <td>{h.participationStatus}</td>
//                 <td>{h.hoursVolunteered}</td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       )}
//     </div>
//   );
// }


// import { useEffect, useState } from "react";
// import axios from "axios";

// export default function VolunteerHistory({ authedUser }) {
//   const [history, setHistory] = useState([]);
//   const [loading, setLoading] = useState(true);

//   const email = authedUser?.email;

//   useEffect(() => {
//     if (!email) return;

//     async function load() {
//       try {
//         const res = await axios.get(`http://localhost:8080/history/${email}`);
//         setHistory(res.data.data || []);
//       } catch (err) {
//         console.error("Failed to load history:", err);
//       } finally {
//         setLoading(false);
//       }
//     }

//     load();
//   }, [email]);

//   if (!email) return <p className="p-4">Not logged in.</p>;
//   if (loading) return <p className="p-4">Loading...</p>;

//   return (
//     <div className="max-w-5xl mx-auto p-6">
//       <h1 className="text-2xl font-bold text-orange-500 mb-4">Volunteer History</h1>

//       {history.length === 0 ? (
//         <p className="text-gray-600">No volunteer history yet.</p>
//       ) : (
//         <table className="min-w-full border rounded bg-white shadow">
//           <thead className="bg-gray-100">
//             <tr>
//               <th className="px-4 py-2 text-left">Event</th>
//               <th className="px-4 py-2 text-left">Date</th>
//               <th className="px-4 py-2 text-left">Location</th>
//               <th className="px-4 py-2 text-left">Status</th>
//               <th className="px-4 py-2 text-left">Hours</th>
//             </tr>
//           </thead>
//           <tbody>
//             {history.map((item) => (
//               <tr key={item.id} className="border-t">
//                 <td className="px-4 py-2">{item.eventName}</td>
//                 <td className="px-4 py-2">{item.eventDate}</td>
//                 <td className="px-4 py-2">{item.eventLocation}</td>
//                 <td className="px-4 py-2">{item.participationStatus}</td>
//                 <td className="px-4 py-2">{item.hoursVolunteered}</td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       )}
//     </div>
//   );
// }

// // frontend/src/components/VolunteerMatching.jsx

// import React, { useState, useEffect } from "react";
// import axios from "axios";

// const API_BASE = "http://localhost:8080";

// export default function VolunteerMatching() {
//   const [events, setEvents] = useState([]);
//   const [selectedEvent, setSelectedEvent] = useState("");
//   const [matches, setMatches] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");

//   useEffect(() => {
//     async function fetchEvents() {
//       try {
//         const res = await axios.get(`${API_BASE}/events`);
//         setEvents(res.data);
//       } catch (err) {
//         console.error("Error loading events:", err);
//       }
//     }
//     fetchEvents();
//   }, []);

//   async function findMatches() {
//     if (!selectedEvent) {
//       alert("Select an event first.");
//       return;
//     }

//     try {
//       setLoading(true);
//       setError("");
//       const res = await axios.get(`${API_BASE}/matching/event/${selectedEvent}`);
//       if (!res.data.success) throw new Error(res.data.message);
//       setMatches(res.data.data);
//     } catch (err) {
//       console.error("Error fetching matches:", err);
//       setError("Error fetching matches.");
//       setMatches([]);
//     } finally {
//       setLoading(false);
//     }
//   }

//   async function assignVolunteer(email) {
//     try {
//       const res = await axios.post(`${API_BASE}/matching/assign`, {
//         email,
//         eventId: selectedEvent,
//       });

//       if (res.data.success) {
//         alert("Volunteer assigned!");
//       } else {
//         alert("Error assigning volunteer.");
//       }
//     } catch (err) {
//       console.error("Error assigning volunteer:", err);
//       alert("Error assigning volunteer.");
//     }
//   }

//   return (
//     <div className="matching-container">
//       <h1>Volunteer Matching (Admin)</h1>

//       <div className="form-group">
//         <label>Select Event:</label>
//         <select
//           value={selectedEvent}
//           onChange={(e) => setSelectedEvent(e.target.value)}
//         >
//           <option value="">-- Select Event --</option>
//           {events.map((e) => (
//             <option key={e.id} value={e.id}>
//               {e.title} — {e.location}
//             </option>
//           ))}
//         </select>
//         <button onClick={findMatches} disabled={!selectedEvent}>
//           Find Matches
//         </button>
//       </div>

//       {loading && <p>Loading matches...</p>}
//       {error && <p style={{ color: "red" }}>{error}</p>}

//       {matches.length > 0 && (
//         <table className="matches-table">
//           <thead>
//             <tr>
//               <th>Name</th>
//               <th>Skills</th>
//               <th>Match %</th>
//               <th>Reason</th>
//               <th>Action</th>
//             </tr>
//           </thead>
//           <tbody>
//             {matches.map((m, idx) => (
//               <tr key={idx}>
//                 <td>{m.volunteer.name}</td>
//                 <td>{m.volunteer.skills.join(", ")}</td>
//                 <td>{m.matchPercent}%</td>
//                 <td>{m.reason}</td>
//                 <td>
//                   <button onClick={() => assignVolunteer(m.volunteer.email)}>
//                     Assign
//                   </button>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       )}

//       {matches.length === 0 && !loading && <p>No matches found.</p>}
//     </div>
//   );
// }


// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import "./VolunteerHistoryPage.css";

// const API_HISTORY = "http://localhost:8080/history";

// const VolunteerHistory = ({ authedUser }) => {
//   const volunteerEmail = authedUser?.email;
//   const [events, setEvents] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");

//   useEffect(() => {
//     if (!volunteerEmail) return;

//     async function loadHistory() {
//       try {
//         const res = await axios.get(`${API_HISTORY}/${volunteerEmail}`);
//         if (!res.data.success) throw new Error("Failed to load");

//         setEvents(res.data.data);
//       } catch (err) {
//         setError("Could not load history.");
//       } finally {
//         setLoading(false);
//       }
//     }

//     loadHistory();
//   }, [volunteerEmail]);

//   if (!volunteerEmail) return <p>You must be logged in to view your history.</p>;
//   if (loading) return <p>Loading...</p>;
//   if (error) return <p>{error}</p>;

//   return (
//     <div className="volunteer-history-container">
//       <h1>Volunteer History</h1>
//       <table className="events-table">
//         <thead>
//           <tr>
//             <th>Event</th>
//             <th>Date</th>
//             <th>Location</th>
//             <th>Status</th>
//             <th>Hours</th>
//             <th>Skills</th>
//           </tr>
//         </thead>
//         <tbody>
//           {events.length === 0 ? (
//             <tr><td colSpan="6">No events found.</td></tr>
//           ) : (
//             events.map((e) => (
//               <tr key={e.id}>
//                 <td>{e.eventName}</td>
//                 <td>{new Date(e.eventDate).toLocaleDateString()}</td>
//                 <td>{e.eventLocation}</td>
//                 <td>{e.participationStatus}</td>
//                 <td>{e.hoursVolunteered}</td>
//                 <td>{(e.skillsUsed || []).join(", ")}</td>
//               </tr>
//             ))
//           )}
//         </tbody>
//       </table>
//     </div>
//   );
// };

// export default VolunteerHistory;


// // frontend/src/components/VolunteerHistory.jsx

// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import "./VolunteerHistoryPage.css";

// const API_HISTORY = "http://localhost:8080/history";

// const VolunteerHistory = ({ authedUser }) => {
//   const volunteerId = authedUser?.id;

//   const [events, setEvents] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");

//   if (!volunteerId) {
//     return <p>You must be logged in to view history.</p>;
//   }

//   useEffect(() => {
//     async function load() {
//       try {
//         const res = await axios.get(`${API_HISTORY}/${volunteerId}`);

//         if (!res.data.success) throw new Error("Failed to load");

//         setEvents(
//           res.data.data.map(r => ({
//             id: r.id,
//             name: r.eventName,
//             date: r.eventDate,
//             location: r.eventLocation,
//             status: r.participationStatus === "assigned" ? "Assigned" : "Completed",
//             hours: r.hoursVolunteered,
//             skills: Array.isArray(r.skillsUsed) ? r.skillsUsed : JSON.parse(r.skillsUsed || "[]")
//           }))
//         );
//       } catch (err) {
//         setError("Could not load history.");
//       } finally {
//         setLoading(false);
//       }
//     }
//     load();
//   }, [volunteerId]);

//   if (loading) return <p>Loading history...</p>;
//   if (error) return <p>{error}</p>;

//   return (
//     <div className="volunteer-history-container">
//       <h1>Volunteer History</h1>

//       <table className="events-table">
//         <thead>
//           <tr>
//             <th>Event</th>
//             <th>Date</th>
//             <th>Location</th>
//             <th>Status</th>
//             <th>Hours</th>
//             <th>Skills</th>
//           </tr>
//         </thead>

//         <tbody>
//           {events.length === 0 && (
//             <tr>
//               <td colSpan="6">No events found.</td>
//             </tr>
//           )}

//           {events.map(e => (
//             <tr key={e.id}>
//               <td>{e.name}</td>
//               <td>{new Date(e.date).toLocaleDateString()}</td>
//               <td>{e.location}</td>
//               <td>{e.status}</td>
//               <td>{e.hours}</td>
//               <td>{e.skills.join(", ")}</td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </div>
//   );
// };

// export default VolunteerHistory;

// // frontend/src/components/VolunteerHistory.jsx

// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import "./VolunteerHistoryPage.css";

// const API_HISTORY = "http://localhost:8080/history";
// const API_VOLUNTEERS = "http://localhost:8080/volunteers";

// const VolunteerHistory = ({ authedEmail }) => {
//   const [volunteerId, setVolunteerId] = useState(null);
//   const [events, setEvents] = useState([]);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [filterStatus, setFilterStatus] = useState("All");
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");

//   // 1) Resolve volunteerId from authedEmail
//   useEffect(() => {
//     if (!authedEmail) {
//       setError("You must be logged in to view history.");
//       setLoading(false);
//       return;
//     }

//     async function resolveVolunteer() {
//       try {
//         setLoading(true);
//         setError("");

//         const res = await axios.get(
//           `${API_VOLUNTEERS}/by-email/${encodeURIComponent(authedEmail)}`
//         );

//         if (!res.data.success) {
//           throw new Error(res.data.message || "Volunteer lookup failed");
//         }

//         setVolunteerId(res.data.data.id);
//       } catch (err) {
//         console.error("Error resolving volunteer by email:", err);
//         setError("No volunteer profile found for this account.");
//         setVolunteerId(null);
//       } finally {
//         setLoading(false);
//       }
//     }

//     resolveVolunteer();
//   }, [authedEmail]);

//   // 2) Once we have volunteerId, load history
//   useEffect(() => {
//     if (!volunteerId) return;

//     async function fetchHistory() {
//       try {
//         setLoading(true);
//         setError("");

//         const res = await axios.get(`${API_HISTORY}/${volunteerId}`);

//         if (!res.data || res.data.success === false) {
//           throw new Error(res.data?.message || "Failed to load history");
//         }

//         const records = res.data.data || [];

//         const mapped = records.map((r) => ({
//           id: r.id,
//           name: r.eventName,
//           date: r.eventDate,
//           location: r.eventLocation,
//           status:
//             r.participationStatus === "completed"
//               ? "Completed"
//               : r.participationStatus === "cancelled"
//               ? "Cancelled"
//               : r.participationStatus === "in-progress"
//               ? "In Progress"
//               : "Assigned",
//           hours: r.hoursVolunteered,
//           skills: Array.isArray(r.skillsUsed)
//             ? r.skillsUsed
//             : r.skillsUsed
//             ? (() => {
//                 try {
//                   return JSON.parse(r.skillsUsed);
//                 } catch {
//                   return [];
//                 }
//               })()
//             : [],
//         }));

//         setEvents(mapped);
//       } catch (err) {
//         console.error("Error fetching volunteer history:", err);
//         setError("Could not load volunteer history.");
//         setEvents([]);
//       } finally {
//         setLoading(false);
//       }
//     }

//     fetchHistory();
//   }, [volunteerId]);

//   // === Stats ===
//   const stats = {
//     totalEvents: events.length,
//     completed: events.filter((e) => e.status === "Completed").length,
//     assigned: events.filter((e) => e.status === "Assigned").length,
//     totalHours: events
//       .filter((e) => e.status === "Completed")
//       .reduce((sum, e) => sum + (e.hours || 0), 0),
//     allSkills: [...new Set(events.flatMap((e) => e.skills))].join(", "),
//   };

//   const filteredEvents = events.filter((event) => {
//     const matchesSearch =
//       event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       event.location.toLowerCase().includes(searchTerm.toLowerCase());

//     const matchesStatus =
//       filterStatus === "All" || event.status === filterStatus;

//     return matchesSearch && matchesStatus;
//   });

//   return (
//     <div className="volunteer-history-container">
//       <h1>Volunteer History</h1>

//       {error && <p className="error-text">{error}</p>}

//       {loading && !error && (
//         <p className="loading-text">Loading history...</p>
//       )}

//       {!loading && !error && (
//         <>
//           <div className="stats-grid">
//             <div className="stat-card">
//               <h3>Total Events</h3>
//               <p className="stat-number">{stats.totalEvents}</p>
//             </div>
//             <div className="stat-card">
//               <h3>Completed</h3>
//               <p className="stat-number completed">{stats.completed}</p>
//             </div>
//             <div className="stat-card">
//               <h3>Assigned</h3>
//               <p className="stat-number assigned">{stats.assigned}</p>
//             </div>
//             <div className="stat-card">
//               <h3>Total Hours</h3>
//               <p className="stat-number hours">{stats.totalHours}</p>
//             </div>
//           </div>

//           <div className="skills-section">
//             <h3>Skills Used</h3>
//             <p>{stats.allSkills || "No skills recorded"}</p>
//           </div>

//           <div className="filters-section">
//             <div className="search-box">
//               <input
//                 type="text"
//                 placeholder="Search events..."
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//               />
//             </div>

//             <div className="status-filter">
//               <select
//                 value={filterStatus}
//                 onChange={(e) => setFilterStatus(e.target.value)}
//               >
//                 <option value="All">All Status</option>
//                 <option value="Assigned">Assigned</option>
//                 <option value="Completed">Completed</option>
//                 <option value="Cancelled">Cancelled</option>
//                 <option value="In Progress">In Progress</option>
//               </select>
//             </div>
//           </div>

//           <div className="events-table-container">
//             <table className="events-table">
//               <thead>
//                 <tr>
//                   <th>Event Name</th>
//                   <th>Date</th>
//                   <th>Location</th>
//                   <th>Status</th>
//                   <th>Hours</th>
//                   <th>Skills Used</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {filteredEvents.map((event) => (
//                   <tr key={event.id}>
//                     <td>{event.name}</td>
//                     <td>
//                       {event.date
//                         ? new Date(event.date).toLocaleDateString()
//                         : "-"}
//                     </td>
//                     <td>{event.location}</td>
//                     <td>
//                       <span
//                         className={`status-badge status-${event.status
//                           .toLowerCase()
//                           .replace(" ", "-")}`}
//                       >
//                         {event.status}
//                       </span>
//                     </td>
//                     <td>{event.hours || "-"}</td>
//                     <td>{event.skills.join(", ") || "-"}</td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>

//             {filteredEvents.length === 0 && (
//               <div className="no-events">
//                 No events found matching your filters.
//               </div>
//             )}
//           </div>
//         </>
//       )}
//     </div>
//   );
// };

// export default VolunteerHistory;

// // frontend/src/components/VolunteerHistory.jsx

// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import "./VolunteerHistoryPage.css";

// const API_HISTORY = "http://localhost:8080/history";

// const VolunteerHistory = ({ authedUser }) => {
//   // userId is our volunteerId everywhere
//   const volunteerId = authedUser?.userId || null;

//   const [events, setEvents] = useState([]);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [filterStatus, setFilterStatus] = useState("All");
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");

//   // === Load volunteer history from backend ===
//   useEffect(() => {
//     if (!volunteerId) {
//       setLoading(false);
//       setEvents([]);
//       return;
//     }

//     async function fetchHistory() {
//       try {
//         setLoading(true);
//         setError("");

//         const res = await axios.get(`${API_HISTORY}/${volunteerId}`);

//         if (!res.data || res.data.success === false) {
//           throw new Error(res.data?.message || "Failed to load history");
//         }

//         const records = res.data.data || [];

//         const mapped = records.map((r) => ({
//           id: r.id,
//           name: r.eventName,
//           date: r.eventDate,
//           location: r.eventLocation,
//           status:
//             r.participationStatus === "completed"
//               ? "Completed"
//               : r.participationStatus === "cancelled"
//               ? "Cancelled"
//               : r.participationStatus === "in-progress"
//               ? "In Progress"
//               : "Assigned",
//           hours: r.hoursVolunteered,
//           skills: Array.isArray(r.skillsUsed)
//             ? r.skillsUsed
//             : r.skillsUsed
//             ? (() => {
//                 try {
//                   return JSON.parse(r.skillsUsed);
//                 } catch {
//                   return [];
//                 }
//               })()
//             : [],
//         }));

//         setEvents(mapped);
//       } catch (err) {
//         console.error("Error fetching volunteer history:", err);
//         setError("Could not load volunteer history.");
//         setEvents([]);
//       } finally {
//         setLoading(false);
//       }
//     }

//     fetchHistory();
//   }, [volunteerId]);

//   // === Stats computed from events ===
//   const stats = {
//     totalEvents: events.length,
//     completed: events.filter((e) => e.status === "Completed").length,
//     assigned: events.filter((e) => e.status === "Assigned").length,
//     totalHours: events
//       .filter((e) => e.status === "Completed")
//       .reduce((sum, e) => sum + (e.hours || 0), 0),
//     allSkills: [...new Set(events.flatMap((e) => e.skills))].join(", "),
//   };

//   // === Filters + Search ===
//   const filteredEvents = events.filter((event) => {
//     const matchesSearch =
//       event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       event.location.toLowerCase().includes(searchTerm.toLowerCase());

//     const matchesStatus =
//       filterStatus === "All" || event.status === filterStatus;

//     return matchesSearch && matchesStatus;
//   });

//   return (
//     <div className="volunteer-history-container">
//       <h1>Volunteer History</h1>

//       {!volunteerId && (
//         <p className="error-text">
//           Please log in as a volunteer to view your history.
//         </p>
//       )}

//       {error && <p className="error-text">{error}</p>}

//       {loading && volunteerId && !error && (
//         <p className="loading-text">Loading history...</p>
//       )}

//       {!loading && !error && volunteerId && (
//         <>
//           {/* === STATS SECTION === */}
//           <div className="stats-grid">
//             <div className="stat-card">
//               <h3>Total Events</h3>
//               <p className="stat-number">{stats.totalEvents}</p>
//             </div>
//             <div className="stat-card">
//               <h3>Completed</h3>
//               <p className="stat-number completed">{stats.completed}</p>
//             </div>
//             <div className="stat-card">
//               <h3>Assigned</h3>
//               <p className="stat-number assigned">{stats.assigned}</p>
//             </div>
//             <div className="stat-card">
//               <h3>Total Hours</h3>
//               <p className="stat-number hours">{stats.totalHours}</p>
//             </div>
//           </div>

//           {/* === SKILLS SUMMARY === */}
//           <div className="skills-section">
//             <h3>Skills Used</h3>
//             <p>{stats.allSkills || "No skills recorded"}</p>
//           </div>

//           {/* === FILTERS === */}
//           <div className="filters-section">
//             <div className="search-box">
//               <input
//                 type="text"
//                 placeholder="Search events..."
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//               />
//             </div>

//             <div className="status-filter">
//               <select
//                 value={filterStatus}
//                 onChange={(e) => setFilterStatus(e.target.value)}
//               >
//                 <option value="All">All Status</option>
//                 <option value="Assigned">Assigned</option>
//                 <option value="Completed">Completed</option>
//                 <option value="Cancelled">Cancelled</option>
//                 <option value="In Progress">In Progress</option>
//               </select>
//             </div>
//           </div>

//           {/* === EVENTS TABLE === */}
//           <div className="events-table-container">
//             <table className="events-table">
//               <thead>
//                 <tr>
//                   <th>Event Name</th>
//                   <th>Date</th>
//                   <th>Location</th>
//                   <th>Status</th>
//                   <th>Hours</th>
//                   <th>Skills Used</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {filteredEvents.map((event) => (
//                   <tr key={event.id}>
//                     <td>{event.name}</td>
//                     <td>
//                       {event.date
//                         ? new Date(event.date).toLocaleDateString()
//                         : "-"}
//                     </td>
//                     <td>{event.location}</td>
//                     <td>
//                       <span
//                         className={`status-badge status-${event.status
//                           .toLowerCase()
//                           .replace(" ", "-")}`}
//                       >
//                         {event.status}
//                       </span>
//                     </td>
//                     <td>{event.hours || "-"}</td>
//                     <td>{event.skills.join(", ") || "-"}</td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>

//             {filteredEvents.length === 0 && (
//               <div className="no-events">
//                 No events found.
//               </div>
//             )}
//           </div>
//         </>
//       )}
//     </div>
//   );
// };

// export default VolunteerHistory;


// // frontend/src/components/VolunteerHistory.jsx

// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import "./VolunteerHistoryPage.css";

// const API_HISTORY = "http://localhost:8080/history";

// const VolunteerHistory = ({ volunteerId: propVolunteerId, authedUser }) => {
//   // Prefer an explicit volunteerId prop, then authedUser.userId, then fallback to 1
//   const volunteerId = propVolunteerId || authedUser?.userId || 1;

//   const [events, setEvents] = useState([]);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [filterStatus, setFilterStatus] = useState("All");
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");

//   // === Load volunteer history from backend ===
//   useEffect(() => {
//     if (!volunteerId) return; // nothing to load yet

//     async function fetchHistory() {
//       try {
//         setLoading(true);
//         setError("");

//         const res = await axios.get(`${API_HISTORY}/${volunteerId}`);

//         if (!res.data || res.data.success === false) {
//           throw new Error(res.data?.message || "Failed to load history");
//         }

//         const records = res.data.data || [];

//         // Map DB fields into the structure used by the UI table
//         const mapped = records.map((r) => ({
//           id: r.id,
//           name: r.eventName,
//           date: r.eventDate,
//           location: r.eventLocation,
//           status:
//             r.participationStatus === "completed"
//               ? "Completed"
//               : r.participationStatus === "cancelled"
//               ? "Cancelled"
//               : r.participationStatus === "in-progress"
//               ? "In Progress"
//               : "Assigned", // default for "registered" / anything else
//           hours: r.hoursVolunteered,
//           skills: Array.isArray(r.skillsUsed)
//             ? r.skillsUsed
//             : r.skillsUsed
//             ? (() => {
//                 try {
//                   return JSON.parse(r.skillsUsed);
//                 } catch {
//                   return [];
//                 }
//               })()
//             : [],
//         }));

//         setEvents(mapped);
//       } catch (err) {
//         console.error("Error fetching volunteer history:", err);
//         setError("Could not load volunteer history.");
//         setEvents([]);
//       } finally {
//         setLoading(false);
//       }
//     }

//     fetchHistory();
//   }, [volunteerId]);

//   // === Stats computed from events ===
//   const stats = {
//     totalEvents: events.length,
//     completed: events.filter((e) => e.status === "Completed").length,
//     assigned: events.filter((e) => e.status === "Assigned").length,
//     totalHours: events
//       .filter((e) => e.status === "Completed")
//       .reduce((sum, e) => sum + (e.hours || 0), 0),
//     allSkills: [...new Set(events.flatMap((e) => e.skills))].join(", "),
//   };

//   // === Filters + Search ===
//   const filteredEvents = events.filter((event) => {
//     const matchesSearch =
//       event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       event.location.toLowerCase().includes(searchTerm.toLowerCase());

//     const matchesStatus =
//       filterStatus === "All" || event.status === filterStatus;

//     return matchesSearch && matchesStatus;
//   });

//   return (
//     <div className="volunteer-history-container">
//       <h1>Volunteer History</h1>

//       {/* Error message */}
//       {error && <p className="error-text">{error}</p>}

//       {/* Loading Indicator */}
//       {loading && !error && (
//         <p className="loading-text">Loading history...</p>
//       )}

//       {/* === STATS SECTION === */}
//       {!loading && !error && (
//         <>
//           <div className="stats-grid">
//             <div className="stat-card">
//               <h3>Total Events</h3>
//               <p className="stat-number">{stats.totalEvents}</p>
//             </div>
//             <div className="stat-card">
//               <h3>Completed</h3>
//               <p className="stat-number completed">{stats.completed}</p>
//             </div>
//             <div className="stat-card">
//               <h3>Assigned</h3>
//               <p className="stat-number assigned">{stats.assigned}</p>
//             </div>
//             <div className="stat-card">
//               <h3>Total Hours</h3>
//               <p className="stat-number hours">{stats.totalHours}</p>
//             </div>
//           </div>

//           {/* === SKILLS SUMMARY === */}
//           <div className="skills-section">
//             <h3>Skills Used</h3>
//             <p>{stats.allSkills || "No skills recorded"}</p>
//           </div>

//           {/* === FILTERS === */}
//           <div className="filters-section">
//             <div className="search-box">
//               <input
//                 type="text"
//                 placeholder="Search events..."
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//               />
//             </div>

//             <div className="status-filter">
//               <select
//                 value={filterStatus}
//                 onChange={(e) => setFilterStatus(e.target.value)}
//               >
//                 <option value="All">All Status</option>
//                 <option value="Assigned">Assigned</option>
//                 <option value="Completed">Completed</option>
//                 <option value="Cancelled">Cancelled</option>
//                 <option value="In Progress">In Progress</option>
//               </select>
//             </div>
//           </div>

//           {/* === EVENTS TABLE === */}
//           <div className="events-table-container">
//             <table className="events-table">
//               <thead>
//                 <tr>
//                   <th>Event Name</th>
//                   <th>Date</th>
//                   <th>Location</th>
//                   <th>Status</th>
//                   <th>Hours</th>
//                   <th>Skills Used</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {filteredEvents.map((event) => (
//                   <tr key={event.id}>
//                     <td>{event.name}</td>
//                     <td>
//                       {event.date
//                         ? new Date(event.date).toLocaleDateString()
//                         : "-"}
//                     </td>
//                     <td>{event.location}</td>
//                     <td>
//                       <span
//                         className={`status-badge status-${event.status
//                           .toLowerCase()
//                           .replace(" ", "-")}`}
//                       >
//                         {event.status}
//                       </span>
//                     </td>
//                     <td>{event.hours || "-"}</td>
//                     <td>{event.skills.join(", ") || "-"}</td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>

//             {filteredEvents.length === 0 && (
//               <div className="no-events">
//                 No events found matching your filters.
//               </div>
//             )}
//           </div>
//         </>
//       )}
//     </div>
//   );
// };

// export default VolunteerHistory;


// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import "./VolunteerHistoryPage.css";

// const VolunteerHistoryPage = ({ volunteerId = 1 }) => {
//   const [events, setEvents] = useState([]);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [filterStatus, setFilterStatus] = useState("All");
//   const [loading, setLoading] = useState(true);

//   // === Load volunteer history from backend ===
//   useEffect(() => {
//     async function fetchHistory() {
//       try {
//         setLoading(true);

//         const res = await axios.get(
//           `http://localhost:8080/history/${volunteerId}`
//         );

//         const records = res.data?.data || [];

//         // Map DB fields into the structure used by the UI table
//         const mapped = records.map((r) => ({
//           id: r.id,
//           name: r.eventName,
//           date: r.eventDate,
//           location: r.eventLocation,
//           status:
//             r.participationStatus === "completed"
//               ? "Completed"
//               : r.participationStatus === "cancelled"
//               ? "Cancelled"
//               : r.participationStatus === "in-progress"
//               ? "In Progress"
//               : "Assigned",
//           hours: r.hoursVolunteered,
//           skills: Array.isArray(r.skillsUsed)
//             ? r.skillsUsed
//             : r.skillsUsed
//             ? JSON.parse(r.skillsUsed)
//             : [],
//         }));

//         setEvents(mapped);
//       } catch (err) {
//         console.error("Error fetching volunteer history:", err);
//       } finally {
//         setLoading(false);
//       }
//     }

//     fetchHistory();
//   }, [volunteerId]);

//   // === Stats ===
//   const stats = {
//     totalEvents: events.length,
//     completed: events.filter((e) => e.status === "Completed").length,
//     assigned: events.filter((e) => e.status === "Assigned").length,
//     totalHours: events
//       .filter((e) => e.status === "Completed")
//       .reduce((sum, e) => sum + (e.hours || 0), 0),
//     allSkills: [...new Set(events.flatMap((e) => e.skills))].join(", "),
//   };

//   // === Filters + Search ===
//   const filteredEvents = events.filter((event) => {
//     const matchesSearch =
//       event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       event.location.toLowerCase().includes(searchTerm.toLowerCase());

//     const matchesStatus =
//       filterStatus === "All" || event.status === filterStatus;

//     return matchesSearch && matchesStatus;
//   });

//   return (
//     <div className="volunteer-history-container">
//       <h1>Volunteer History</h1>

//       {/* Loading Indicator */}
//       {loading && <p className="loading-text">Loading history...</p>}

//       {/* === STATS SECTION === */}
//       {!loading && (
//         <>
//           <div className="stats-grid">
//             <div className="stat-card">
//               <h3>Total Events</h3>
//               <p className="stat-number">{stats.totalEvents}</p>
//             </div>
//             <div className="stat-card">
//               <h3>Completed</h3>
//               <p className="stat-number completed">{stats.completed}</p>
//             </div>
//             <div className="stat-card">
//               <h3>Assigned</h3>
//               <p className="stat-number assigned">{stats.assigned}</p>
//             </div>
//             <div className="stat-card">
//               <h3>Total Hours</h3>
//               <p className="stat-number hours">{stats.totalHours}</p>
//             </div>
//           </div>

//           {/* === SKILLS SUMMARY === */}
//           <div className="skills-section">
//             <h3>Skills Used</h3>
//             <p>{stats.allSkills || "No skills recorded"}</p>
//           </div>

//           {/* === FILTERS === */}
//           <div className="filters-section">
//             <div className="search-box">
//               <input
//                 type="text"
//                 placeholder="Search events..."
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//               />
//             </div>

//             <div className="status-filter">
//               <select
//                 value={filterStatus}
//                 onChange={(e) => setFilterStatus(e.target.value)}
//               >
//                 <option value="All">All Status</option>
//                 <option value="Assigned">Assigned</option>
//                 <option value="Completed">Completed</option>
//                 <option value="Cancelled">Cancelled</option>
//                 <option value="In Progress">In Progress</option>
//               </select>
//             </div>
//           </div>

//           {/* === EVENTS TABLE === */}
//           <div className="events-table-container">
//             <table className="events-table">
//               <thead>
//                 <tr>
//                   <th>Event Name</th>
//                   <th>Date</th>
//                   <th>Location</th>
//                   <th>Status</th>
//                   <th>Hours</th>
//                   <th>Skills Used</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {filteredEvents.map((event) => (
//                   <tr key={event.id}>
//                     <td>{event.name}</td>
//                     <td>{new Date(event.date).toLocaleDateString()}</td>
//                     <td>{event.location}</td>
//                     <td>
//                       <span
//                         className={`status-badge status-${event.status.toLowerCase()}`}
//                       >
//                         {event.status}
//                       </span>
//                     </td>
//                     <td>{event.hours || "-"}</td>
//                     <td>{event.skills.join(", ") || "-"}</td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>

//             {filteredEvents.length === 0 && (
//               <div className="no-events">No events found matching criteria.</div>
//             )}
//           </div>
//         </>
//       )}
//     </div>
//   );
// };

// export default VolunteerHistoryPage;

