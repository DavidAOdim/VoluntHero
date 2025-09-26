// /** ---- Volunteer Matching Page (Admin) ----
//  * - Volunteer Name (auto-fill from DB via mockServer.js)
//  * - Matched Event (auto-fill based on volunteer profile)
//  * - Propose/Confirm assignment actions
//  */

// import { useState } from "react";
// import VolunteerPicker from "../../components/matching/VolunteerPicker";
// import MatchedEventCard from "../../components/matching/MatchedEventCard";
// import AlternativeEventsTable from "../../components/matching/AlternativeEventsTable";
// import { createAssignment, getMatchSuggestion } from "../../api/mockServer";

// export default function MatchingPage() {
//   const [best, setBest] = useState(null);
//   const [alts, setAlts] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [vol, setVol] = useState(null); 
//   const [mode, setMode] = useState("proposed");
//   const [errors, setErrors] = useState({});

//   async function onVolunteerSelected(v) {
//     setVol(v);
//     setErrors({});
//     setLoading(true);
//     const res = await getMatchSuggestion(v.id);
//     setBest(res.best);
//     setAlts(res.alternatives);
//     setLoading(false);
//   }

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
//     await createAssignment({ eventId: best.id, userId: vol.id, mode });
//     alert(mode === "confirmed" ? "Assignment confirmed" : "Assignment proposed");
//   }

//   return (
//     <div className="max-w-4xl mx-auto p-4 space-y-6">
//       <h1 className="text-2xl font-bold">Volunteer Matching</h1>

//       {/* Volunteer Name (Auto-fill from database) */}
//       <VolunteerPicker onSelect={onVolunteerSelected} />
//       {errors.volunteerId && <div className="text-sm text-red-600">{errors.volunteerId}</div>}

//       {/* Matched Event (Auto-fill from volunteer profile) */}
//       <div className="space-y-2">
//         <label className="text-sm font-medium">Matched Event</label>
//         {loading ? (
//           <div className="p-4 border rounded bg-gray-50">Finding best match…</div>
//         ) : (
//           <MatchedEventCard ev={best} />
//         )}
//         <AlternativeEventsTable rows={alts} />
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
//             {mode === "confirmed" ? "Confirm Assignment" : "Propose Assignment"}
//           </button>
//         </div>
//       </form>
//     </div>
//   );
// }
import { useState } from "react";
import VolunteerPicker from "../../components/matching/VolunteerPicker";
import MatchedEventCard from "../../components/matching/MatchedEventCard";
import AlternativeEventsTable from "../../components/matching/AlternativeEventsTable";
import { createAssignment, getMatchSuggestion } from "../../api/mockServer";

// Helper function to update volunteer history in localStorage
function updateVolunteerHistory(volunteerEmail, eventDetails, status) {
  const users = JSON.parse(localStorage.getItem("volunthero_users"));
  const volunteer = users[volunteerEmail.toLowerCase()];

  if (!volunteer) {
    console.error("Volunteer not found");
    return;
  }

  const newHistoryEntry = {
    eventId: eventDetails.id,
    eventName: eventDetails.name,
    eventDate: eventDetails.date,
    eventLocation: eventDetails.location,
    skillsRequired: eventDetails.skills,
    status: status, // Status could be "Proposed" or "Confirmed"
  };

  volunteer.history = volunteer.history || [];
  volunteer.history.push(newHistoryEntry);

  users[volunteerEmail.toLowerCase()] = volunteer;
  localStorage.setItem("volunthero_users", JSON.stringify(users));
}

export default function MatchingPage() {
  const [best, setBest] = useState(null);
  const [alts, setAlts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [vol, setVol] = useState(null); 
  const [mode, setMode] = useState("proposed");
  const [errors, setErrors] = useState({});

  async function onVolunteerSelected(v) {
    setVol(v);
    setErrors({});
    setLoading(true);
    const res = await getMatchSuggestion(v.id);
    setBest(res.best);
    setAlts(res.alternatives);
    setLoading(false);
  }

  function validate() {
    const e = {};
    if (!vol || !vol.id) e.volunteerId = "Volunteer is required";
    if (!best || !best.id) e.eventId = "Matched event is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function onSubmit(e) {
    e.preventDefault();
    if (!validate()) return;

    // Update the volunteer history after proposing or confirming the assignment
    updateVolunteerHistory(vol.email, best, mode);  // Update history in localStorage

    // Proceed with creating the assignment
    await createAssignment({ eventId: best.id, userId: vol.id, mode });

    // Show success message
    alert(mode === "confirmed" ? "Assignment confirmed" : "Assignment proposed");
  }

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-bold">Volunteer Matching</h1>

      {/* Volunteer Name (Auto-fill from database) */}
      <VolunteerPicker onSelect={onVolunteerSelected} />
      {errors.volunteerId && <div className="text-sm text-red-600">{errors.volunteerId}</div>}

      {/* Matched Event (Auto-fill from volunteer profile) */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Matched Event</label>
        {loading ? (
          <div className="p-4 border rounded bg-gray-50">Finding best match…</div>
        ) : (
          <MatchedEventCard ev={best} />
        )}
        <AlternativeEventsTable rows={alts} />
      </div>
      {errors.eventId && <div className="text-sm text-red-600">{errors.eventId}</div>}

      <form onSubmit={onSubmit} className="space-y-3">
        <div className="flex items-center gap-4">
          <label className="text-sm">Mode</label>
          <select
            className="border rounded px-2 py-1"
            value={mode}
            onChange={(e) => setMode(e.target.value)}
          >
            <option value="proposed">Propose</option>
            <option value="confirmed">Confirm</option>
          </select>

          <button
            type="submit"
            className="ml-auto px-4 py-2 rounded bg-black text-white disabled:opacity-40"
            disabled={!vol || !best}
          >
            {mode === "confirmed" ? "Confirm Assignment" : "Propose Assignment"}
          </button>
        </div>
      </form>
    </div>
  );
}
