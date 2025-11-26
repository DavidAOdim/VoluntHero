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


// // frontend/src/pages/admin/MatchingPage.jsx

// import { useEffect, useState } from "react";
// import axios from "axios";

// export default function MatchingPage() {
//   const [events, setEvents] = useState([]);
//   const [selectedEvent, setSelectedEvent] = useState("");
//   const [matches, setMatches] = useState([]);
//   const [assigned, setAssigned] = useState([]);

//   useEffect(() => {
//     loadEvents();
//   }, []);

//   async function loadEvents() {
//     try {
//       const res = await axios.get("http://localhost:8080/events");
//       setEvents(res.data);
//     } catch (err) {
//       console.error("Error loading events:", err);
//     }
//   }

//   async function fetchMatches() {
//     if (!selectedEvent) return;

//     try {
//       const res = await axios.get(
//         `http://localhost:8080/matching/event/${selectedEvent}`
//       );
//       setMatches(res.data.matches || []);
//       await loadAssigned();
//     } catch (err) {
//       console.error("Error fetching matches:", err);
//     }
//   }

//   async function loadAssigned() {
//     if (!selectedEvent) return;

//     try {
//       const res = await axios.get(
//         `http://localhost:8080/matching/assigned/${selectedEvent}`
//       );
//       setAssigned(res.data.assigned || []);
//     } catch (err) {
//       console.error("Error fetching assigned volunteers:", err);
//     }
//   }

//   async function assignVolunteer(volunteerId, volunteerName) {
//     if (!selectedEvent) {
//       alert("Please choose an event first.");
//       return;
//     }

//     try {
//       await axios.post("http://localhost:8080/matching/assign", {
//         volunteerEmail,
//         volunteerName,
//         eventId: selectedEvent,
//       });

//       alert("Volunteer assigned successfully!");
//       await loadAssigned();
//     } catch (err) {
//       console.error("Assign error:", err?.response?.data || err);
//       alert("Failed to assign volunteer.");
//     }
//   }

//   return (
//     <div className="matching-page">
//       <h2>Volunteer Matching (Admin)</h2>

//       <select
//         value={selectedEvent}
//         onChange={(e) => setSelectedEvent(e.target.value)}
//       >
//         <option value="">-- Choose an event --</option>
//         {events.map((e) => (
//           <option key={e.id} value={e.id}>
//             {e.title} — {e.location}
//           </option>
//         ))}
//       </select>

//       <button onClick={fetchMatches} style={{ marginLeft: "0.5rem" }}>
//         Find Matches
//       </button>

//       <h3>Matches</h3>
//       <table>
//         <thead>
//           <tr>
//             <th>Name</th>
//             <th>Skills</th>
//             <th>Match %</th>
//             <th>Reason</th>
//             <th>Action</th>
//           </tr>
//         </thead>
//         <tbody>
//           {matches.length === 0 && (
//             <tr>
//               <td colSpan="5">No matches found.</td>
//             </tr>
//           )}

//           {matches.map((m, i) => (
//             <tr key={i}>
//               <td>{m.fullName}</td>
//               <td>{(m.skills || []).join(", ")}</td>
//               <td>{Math.round(m.matchScore)}</td>
//               <td>{m.reason}</td>
//               <td>
//                 <button onClick={() => assignVolunteer(m.volunteerEmail, m.volunteerName)}>Assign</button>
//               </td>
//             </tr>
//           ))}
//         </tbody>
//       </table>

//       <h3>Already Assigned</h3>
//       {assigned.length === 0 ? (
//         <p>No volunteers assigned yet.</p>
//       ) : (
//         <ul>
//           {assigned.map((a) => (
//             <li key={a.id}>
//               {a.volunteerName || a.volunteerEmail} → {a.eventName} (
//               {a.eventDate})
//             </li>
//           ))}
//         </ul>
//       )}
//     </div>
//   );
// }

// // frontend/src/pages/admin/MatchingPage.jsx

// import { useEffect, useState } from "react";
// import axios from "axios";

// export default function MatchingPage() {
//   const [events, setEvents] = useState([]);
//   const [selectedEvent, setSelectedEvent] = useState("");
//   const [matches, setMatches] = useState([]);
//   const [assigned, setAssigned] = useState([]);

//   useEffect(() => {
//     loadEvents();
//   }, []);

//   async function loadEvents() {
//     const res = await axios.get("http://localhost:8080/events");
//     setEvents(res.data);
//   }

//   async function fetchMatches() {
//     if (!selectedEvent) return;

//     const res = await axios.get(
//       `http://localhost:8080/matching/event/${selectedEvent}`
//     );

