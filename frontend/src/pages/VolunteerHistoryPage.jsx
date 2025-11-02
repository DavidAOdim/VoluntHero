import React, { useEffect, useState } from "react";
import axios from "axios";
import "./VolunteerHistoryPage.css";

export default function VolunteerHistoryPage({ authedEmail }) {
  const [volunteers, setVolunteers] = useState([]);
  const [selectedVolunteerId, setSelectedVolunteerId] = useState("");
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Detect admin role from email
  const isAdmin = authedEmail?.toLowerCase().includes("admin");

  // 🔹 1. Load all volunteers (admin only)
  useEffect(() => {
    if (isAdmin) {
      axios
        .get("http://localhost:8080/profile/all")
        .then((res) => {
          const list = res.data?.data || [];
          setVolunteers(list);
          if (list.length > 0) {
            // Auto-load first volunteer’s history
            setSelectedVolunteerId(list[0].id);
            loadVolunteerData(list[0].id);
          }
        })
        .catch((err) => {
          console.error("Error loading volunteers:", err);
          setError("Could not load volunteer list.");
        });
    } else {
      // For non-admin: try to load from local/session or static ID
      const storedId = localStorage.getItem("volunteerId") || "1";
      setSelectedVolunteerId(storedId);
      loadVolunteerData(storedId);
    }
  }, [isAdmin]);

  // 🔹 2. Fetch volunteer history + stats
  async function loadVolunteerData(volunteerId) {
    if (!volunteerId) return;
    setLoading(true);
    setError("");
    setHistory([]);
    setStats(null);
    try {
      const [historyRes, statsRes] = await Promise.all([
        axios.get(`http://localhost:8080/history/${volunteerId}`),
        axios.get(`http://localhost:8080/history/stats/${volunteerId}`),
      ]);

      // ✅ Adjusted for backend response shape
      if (historyRes.data.success && Array.isArray(historyRes.data.data || historyRes.data.records)) {
        setHistory(historyRes.data.data || historyRes.data.records);
      } else if (historyRes.data.data?.data) {
        // Some endpoints wrap inside { data: { data: [] } }
        setHistory(historyRes.data.data.data);
      }

      if (statsRes.data.success) {
        setStats(statsRes.data.data);
      }
    } catch (err) {
      console.error("Error loading volunteer history:", err);
      setError("Could not fetch volunteer history.");
    } finally {
      setLoading(false);
    }
  }

  // 🔹 3. Render
  return (
    <div className="volunteer-history-container">
      <h1 className="text-2xl font-bold text-orange-600">Volunteer History</h1>

      {/* ADMIN VOLUNTEER DROPDOWN */}
      {isAdmin && (
        <div className="filters-section" style={{ marginBottom: "1rem" }}>
          <label className="font-medium">Select Volunteer:</label>
          <select
            className="status-filter"
            value={selectedVolunteerId}
            onChange={(e) => {
              setSelectedVolunteerId(e.target.value);
              loadVolunteerData(e.target.value);
            }}
          >
            {volunteers.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name || v.fullName} ({v.email})
              </option>
            ))}
          </select>
        </div>
      )}

      {/* STATUS DISPLAY */}
      {loading && <p className="muted">Loading volunteer history...</p>}
      {error && <p className="muted" style={{ color: "crimson" }}>{error}</p>}
      {!loading && !error && history.length === 0 && (
        <p className="muted">No volunteer data found.</p>
      )}

      {/* STATS SUMMARY */}
      {stats && (
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
            <p className="stat-number">{stats.skillsUsed?.length || 0}</p>
          </div>
        </div>
      )}

      {/* HISTORY TABLE */}
      {history.length > 0 && (
        <div className="events-table-container">
          <table className="events-table">
            <thead>
              <tr>
                <th>Event</th>
                <th>Date</th>
                <th>Location</th>
                <th>Status</th>
                <th>Hours</th>
                <th>Skills Used</th>
              </tr>
            </thead>
            <tbody>
              {history.map((r) => (
                <tr key={r.id}>
                  <td>{r.eventName}</td>
                  <td>{new Date(r.eventDate).toLocaleDateString()}</td>
                  <td>{r.eventLocation}</td>
                  <td>
                    <span
                      className={`status-badge ${
                        r.participationStatus === "completed"
                          ? "status-completed"
                          : "status-assigned"
                      }`}
                    >
                      {r.participationStatus}
                    </span>
                  </td>
                  <td>{r.hoursVolunteered}</td>
                  <td>{Array.isArray(r.skillsUsed) ? r.skillsUsed.join(", ") : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}



// import React, { useEffect, useState } from "react";
// import "./VolunteerHistoryPage.css";
// import axios from "axios";

// export default function VolunteerHistoryPage({ authedEmail }) {
//   const [volunteers, setVolunteers] = useState([]);
//   const [selectedVolunteerId, setSelectedVolunteerId] = useState("");
//   const [history, setHistory] = useState([]);
//   const [stats, setStats] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");

//   // ✅ Detect if logged-in user is an admin
//   const isAdmin = authedEmail?.toLowerCase().includes("admin");

//   // ✅ Load all volunteers (admin only)
//   useEffect(() => {
//     if (!isAdmin) return;

//     axios
//       .get("http://localhost:8080/profile/all")
//       .then((res) => {
//         if (res.data?.data?.length) {
//           setVolunteers(res.data.data);
//         } else {
//           console.warn("No volunteers returned from backend.");
//         }
//       })
//       .catch((err) => {
//         console.error("Error loading volunteers:", err);
//         // Fallback demo data
//         setVolunteers([
//           { id: 1, name: "John Doe", email: "john@example.com" },
//           { id: 2, name: "Jane Smith", email: "jane@example.com" },
//           { id: 3, name: "Mike Johnson", email: "mike@example.com" },
//         ]);
//       });
//   }, [isAdmin]);

//   // ✅ Fetch volunteer history & stats
//   async function loadVolunteerData(volunteerId) {
//     if (!volunteerId) return;
//     setLoading(true);
//     setError("");
//     setHistory([]);
//     setStats(null);

//     try {
//       const [histRes, statsRes] = await Promise.all([
//         axios.get(`http://localhost:8080/history/${volunteerId}`),
//         axios.get(`http://localhost:8080/history/stats/${volunteerId}`),
//       ]);

//       if (histRes.data.success) setHistory(histRes.data.data);
//       if (statsRes.data.success) setStats(statsRes.data.data);
//     } catch (err) {
//       console.error("Failed to load volunteer history:", err);
//       setError("Failed to load volunteer history. Please try again later.");
//     } finally {
//       setLoading(false);
//     }
//   }

//   // ✅ Auto-load volunteer’s own data (non-admin)
//   useEffect(() => {
//     if (!isAdmin && authedEmail) {
//       const storedId = localStorage.getItem("volunteerId");
//       if (storedId) loadVolunteerData(storedId);
//     }
//   }, [authedEmail]);

//   return (
//     <div className="volunteer-history-container">
//       <h1>Volunteer History</h1>

//       {/* ADMIN DROPDOWN */}
//       {isAdmin && (
//         <div className="filters-section">
//           <label className="font-medium">Select Volunteer:</label>
//           <select
//             className="status-filter"
//             value={selectedVolunteerId}
//             onChange={(e) => {
//               setSelectedVolunteerId(e.target.value);
//               loadVolunteerData(e.target.value);
//             }}
//           >
//             <option value="">-- Choose a volunteer --</option>
//             {volunteers.map((v) => (
//               <option key={v.id} value={v.id}>
//                 {v.name || v.fullName} ({v.email || "no email"})
//               </option>
//             ))}
//           </select>
//         </div>
//       )}

//       {/* STATUS MESSAGES */}
//       {loading && <p className="muted">Loading volunteer data...</p>}
//       {error && <p className="muted" style={{ color: "crimson" }}>{error}</p>}
//       {!loading && !error && !isAdmin && !history.length && (
//         <p className="muted">No volunteer data found.</p>
//       )}
//       {!loading && isAdmin && !selectedVolunteerId && (
//         <p className="muted">Select a volunteer to view their records.</p>
//       )}

//       {/* STATS GRID */}
//       {stats && (
//         <div className="stats-grid">
//           <div className="stat-card">
//             <p>Total Events</p>
//             <p className="stat-number">{stats.totalEvents}</p>
//           </div>
//           <div className="stat-card">
//             <p>Completed</p>
//             <p className="stat-number completed">{stats.completedEvents}</p>
//           </div>
//           <div className="stat-card">
//             <p>Total Hours</p>
//             <p className="stat-number hours">{stats.totalHours}</p>
//           </div>
//           <div className="stat-card">
//             <p>Skills Used</p>
//             <p className="stat-number">{stats.skillsUsed.length}</p>
//           </div>
//         </div>
//       )}

//       {/* HISTORY TABLE */}
//       {history.length > 0 && (
//         <div className="events-table-container">
//           <table className="events-table">
//             <thead>
//               <tr>
//                 <th>Event</th>
//                 <th>Date</th>
//                 <th>Location</th>
//                 <th>Status</th>
//                 <th>Hours</th>
//                 <th>Feedback</th>
//               </tr>
//             </thead>
//             <tbody>
//               {history.map((r) => (
//                 <tr key={r.id}>
//                   <td>{r.eventName}</td>
//                   <td>{new Date(r.eventDate).toLocaleDateString()}</td>
//                   <td>{r.eventLocation}</td>
//                   <td>
//                     <span
//                       className={`status-badge ${
//                         r.participationStatus === "completed"
//                           ? "status-completed"
//                           : "status-assigned"
//                       }`}
//                     >
//                       {r.participationStatus}
//                     </span>
//                   </td>
//                   <td>{r.hoursVolunteered}</td>
//                   <td>{r.feedback || "—"}</td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       )}
//     </div>
//   );


// // frontend/src/pages/VolunteerHistoryPage.jsx
// import React, { useEffect, useState } from "react";
// import "./VolunteerHistoryPage.css";
// import axios from "axios";

// export default function VolunteerHistoryPage({ authedEmail }) {
//   const [volunteers, setVolunteers] = useState([]);
//   const [selectedVolunteerId, setSelectedVolunteerId] = useState("");
//   const [history, setHistory] = useState([]);
//   const [stats, setStats] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");

//   // ✅ Detect if user is admin
//   const isAdmin = authedEmail?.toLowerCase().includes("admin");

//   // ✅ Load volunteers (for admin only)
//   useEffect(() => {
//     if (!isAdmin) return;
//     axios
//       .get("http://localhost:8080/matching/test")
//       .then(async (res) => {
//         // Instead of using a test route, let’s fetch from volunteers table directly
//         const volunteersRes = await axios.get("http://localhost:8080/profile/all"); // optional route
//         if (volunteersRes.data?.data?.length) setVolunteers(volunteersRes.data.data);
//       })
//       .catch(() => {
//         // fallback in case no backend /profile/all exists
//         setVolunteers([
//           { id: 1, name: "John Doe" },
//           { id: 2, name: "Jane Smith" },
//           { id: 3, name: "Mike Johnson" },
//         ]);
//       });
//   }, [isAdmin]);

//   // ✅ Fetch history & stats for a specific volunteer
//   async function loadVolunteerData(volunteerId) {
//     if (!volunteerId) return;
//     setLoading(true);
//     setError("");
//     setHistory([]);
//     setStats(null);

//     try {
//       const [histRes, statsRes] = await Promise.all([
//         axios.get(`http://localhost:8080/history/${volunteerId}`),
//         axios.get(`http://localhost:8080/history/stats/${volunteerId}`),
//       ]);
//       if (histRes.data.success) setHistory(histRes.data.data);
//       if (statsRes.data.success) setStats(statsRes.data.data);
//     } catch (err) {
//       console.error(err);
//       setError("Failed to load volunteer history.");
//     } finally {
//       setLoading(false);
//     }
//   }

//   // ✅ Automatically load for volunteer user (non-admin)
//   useEffect(() => {
//     if (!isAdmin && authedEmail) {
//       const storedId = localStorage.getItem("volunteerId");
//       if (storedId) loadVolunteerData(storedId);
//     }
//   }, [authedEmail]);

//   return (
//     <div className="volunteer-history-container">
//       <h1>Volunteer History</h1>

//       {/* ADMIN SELECTOR */}
//       {isAdmin && (
//         <div className="filters-section">
//           <label className="font-medium">Select Volunteer:</label>
//           <select
//             className="status-filter"
//             value={selectedVolunteerId}
//             onChange={(e) => {
//               setSelectedVolunteerId(e.target.value);
//               loadVolunteerData(e.target.value);
//             }}
//           >
//             <option value="">-- Choose a volunteer --</option>
//             {volunteers.map((v) => (
//               <option key={v.id} value={v.id}>
//                 {v.name || v.fullName} ({v.email || "no email"})
//               </option>
//             ))}
//           </select>
//         </div>
//       )}

//       {/* Loading / error / empty */}
//       {loading && <p className="loading-text">Loading volunteer data...</p>}
//       {error && <p className="error-text">{error}</p>}
//       {!loading && !error && !history.length && !selectedVolunteerId && isAdmin && (
//         <p className="muted">Select a volunteer to view their records.</p>
//       )}

//       {/* STATS */}
//       {stats && (
//         <div className="stats-grid">
//           <div className="stat-card">
//             <p>Total Events</p>
//             <p className="stat-number">{stats.totalEvents}</p>
//           </div>
//           <div className="stat-card">
//             <p>Completed</p>
//             <p className="stat-number completed">{stats.completedEvents}</p>
//           </div>
//           <div className="stat-card">
//             <p>Total Hours</p>
//             <p className="stat-number hours">{stats.totalHours}</p>
//           </div>
//           <div className="stat-card">
//             <p>Skills Used</p>
//             <p className="stat-number">{stats.skillsUsed.length}</p>
//           </div>
//         </div>
//       )}

//       {/* HISTORY TABLE */}
//       {history.length > 0 && (
//         <div className="events-table-container">
//           <table className="events-table">
//             <thead>
//               <tr>
//                 <th>Event</th>
//                 <th>Date</th>
//                 <th>Location</th>
//                 <th>Status</th>
//                 <th>Hours</th>
//                 <th>Feedback</th>
//               </tr>
//             </thead>
//             <tbody>
//               {history.map((r) => (
//                 <tr key={r.id}>
//                   <td>{r.eventName}</td>
//                   <td>{new Date(r.eventDate).toLocaleDateString()}</td>
//                   <td>{r.eventLocation}</td>
//                   <td>
//                     <span
//                       className={`status-badge ${
//                         r.participationStatus === "completed"
//                           ? "status-completed"
//                           : "status-assigned"
//                       }`}
//                     >
//                       {r.participationStatus}
//                     </span>
//                   </td>
//                   <td>{r.hoursVolunteered}</td>
//                   <td>{r.feedback || "—"}</td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       )}
//     </div>
//   );
// }


// // frontend/src/pages/VolunteerHistoryPage.jsx
// import React, { useEffect, useState } from "react";
// import "./VolunteerHistoryPage.css"; // ✅ Styling file
// import axios from "axios";

// export default function VolunteerHistoryPage({ authedEmail, volunteerId }) {
//   const [history, setHistory] = useState([]);
//   const [stats, setStats] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");

//   // ✅ Fetch volunteerId if not provided (based on email)
//   useEffect(() => {
//     async function fetchVolunteerId() {
//       if (volunteerId) return; // already known
//       if (!authedEmail) return;

//       try {
//         const res = await axios.get(`http://localhost:8080/profile/${authedEmail}`);
//         if (res.data?.id) {
//           window.localStorage.setItem("volunteerId", res.data.id);
//           setStats((prev) => ({ ...prev, volunteerId: res.data.id }));
//         }
//       } catch (err) {
//         console.error("Error fetching volunteerId:", err);
//       }
//     }
//     fetchVolunteerId();
//   }, [authedEmail, volunteerId]);

//   // ✅ Fetch history and stats from backend
//   useEffect(() => {
//     const id = volunteerId || localStorage.getItem("volunteerId");
//     if (!id) {
//       setError("No volunteer ID found — please log in.");
//       setLoading(false);
//       return;
//     }

//     async function loadData() {
//       setLoading(true);
//       setError("");

//       try {
//         const [histRes, statsRes] = await Promise.all([
//           axios.get(`http://localhost:8080/history/${id}`),
//           axios.get(`http://localhost:8080/history/stats/${id}`),
//         ]);

//         if (histRes.data.success) setHistory(histRes.data.data);
//         if (statsRes.data.success) setStats(statsRes.data.data);
//       } catch (err) {
//         console.error("Error fetching volunteer history:", err);
//         setError("Failed to load volunteer history.");
//       } finally {
//         setLoading(false);
//       }
//     }

//     loadData();
//   }, [volunteerId]);

//   // ✅ Render states
//   if (loading)
//     return (
//       <div className="volunteer-history-container">
//         <p className="loading-text">Loading your volunteer history...</p>
//       </div>
//     );

//   if (error)
//     return (
//       <div className="volunteer-history-container">
//         <p className="error-text">{error}</p>
//       </div>
//     );

//   if (!history.length)
//     return (
//       <div className="volunteer-history-container">
//         <h1>Volunteer History</h1>
//         <p className="no-events">
//           You don’t have any recorded volunteer activities yet.
//         </p>
//       </div>
//     );

//   // ✅ Helper function for status badge styling
//   function statusClass(status) {
//     switch (status) {
//       case "completed":
//         return "status-badge status-completed";
//       case "registered":
//       case "assigned":
//         return "status-badge status-assigned";
//       case "cancelled":
//         return "status-badge status-cancelled";
//       default:
//         return "status-badge";
//     }
//   }

//   return (
//     <div className="volunteer-history-container">
//       <h1>Volunteer History</h1>

//       {/* ✅ Stats Overview */}
//       {stats && (
//         <div className="stats-grid">
//           <div className="stat-card">
//             <p>Total Events</p>
//             <p className="stat-number">{stats.totalEvents}</p>
//           </div>
//           <div className="stat-card">
//             <p>Completed Events</p>
//             <p className="stat-number completed">{stats.completedEvents}</p>
//           </div>
//           <div className="stat-card">
//             <p>Total Hours</p>
//             <p className="stat-number hours">{stats.totalHours}</p>
//           </div>
//           <div className="stat-card">
//             <p>Unique Skills Used</p>
//             <p className="stat-number">{stats.skillsUsed.length}</p>
//           </div>
//         </div>
//       )}

//       {/* ✅ Skills List */}
//       {stats?.skillsUsed?.length > 0 && (
//         <div className="skills-section">
//           <h3>Skills You’ve Used</h3>
//           <ul className="skills-list">
//             {stats.skillsUsed.map((s, i) => (
//               <li key={i} className="skill-chip">
//                 {s}
//               </li>
//             ))}
//           </ul>
//         </div>
//       )}

//       {/* ✅ Event History Table */}
//       <div className="events-table-container">
//         <table className="events-table">
//           <thead>
//             <tr>
//               <th>Event</th>
//               <th>Date</th>
//               <th>Location</th>
//               <th>Status</th>
//               <th>Hours</th>
//               <th>Feedback</th>
//             </tr>
//           </thead>
//           <tbody>
//             {history.map((r) => (
//               <tr key={r.id}>
//                 <td>{r.eventName}</td>
//                 <td>{new Date(r.eventDate).toLocaleDateString()}</td>
//                 <td>{r.eventLocation}</td>
//                 <td>
//                   <span className={statusClass(r.participationStatus)}>
//                     {r.participationStatus}
//                   </span>
//                 </td>
//                 <td>{r.hoursVolunteered}</td>
//                 <td>{r.feedback || "—"}</td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// }

// import React, { useEffect, useState } from "react";
// import "./VolunteerHistoryPage.css"; // ✅ imports the styles you already have

// export default function VolunteerHistoryPage() {
//   const [history, setHistory] = useState([]);
//   const [stats, setStats] = useState(null);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [filterStatus, setFilterStatus] = useState("All");
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");

//   const volunteerId = 1; // for demo (replace with logged-in user ID later)

//   // ✅ Load volunteer history and stats from backend
//   useEffect(() => {
//     async function loadData() {
//       try {
//         const resHistory = await fetch(`http://localhost:8080/history/${volunteerId}`);
//         const resStats = await fetch(`http://localhost:8080/history/stats/${volunteerId}`);

//         const historyData = await resHistory.json();
//         const statsData = await resStats.json();

//         if (historyData.success) setHistory(historyData.data);
//         if (statsData.success) setStats(statsData.data);
//       } catch (err) {
//         console.error("Error loading volunteer history:", err);
//         setError("Failed to load volunteer history");
//       } finally {
//         setLoading(false);
//       }
//     }
//     loadData();
//   }, []);

//   const filteredEvents = history.filter((e) => {
//     const matchSearch =
//       e.eventName.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       e.eventLocation.toLowerCase().includes(searchTerm.toLowerCase());
//     const matchStatus =
//       filterStatus === "All" || e.participationStatus === filterStatus;
//     return matchSearch && matchStatus;
//   });

//   return (
//     <div className="volunteer-history-container">
//       <h1 className="text-3xl font-bold text-orange-600 mb-6">
//         Volunteer History
//       </h1>

//       {/* Loading/Error */}
//       {loading && <p>Loading volunteer history...</p>}
//       {error && <p style={{ color: "red" }}>{error}</p>}

//       {/* Stats Cards */}
//       {stats && (
//         <div className="stats-grid">
//           <div className="stat-card">
//             <h3>Total Events</h3>
//             <p className="stat-number">{stats.totalEvents}</p>
//           </div>
//           <div className="stat-card">
//             <h3>Completed</h3>
//             <p className="stat-number completed">{stats.completedEvents}</p>
//           </div>
//           <div className="stat-card">
//             <h3>Total Hours</h3>
//             <p className="stat-number hours">{stats.totalHours}</p>
//           </div>
//         </div>
//       )}

//       {/* Skills Used */}
//       {stats?.skillsUsed?.length > 0 && (
//         <div className="skills-section">
//           <h3>Skills Used</h3>
//           <p>{stats.skillsUsed.join(", ")}</p>
//         </div>
//       )}

//       {/* Filters */}
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

//       {/* Events Table */}
//       <div className="events-table-container">
//         {filteredEvents.length > 0 ? (
//           <table className="events-table">
//             <thead>
//               <tr>
//                 <th>Event Name</th>
//                 <th>Date</th>
//                 <th>Location</th>
//                 <th>Status</th>
//                 <th>Hours</th>
//                 <th>Skills Used</th>
//               </tr>
//             </thead>
//             <tbody>
//               {filteredEvents.map((e) => (
//                 <tr key={e.id}>
//                   <td>{e.eventName}</td>
//                   <td>{new Date(e.eventDate).toLocaleDateString()}</td>
//                   <td>{e.eventLocation}</td>
//                   <td>
//                     <span
//                       className={`status-badge status-${e.participationStatus}`}
//                     >
//                       {e.participationStatus}
//                     </span>
//                   </td>
//                   <td>{e.hoursVolunteered || 0}</td>
//                   <td>{Array.isArray(e.skillsUsed) ? e.skillsUsed.join(", ") : e.skillsUsed}</td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         ) : (
//           <p className="no-events">No events found.</p>
//         )}
//       </div>
//     </div>
//   );
// }
