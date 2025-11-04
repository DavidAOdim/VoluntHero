// frontend/src/pages/VolunteerHistoryPage.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import "./VolunteerHistoryPage.css";

export default function VolunteerHistoryPage({ authedEmail }) {
  const [volunteers, setVolunteers] = useState([]);
  const [selectedVolunteerId, setSelectedVolunteerId] = useState("");
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});

  useEffect(() => {
    if (authedEmail && authedEmail.includes("admin")) setIsAdmin(true);
  }, [authedEmail]);

  // Load volunteers for admin dropdown
  useEffect(() => {
    if (!isAdmin) return;
    (async () => {
      try {
        const res = await axios.get("http://localhost:8080/volunteers");
        if (Array.isArray(res.data)) setVolunteers(res.data);
      } catch (err) {
        console.error("Error fetching volunteers:", err);
      }
    })();
  }, [isAdmin]);

  async function loadVolunteerData(volunteerId) {
    setLoading(true);
    try {
      const [histRes, statsRes] = await Promise.all([
        axios.get(`http://localhost:8080/history/${volunteerId}`),
        axios.get(`http://localhost:8080/history/stats/${volunteerId}`),
      ]);
      setHistory(histRes.data.data || []);
      setStats(statsRes.data.data || null);
    } catch (err) {
      console.error("Error loading volunteer data:", err);
      setHistory([]);
      setStats(null);
    } finally {
      setLoading(false);
    }
  }

  // Auto-load current volunteer (for demo: id=1)
  useEffect(() => {
    if (!isAdmin && authedEmail) loadVolunteerData(1);
  }, [authedEmail, isAdmin]);

  // === Editing ===
  function startEdit(record) {
    setEditingId(record.id);
    setEditForm({
      participationStatus: record.participationStatus,
      hoursVolunteered: record.hoursVolunteered,
      feedback: record.feedback,
      skillsUsed: record.skillsUsed || [],
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setEditForm({});
  }

  async function saveEdit(id) {
    try {
      const res = await axios.patch(`http://localhost:8080/history/${id}`, editForm);
      if (res.data.success) {
        alert("✅ Record updated successfully!");
        setEditingId(null);
        await loadVolunteerData(selectedVolunteerId || 1);
      } else {
        alert("⚠️ Failed to update record.");
      }
    } catch (err) {
      console.error("Error saving edit:", err);
      alert("❌ Error updating record.");
    }
  }

  return (
    <div className="volunteer-history-container">
      <h2 style={{ color: "#e45d5d", fontWeight: "bold" }}>Volunteer History</h2>

      {/* === Admin Dropdown === */}
      {isAdmin && (
        <div className="admin-selector" style={{ marginBottom: "20px" }}>
          <label>Select Volunteer:</label>
          <select
            className="border rounded-md px-3 py-2 w-full"
            value={selectedVolunteerId}
            onChange={(e) => {
              const id = e.target.value;
              setSelectedVolunteerId(id);
              if (id) loadVolunteerData(id);
            }}
          >
            <option value="">-- Choose Volunteer --</option>
            {volunteers.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name} — {v.email}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* === Content === */}
      {loading ? (
        <p>Loading...</p>
      ) : !stats ? (
        <p style={{ color: "red" }}>No volunteer data found.</p>
      ) : (
        <>
          {/* Stats */}
          <div className="stats-grid">
            <div className="stat-card">
              <p>Total Events</p>
              <p className="stat-number">{stats.totalEvents}</p>
            </div>
            <div className="stat-card">
              <p>Completed</p>
              <p className="stat-number completed">{stats.completedEvents}</p>
            </div>
            <div className="stat-card">
              <p>Total Hours</p>
              <p className="stat-number hours">{stats.totalHours}</p>
            </div>
            <div className="stat-card">
              <p>Skills Used</p>
              <p className="stat-number">{stats.skillsUsed.length}</p>
            </div>
          </div>

          {/* Table */}
          <div className="events-table-container">
            <table className="events-table">
              <thead>
                <tr>
                  <th>Event</th>
                  <th>Date</th>
                  <th>Location</th>
                  <th>Status</th>
                  <th>Hours</th>
                  <th>Feedback</th>
                  <th>Skills Used</th>
                  {isAdmin && <th>Action</th>}
                </tr>
              </thead>
              <tbody>
                {history.map((h) =>
                  editingId === h.id ? (
                    <tr key={h.id} style={{ background: "#fff6e6" }}>
                      <td>{h.eventName}</td>
                      <td>{new Date(h.eventDate).toLocaleDateString()}</td>
                      <td>{h.eventLocation}</td>
                      <td>
                        <select
                          value={editForm.participationStatus}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              participationStatus: e.target.value,
                            })
                          }
                        >
                          <option>registered</option>
                          <option>completed</option>
                          <option>cancelled</option>
                        </select>
                      </td>
                      <td>
                        <input
                          type="number"
                          min="0"
                          value={editForm.hoursVolunteered}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              hoursVolunteered: parseInt(e.target.value) || 0,
                            })
                          }
                          style={{ width: "60px" }}
                        />
                      </td>
                      <td>
                        <textarea
                          rows="2"
                          value={editForm.feedback}
                          onChange={(e) =>
                            setEditForm({ ...editForm, feedback: e.target.value })
                          }
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          value={editForm.skillsUsed.join(", ")}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              skillsUsed: e.target.value
                                .split(",")
                                .map((s) => s.trim()),
                            })
                          }
                        />
                      </td>
                      <td>
                        <button
                          className="btn-view"
                          onClick={() => saveEdit(h.id)}
                        >
                          Save
                        </button>
                        <button className="btn-cancel" onClick={cancelEdit}>
                          Cancel
                        </button>
                      </td>
                    </tr>
                  ) : (
                    <tr key={h.id}>
                      <td>{h.eventName}</td>
                      <td>{new Date(h.eventDate).toLocaleDateString()}</td>
                      <td>{h.eventLocation}</td>
                      <td>
                        <span
                          className={`status-badge ${
                            h.participationStatus === "completed"
                              ? "status-completed"
                              : "status-assigned"
                          }`}
                        >
                          {h.participationStatus}
                        </span>
                      </td>
                      <td>{h.hoursVolunteered}</td>
                      <td>{h.feedback || "—"}</td>
                      <td>
                        {Array.isArray(h.skillsUsed)
                          ? h.skillsUsed.join(", ")
                          : h.skillsUsed || "—"}
                      </td>
                      {isAdmin && (
                        <td>
                          <button
                            className="btn-view"
                            onClick={() => startEdit(h)}
                          >
                            Edit
                          </button>
                        </td>
                      )}
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

// // frontend/src/pages/VolunteerHistoryPage.jsx
// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import "./VolunteerHistoryPage.css";

// export default function VolunteerHistoryPage({ authedEmail }) {
//   const [volunteers, setVolunteers] = useState([]); // Admin view
//   const [selectedVolunteerId, setSelectedVolunteerId] = useState("");
//   const [history, setHistory] = useState([]);
//   const [stats, setStats] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [isAdmin, setIsAdmin] = useState(false);

//   // ✅ Determine if user is admin
//   useEffect(() => {
//     if (authedEmail && authedEmail.includes("admin")) setIsAdmin(true);
//   }, [authedEmail]);

//   // ✅ Fetch all volunteers (for admin dropdown)
//   useEffect(() => {
//     if (!isAdmin) return;
//     (async () => {
//       try {
//         const res = await axios.get("http://localhost:8080/volunteers");
//         if (res.data && Array.isArray(res.data)) {
//           setVolunteers(res.data);
//         }
//       } catch (err) {
//         console.error("Error fetching volunteer list:", err);
//       }
//     })();
//   }, [isAdmin]);

//   // ✅ Load volunteer history + stats
//   async function loadVolunteerData(volunteerId) {
//     setLoading(true);
//     try {
//       const [histRes, statsRes] = await Promise.all([
//         axios.get(`http://localhost:8080/history/${volunteerId}`),
//         axios.get(`http://localhost:8080/history/stats/${volunteerId}`),
//       ]);
//       setHistory(histRes.data.data || []);
//       setStats(statsRes.data.data || null);
//     } catch (err) {
//       console.error("Error loading volunteer data:", err);
//       setHistory([]);
//       setStats(null);
//     } finally {
//       setLoading(false);
//     }
//   }

//   // ✅ If volunteer user, auto-load their own data
//   useEffect(() => {
//     if (!isAdmin && authedEmail) {
//       // temporarily fake volunteerId 1 for demonstration
//       loadVolunteerData(1);
//     }
//   }, [authedEmail, isAdmin]);

//   return (
//     <div className="volunteer-history-container">
//       <h2 style={{ color: "#e45d5d", fontWeight: "bold" }}>Volunteer History</h2>

//       {/* === Admin Volunteer Selector === */}
//       {isAdmin && (
//         <div className="admin-selector" style={{ marginBottom: "20px" }}>
//           <label className="block text-sm font-medium text-gray-700">
//             Select Volunteer:
//           </label>
//           <select
//             className="border rounded-md px-3 py-2 w-full"
//             value={selectedVolunteerId}
//             onChange={(e) => {
//               const id = e.target.value;
//               setSelectedVolunteerId(id);
//               if (id) loadVolunteerData(id);
//             }}
//           >
//             <option value="">-- Choose Volunteer --</option>
//             {volunteers.map((v) => (
//               <option key={v.id} value={v.id}>
//                 {v.name} — {v.email}
//               </option>
//             ))}
//           </select>
//         </div>
//       )}

//       {/* === Loading & Empty State === */}
//       {loading ? (
//         <p>Loading history...</p>
//       ) : !stats ? (
//         <p style={{ color: "red" }}>No volunteer data found.</p>
//       ) : (
//         <>
//           {/* === Stats Summary === */}
//           <div className="stats-grid">
//             <div className="stat-card">
//               <p>Total Events</p>
//               <p className="stat-number">{stats.totalEvents}</p>
//             </div>
//             <div className="stat-card">
//               <p>Completed</p>
//               <p className="stat-number completed">
//                 {stats.completedEvents}
//               </p>
//             </div>
//             <div className="stat-card">
//               <p>Total Hours</p>
//               <p className="stat-number hours">{stats.totalHours}</p>
//             </div>
//             <div className="stat-card">
//               <p>Skills Used</p>
//               <p className="stat-number">{stats.skillsUsed.length}</p>
//             </div>
//           </div>

//           {/* === Events Table === */}
//           <div className="events-table-container">
//             <table className="events-table">
//               <thead>
//                 <tr>
//                   <th>Event</th>
//                   <th>Date</th>
//                   <th>Location</th>
//                   <th>Status</th>
//                   <th>Hours</th>
//                   <th>Skills Used</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {history.length > 0 ? (
//                   history.map((h) => (
//                     <tr key={h.id}>
//                       <td>{h.eventName}</td>
//                       <td>{new Date(h.eventDate).toLocaleDateString()}</td>
//                       <td>{h.eventLocation}</td>
//                       <td>
//                         <span
//                           className={`status-badge ${
//                             h.participationStatus === "completed"
//                               ? "status-completed"
//                               : "status-assigned"
//                           }`}
//                         >
//                           {h.participationStatus}
//                         </span>
//                       </td>
//                       <td>{h.hoursVolunteered}</td>
//                       <td>
//                         {Array.isArray(h.skillsUsed)
//                           ? h.skillsUsed.join(", ")
//                           : h.skillsUsed || "—"}
//                       </td>
//                     </tr>
//                   ))
//                 ) : (
//                   <tr>
//                     <td colSpan="6" style={{ textAlign: "center" }}>
//                       No event records found.
//                     </td>
//                   </tr>
//                 )}
//               </tbody>
//             </table>
//           </div>
//         </>
//       )}
//     </div>
//   );
// }

// // frontend/src/components/VolunteerHistory.jsx
// import React, { useState, useEffect } from "react";
// import { getVolunteerHistory, getVolunteerStats } from "../api/historyServer";
// import "./VolunteerHistoryPage.css";

// export default function VolunteerHistory({ volunteerId = 1 }) {
//   const [events, setEvents] = useState([]);
//   const [stats, setStats] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [filterStatus, setFilterStatus] = useState("All");

//   // 🔥 Load real data from backend
//   useEffect(() => {
//     async function loadHistory() {
//       try {
//         const [historyRes, statsRes] = await Promise.all([
//           getVolunteerHistory(volunteerId),
//           getVolunteerStats(volunteerId),
//         ]);

//         setEvents(historyRes.data || []);
//         setStats(statsRes.data || {});
//       } catch (err) {
//         console.error("Error loading volunteer history:", err);
//       } finally {
//         setLoading(false);
//       }
//     }

//     loadHistory();
//   }, [volunteerId]);

//   if (loading) return <p>Loading volunteer history...</p>;

//   const filteredEvents = events.filter((event) => {
//     const matchesSearch =
//       event.eventName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       event.eventLocation?.toLowerCase().includes(searchTerm.toLowerCase());
//     const matchesStatus =
//       filterStatus === "All" || event.participationStatus === filterStatus;
//     return matchesSearch && matchesStatus;
//   });

//   return (
//     <div className="volunteer-history-container">
//       <h1>Volunteer History</h1>

//       {/* ✅ Statistics Section */}
//       {stats && (
//         <div className="stats-grid">
//           <div className="stat-card">
//             <h3>Total Events</h3>
//             <p className="stat-number">{stats.totalEvents || 0}</p>
//           </div>
//           <div className="stat-card">
//             <h3>Completed</h3>
//             <p className="stat-number completed">
//               {stats.completedEvents || 0}
//             </p>
//           </div>
//           <div className="stat-card">
//             <h3>Total Hours</h3>
//             <p className="stat-number hours">{stats.totalHours || 0}</p>
//           </div>
//         </div>
//       )}

//       {/* ✅ Skills Summary */}
//       {stats?.skillsUsed && (
//         <div className="skills-section">
//           <h3>Skills Used</h3>
//           <p>{stats.skillsUsed.join(", ") || "No skills recorded"}</p>
//         </div>
//       )}

//       {/* ✅ Filters */}
//       <div className="filters-section">
//         <div className="search-box">
//           <input
//             type="text"
//             placeholder="Search events..."
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//           />
//         </div>
//         <div className="status-filter">
//           <select
//             value={filterStatus}
//             onChange={(e) => setFilterStatus(e.target.value)}
//           >
//             <option value="All">All Status</option>
//             <option value="registered">Registered</option>
//             <option value="in-progress">In Progress</option>
//             <option value="completed">Completed</option>
//             <option value="cancelled">Cancelled</option>
//           </select>
//         </div>
//       </div>

//       {/* ✅ Events Table */}
//       <div className="events-table-container">
//         <table className="events-table">
//           <thead>
//             <tr>
//               <th>Event Name</th>
//               <th>Date</th>
//               <th>Location</th>
//               <th>Status</th>
//               <th>Hours</th>
//               <th>Skills Used</th>
//             </tr>
//           </thead>
//           <tbody>
//             {filteredEvents.map((event) => (
//               <tr key={event.id}>
//                 <td>{event.eventName}</td>
//                 <td>{new Date(event.eventDate).toLocaleDateString()}</td>
//                 <td>{event.eventLocation}</td>
//                 <td>
//                   <span
//                     className={`status-badge status-${event.participationStatus?.toLowerCase()}`}
//                   >
//                     {event.participationStatus}
//                   </span>
//                 </td>
//                 <td>{event.hoursVolunteered || "-"}</td>
//                 <td>
//                   {Array.isArray(event.skillsUsed)
//                     ? event.skillsUsed.join(", ")
//                     : "-"}
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>

//         {filteredEvents.length === 0 && (
//           <div className="no-events">No events found matching your criteria.</div>
//         )}
//       </div>
//     </div>
//   );
// }

// import React, { useState, useEffect } from 'react';
// import './VolunteerHistoryPage.css';

// const VolunteerHistoryPage = () => {
//   const [events, setEvents] = useState([]);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [filterStatus, setFilterStatus] = useState('All');

//   // Mock data - replace with actual API call to your backend
//   useEffect(() => {
//     const mockEvents = [
//       {
//         id: 1,
//         name: "Food Bank Packing",
//         date: "2025-10-05",
//         location: "Eastside Center, Houston, TX",
//         status: "Completed",
//         hours: 5,
//         skills: ["organizing", "lifting", "teamwork"]
//       },
//       {
//         id: 2,
//         name: "Soup Kitchen",
//         date: "2025-09-15", 
//         location: "Downtown Shelter, Houston, TX",
//         status: "Completed",
//         hours: 5,
//         skills: ["cooking", "serving", "teamwork"]
//       },
//       {
//         id: 3,
//         name: "Community Cleanup",
//         date: "2025-10-12",
//         location: "North Park, Houston, TX", 
//         status: "Assigned",
//         hours: null,
//         skills: ["teamwork"]
//       }
//     ];
//     setEvents(mockEvents);
//   }, []);

//   const stats = {
//     totalEvents: events.length,
//     completed: events.filter(e => e.status === 'Completed').length,
//     assigned: events.filter(e => e.status === 'Assigned').length,
//     totalHours: events.filter(e => e.status === 'Completed').reduce((sum, e) => sum + (e.hours || 0), 0),
//     allSkills: [...new Set(events.flatMap(e => e.skills))].join(", ")
//   };

//   const filteredEvents = events.filter(event => {
//     const matchesSearch = event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//                          event.location.toLowerCase().includes(searchTerm.toLowerCase());
//     const matchesStatus = filterStatus === 'All' || event.status === filterStatus;
//     return matchesSearch && matchesStatus;
//   });

//   return (
//     <div className="volunteer-history-container">
//       <h1>Volunteer History</h1>

//       {/* Statistics Section */}
//       <div className="stats-grid">
//         <div className="stat-card">
//           <h3>Total Events</h3>
//           <p className="stat-number">{stats.totalEvents}</p>
//         </div>
//         <div className="stat-card">
//           <h3>Completed</h3>
//           <p className="stat-number completed">{stats.completed}</p>
//         </div>
//         <div className="stat-card">
//           <h3>Assigned</h3>
//           <p className="stat-number assigned">{stats.assigned}</p>
//         </div>
//         <div className="stat-card">
//           <h3>Total Hours</h3>
//           <p className="stat-number hours">{stats.totalHours}</p>
//         </div>
//       </div>

//       {/* Skills Summary */}
//       <div className="skills-section">
//         <h3>Skills Used</h3>
//         <p>{stats.allSkills || "No skills recorded"}</p>
//       </div>

//       {/* Filters and Search */}
//       <div className="filters-section">
//         <div className="search-box">
//           <input
//             type="text"
//             placeholder="Search events..."
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//           />
//         </div>
//         <div className="status-filter">
//           <select 
//             value={filterStatus} 
//             onChange={(e) => setFilterStatus(e.target.value)}
//           >
//             <option value="All">All Status</option>
//             <option value="Assigned">Assigned</option>
//             <option value="Completed">Completed</option>
//             <option value="Cancelled">Cancelled</option>
//           </select>
//         </div>
//       </div>

//       {/* Events Table */}
//       <div className="events-table-container">
//         <table className="events-table">
//           <thead>
//             <tr>
//               <th>Event Name</th>
//               <th>Date</th>
//               <th>Location</th>
//               <th>Status</th>
//               <th>Hours</th>
//               <th>Skills Used</th>
//               <th>Actions</th>
//             </tr>
//           </thead>
//           <tbody>
//             {filteredEvents.map(event => (
//               <tr key={event.id}>
//                 <td>{event.name}</td>
//                 <td>{new Date(event.date).toLocaleDateString()}</td>
//                 <td>{event.location}</td>
//                 <td>
//                   <span className={`status-badge status-${event.status.toLowerCase()}`}>
//                     {event.status}
//                   </span>
//                 </td>
//                 <td>{event.hours || '-'}</td>
//                 <td>{event.skills.join(', ')}</td>
//                 <td>
//                   <button className="btn-view">View</button>
//                   {event.status === 'Assigned' && (
//                     <button className="btn-cancel">Cancel</button>
//                   )}
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
        
//         {filteredEvents.length === 0 && (
//           <div className="no-events">
//             No events found matching your criteria.
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default VolunteerHistoryPage;

// // import { useEffect, useMemo, useState } from "react";

// // const USERS_KEY = "volunthero_users";
// // const EVENTS_KEY = "volunthero_events";

// // function getUsers() {
// //   try {
// //     return JSON.parse(localStorage.getItem(USERS_KEY)) || {};
// //   } catch {
// //     return {};
// //   }
// // }
// // function setUsers(next) {
// //   localStorage.setItem(USERS_KEY, JSON.stringify(next));
// // }
// // function getUser(users, email) {
// //   if (!email) return null;
// //   return users[email.toLowerCase()] || null;
// // }
// // function setUser(users, email, data) {
// //   const next = { ...users, [email.toLowerCase()]: data };
// //   setUsers(next);
// //   return next;
// // }
// // function getEvents() {
// //   try {
// //     return JSON.parse(localStorage.getItem(EVENTS_KEY)) || [];
// //   } catch {
// //     return [];
// //   }
// // }

// // const STATUSES = ["Assigned", "Attended", "No-show", "Cancelled"];

// // export default function VolunteerHistory({ authedEmail }) {
// //   const [users, setUsersState] = useState(getUsers);
// //   const me = useMemo(() => getUser(users, authedEmail), [users, authedEmail]);
// //   const [backendHistory, setBackendHistory] = useState([]); // NEW: Backend data
// //   const [backendStats, setBackendStats] = useState(null); // NEW: Backend stats
// //   const [loading, setLoading] = useState(false);

// //   // Use existing localStorage history OR backend history
// //   const history = me?.history || backendHistory;

// //   const [modal, setModal] = useState(null);

// //   useEffect(() => {
// //     const onStorage = (e) => {
// //       if (e.key === USERS_KEY) setUsersState(getUsers());
// //     };
// //     window.addEventListener("storage", onStorage);
// //     return () => window.removeEventListener("storage", onStorage);
// //   }, []);

// //   // NEW: Load data from YOUR backend
// //   useEffect(() => {
// //     if (authedEmail) {
// //       setLoading(true);
// //       // For demo, using volunteerId 1 - in real app, map email to ID
// //       const volunteerId = "1"; 
      
// //       // Load history from YOUR backend
// //       fetch(`http://localhost:8080/history/${volunteerId}`)
// //         .then(response => response.json())
// //         .then(data => {
// //           if (data.success) {
// //             setBackendHistory(data.data);
// //           }
// //         })
// //         .catch(error => console.error('Error fetching backend history:', error));

// //       // Load stats from YOUR backend
// //       fetch(`http://localhost:8080/history/stats/${volunteerId}`)
// //         .then(response => response.json())
// //         .then(data => {
// //           if (data.success) {
// //             setBackendStats(data.data);
// //           }
// //           setLoading(false);
// //         })
// //         .catch(error => {
// //           console.error('Error fetching backend stats:', error);
// //           setLoading(false);
// //         });
// //     }
// //   }, [authedEmail]);

// //   // Keep all existing functions - they work with localStorage
// //   function saveHistory(nextHistory) {
// //     if (!me) return;
// //     const nextUser = { ...me, history: nextHistory };
// //     const nextUsers = setUser(users, me.email || authedEmail, nextUser);
// //     setUsersState(nextUsers);
// //   }

// //   function importAllFromEvents() {
// //     const events = getEvents();
// //     if (!events.length) return;
// //     const mapped = events.map((e) => ({
// //       id: e.id,
// //       name: e.name,
// //       description: e.description || "",
// //       location: e.location || "",
// //       skillsRequired: Array.isArray(e.skills) ? e.skills : (e.skills ? [e.skills] : []),
// //       urgency: e.urgency || "Low",
// //       date: e.date || new Date().toISOString().slice(0, 10),
// //       status: "Assigned",
// //     }));
// //     saveHistory(mapped);
// //   }

// //   function clearAll() {
// //     saveHistory([]);
// //   }

// //   function removeRow(idx) {
// //     const next = history.filter((_, i) => i !== idx);
// //     saveHistory(next);
// //   }

// //   function updateStatus(idx, value) {
// //     const next = history.map((row, i) => (i === idx ? { ...row, status: value } : row));
// //     saveHistory(next);
// //   }

// //   function openModal(row) {
// //     setModal({ open: true, row });
// //   }

// //   function closeModal() {
// //     setModal(null);
// //   }

// //   const empty = history.length === 0;

// //   const tableStyle = {
// //     width: "100%",
// //     borderCollapse: "collapse",
// //     tableLayout: "fixed",
// //   };
// //   const thtd = {
// //     padding: "12px 10px",
// //     borderBottom: "1px solid rgba(255,255,255,.08)",
// //     verticalAlign: "top",
// //     textAlign: "left",
// //   };
// //   const headerStyle = {
// //     ...thtd,
// //     fontWeight: 600,
// //     color: "rgba(255,255,255,.85)",
// //   };

// //   const truncate = {
// //     display: "block",
// //     width: "100%",
// //     overflow: "hidden",
// //     textOverflow: "ellipsis",
// //     whiteSpace: "nowrap",
// //   };

// //   return (
// //     <div className="card" style={{ marginTop: 16 }}>
// //       <h2 style={{ marginTop: 0 }}>Volunteer History</h2>
// //       <p className="muted" style={{ marginTop: -8 }}>
// //         Tabular display of your participation. All event fields + your status.
// //       </p>

// //       {/* NEW: Backend Statistics Display */}
// //       {backendStats && (
// //         <div style={{ 
// //           background: "rgba(76, 175, 80, 0.1)", 
// //           border: "1px solid rgba(76, 175, 80, 0.3)",
// //           borderRadius: "8px",
// //           padding: "12px",
// //           marginBottom: "16px"
// //         }}>
// //           <h3 style={{ margin: "0 0 8px 0", color: "#4CAF50" }}>Backend Statistics</h3>
// //           <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
// //             <div><strong>Total Events:</strong> {backendStats.totalEvents}</div>
// //             <div><strong>Completed:</strong> {backendStats.completedEvents}</div>
// //             <div><strong>Total Hours:</strong> {backendStats.totalHours}</div>
// //             <div><strong>Skills Used:</strong> {backendStats.skillsUsed.join(", ") || "None"}</div>
// //           </div>
// //         </div>
// //       )}

// //       {loading && <div style={{ padding: "12px", textAlign: "center" }}>Loading backend data...</div>}

// //       <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
// //         <button onClick={importAllFromEvents}>Import all current events as "Assigned"</button>
// //         <button onClick={clearAll}>Clear all</button>
// //         {/* NEW: Sync button to push local data to backend */}
// //         <button 
// //           onClick={() => alert("This would sync local data to backend in a real implementation")}
// //           style={{ background: "#2196F3" }}
// //         >
// //           Sync to Backend
// //         </button>
// //       </div>

// //       {empty ? (
// //         <div className="muted" style={{ padding: 16 }}>
// //           {loading ? "Loading..." : "No current events yet."}
// //         </div>
// //       ) : (
// //         <div style={{ overflowX: "hidden" }}>
// //           <table style={tableStyle}>
// //             <colgroup>
// //               <col style={{ width: "14%" }} />
// //               <col style={{ width: "22%" }} />
// //               <col style={{ width: "11%" }} />
// //               <col style={{ width: "14%" }} />
// //               <col style={{ width: "7%"  }} />
// //               <col style={{ width: "7%"  }} />
// //               <col style={{ width: "8%"  }} />
// //               <col style={{ width: "17%" }} />
// //             </colgroup>

// //             <thead>
// //               <tr>
// //                 <th style={headerStyle}>Event Name</th>
// //                 <th style={headerStyle}>Description</th>
// //                 <th style={headerStyle}>Location</th>
// //                 <th style={headerStyle}>Required Skills</th>
// //                 <th style={headerStyle}>Urgency</th>
// //                 <th style={headerStyle}>Date</th>
// //                 <th style={headerStyle}>Status</th>
// //                 <th style={headerStyle}>Actions</th>
// //               </tr>
// //             </thead>

// //             <tbody>
// //               {history.map((row, idx) => (
// //                 <tr key={row.id ?? idx}>
// //                   <td style={thtd}>{row.name || "-"}</td>

// //                   <td style={{ ...thtd, overflow: "hidden" }}>
// //                     <span title={row.description} style={truncate}>
// //                       {row.description || "-"}
// //                     </span>
// //                   </td>

// //                   <td style={{ ...thtd, overflow: "hidden" }}>
// //                     <span title={row.location} style={truncate}>
// //                       {row.location || "-"}
// //                     </span>
// //                   </td>

// //                   <td style={{ ...thtd, overflow: "hidden" }}>
// //                     <span
// //                       title={(row.skillsRequired || []).join(", ")}
// //                       style={truncate}
// //                     >
// //                       {(row.skillsRequired || []).join(", ") || "-"}
// //                     </span>
// //                   </td>

// //                   <td style={thtd}>{row.urgency || "-"}</td>
// //                   <td style={thtd}>{formatDate(row.date)}</td>

// //                   <td style={thtd}>
// //                     <select
// //                       value={row.status || "Assigned"}
// //                       onChange={(e) => updateStatus(idx, e.target.value)}
// //                       style={{ width: "100%" }}
// //                     >
// //                       {STATUSES.map((s) => (
// //                         <option key={s} value={s}>{s}</option>
// //                       ))}
// //                     </select>
// //                   </td>

// //                   <td style={{ ...thtd, minWidth: 170 }}>
// //                     <div style={{ display: "flex", gap: 8, flexWrap: "nowrap" }}>
// //                       <button className="btn-ghost" onClick={() => removeRow(idx)}>Remove</button>
// //                       <button onClick={() => openModal(row)}>View</button>
// //                     </div>
// //                   </td>
// //                 </tr>
// //               ))}
// //             </tbody>
// //           </table>
// //         </div>
// //       )}

// //       {modal?.open && (
// //         <div
// //           role="dialog"
// //           aria-modal="true"
// //           style={{
// //             position: "fixed",
// //             inset: 0,
// //             background: "rgba(0,0,0,.55)",
// //             display: "grid",
// //             placeItems: "center",
// //             zIndex: 1000,
// //           }}
// //           onClick={closeModal}
// //         >
// //           <div
// //             style={{
// //               background: "#1b1c1f",
// //               border: "1px solid rgba(255,255,255,.08)",
// //               borderRadius: 12,
// //               width: "min(820px, 92vw)",
// //               maxHeight: "82vh",
// //               overflow: "auto",
// //               padding: 20,
// //               color: "#fff",
// //             }}
// //             onClick={(e) => e.stopPropagation()}
// //           >
// //             <h3 style={{ marginTop: 0 }}>{modal.row?.name}</h3>
// //             <Detail label="Date" value={formatDate(modal.row?.date, true)} />
// //             <Detail label="Location" value={modal.row?.location} />
// //             <Detail label="Urgency" value={modal.row?.urgency} />
// //             <Detail label="Skills" value={(modal.row?.skillsRequired || []).join(", ")} />
// //             <div style={{ marginTop: 12, fontWeight: 600, marginBottom: 4 }}>Description</div>
// //             <div style={{ whiteSpace: "pre-wrap", lineHeight: 1.5 }}>
// //               {modal.row?.description || "—"}
// //             </div>
// //             <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 18 }}>
// //               <button onClick={closeModal}>Close</button>
// //             </div>
// //           </div>
// //         </div>
// //       )}
// //     </div>
// //   );
// // }

// // function Detail({ label, value }) {
// //   return (
// //     <div style={{ marginTop: 6 }}>
// //       <span style={{ fontWeight: 600 }}>{label}:</span>{" "}
// //       <span>{value || "—"}</span>
// //     </div>
// //   );
// // }

// // function formatDate(d, includeTime = false) {
// //   if (!d) return "—";
// //   const date =
// //     typeof d === "string" && /^\d{4}-\d{2}-\d{2}$/.test(d)
// //       ? new Date(`${d}T00:00:00`)
// //       : new Date(d);
// //   if (Number.isNaN(date.getTime())) return d;
// //   return includeTime ? date.toLocaleString() : date.toLocaleDateString();
// // }



// // // src/components/VolunteerHistory.jsx
// // import { useEffect, useMemo, useState } from "react";

// // const USERS_KEY = "volunthero_users";
// // const EVENTS_KEY = "volunthero_events";

// // function getUsers() {
// //   try {
// //     return JSON.parse(localStorage.getItem(USERS_KEY)) || {};
// //   } catch {
// //     return {};
// //   }
// // }
// // function setUsers(next) {
// //   localStorage.setItem(USERS_KEY, JSON.stringify(next));
// // }
// // function getUser(users, email) {
// //   if (!email) return null;
// //   return users[email.toLowerCase()] || null;
// // }
// // function setUser(users, email, data) {
// //   const next = { ...users, [email.toLowerCase()]: data };
// //   setUsers(next);
// //   return next;
// // }
// // function getEvents() {
// //   try {
// //     return JSON.parse(localStorage.getItem(EVENTS_KEY)) || [];
// //   } catch {
// //     return [];
// //   }
// // }

// // const STATUSES = ["Assigned", "Attended", "No-show", "Cancelled"];

// // export default function VolunteerHistory({ authedEmail }) {
// //   const [users, setUsersState] = useState(getUsers);
// //   const me = useMemo(() => getUser(users, authedEmail), [users, authedEmail]);
// //   const history = me?.history || [];

// //   const [modal, setModal] = useState(null);

// //   useEffect(() => {
// //     const onStorage = (e) => {
// //       if (e.key === USERS_KEY) setUsersState(getUsers());
// //     };
// //     window.addEventListener("storage", onStorage);
// //     return () => window.removeEventListener("storage", onStorage);
// //   }, []);

// //   function saveHistory(nextHistory) {
// //     if (!me) return;
// //     const nextUser = { ...me, history: nextHistory };
// //     const nextUsers = setUser(users, me.email || authedEmail, nextUser);
// //     setUsersState(nextUsers);
// //   }

// //   function importAllFromEvents() {
// //     const events = getEvents();
// //     if (!events.length) return;
// //     const mapped = events.map((e) => ({
// //       id: e.id,
// //       name: e.name,
// //       description: e.description || "",
// //       location: e.location || "",
// //       skillsRequired: Array.isArray(e.skills) ? e.skills : (e.skills ? [e.skills] : []),
// //       urgency: e.urgency || "Low",
// //       date: e.date || new Date().toISOString().slice(0, 10),
// //       status: "Assigned",
// //     }));
// //     saveHistory(mapped);
// //   }
// //   function clearAll() {
// //     saveHistory([]);
// //   }
// //   function removeRow(idx) {
// //     const next = history.filter((_, i) => i !== idx);
// //     saveHistory(next);
// //   }
// //   function updateStatus(idx, value) {
// //     const next = history.map((row, i) => (i === idx ? { ...row, status: value } : row));
// //     saveHistory(next);
// //   }
// //   function openModal(row) {
// //     setModal({ open: true, row });
// //   }
// //   function closeModal() {
// //     setModal(null);
// //   }

// //   const empty = history.length === 0;

// //   const tableStyle = {
// //     width: "100%",
// //     borderCollapse: "collapse",
// //     tableLayout: "fixed",
// //   };
// //   const thtd = {
// //     padding: "12px 10px",
// //     borderBottom: "1px solid rgba(255,255,255,.08)",
// //     verticalAlign: "top",
// //     textAlign: "left",
// //   };
// //   const headerStyle = {
// //     ...thtd,
// //     fontWeight: 600,
// //     color: "rgba(255,255,255,.85)",
// //   };

// //   const truncate = {
// //     display: "block",
// //     width: "100%",
// //     overflow: "hidden",
// //     textOverflow: "ellipsis",
// //     whiteSpace: "nowrap",
// //   };

// //   return (
// //     <div className="card" style={{ marginTop: 16 }}>
// //       <h2 style={{ marginTop: 0 }}>Volunteer History</h2>
// //       <p className="muted" style={{ marginTop: -8 }}>
// //         Tabular display of your participation. All event fields + your status.
// //       </p>

// //       <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
// //         <button onClick={importAllFromEvents}>Import all current events as “Assigned”</button>
// //         <button onClick={clearAll}>Clear all</button>
// //       </div>

// //       {empty ? (
// //         <div className="muted" style={{ padding: 16 }}>No current events yet.</div>
// //       ) : (
// //         <div style={{ overflowX: "hidden" }}>
// //           <table style={tableStyle}>
// //             {/* widths now sum to 100%; Actions widened so buttons sit side-by-side */}
// //             <colgroup>
// //               <col style={{ width: "14%" }} /> {/* Event Name */}
// //               <col style={{ width: "22%" }} /> {/* Description */}
// //               <col style={{ width: "11%" }} /> {/* Location */}
// //               <col style={{ width: "14%" }} /> {/* Required Skills */}
// //               <col style={{ width: "7%"  }} /> {/* Urgency */}
// //               <col style={{ width: "7%"  }} /> {/* Date */}
// //               <col style={{ width: "8%"  }} /> {/* Status */}
// //               <col style={{ width: "17%" }} /> {/* Actions (wider) */}
// //             </colgroup>

// //             <thead>
// //               <tr>
// //                 <th style={headerStyle}>Event Name</th>
// //                 <th style={headerStyle}>Description</th>
// //                 <th style={headerStyle}>Location</th>
// //                 <th style={headerStyle}>Required Skills</th>
// //                 <th style={headerStyle}>Urgency</th>
// //                 <th style={headerStyle}>Date</th>
// //                 <th style={headerStyle}>Status</th>
// //                 <th style={headerStyle}>Actions</th>
// //               </tr>
// //             </thead>

// //             <tbody>
// //               {history.map((row, idx) => (
// //                 <tr key={row.id ?? idx}>
// //                   <td style={thtd}>{row.name || "-"}</td>

// //                   <td style={{ ...thtd, overflow: "hidden" }}>
// //                     <span title={row.description} style={truncate}>
// //                       {row.description || "-"}
// //                     </span>
// //                   </td>

// //                   <td style={{ ...thtd, overflow: "hidden" }}>
// //                     <span title={row.location} style={truncate}>
// //                       {row.location || "-"}
// //                     </span>
// //                   </td>

// //                   <td style={{ ...thtd, overflow: "hidden" }}>
// //                     <span
// //                       title={(row.skillsRequired || []).join(", ")}
// //                       style={truncate}
// //                     >
// //                       {(row.skillsRequired || []).join(", ") || "-"}
// //                     </span>
// //                   </td>

// //                   <td style={thtd}>{row.urgency || "-"}</td>
// //                   <td style={thtd}>{formatDate(row.date)}</td>

// //                   <td style={thtd}>
// //                     <select
// //                       value={row.status || "Assigned"}
// //                       onChange={(e) => updateStatus(idx, e.target.value)}
// //                       style={{ width: "100%" }}
// //                     >
// //                       {STATUSES.map((s) => (
// //                         <option key={s} value={s}>{s}</option>
// //                       ))}
// //                     </select>
// //                   </td>

// //                   {/* 👉 keep buttons on one line, give the cell a minimum width */}
// //                   <td style={{ ...thtd, minWidth: 170 }}>
// //                     <div style={{ display: "flex", gap: 8, flexWrap: "nowrap" }}>
// //                       <button className="btn-ghost" onClick={() => removeRow(idx)}>Remove</button>
// //                       <button onClick={() => openModal(row)}>View</button>
// //                     </div>
// //                   </td>
// //                 </tr>
// //               ))}
// //             </tbody>
// //           </table>
// //         </div>
// //       )}

// //       {modal?.open && (
// //         <div
// //           role="dialog"
// //           aria-modal="true"
// //           style={{
// //             position: "fixed",
// //             inset: 0,
// //             background: "rgba(0,0,0,.55)",
// //             display: "grid",
// //             placeItems: "center",
// //             zIndex: 1000,
// //           }}
// //           onClick={closeModal}
// //         >
// //           <div
// //             style={{
// //               background: "#1b1c1f",
// //               border: "1px solid rgba(255,255,255,.08)",
// //               borderRadius: 12,
// //               width: "min(820px, 92vw)",
// //               maxHeight: "82vh",
// //               overflow: "auto",
// //               padding: 20,
// //               color: "#fff",
// //             }}
// //             onClick={(e) => e.stopPropagation()}
// //           >
// //             <h3 style={{ marginTop: 0 }}>{modal.row?.name}</h3>
// //             <Detail label="Date" value={formatDate(modal.row?.date, true)} />
// //             <Detail label="Location" value={modal.row?.location} />
// //             <Detail label="Urgency" value={modal.row?.urgency} />
// //             <Detail label="Skills" value={(modal.row?.skillsRequired || []).join(", ")} />
// //             <div style={{ marginTop: 12, fontWeight: 600, marginBottom: 4 }}>Description</div>
// //             <div style={{ whiteSpace: "pre-wrap", lineHeight: 1.5 }}>
// //               {modal.row?.description || "—"}
// //             </div>
// //             <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 18 }}>
// //               <button onClick={closeModal}>Close</button>
// //             </div>
// //           </div>
// //         </div>
// //       )}
// //     </div>
// //   );
// // }

// // function Detail({ label, value }) {
// //   return (
// //     <div style={{ marginTop: 6 }}>
// //       <span style={{ fontWeight: 600 }}>{label}:</span>{" "}
// //       <span>{value || "—"}</span>
// //     </div>
// //   );
// // }

// // function formatDate(d, includeTime = false) {
// //   if (!d) return "—";
// //   const date =
// //     typeof d === "string" && /^\d{4}-\d{2}-\d{2}$/.test(d)
// //       ? new Date(`${d}T00:00:00`)
// //       : new Date(d);
// //   if (Number.isNaN(date.getTime())) return d;
// //   return includeTime ? date.toLocaleString() : date.toLocaleDateString();
// // }