//     setMatches(res.data.matches || []);
//     loadAssigned();
//   }

//   async function loadAssigned() {
//     if (!selectedEvent) return;

//     const res = await axios.get(
//       `http://localhost:8080/matching/assigned/${selectedEvent}`
//     );

//     setAssigned(res.data.assigned || []);
//   }

//   async function assignVolunteer(volunteerId) {
//     try {
//       const res = await axios.post(`http://localhost:8080/matching/assign`, {
//         volunteerId,
//         eventId: selectedEvent,
//     });
//     alert("Volunteer assigned successfully!");
//     loadAssigned();
//   } catch (err) {
//     console.error("Assign error:", err);
//     alert("Failed to assign volunteer.");
//   }
//   }
//   return (
//     <div className="matching-page">
//       <h2>Volunteer Matching (Admin)</h2>

//       <select
//         value={selectedEvent}
//         onChange={(e) => setSelectedEvent(e.target.value)}
//       >
//         <option value="">-- Choose an event --</option>

//         {events.map((e) => (
//           <option key={e.id} value={e.id}>
//             {e.title} — {e.location}
//           </option>
//         ))}
//       </select>

//       <button onClick={fetchMatches}>Find Matches</button>

//       <h3>Matches</h3>
//       <table>
//         <thead>
//           <tr>
//             <th>Name</th>
//             <th>Skills</th>
//             <th>Match %</th>
//             <th>Reason</th>
//             <th>Action</th>
//           </tr>
//         </thead>

//         <tbody>
//           {matches.length === 0 && (
//             <tr>
//               <td colSpan="5">No matches found.</td>
//             </tr>
//           )}

//           {matches.map((m, i) => (
//             <tr key={i}>
//               <td>{m.fullName}</td>
//               <td>{m.skills.join(", ")}</td>
//               <td>{m.matchScore}%</td>
//               <td>{m.reason}</td>
//               <td>
//                 <button onClick={() => assignVolunteer(m.userId)}>
//                   Assign
//                 </button>
//               </td>
//             </tr>
//           ))}
//         </tbody>
//       </table>

//       <h3>Already Assigned</h3>

//       <ul>
//         {assigned.map((a) => (
//           <li key={a.id}>
//             Volunteer #{a.volunteerId} → {a.eventName} ({a.eventDate})
//           </li>
//         ))}
//       </ul>
//     </div>
//   );
// }


// // frontend/src/pages/admin/MatchingPage.jsx

// import { useState, useEffect } from "react";
// import axios from "axios";

// const API_MATCHING = "http://localhost:8080/matching";
// const API_EVENTS = "http://localhost:8080/events";
// const API_HISTORY = "http://localhost:8080/history";

// export default function MatchingPage() {
//   const [events, setEvents] = useState([]);
//   const [volunteers, setVolunteers] = useState([]);
//   const [selectedEventId, setSelectedEventId] = useState("");
//   const [matches, setMatches] = useState([]);
//   const [assigned, setAssigned] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [message, setMessage] = useState("");

//   // =============================
//   // LOAD EVENTS + VOLUNTEERS
//   // =============================
//   useEffect(() => {
//     loadEvents();
//     loadVolunteers();
//   }, []);

//   async function loadEvents() {
//     try {
//       const res = await axios.get(API_EVENTS);
//       // Your backend returns a raw array
//       setEvents(res.data || []);
//     } catch (err) {
//       console.error("Failed loading events:", err);
//     }
//   }

//   async function loadVolunteers() {
//     try {
//       const res = await axios.get("http://localhost:8080/profile/all");
//       setVolunteers(res.data.data || res.data || []);
//     } catch (err) {
//       console.error("Failed loading volunteers:", err);
//     }
//   }

//   // ===================================
//   // LOAD ASSIGNED VOLUNTEERS FOR EVENT
//   // ===================================
//   async function loadAssigned(eventId) {
//     try {
//       //const res = await axios.get(`${API_HISTORY}/${0}?eventId=${eventId}`);
//       const res = await axios.get(`http://localhost:8080/matching/assigned/${eventId}`);


//       // Your history route doesn't support filtering by event,
//       // so we filter manually here.
//       const allHistory = res.data.data || [];

//       const filtered = allHistory.filter(
//         r => r.eventId === parseInt(eventId)
//       );

//       setAssigned(filtered);
//     } catch (err) {
//       console.error("Error fetching assigned volunteers:", err);
//     }
//   }

//   // ===================================
//   // FIND MATCHES
//   // ===================================
//   async function handleFindMatches() {
//     if (!selectedEventId) return alert("Select an event first!");

