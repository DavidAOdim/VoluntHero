// Simple in-memory mock. Replace with real fetch() calls later.

const VOLUNTEERS = [
  { id: 1, fullName: "Ami Patel", email: "ami@example.org" },
  { id: 2, fullName: "Diego Ramos", email: "diego@example.org" },
  { id: 3, fullName: "Lee Wong",  email: "lee@example.org"  },
];

const EVENTS = [
  {
    id: 101,
    title: "Food Bank Packing",
    location: "Eastside Center, 123 Main St, Houston, TX",
    date: "2025-10-05T09:00:00Z",
    requiredSkills: [{ skillId: 1, name: "Lifting", minLevel: 2 }],
    urgency: 3,
    score: 0.86,
    breakdown: { skill: 0.9, availability: 0.8, distance: 0.85 },
  },
  {
    id: 102,
    title: "Community Cleanup",
    location: "North Park, Houston, TX",
    date: "2025-10-12T08:00:00Z",
    requiredSkills: [{ skillId: 2, name: "Teamwork", minLevel: 1 }],
    urgency: 2,
    score: 0.74,
    breakdown: { skill: 0.7, availability: 0.8, distance: 0.6 },
  },
  {
    id: 103,
    title: "Shelter Meal Prep",
    location: "Downtown Shelter, Houston, TX",
    date: "2025-11-02T07:00:00Z",
    requiredSkills: [{ skillId: 3, name: "Food Prep", minLevel: 2 }],
    urgency: 4,
    score: 0.69,
    breakdown: { skill: 0.65, availability: 0.7, distance: 0.55 },
  },
];

const delay = (ms = 400) => new Promise(r => setTimeout(r, ms));

export async function listVolunteers(query) {
  await delay();
  const q = (query || "").trim().toLowerCase();
  if (!q) return VOLUNTEERS;
  return VOLUNTEERS.filter(v =>
    v.fullName.toLowerCase().includes(q) || v.email.toLowerCase().includes(q)
  );
}

export async function getMatchSuggestion(volunteerId) {
  await delay();
  // For demo: pick highest score as best
  const sorted = [...EVENTS].sort((a, b) => (b.score || 0) - (a.score || 0));
  return { best: sorted[0] || null, alternatives: sorted.slice(1) };
}

export async function createAssignment({ eventId, userId, mode }) {
  await delay(300);
  console.log("createAssignment", { eventId, userId, mode });
  return { ok: true };
}
