// frontend/src/pages/admin/MatchingPage.jsx
import { useState, useEffect } from "react";
import {
  getAllEvents,
  getMatchesForEvent,
  createMatch,
} from "../../api/matchingServer";
import axios from "axios";
import "./MatchingPage.css";

export default function MatchingPage() {
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState("");
  const [matches, setMatches] = useState([]);
  const [assigned, setAssigned] = useState([]); // ✅ NEW
  const [loading, setLoading] = useState(false);
  const [autoLoading, setAutoLoading] = useState(false);
  const [message, setMessage] = useState("");

  // ✅ Load all events on mount
  useEffect(() => {
    (async () => {
      try {
        const data = await getAllEvents();
        setEvents(data);
      } catch (err) {
        console.error("Error fetching events:", err);
      }
    })();
  }, []);

  // ✅ Fetch assigned volunteers for event
  async function loadAssignedVolunteers(eventId) {
    try {
      const res = await axios.get(
        `http://localhost:8080/matching/event/${eventId}/assigned`
      );
      if (res.data.success) setAssigned(res.data.data);
      else setAssigned([]);
    } catch (err) {
      console.error("Error loading assigned volunteers:", err);
      setAssigned([]);
    }
  }

  // ✅ Fetch potential matches
  async function handleFindMatches() {
    if (!selectedEventId) return alert("Select an event first!");
    setLoading(true);
    setMessage("");

    try {
      const res = await getMatchesForEvent(selectedEventId);
      if (res.success && Array.isArray(res.data)) {
        setMatches(res.data);
        setMessage(`✅ Found ${res.data.length} potential volunteers`);
      } else {
        setMatches([]);
        setMessage("⚠️ No suitable volunteers found for this event.");
      }
      await loadAssignedVolunteers(selectedEventId); // ✅ load assigned list too
    } catch (err) {
      console.error(err);
      setMessage("❌ Error fetching matches.");
    } finally {
      setLoading(false);
    }
  }

  // ✅ Assign volunteer manually
  async function handleAssign(volunteerId) {
    try {
      const res = await createMatch(volunteerId, selectedEventId);
      if (res.success) {
        alert("✅ Volunteer successfully assigned!");
        await handleFindMatches(); // refresh matches
        await loadAssignedVolunteers(selectedEventId); // refresh assigned
      } else {
        alert("⚠️ Could not assign volunteer.");
      }
    } catch (err) {
      console.error("Error assigning volunteer:", err);
      alert("❌ Error assigning volunteer.");
    }
  }

  // ✅ Auto assign top volunteers
  async function handleAutoAssign() {
    if (!selectedEventId) return alert("Select an event first!");
    setAutoLoading(true);
    setMessage("Auto-assigning volunteers...");

    try {
      const res = await axios.post(
        `http://localhost:8080/matching/event/${selectedEventId}/auto?top=2&min=0.4`
      );
      if (res.data.success) {
        alert(`✅ Assigned ${res.data.assigned?.length || 0} successfully!`);
        await handleFindMatches();
      } else {
        alert("⚠️ Auto-assign failed: " + res.data.message);
      }
    } catch (err) {
      console.error(err);
      alert("❌ Error performing auto-assign.");
    } finally {
      setAutoLoading(false);
    }
  }

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold text-orange-600">
        Volunteer Matching Dashboard (Admin)
      </h1>

      {/* Event Selector */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Select an Event:
        </label>
        <select
          className="border rounded-md px-3 py-2 w-full"
          value={selectedEventId}
          onChange={(e) => setSelectedEventId(e.target.value)}
        >
          <option value="">-- Choose Event --</option>
          {events.map((evt) => (
            <option key={evt.id} value={evt.id}>
              {evt.name || evt.title} — {evt.location}
            </option>
          ))}
        </select>
      </div>

      {/* Buttons */}
      <div className="flex gap-3">
        <button
          onClick={handleFindMatches}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          disabled={loading || !selectedEventId}
        >
          {loading ? "Finding Matches..." : "🔍 Find Matches"}
        </button>

        <button
          onClick={handleAutoAssign}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          disabled={autoLoading || !selectedEventId}
        >
          {autoLoading ? "Auto-Assigning..." : "⚡ Auto Assign"}
        </button>
      </div>

      {/* Feedback Message */}
      {message && (
        <p className="text-sm mt-2 text-gray-700 font-medium">{message}</p>
      )}

      {/* Matches Table */}
      <div className="overflow-x-auto border rounded-lg mt-6">
        <table className="min-w-full border-collapse">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 text-left">Volunteer</th>
              <th className="px-4 py-2 text-left">Skills</th>
              <th className="px-4 py-2 text-left">Match %</th>
              <th className="px-4 py-2 text-left">Details</th>
              <th className="px-4 py-2 text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {matches.length === 0 ? (
              <tr>
                <td
                  colSpan="5"
                  className="text-center py-6 text-gray-500 font-medium"
                >
                  No matches found.
                </td>
              </tr>
            ) : (
              matches.map((m, i) => (
                <tr
                  key={i}
                  className="border-t hover:bg-gray-50 transition-colors"
                >
                  <td className="px-4 py-2 font-semibold text-gray-800">
                    {m.volunteer.name}
                  </td>
                  <td className="px-4 py-2 text-gray-700">
                    {m.volunteer.skills.join(", ")}
                  </td>
                  <td className="px-4 py-2 font-medium">
                    {(m.matchScore * 100).toFixed(0)}%
                  </td>
                  <td className="px-4 py-2 text-gray-600">{m.reason}</td>
                  <td className="px-4 py-2 text-center">
                    <button
                      onClick={() => handleAssign(m.volunteer.id)}
                      className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      Assign
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ✅ Assigned Volunteers Section */}
      {assigned.length > 0 && (
        <div className="mt-10 border-t pt-6">
          <h2 className="text-xl font-semibold text-orange-600 mb-3">
            Already Assigned Volunteers ({assigned.length})
          </h2>
          <div className="overflow-x-auto border rounded-lg">
            <table className="min-w-full border-collapse">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 text-left">Name</th>
                  <th className="px-4 py-2 text-left">Status</th>
                  <th className="px-4 py-2 text-left">Hours</th>
                  <th className="px-4 py-2 text-left">Skills Used</th>
                </tr>
              </thead>
              <tbody>
                {/* {assigned.map((v) => ( */}
                {Array.from(
                  new Map(assigned.map(v => [v.volunteerId, v])).values()
                ).map((v) => (

                  <tr
                    key={v.volunteerId}
                    className="border-t hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-2 font-medium">{v.volunteerName}</td>
                    <td className="px-4 py-2">
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold ${
                          v.participationStatus === "completed"
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {v.participationStatus}
                      </span>
                    </td>
                    <td className="px-4 py-2">{v.hoursVolunteered}</td>
                    <td className="px-4 py-2 text-gray-600">
                      {v.skillsUsed?.length
                        ? v.skillsUsed.join(", ")
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// // frontend/src/pages/admin/MatchingPage.jsx
// import { useState, useEffect } from "react";
// import axios from "axios";
// import "./MatchingPage.css";

// export default function MatchingPage() {
//   const [events, setEvents] = useState([]);
//   const [selectedEventId, setSelectedEventId] = useState("");
//   const [matches, setMatches] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [autoLoading, setAutoLoading] = useState(false);
//   const [message, setMessage] = useState("");
//   const [historyData, setHistoryData] = useState(null);
//   const [activeVolunteer, setActiveVolunteer] = useState(null);

//   // ✅ Load all events from backend
//   useEffect(() => {
//     (async () => {
//       try {
//         const res = await axios.get("http://localhost:8080/events");
//         if (Array.isArray(res.data)) setEvents(res.data);
//       } catch (err) {
//         console.error("Error fetching events:", err);
//       }
//     })();
//   }, []);

//   // ✅ Fetch matches for selected event
//   async function handleFindMatches() {
//     if (!selectedEventId) return alert("Select an event first!");
//     setLoading(true);
//     setMessage("");
//     try {
//       const res = await axios.get(
//         `http://localhost:8080/matching/event/${selectedEventId}`
//       );
//       if (res.data.success && Array.isArray(res.data.data)) {
//         setMatches(res.data.data);
//         setMessage(`✅ Found ${res.data.data.length} potential volunteers`);
//       } else {
//         setMatches([]);
//         setMessage("⚠️ No suitable volunteers found for this event.");
//       }
//     } catch (err) {
//       console.error(err);
//       setMessage("❌ Error fetching matches.");
//     } finally {
//       setLoading(false);
//     }
//   }

//   // ✅ Assign a volunteer manually
//   async function handleAssign(volunteerId) {
//     try {
//       const res = await axios.post("http://localhost:8080/matching", {
//         volunteerId,
//         eventId: selectedEventId,
//       });
//       if (res.data.success) {
//         alert(`✅ Assigned ${res.data.data.volunteerId} successfully!`);
//         handleFindMatches();
//       } else {
//         alert("⚠️ Could not assign volunteer.");
//       }
//     } catch (err) {
//       console.error("Error assigning volunteer:", err);
//       alert("❌ Error assigning volunteer.");
//     }
//   }

//   // ✅ Auto-assign top volunteers
//   async function handleAutoAssign() {
//     if (!selectedEventId) return alert("Select an event first!");
//     setAutoLoading(true);
//     setMessage("Auto-assigning volunteers...");
//     try {
//       const res = await axios.post(
//         `http://localhost:8080/matching/event/${selectedEventId}/auto?top=2&min=0.4`
//       );
//       if (res.data.success) {
//         setMessage(
//           `✅ Auto-assigned ${res.data.assigned?.length || 0} volunteer(s)!`
//         );
//         handleFindMatches();
//       } else {
//         setMessage("⚠️ Auto-assign failed: " + res.data.message);
//       }
//     } catch (err) {
//       console.error(err);
//       setMessage("❌ Error performing auto-assign.");
//     } finally {
//       setAutoLoading(false);
//     }
//   }

//   // ✅ Fetch volunteer history inline
//   async function handleViewHistory(volunteerId) {
//     try {
//       const res = await axios.get(
//         `http://localhost:8080/history/${volunteerId}`
//       );
//       setHistoryData(res.data.data || []);
//       setActiveVolunteer(volunteerId);
//     } catch (err) {
//       console.error("Error loading history:", err);
//       alert("⚠️ Could not load volunteer history.");
//     }
//   }

//   return (
//     <div className="matching-container">
//       <h1>🧭 Volunteer Matching Dashboard (Admin)</h1>

//       {/* Event Selector */}
//       <div className="selector">
//         <label>Select an Event:</label>
//         <select
//           value={selectedEventId}
//           onChange={(e) => setSelectedEventId(e.target.value)}
//         >
//           <option value="">-- Choose Event --</option>
//           {events.map((evt) => (
//             <option key={evt.id} value={evt.id}>
//               {evt.name || evt.title} — {evt.location}
//             </option>
//           ))}
//         </select>
//       </div>

//       {/* Control Buttons */}
//       <div className="buttons">
//         <button onClick={handleFindMatches} disabled={loading || !selectedEventId}>
//           {loading ? "Finding..." : "🔍 Find Matches"}
//         </button>
//         <button
//           onClick={handleAutoAssign}
//           disabled={autoLoading || !selectedEventId}
//           className="auto-btn"
//         >
//           {autoLoading ? "Auto-Assigning..." : "⚡ Auto Assign"}
//         </button>
//       </div>

//       {message && <p className="status-msg">{message}</p>}

//       {/* Matches Table */}
//       <div className="table-wrapper">
//         <table className="matches-table">
//           <thead>
//             <tr>
//               <th>Volunteer</th>
//               <th>Skills</th>
//               <th>Match %</th>
//               <th>Details</th>
//               <th>Action</th>
//             </tr>
//           </thead>
//           <tbody>
//             {matches.length === 0 ? (
//               <tr>
//                 <td colSpan="5" className="no-data">
//                   No matches found.
//                 </td>
//               </tr>
//             ) : (
//               matches.map((m, i) => (
//                 <tr key={i}>
//                   <td>{m.volunteer.name}</td>
//                   <td>{m.volunteer.skills.join(", ")}</td>
//                   <td>
//                     <div className="score-bar">
//                       <div
//                         className="score-fill"
//                         style={{ width: `${m.matchScore * 100}%` }}
//                       ></div>
//                     </div>
//                     {Math.round(m.matchScore * 100)}%
//                   </td>
//                   <td>{m.reason}</td>
//                   <td>
//                     <button
//                       className="assign-btn"
//                       onClick={() => handleAssign(m.volunteer.id)}
//                     >
//                       Assign
//                     </button>
//                     <button
//                       className="history-btn"
//                       onClick={() => handleViewHistory(m.volunteer.id)}
//                     >
//                       History
//                     </button>
//                   </td>
//                 </tr>
//               ))
//             )}
//           </tbody>
//         </table>
//       </div>

//       {/* Inline History View */}
//       {historyData && (
//         <div className="history-panel">
//           <h2>📜 Volunteer History (ID: {activeVolunteer})</h2>
//           {historyData.length === 0 ? (
//             <p>No history records found.</p>
//           ) : (
//             <ul>
//               {historyData.map((h) => (
//                 <li key={h.id}>
//                   <strong>{h.eventName}</strong> — {h.eventDate?.split("T")[0]}{" "}
//                   ({h.participationStatus}) • {h.hoursVolunteered} hrs
//                 </li>
//               ))}
//             </ul>
//           )}
//         </div>
//       )}
//     </div>
//   );
// }

// // frontend/src/pages/admin/MatchingPage.jsx
// import { useState, useEffect } from "react";
// import {
//   getAllEvents,
//   getMatchesForEvent,
//   createMatch,
// } from "../../api/matchingServer";
// import axios from "axios";
// import "./MatchingPage.css";

// export default function MatchingPage() {
//   const [events, setEvents] = useState([]);
//   const [selectedEventId, setSelectedEventId] = useState("");
//   const [matches, setMatches] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [autoLoading, setAutoLoading] = useState(false);
//   const [message, setMessage] = useState("");

//   // ✅ Load all events from backend
//   useEffect(() => {
//     (async () => {
//       try {
//         const data = await getAllEvents();
//         setEvents(data);
//       } catch (err) {
//         console.error("Error fetching events:", err);
//       }
//     })();
//   }, []);

//   // ✅ Fetch matches for a specific event
//   async function handleFindMatches() {
//     if (!selectedEventId) return alert("Select an event first!");
//     setLoading(true);
//     setMessage("");

//     try {
//       const res = await getMatchesForEvent(selectedEventId);
//       if (res.success && Array.isArray(res.data)) {
//         setMatches(res.data);
//         setMessage(`✅ Found ${res.data.length} potential volunteers`);
//       } else {
//         setMatches([]);
//         setMessage("⚠️ No suitable volunteers found for this event.");
//       }
//     } catch (err) {
//       console.error(err);
//       setMessage("❌ Error fetching matches.");
//     } finally {
//       setLoading(false);
//     }
//   }

//   // ✅ Manually assign a volunteer
//   async function handleAssign(volunteerId) {
//     try {
//       const res = await createMatch(volunteerId, selectedEventId);
//       if (res.success) {
//         alert("✅ Volunteer successfully assigned and recorded!");
//         handleFindMatches(); // refresh list
//       } else {
//         alert("⚠️ Could not assign volunteer.");
//       }
//     } catch (err) {
//       console.error("Error assigning volunteer:", err);
//       alert("❌ Error assigning volunteer.");
//     }
//   }

//   // ✅ Auto-assign top volunteers
//   async function handleAutoAssign() {
//     if (!selectedEventId) return alert("Select an event first!");
//     setAutoLoading(true);
//     setMessage("Auto-assigning volunteers...");

//     try {
//       const res = await axios.post(
//         `http://localhost:8080/matching/event/${selectedEventId}/auto?top=2&min=0.4`
//       );
//       if (res.data.success) {
//         setMessage(
//           `✅ Auto-assigned ${res.data.assigned?.length || 0} volunteer(s)!`
//         );
//         handleFindMatches(); // reload after assigning
//       } else {
//         setMessage("⚠️ Auto-assign failed: " + res.data.message);
//       }
//     } catch (err) {
//       console.error(err);
//       setMessage("❌ Error performing auto-assign.");
//     } finally {
//       setAutoLoading(false);
//     }
//   }

//   return (
//     <div className="matching-container">
//       <div className="matching-header">
//         <h1>Volunteer Matching (Admin Only)</h1>
//       </div>

//       {/* Event Selector */}
//       <div className="matching-controls">
//         <select
//           value={selectedEventId}
//           onChange={(e) => setSelectedEventId(e.target.value)}
//         >
//           <option value="">-- Choose Event --</option>
//           {events.map((evt) => (
//             <option key={evt.id} value={evt.id}>
//               {evt.name || evt.title} — {evt.location}
//             </option>
//           ))}
//         </select>

//         <button
//           onClick={handleFindMatches}
//           className="btn-primary"
//           disabled={loading || !selectedEventId}
//         >
//           {loading ? "Finding Matches..." : "Find Matches"}
//         </button>

//         <button
//           onClick={handleAutoAssign}
//           className="btn-success"
//           disabled={autoLoading || !selectedEventId}
//         >
//           {autoLoading ? "Auto-Assigning..." : "Auto-Assign Top Volunteers"}
//         </button>
//       </div>

//       {/* Feedback Message */}
//       {message && <p className="message-banner">{message}</p>}

//       {/* Matches Table */}
//       <table className="match-table">
//         <thead>
//           <tr>
//             <th>Volunteer</th>
//             <th>Skills</th>
//             <th>Match %</th>
//             <th>Reason</th>
//             <th className="text-center">Assign</th>
//           </tr>
//         </thead>
//         <tbody>
//           {matches.length === 0 ? (
//             <tr>
//               <td colSpan="5" style={{ textAlign: "center", padding: "1rem" }}>
//                 No matches found.
//               </td>
//             </tr>
//           ) : (
//             matches.map((m, i) => (
//               <tr key={i}>
//                 <td>{m.volunteer.name}</td>
//                 <td>
//                   {m.volunteer.skills.map((skill, idx) => (
//                     <span key={idx} className="match-skill-badge">
//                       {skill}
//                     </span>
//                   ))}
//                 </td>
//                 <td className="match-score">
//                   {(m.matchScore * 100).toFixed(0)}%
//                 </td>
//                 <td>{m.reason}</td>
//                 <td style={{ textAlign: "center" }}>
//                   <button
//                     onClick={() => handleAssign(m.volunteer.id)}
//                     className="btn-assign"
//                   >
//                     Assign
//                   </button>
//                 </td>
//               </tr>
//             ))
//           )}
//         </tbody>
//       </table>
//     </div>
//   );
// }

// // frontend/src/pages/admin/MatchingPage.jsx
// import { useState, useEffect } from "react";
// import {
//   getAllEvents,
//   getMatchesForEvent,
//   createMatch,
// } from "../../api/matchingServer";
// import axios from "axios";
// import "./MatchingPage.css";


// export default function MatchingPage() {
//   const [events, setEvents] = useState([]);
//   const [selectedEventId, setSelectedEventId] = useState("");
//   const [matches, setMatches] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [autoLoading, setAutoLoading] = useState(false);
//   const [message, setMessage] = useState("");

//   // ✅ Load all events from backend
//   useEffect(() => {
//     (async () => {
//       try {
//         const data = await getAllEvents();
//         setEvents(data);
//       } catch (err) {
//         console.error("Error fetching events:", err);
//       }
//     })();
//   }, []);

//   // ✅ Fetch matches for a specific event
//   async function handleFindMatches() {
//     if (!selectedEventId) return alert("Select an event first!");
//     setLoading(true);
//     setMessage("");

//     try {
//       const res = await getMatchesForEvent(selectedEventId);
//       if (res.success && Array.isArray(res.data)) {
//         setMatches(res.data);
//         setMessage(`✅ Found ${res.data.length} potential volunteers`);
//       } else {
//         setMatches([]);
//         setMessage("⚠️ No suitable volunteers found for this event.");
//       }
//     } catch (err) {
//       console.error(err);
//       setMessage("❌ Error fetching matches.");
//     } finally {
//       setLoading(false);
//     }
//   }

//   // ✅ Manually assign a volunteer
//   async function handleAssign(volunteerId) {
//     try {
//       const res = await createMatch(volunteerId, selectedEventId);
//       if (res.success) {
//         alert("✅ Volunteer successfully assigned and recorded!");
//         handleFindMatches(); // refresh list
//       } else {
//         alert("⚠️ Could not assign volunteer.");
//       }
//     } catch (err) {
//       console.error("Error assigning volunteer:", err);
//       alert("❌ Error assigning volunteer.");
//     }
//   }

//   // ✅ Auto-assign top volunteers
//   async function handleAutoAssign() {
//     if (!selectedEventId) return alert("Select an event first!");
//     setAutoLoading(true);
//     setMessage("Auto-assigning volunteers...");

//     try {
//       const res = await axios.post(
//         `http://localhost:8080/matching/event/${selectedEventId}/auto?top=2&min=0.4`
//       );
//       if (res.data.success) {
//         setMessage(
//           `✅ Auto-assigned ${res.data.assigned?.length || 0} volunteer(s)!`
//         );
//         handleFindMatches(); // reload after assigning
//       } else {
//         setMessage("⚠️ Auto-assign failed: " + res.data.message);
//       }
//     } catch (err) {
//       console.error(err);
//       setMessage("❌ Error performing auto-assign.");
//     } finally {
//       setAutoLoading(false);
//     }
//   }

//   return (
//     <div className="max-w-5xl mx-auto p-6 space-y-6">
//       <h1 className="text-2xl font-bold text-orange-600">
//         Volunteer Matching (Admin Only)
//       </h1>

//       {/* Event Selector */}
//       <div className="space-y-2">
//         <label className="block text-sm font-medium text-gray-700">
//           Select an Event:
//         </label>
//         <select
//           className="border rounded-md px-3 py-2 w-full"
//           value={selectedEventId}
//           onChange={(e) => setSelectedEventId(e.target.value)}
//         >
//           <option value="">-- Choose Event --</option>
//           {events.map((evt) => (
//             <option key={evt.id} value={evt.id}>
//               {evt.name || evt.title} — {evt.location}
//             </option>
//           ))}
//         </select>
//       </div>

//       {/* Buttons */}
//       <div className="flex gap-3">
//         <button
//           onClick={handleFindMatches}
//           className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
//           disabled={loading || !selectedEventId}
//         >
//           {loading ? "Finding Matches..." : "Find Matches"}
//         </button>

//         <button
//           onClick={handleAutoAssign}
//           className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
//           disabled={autoLoading || !selectedEventId}
//         >
//           {autoLoading ? "Auto-Assigning..." : "Auto-Assign Top Volunteers"}
//         </button>
//       </div>

//       {/* Feedback Message */}
//       {message && (
//         <p className="text-sm mt-2 text-gray-700 font-medium">{message}</p>
//       )}

//       {/* Matches Table */}
//       <div className="overflow-x-auto border rounded-lg mt-6">
//         <table className="min-w-full border-collapse">
//           <thead className="bg-gray-100">
//             <tr>
//               <th className="px-4 py-2 text-left">Volunteer</th>
//               <th className="px-4 py-2 text-left">Skills</th>
//               <th className="px-4 py-2 text-left">Match %</th>
//               <th className="px-4 py-2 text-left">Reason</th>
//               <th className="px-4 py-2 text-center">Assign</th>
//             </tr>
//           </thead>
//           <tbody>
//             {matches.length === 0 ? (
//               <tr>
//                 <td
//                   colSpan="5"
//                   className="text-center py-6 text-gray-500 font-medium"
//                 >
//                   No matches found.
//                 </td>
//               </tr>
//             ) : (
//               matches.map((m, i) => (
//                 <tr
//                   key={i}
//                   className="border-t hover:bg-gray-50 transition-colors"
//                 >
//                   <td className="px-4 py-2 font-semibold text-gray-800">
//                     {m.volunteer.name}
//                   </td>
//                   <td className="px-4 py-2 text-gray-700">
//                     {m.volunteer.skills.join(", ")}
//                   </td>
//                   <td className="px-4 py-2 font-medium">
//                     {(m.matchScore * 100).toFixed(0)}%
//                   </td>
//                   <td className="px-4 py-2 text-gray-600">{m.reason}</td>
//                   <td className="px-4 py-2 text-center">
//                     <button
//                       onClick={() => handleAssign(m.volunteer.id)}
//                       className="px-3 py-1 bg-black text-white rounded hover:bg-gray-800"
//                     >
//                       Assign
//                     </button>
//                   </td>
//                 </tr>
//               ))
//             )}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// }

// // import { useState, useEffect } from "react";
// // import {
// //   getMatchesForEvent,
// //   createMatch,
// //   getAllEvents,
// //   getAllVolunteers,
// // } from "../../api/matchingServer";

// // export default function MatchingPage() {
// //   const [events, setEvents] = useState([]);
// //   const [selectedEventId, setSelectedEventId] = useState("");
// //   const [matches, setMatches] = useState([]);
// //   const [loading, setLoading] = useState(false);
// //   const [assigning, setAssigning] = useState(false);
// //   const [error, setError] = useState("");

// //   // ✅ Load events from backend
// //   useEffect(() => {
// //     async function load() {
// //       try {
// //         const res = await getAllEvents();
// //         setEvents(res);
// //       } catch (err) {
// //         console.error("Error loading events:", err);
// //         setError("Failed to load events");
// //       }
// //     }
// //     load();
// //   }, []);

// //   // ✅ When event changes, fetch matches
// //   async function handleEventChange(e) {
// //     const id = e.target.value;
// //     setSelectedEventId(id);
// //     setMatches([]);
// //     if (!id) return;

// //     setLoading(true);
// //     try {
// //       const res = await getMatchesForEvent(id);
// //       if (res.success && Array.isArray(res.data)) {
// //         setMatches(res.data);
// //       } else {
// //         setMatches([]);
// //       }
// //     } catch (err) {
// //       console.error("Error fetching matches:", err);
// //       setError("Could not load matches");
// //     } finally {
// //       setLoading(false);
// //     }
// //   }

// //   // ✅ Assign volunteer to event
// //   async function handleAssign(volunteerId) {
// //     if (!selectedEventId) return alert("Select an event first!");
// //     setAssigning(true);
// //     try {
// //       const res = await createMatch(volunteerId, selectedEventId);
// //       if (res.success) {
// //         alert("✅ Volunteer assigned and recorded in history!");
// //       } else {
// //         alert("⚠️ Failed to assign volunteer.");
// //       }
// //     } catch (err) {
// //       console.error("Error assigning volunteer:", err);
// //       alert("Error creating match.");
// //     } finally {
// //       setAssigning(false);
// //     }
// //   }

// //   return (
// //     <div className="max-w-6xl mx-auto p-6 space-y-8">
// //       <h1 className="text-3xl font-bold text-orange-600">
// //         Volunteer Matching System
// //       </h1>

// //       {/* Event Selection */}
// //       <div className="p-4 border rounded-lg bg-blue-50">
// //         <label className="block mb-2 font-medium text-gray-700">
// //           Select Event:
// //         </label>
// //         <select
// //           className="border rounded px-3 py-2 w-full"
// //           value={selectedEventId}
// //           onChange={handleEventChange}
// //         >
// //           <option value="">-- Select Event --</option>
// //           {events.map((evt) => (
// //             <option key={evt.id} value={evt.id}>
// //               {evt.name || evt.title} — {evt.location}
// //             </option>
// //           ))}
// //         </select>
// //       </div>

// //       {/* Loading and Error States */}
// //       {loading && (
// //         <div className="p-4 text-center text-gray-600 bg-gray-100 rounded">
// //           Loading volunteer matches...
// //         </div>
// //       )}
// //       {error && (
// //         <div className="p-4 text-center text-red-600 bg-red-50 rounded">
// //           {error}
// //         </div>
// //       )}

// //       {/* Matches Display */}
// //       {matches.length > 0 && (
// //         <div className="grid md:grid-cols-2 gap-6">
// //           {matches.map((m, idx) => (
// //             <div
// //               key={idx}
// //               className="bg-white shadow-md border rounded-2xl p-5 hover:shadow-lg transition-all"
// //             >
// //               <div className="flex justify-between items-center mb-3">
// //                 <h2 className="text-xl font-semibold text-gray-800">
// //                   {m.volunteer.name}
// //                 </h2>
// //                 <span className="text-sm bg-blue-100 text-blue-700 px-2 py-1 rounded-lg">
// //                   Match Score: {(m.matchScore * 100).toFixed(0)}%
// //                 </span>
// //               </div>

// //               <p className="text-gray-600">
// //                 <strong>Location:</strong> {m.volunteer.location}
// //               </p>
// //               <p className="text-gray-600 mt-1">
// //                 <strong>Email:</strong> {m.volunteer.email}
// //               </p>

// //               <div className="mt-3">
// //                 <strong>Matching Skills:</strong>
// //                 <ul className="list-disc list-inside text-gray-700 ml-4 mt-1">
// //                   {m.matchingSkills.length > 0 ? (
// //                     m.matchingSkills.map((s, i) => <li key={i}>{s}</li>)
// //                   ) : (
// //                     <li className="italic text-gray-500">No matching skills</li>
// //                   )}
// //                 </ul>
// //               </div>

// //               <p className="mt-3 text-gray-500 text-sm">
// //                 <em>{m.reason}</em>
// //               </p>

// //               <button
// //                 onClick={() => handleAssign(m.volunteer.id)}
// //                 className="mt-4 w-full bg-black text-white py-2 rounded-lg hover:bg-gray-800 transition-all disabled:opacity-50"
// //                 disabled={assigning}
// //               >
// //                 {assigning ? "Assigning..." : "Assign Volunteer"}
// //               </button>
// //             </div>
// //           ))}
// //         </div>
// //       )}

// //       {/* No Matches Found */}
// //       {!loading && matches.length === 0 && selectedEventId && (
// //         <div className="p-6 bg-yellow-50 border border-yellow-300 rounded-lg text-center text-yellow-700">
// //           No suitable volunteers found for this event.
// //         </div>
// //       )}
// //     </div>
// //   );
// // }

// // import { useState, useEffect } from "react";
// // import {
// //   getAllEvents,
// //   getAllVolunteers,
// //   getMatchesForEvent,
// //   createMatch,
// // } from "../../api/matchingServer";

// // export default function MatchingPage() {
// //   const [events, setEvents] = useState([]);
// //   const [volunteers, setVolunteers] = useState([]);
// //   const [selectedEvent, setSelectedEvent] = useState("");
// //   const [matches, setMatches] = useState([]);
// //   const [loading, setLoading] = useState(false);
// //   const [message, setMessage] = useState("");

// //   useEffect(() => {
// //     async function loadData() {
// //       try {
// //         const [eventRes, volunteerRes] = await Promise.all([
// //           getAllEvents(),
// //           getAllVolunteers(),
// //         ]);
// //         setEvents(eventRes);
// //         setVolunteers(volunteerRes);
// //       } catch (err) {
// //         console.error("Error loading data:", err);
// //       }
// //     }
// //     loadData();
// //   }, []);

// //   async function handleFindMatches() {
// //     if (!selectedEvent) return alert("Select an event first!");
// //     setLoading(true);
// //     try {
// //       const res = await getMatchesForEvent(selectedEvent);
// //       if (res.success && res.data?.length > 0) {
// //         setMatches(res.data);
// //       } else setMatches([]);
// //     } catch (err) {
// //       console.error("Error getting matches:", err);
// //     } finally {
// //       setLoading(false);
// //     }
// //   }

// //   async function handleAssign(volunteerId) {
// //     try {
// //       const res = await createMatch(volunteerId, selectedEvent);
// //       if (res.success) setMessage("✅ Volunteer assigned and added to history!");
// //     } catch (err) {
// //       console.error("Error assigning volunteer:", err);
// //       setMessage("❌ Error assigning volunteer.");
// //     }
// //   }

// //   return (
// //     <div className="max-w-5xl mx-auto p-4 space-y-6">
// //       <h1 className="text-2xl font-bold text-orange-600">Volunteer Matching</h1>

// //       <div className="space-y-2">
// //         <label>Select Event:</label>
// //         <select
// //           value={selectedEvent}
// //           onChange={(e) => setSelectedEvent(e.target.value)}
// //           className="border rounded px-2 py-1 w-full"
// //         >
// //           <option value="">-- Select Event --</option>
// //           {events.map((e) => (
// //             <option key={e.id} value={e.id}>
// //               {e.name || e.title} — {e.location}
// //             </option>
// //           ))}
// //         </select>
// //       </div>

// //       <button
// //         onClick={handleFindMatches}
// //         className="bg-black text-white px-4 py-2 rounded"
// //         disabled={!selectedEvent || loading}
// //       >
// //         {loading ? "Finding matches..." : "Find Matches"}
// //       </button>

// //       {message && <p className="text-green-600">{message}</p>}

// //       <div className="mt-4">
// //         {matches.length === 0 ? (
// //           <p>No matches yet.</p>
// //         ) : (
// //           <table className="min-w-full text-sm border">
// //             <thead className="bg-gray-100">
// //               <tr>
// //                 <th className="border p-2">Volunteer</th>
// //                 <th className="border p-2">Skills</th>
// //                 <th className="border p-2">Score</th>
// //                 <th className="border p-2">Reason</th>
// //                 <th className="border p-2">Actions</th>
// //               </tr>
// //             </thead>
// //             <tbody>
// //               {matches.map((m) => (
// //                 <tr key={m.volunteer.id}>
// //                   <td className="border p-2">{m.volunteer.name}</td>
// //                   <td className="border p-2">
// //                     {m.volunteer.skills.join(", ")}
// //                   </td>
// //                   <td className="border p-2">{m.matchScore}</td>
// //                   <td className="border p-2">{m.reason}</td>
// //                   <td className="border p-2">
// //                     <button
// //                       className="bg-blue-600 text-white px-3 py-1 rounded"
// //                       onClick={() => handleAssign(m.volunteer.id)}
// //                     >
// //                       Assign
// //                     </button>
// //                   </td>
// //                 </tr>
// //               ))}
// //             </tbody>
// //           </table>
// //         )}
// //       </div>
// //     </div>
// //   );
// // }

// // // frontend/src/components/VolunteerHistory.jsx
// // import { useEffect, useState } from "react";
// // import { getVolunteerHistory, getVolunteerStats } from "../../api/historyServer";

// // export default function VolunteerHistory({ email, volunteerId }) {
// //   const [history, setHistory] = useState([]);
// //   const [stats, setStats] = useState(null);
// //   const [loading, setLoading] = useState(true);

// //   const id = volunteerId || 1; // temporary fallback if not provided

// //   useEffect(() => {
// //     async function loadData() {
// //       try {
// //         const [historyRes, statsRes] = await Promise.all([
// //           getVolunteerHistory(id),
// //           getVolunteerStats(id),
// //         ]);

// //         setHistory(historyRes.data || []);
// //         setStats(statsRes.data || {});
// //       } catch (err) {
// //         console.error("Error loading volunteer history:", err);
// //       } finally {
// //         setLoading(false);
// //       }
// //     }

// //     loadData();
// //   }, [id]);

// //   if (loading) return <p>Loading volunteer history...</p>;

// //   return (
// //     <div className="border-t pt-4 mt-4">
// //       <h2 className="text-xl font-bold mb-2">Volunteer History</h2>

// //       {stats && (
// //         <div className="bg-gray-50 p-3 rounded mb-4">
// //           <p><strong>Total Events:</strong> {stats.totalEvents}</p>
// //           <p><strong>Completed Events:</strong> {stats.completedEvents}</p>
// //           <p><strong>Total Hours:</strong> {stats.totalHours}</p>
// //           {stats.skillsUsed?.length > 0 && (
// //             <p><strong>Skills Used:</strong> {stats.skillsUsed.join(", ")}</p>
// //           )}
// //         </div>
// //       )}

// //       {history.length === 0 ? (
// //         <p>No volunteer history available.</p>
// //       ) : (
// //         <table className="min-w-full text-sm border">
// //           <thead className="bg-gray-100">
// //             <tr>
// //               <th className="border p-2">Event</th>
// //               <th className="border p-2">Date</th>
// //               <th className="border p-2">Location</th>
// //               <th className="border p-2">Status</th>
// //               <th className="border p-2">Hours</th>
// //             </tr>
// //           </thead>
// //           <tbody>
// //             {history.map((h) => (
// //               <tr key={h.id}>
// //                 <td className="border p-2">{h.eventName}</td>
// //                 <td className="border p-2">{new Date(h.eventDate).toLocaleDateString()}</td>
// //                 <td className="border p-2">{h.eventLocation}</td>
// //                 <td className="border p-2">{h.participationStatus}</td>
// //                 <td className="border p-2 text-center">{h.hoursVolunteered}</td>
// //               </tr>
// //             ))}
// //           </tbody>
// //         </table>
// //       )}
// //     </div>
// //   );
// // }

// // // /** ---- Volunteer Matching Page (Admin) ----
// // //  * - Volunteer Name (auto-fill from DB via mockServer.js)
// // //  * - Matched Event (auto-fill based on volunteer profile)
// // //  * - Propose/Confirm assignment actions
// // //  */
// // import { useState } from "react";
// // import VolunteerPicker from "../../components/matching/VolunteerPicker";
// // import MatchedEventCard from "../../components/matching/MatchedEventCard";
// // import AlternativeEventsTable from "../../components/matching/AlternativeEventsTable";
// // import { createAssignment, getMatchSuggestion } from "../../api/mockServer";

// // // Helper function to update volunteer history in localStorage
// // function updateVolunteerHistory(volunteerEmail, eventDetails, status) {
// //   const users = JSON.parse(localStorage.getItem("volunthero_users"));
// //   const volunteer = users[volunteerEmail.toLowerCase()];

// //   if (!volunteer) {
// //     console.error("Volunteer not found");
// //     return;
// //   }

// //   const newHistoryEntry = {
// //     eventId: eventDetails.id,
// //     eventName: eventDetails.name,
// //     eventDate: eventDetails.date,
// //     eventLocation: eventDetails.location,
// //     skillsRequired: eventDetails.skills,
// //     status: status, // Status could be "Proposed" or "Confirmed"
// //   };

// //   volunteer.history = volunteer.history || [];
// //   volunteer.history.push(newHistoryEntry);

// //   users[volunteerEmail.toLowerCase()] = volunteer;
// //   localStorage.setItem("volunthero_users", JSON.stringify(users));
// // }

// // export default function MatchingPage() {
// //   const [best, setBest] = useState(null);
// //   const [alts, setAlts] = useState([]);
// //   const [loading, setLoading] = useState(false);
// //   const [vol, setVol] = useState(null);
// //   const [mode, setMode] = useState("proposed");
// //   const [errors, setErrors] = useState({});
// //   const [backendMatches, setBackendMatches] = useState([]); // NEW: Backend matches
// //   const [useBackend, setUseBackend] = useState(false); // NEW: Toggle between mock and backend

// //   async function onVolunteerSelected(v) {
// //     setVol(v);
// //     setErrors({});
// //     setLoading(true);

// //     if (useBackend) {
// //       // NEW: Use YOUR backend API
// //       try {
// //         const response = await fetch(`http://localhost:8080/matching/event/1`); // Using event 1 for demo
// //         const data = await response.json();

// //         if (data.success && data.data.length > 0) {
// //           // Transform backend data to match existing frontend format
// //           const backendBest = data.data[0]; // Highest score is first
// //           const backendAlts = data.data.slice(1); // Rest are alternatives

// //           setBest(transformBackendEvent(backendBest));
// //           setAlts(backendAlts.map(transformBackendEvent));
// //           setBackendMatches(data.data);
// //         }
// //       } catch (error) {
// //         console.error('Error fetching from backend:', error);
// //         // Fallback to mock data
// //         const res = await getMatchSuggestion(v.id);
// //         setBest(res.best);
// //         setAlts(res.alternatives);
// //       }
// //     } else {
// //       // Use existing mock server
// //       const res = await getMatchSuggestion(v.id);
// //       setBest(res.best);
// //       setAlts(res.alternatives);
// //     }

// //     setLoading(false);
// //   }
// //   function transformBackendEvent(backendMatch) {
// //     return {
// //       id: backendMatch.volunteer?.id || backendMatch.event?.id || Math.random(),
// //       title: backendMatch.event?.name || backendMatch.volunteer?.name || "Event",
// //       location: backendMatch.event?.location || backendMatch.volunteer?.location || "Location",
// //       date: backendMatch.event?.date || new Date().toISOString(),
// //       score: backendMatch.matchScore || 0,
// //       requiredSkills: backendMatch.matchingSkills?.map(skill => ({
// //         skillId: skill,
// //         name: skill,
// //         minLevel: 1
// //       })) || [],
// //       breakdown: {
// //         skill: Math.round((backendMatch.matchScore || 0) * 0.5),
// //         availability: backendMatch.isAvailable ? 20 : 0,
// //         distance: 30
// //       }
// //     };
// //   }

// //   // NEW: Transform backend data to match frontend format
// //   // function transformBackendEvent(backendMatch) {
// //   //   return {
// //   //     id: backendMatch.volunteer.id,
// //   //     title: backendMatch.volunteer.name,
// //   //     location: backendMatch.volunteer.location,
// //   //     date: new Date().toISOString(), // Use current date since backend doesn't provide event date
// //   //     score: backendMatch.matchScore,
// //   //     requiredSkills: backendMatch.matchingSkills.map(skill => ({
// //   //       skillId: skill,
// //   //       name: skill,
// //   //       minLevel: 1
// //   //     })),
// //   //     breakdown: {
// //   //       skill: backendMatch.matchScore * 0.5, // Estimate based on weights
// //   //       availability: backendMatch.isAvailable ? 0.2 : 0,
// //   //       distance: 0.3 // Estimate
// //   //     }
// //   //   };
// //   // }


// //   function validate() {
// //     const e = {};
// //     if (!vol || !vol.id) e.volunteerId = "Volunteer is required";
// //     if (!best || !best.id) e.eventId = "Matched event is required";
// //     setErrors(e);
// //     return Object.keys(e).length === 0;
// //   }

// //   async function onSubmit(e) {
// //     e.preventDefault();
// //     if (!validate()) return;

// //     if (useBackend) {
// //       // NEW: Use YOUR backend API to create match
// //       try {
// //         const response = await fetch('http://localhost:8080/matching', {
// //           method: 'POST',
// //           headers: {
// //             'Content-Type': 'application/json',
// //           },
// //           body: JSON.stringify({
// //             volunteerId: vol.id,
// //             eventId: 1 // Using event 1 for demo - in real app, this would be dynamic
// //           })
// //         });

// //         const data = await response.json();

// //         if (data.success) {
// //           // Update the volunteer history after proposing or confirming the assignment
// //           updateVolunteerHistory(vol.email, best, mode);
// //           alert(mode === "confirmed" ? "Assignment confirmed via Backend" : "Assignment proposed via Backend");
// //         }
// //       } catch (error) {
// //         console.error('Error creating match in backend:', error);
// //         alert('Error creating match. Please try again.');
// //       }
// //     } else {
// //       // Use existing mock server
// //       updateVolunteerHistory(vol.email, best, mode);
// //       await createAssignment({ eventId: best.id, userId: vol.id, mode });
// //       alert(mode === "confirmed" ? "Assignment confirmed" : "Assignment proposed");
// //     }
// //   }

// //   return (
// //     <div className="max-w-4xl mx-auto p-4 space-y-6">
// //       <h1 className="text-2xl font-bold">Volunteer Matching</h1>

// //       {/* NEW: Backend Toggle */}
// //       <div className="flex items-center gap-4 p-4 border rounded bg-blue-50">
// //         <label className="flex items-center gap-2 cursor-pointer">
// //           <input
// //             type="checkbox"
// //             checked={useBackend}
// //             onChange={(e) => setUseBackend(e.target.checked)}
// //             className="rounded"
// //           />
// //           <span className="font-medium">Use Backend API (Vitor's Implementation)</span>
// //         </label>
// //         {useBackend && (
// //           <span className="text-sm text-green-600">
// //             ✅ Connected to your Volunteer Matching Backend
// //           </span>
// //         )}
// //       </div>

// //       {/* Volunteer Name (Auto-fill from database) */}
// //       <VolunteerPicker onSelect={onVolunteerSelected} />
// //       {errors.volunteerId && <div className="text-sm text-red-600">{errors.volunteerId}</div>}

// //       {/* Matched Event (Auto-fill from volunteer profile) */}
// //       <div className="space-y-2">
// //         <label className="text-sm font-medium">Matched Event</label>
// //         {loading ? (
// //           <div className="p-4 border rounded bg-gray-50">
// //             {useBackend ? "Finding best match from Backend..." : "Finding best match..."}
// //           </div>
// //         ) : (
// //           <MatchedEventCard ev={best} useBackend={useBackend} />
// //         )}
// //         <AlternativeEventsTable rows={alts} useBackend={useBackend} />
// //       </div>
// //       {errors.eventId && <div className="text-sm text-red-600">{errors.eventId}</div>}

// //       <form onSubmit={onSubmit} className="space-y-3">
// //         <div className="flex items-center gap-4">
// //           <label className="text-sm">Mode</label>
// //           <select
// //             className="border rounded px-2 py-1"
// //             value={mode}
// //             onChange={(e) => setMode(e.target.value)}
// //           >
// //             <option value="proposed">Propose</option>
// //             <option value="confirmed">Confirm</option>
// //           </select>

// //           <button
// //             type="submit"
// //             className="ml-auto px-4 py-2 rounded bg-black text-white disabled:opacity-40"
// //             disabled={!vol || !best}
// //           >
// //             {mode === "confirmed" ? "Confirm Assignment" : "Assign Volunteer"}
// //           </button>
// //         </div>
// //       </form>

// //       {/* NEW: Backend Data Debug Info */}
// //       {useBackend && backendMatches.length > 0 && (
// //         <div className="p-4 border rounded bg-gray-50 text-sm">
// //           <h4 className="font-medium mb-2">Backend Data (Debug):</h4>
// //           <p>Found {backendMatches.length} matches from backend API</p>
// //           <p>Best match score: {backendMatches[0]?.matchScore}</p>
// //         </div>
// //       )}
// //     </div>
// //   );
// // }


// // // import { useState } from "react";
// // // import VolunteerPicker from "../../components/matching/VolunteerPicker";
// // // import MatchedEventCard from "../../components/matching/MatchedEventCard";
// // // import AlternativeEventsTable from "../../components/matching/AlternativeEventsTable";
// // // import { createAssignment, getMatchSuggestion } from "../../api/mockServer";

// // // // Helper function to update volunteer history in localStorage
// // // function updateVolunteerHistory(volunteerEmail, eventDetails, status) {
// // //   const users = JSON.parse(localStorage.getItem("volunthero_users"));
// // //   const volunteer = users[volunteerEmail.toLowerCase()];

// // //   if (!volunteer) {
// // //     console.error("Volunteer not found");
// // //     return;
// // //   }

// // //   const newHistoryEntry = {
// // //     eventId: eventDetails.id,
// // //     eventName: eventDetails.name,
// // //     eventDate: eventDetails.date,
// // //     eventLocation: eventDetails.location,
// // //     skillsRequired: eventDetails.skills,
// // //     status: status, // Status could be "Proposed" or "Confirmed"
// // //   };

// // //   volunteer.history = volunteer.history || [];
// // //   volunteer.history.push(newHistoryEntry);

// // //   users[volunteerEmail.toLowerCase()] = volunteer;
// // //   localStorage.setItem("volunthero_users", JSON.stringify(users));
// // // }

// // // export default function MatchingPage() {
// // //   const [best, setBest] = useState(null);
// // //   const [alts, setAlts] = useState([]);
// // //   const [loading, setLoading] = useState(false);
// // //   const [vol, setVol] = useState(null);
// // //   const [mode, setMode] = useState("proposed");
// // //   const [errors, setErrors] = useState({});

// // //   async function onVolunteerSelected(v) {
// // //     setVol(v);
// // //     setErrors({});
// // //     setLoading(true);
// // //     const res = await getMatchSuggestion(v.id);
// // //     setBest(res.best);
// // //     setAlts(res.alternatives);
// // //     setLoading(false);
// // //   }

// // //   function validate() {
// // //     const e = {};
// // //     if (!vol || !vol.id) e.volunteerId = "Volunteer is required";
// // //     if (!best || !best.id) e.eventId = "Matched event is required";
// // //     setErrors(e);
// // //     return Object.keys(e).length === 0;
// // //   }

// // //   async function onSubmit(e) {
// // //     e.preventDefault();
// // //     if (!validate()) return;

// // //     // Update the volunteer history after proposing or confirming the assignment
// // //     updateVolunteerHistory(vol.email, best, mode);  // Update history in localStorage

// // //     // Proceed with creating the assignment
// // //     await createAssignment({ eventId: best.id, userId: vol.id, mode });

// // //     // Show success message
// // //     alert(mode === "confirmed" ? "Assignment confirmed" : "Assignment proposed");
// // //   }

// // //   return (
// // //     <div className="max-w-4xl mx-auto p-4 space-y-6">
// // //       <h1 className="text-2xl font-bold">Volunteer Matching</h1>

// // //       {/* Volunteer Name (Auto-fill from database) */}
// // //       <VolunteerPicker onSelect={onVolunteerSelected} />
// // //       {errors.volunteerId && <div className="text-sm text-red-600">{errors.volunteerId}</div>}

// // //       {/* Matched Event (Auto-fill from volunteer profile) */}
// // //       <div className="space-y-2">
// // //         <label className="text-sm font-medium">Matched Event</label>
// // //         {loading ? (
// // //           <div className="p-4 border rounded bg-gray-50">Finding best match…</div>
// // //         ) : (
// // //           <MatchedEventCard ev={best} />
// // //         )}
// // //         <AlternativeEventsTable rows={alts} />
// // //       </div>
// // //       {errors.eventId && <div className="text-sm text-red-600">{errors.eventId}</div>}

// // //       <form onSubmit={onSubmit} className="space-y-3">
// // //         <div className="flex items-center gap-4">
// // //           <label className="text-sm">Mode</label>
// // //           <select
// // //             className="border rounded px-2 py-1"
// // //             value={mode}
// // //             onChange={(e) => setMode(e.target.value)}
// // //           >
// // //             <option value="proposed">Propose</option>
// // //             <option value="confirmed">Confirm</option>
// // //           </select>

// // //           <button
// // //             type="submit"
// // //             className="ml-auto px-4 py-2 rounded bg-black text-white disabled:opacity-40"
// // //             disabled={!vol || !best}
// // //           >
// // //             {mode === "confirmed" ? "Confirm Assignment" : "Propose Assignment"}
// // //           </button>
// // //         </div>
// // //       </form>
// // //     </div>
// // //   );
// // // }