//     setLoading(true);
//     setMessage("");

//     try {
//       const res = await axios.get(`${API_MATCHING}/event/${selectedEventId}`);

//       if (res.data.success) {
//         setMatches(res.data.data);
//         setMessage(`Found ${res.data.data.length} potential matches.`);
//       } else {
//         setMatches([]);
//         setMessage("No matches found.");
//       }

//       await loadAssigned(selectedEventId);
//     } catch (err) {
//       console.error(err);
//       setMessage("Error fetching matches.");
//     } finally {
//       setLoading(false);
//     }
//   }

//   // ===================================
//   // ASSIGN VOLUNTEER
//   // ===================================
//   async function handleAssign(email) {
//     try {
//       const res = await axios.post(API_MATCHING, {
//         email,
//         eventId: selectedEventId
//       });

//       if (res.data.success) {
//         alert("Volunteer assigned!");
//         await loadAssigned(selectedEventId);
//       } else {
//         alert("Failed to assign volunteer.");
//       }
//     } catch (err) {
//       console.error(err);
//       alert("Error assigning.");
//     }
//   }

//   // ===================================
//   // RENDER
//   // ===================================
//   return (
//     <div className="max-w-5xl mx-auto p-6 space-y-6">
//       <h1 className="text-2xl font-bold text-orange-600">
//         Volunteer Matching (Admin)
//       </h1>

//       {/* Event Selector */}
//       <div>
//         <label className="block font-medium mb-1">Select Event:</label>
//         <select
//           className="border px-3 py-2 rounded w-full"
//           value={selectedEventId}
//           onChange={e => setSelectedEventId(e.target.value)}
//         >
//           <option value="">-- Choose an event --</option>
//           {events.map(evt => (
//             <option key={evt.id} value={evt.id}>
//               {evt.title} — {evt.location}
//             </option>
//           ))}
//         </select>
//       </div>

//       <button
//         className="px-4 py-2 bg-blue-600 text-white rounded"
//         onClick={handleFindMatches}
//         disabled={!selectedEventId}
//       >
//         {loading ? "Loading..." : "Find Matches"}
//       </button>

//       {message && <p className="text-sm text-gray-700">{message}</p>}

//       {/* MATCHES TABLE */}
//       <div className="mt-6 border rounded overflow-x-auto">
//         <table className="min-w-full">
//           <thead className="bg-gray-100 text-left">
//             <tr>
//               <th className="px-3 py-2">Name</th>
//               <th className="px-3 py-2">Skills</th>
//               <th className="px-3 py-2">Match %</th>
//               <th className="px-3 py-2">Reason</th>
//               <th className="px-3 py-2">Action</th>
//             </tr>
//           </thead>

//           <tbody>
//             {matches.length === 0 && (
//               <tr>
//                 <td colSpan="5" className="text-center py-4 text-gray-500">
//                   No matches
//                 </td>
//               </tr>
//             )}

//             {matches.map((m, i) => (
//               <tr key={i} className="border-t">
//                 <td className="px-3 py-2 font-medium">
//                   {m.volunteer.name}
//                 </td>
//                 <td className="px-3 py-2">
//                   {m.volunteer.skills.join(", ")}
//                 </td>
//                 <td className="px-3 py-2">
//                   {m.matchPercent + "%"}
//                 </td>
//                 <td className="px-3 py-2">{m.reason}</td>
//                 <td className="px-3 py-2">
//                   <button
//                     onClick={() => handleAssign(m.volunteer.email)}
//                     className="px-3 py-1 bg-blue-500 text-white rounded"
//                   >
//                     Assign
//                   </button>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>

//       {/* ASSIGNED SECTION */}
//       {assigned.length > 0 && (
//         <div className="mt-10">
//           <h2 className="text-xl font-semibold text-orange-600 mb-3">
//             Already Assigned
//           </h2>

//           <table className="min-w-full border">
//             <thead className="bg-gray-100">
//               <tr>
//                 <th className="px-3 py-2 text-left">Name</th>
//                 <th className="px-3 py-2 text-left">Status</th>
//                 <th className="px-3 py-2 text-left">Hours</th>
//                 <th className="px-3 py-2 text-left">Skills Used</th>
//               </tr>
//             </thead>

//             <tbody>
//               {assigned.map(a => (
//                 <tr key={a.id} className="border-t">
//                   <td className="px-3 py-2">{a.volunteerName}</td>
//                   <td className="px-3 py-2">{a.participationStatus}</td>
//                   <td className="px-3 py-2">{a.hoursVolunteered}</td>
//                   <td className="px-3 py-2">
//                     {Array.isArray(a.skillsUsed) ? a.skillsUsed.join(", ") : "—"}
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       )}
//     </div>
//   );
// }
// // /** ---- Volunteer Matching Page (Admin) ----
// //  * - Volunteer Name (auto-fill from DB via mockServer.js)
// //  * - Matched Event (auto-fill based on volunteer profile)
// //  * - Propose/Confirm assignment actions
// //  */
// import { useState } from "react";
// import VolunteerPicker from "../../components/matching/VolunteerPicker";
// import MatchedEventCard from "../../components/matching/MatchedEventCard";
// import AlternativeEventsTable from "../../components/matching/AlternativeEventsTable";
// import { createAssignment, getMatchSuggestion } from "../../api/mockServer";

// // Helper function to update volunteer history in localStorage
// function updateVolunteerHistory(volunteerEmail, eventDetails, status) {
//   const users = JSON.parse(localStorage.getItem("volunthero_users"));
//   const volunteer = users[volunteerEmail.toLowerCase()];

//   if (!volunteer) {
//     console.error("Volunteer not found");
//     return;
//   }

//   const newHistoryEntry = {
//     eventId: eventDetails.id,
//     eventName: eventDetails.name,
//     eventDate: eventDetails.date,
//     eventLocation: eventDetails.location,
//     skillsRequired: eventDetails.skills,
//     status: status, // Status could be "Proposed" or "Confirmed"
//   };

//   volunteer.history = volunteer.history || [];
//   volunteer.history.push(newHistoryEntry);

//   users[volunteerEmail.toLowerCase()] = volunteer;
//   localStorage.setItem("volunthero_users", JSON.stringify(users));
// }

// export default function MatchingPage() {
//   const [best, setBest] = useState(null);
//   const [alts, setAlts] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [vol, setVol] = useState(null);
//   const [mode, setMode] = useState("proposed");
//   const [errors, setErrors] = useState({});
//   const [backendMatches, setBackendMatches] = useState([]); // NEW: Backend matches
//   const [useBackend, setUseBackend] = useState(false); // NEW: Toggle between mock and backend

//   async function onVolunteerSelected(v) {
//     setVol(v);
//     setErrors({});
//     setLoading(true);

//     if (useBackend) {
//       // NEW: Use YOUR backend API
//       try {
//         const response = await fetch(`http://localhost:8080/matching/event/1`); // Using event 1 for demo
//         const data = await response.json();

//         if (data.success && data.data.length > 0) {
//           // Transform backend data to match existing frontend format
//           const backendBest = data.data[0]; // Highest score is first
//           const backendAlts = data.data.slice(1); // Rest are alternatives

//           setBest(transformBackendEvent(backendBest));
//           setAlts(backendAlts.map(transformBackendEvent));
//           setBackendMatches(data.data);
//         }
//       } catch (error) {
//         console.error('Error fetching from backend:', error);
//         // Fallback to mock data
//         const res = await getMatchSuggestion(v.id);
//         setBest(res.best);
//         setAlts(res.alternatives);
//       }
//     } else {
//       // Use existing mock server
//       const res = await getMatchSuggestion(v.id);
//       setBest(res.best);
//       setAlts(res.alternatives);
//     }

//     setLoading(false);
//   }
//   function transformBackendEvent(backendMatch) {
//     return {
//       id: backendMatch.volunteer?.id || backendMatch.event?.id || Math.random(),
//       title: backendMatch.event?.name || backendMatch.volunteer?.name || "Event",
//       location: backendMatch.event?.location || backendMatch.volunteer?.location || "Location",
//       date: backendMatch.event?.date || new Date().toISOString(),
//       score: backendMatch.matchScore || 0,
//       requiredSkills: backendMatch.matchingSkills?.map(skill => ({
//         skillId: skill,
//         name: skill,
//         minLevel: 1
//       })) || [],
//       breakdown: {
//         skill: Math.round((backendMatch.matchScore || 0) * 0.5),
//         availability: backendMatch.isAvailable ? 20 : 0,
//         distance: 30
//       }
//     };
//   }

//   // NEW: Transform backend data to match frontend format
//   // function transformBackendEvent(backendMatch) {
//   //   return {
//   //     id: backendMatch.volunteer.id,
//   //     title: backendMatch.volunteer.name,
//   //     location: backendMatch.volunteer.location,
//   //     date: new Date().toISOString(), // Use current date since backend doesn't provide event date
//   //     score: backendMatch.matchScore,
//   //     requiredSkills: backendMatch.matchingSkills.map(skill => ({
//   //       skillId: skill,
//   //       name: skill,
//   //       minLevel: 1
//   //     })),
//   //     breakdown: {
//   //       skill: backendMatch.matchScore * 0.5, // Estimate based on weights
//   //       availability: backendMatch.isAvailable ? 0.2 : 0,
//   //       distance: 0.3 // Estimate
//   //     }
//   //   };
//   // }


//   function validate() {
//     const e = {};
//     if (!vol || !vol.id) e.volunteerId = "Volunteer is required";
//     if (!best || !best.id) e.eventId = "Matched event is required";
//     setErrors(e);
//     return Object.keys(e).length === 0;
//   }

//   async function onSubmit(e) {
//     e.preventDefault();
//     if (!validate()) return;

//     if (useBackend) {
//       // NEW: Use YOUR backend API to create match
//       try {
//         const response = await fetch('http://localhost:8080/matching', {
//           method: 'POST',
//           headers: {
//             'Content-Type': 'application/json',
//           },
//           body: JSON.stringify({
//             volunteerId: vol.id,
//             eventId: 1 // Using event 1 for demo - in real app, this would be dynamic
//           })
//         });

//         const data = await response.json();

//         if (data.success) {
//           // Update the volunteer history after proposing or confirming the assignment
//           updateVolunteerHistory(vol.email, best, mode);
//           alert(mode === "confirmed" ? "Assignment confirmed via Backend" : "Assignment proposed via Backend");
//         }
//       } catch (error) {
//         console.error('Error creating match in backend:', error);
//         alert('Error creating match. Please try again.');
//       }
//     } else {
//       // Use existing mock server
//       updateVolunteerHistory(vol.email, best, mode);
//       await createAssignment({ eventId: best.id, userId: vol.id, mode });
//       alert(mode === "confirmed" ? "Assignment confirmed" : "Assignment proposed");
//     }
//   }

//   return (
//     <div className="max-w-4xl mx-auto p-4 space-y-6">
//       <h1 className="text-2xl font-bold">Volunteer Matching</h1>

//       {/* NEW: Backend Toggle */}
//       <div className="flex items-center gap-4 p-4 border rounded bg-blue-50">
//         <label className="flex items-center gap-2 cursor-pointer">
//           <input
//             type="checkbox"
//             checked={useBackend}
//             onChange={(e) => setUseBackend(e.target.checked)}
//             className="rounded"
//           />
//           <span className="font-medium">Use Backend API (Vitor's Implementation)</span>
//         </label>
//         {useBackend && (
//           <span className="text-sm text-green-600">
//             ✅ Connected to your Volunteer Matching Backend
//           </span>
//         )}
//       </div>

//       {/* Volunteer Name (Auto-fill from database) */}
//       <VolunteerPicker onSelect={onVolunteerSelected} />
//       {errors.volunteerId && <div className="text-sm text-red-600">{errors.volunteerId}</div>}

//       {/* Matched Event (Auto-fill from volunteer profile) */}
//       <div className="space-y-2">
//         <label className="text-sm font-medium">Matched Event</label>
//         {loading ? (
//           <div className="p-4 border rounded bg-gray-50">
//             {useBackend ? "Finding best match from Backend..." : "Finding best match..."}
//           </div>
//         ) : (
//           <MatchedEventCard ev={best} useBackend={useBackend} />
//         )}
//         <AlternativeEventsTable rows={alts} useBackend={useBackend} />
//       </div>
//       {errors.eventId && <div className="text-sm text-red-600">{errors.eventId}</div>}

//       <form onSubmit={onSubmit} className="space-y-3">
//         <div className="flex items-center gap-4">
//           <label className="text-sm">Mode</label>
//           <select
//             className="border rounded px-2 py-1"
//             value={mode}
//             onChange={(e) => setMode(e.target.value)}
//           >
//             <option value="proposed">Propose</option>
//             <option value="confirmed">Confirm</option>
//           </select>

//           <button
//             type="submit"
//             className="ml-auto px-4 py-2 rounded bg-black text-white disabled:opacity-40"
//             disabled={!vol || !best}
//           >
//             {mode === "confirmed" ? "Confirm Assignment" : "Assign Volunteer"}
//           </button>
//         </div>
//       </form>

//       {/* NEW: Backend Data Debug Info */}
//       {useBackend && backendMatches.length > 0 && (
//         <div className="p-4 border rounded bg-gray-50 text-sm">
//           <h4 className="font-medium mb-2">Backend Data (Debug):</h4>
//           <p>Found {backendMatches.length} matches from backend API</p>
//           <p>Best match score: {backendMatches[0]?.matchScore}</p>
//         </div>
//       )}
//     </div>
//   );
// }


