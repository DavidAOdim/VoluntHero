import { useEffect, useMemo, useState } from "react";
import "./App.css";

// === Notifications (new) ===
import NotificationBell from "./notifications/NotificationBell";
import Inbox from "./notifications/Inbox";
import useNotifications from "./notifications/useNotifications"; //  NEW

// === Matching (new) ==
import MatchingPage from "./pages/admin/MatchingPage";

// === Profile Page (new) ===
import ProfilePage from "./pages/ProfilePage";  // Re-enable ProfilePage import

// importing volunteerhistory
import VolunteerHistory from "./components/VolunteerHistory";

/** ---- LocalStorage helpers (MUST be defined before App uses them) ---- */
const LS_KEY = "volunthero_users";
const EVENT_KEY = "volunthero_events";

function loadUsers() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveUsers(users) {
  localStorage.setItem(LS_KEY, JSON.stringify(users));
}

function loadEvents() {
  try {
    const raw = localStorage.getItem(EVENT_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveEvents(events) {
  localStorage.setItem(EVENT_KEY, JSON.stringify(events));
}

function getUser(users, email) {
  return users[email.toLowerCase()] || null;
}

function setUser(users, email, data) {
  const copy = { ...users, [email.toLowerCase()]: data };
  saveUsers(copy);
  return copy;
}

/** ---- Constants ---- */
const STATES = [
  "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA","KS","KY","LA","ME","MD","MA",
  "MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN",
  "TX","UT","VT","VA","WA","WV","WI","WY","DC",
];

const SKILLS = [
  "First Aid","Cooking","Tutoring","Event Setup","Logistics","Driving","Registration Desk","Crowd Management",
];

/** ---- Validation helpers ---- */
function isEmail(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); }
function withinLen(v, max) { return (v || "").length <= max; }
function required(v) { return String(v || "").trim().length > 0; }
function zipOk(v) { return /^\d{5}(\d{4})?$/.test((v || "").trim()); }

/** ---- Header ---- */
function Header({ onNavigate, current, authedEmail, authedUser, onLogout }) {
  return (
    <header>
      <div className="bar" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1>VoluntHero</h1>

        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <nav>
            <button onClick={() => onNavigate("home")} aria-pressed={current === "home"}>Home</button>
            <button onClick={() => onNavigate("login")} aria-pressed={current === "login"}>Login</button>
            <button onClick={() => onNavigate("register")} aria-pressed={current === "register"}>Register</button>
            <button onClick={() => onNavigate("profile")} aria-pressed={current === "profile"}>Profile</button>
            <button onClick={() => onNavigate("events")} aria-pressed={current === "events"}>Events</button>

            
            {/* Add button for Volunteer History */}
            {authedEmail && (
              <button onClick={() => onNavigate("volunteer-history")} aria-pressed={current === "volunteer-history"}>
                Volunteer History
              </button>
            )}

            {authedEmail && authedUser?.role === "admin" && (
              <>
                <button
                  onClick={() => onNavigate("manage-events")}
                  aria-pressed={current === "manage-events"}
                >
                  Manage Events
                </button>

                {/* NEW: Volunteer Matching (admin only) */}
                <button
                  onClick={() => onNavigate("matching")}
                  aria-pressed={current === "matching"}
                >
                  Match Volunteers
                </button>
              </>
            )}

            {authedEmail ? <button onClick={onLogout}>Logout ({authedEmail})</button> : null}
          </nav>

          {/* Bell → Inbox view */}
          {authedEmail && <NotificationBell onClick={() => onNavigate("inbox")} />}
        </div>
      </div>
    </header>
  );
}


/** ---- Home (with test notification button) ---- */
function Home({ authedEmail, onNavigate }) {
  const { add } = useNotifications(); // ✅ NEW

  return (
    <main className="container">
      <div className="grid">
        <div className="col-12">
          <div className="card">
            <h2>Welcome</h2>
            {authedEmail && (
              <div style={{ display: "flex", gap: 8, marginTop: 16, justifyContent: "center", alignItems: "center" }}>
                <button onClick={() => onNavigate("profile")}>Complete Profile</button>

                {/* ✅ NEW: quick demo trigger */}
                <button
                  onClick={() =>
                    add({
                      title: "New Event Assignment",
                      body: "Temitayo matched to “Park Cleanup”.",
                      type: "success",
                      related: { eventId: "E-1001" },
                    })
                  }
                >
                  Trigger Test Notification
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

/** ---- Login ---- */
function Login({ users, onLogin, onNavigate }) {
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    setErr("");
    if (!isEmail(email)) return setErr("Enter a valid email.");
    const u = getUser(users, email);
    if (!u) return setErr("No account found. Please register first.");
    if (u.password !== pw) return setErr("Incorrect password.");
    onLogin(email.toLowerCase());
    onNavigate("profile");
  }

  return (
    <main className="container">
      <div className="grid">
        <div className="col-12">
          <div className="card">
            <h2>Login</h2>
            <p className="muted">Use your email and password.</p>
            <form onSubmit={handleSubmit}>
              <label>Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                     placeholder="you@example.org" required />
              <label>Password</label>
              <input type="password" value={pw} onChange={(e) => setPw(e.target.value)} required />
              {err ? <p className="muted" style={{ color: "crimson" }}>{err}</p> : null}
              <div style={{ display: "flex", gap: 8, marginTop: 16, justifyContent: "center", alignItems: "center" }}>
                <button type="submit">Login</button>
                <button type="button" onClick={() => onNavigate("register")}>Go to Register</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}

/** ---- Account Type ---- */
function SelectAccountType({ onSelect }) {
  return (
    <main className="container">
      <div className="card">
        <h2>Create Account</h2>
        <p className="muted">Select the type of account you want to create:</p>
        <div style={{ display: "flex", gap: 8, marginTop: 16, justifyContent: "center", alignItems: "center" }}>
          <button onClick={() => onSelect("volunteer")}>Volunteer</button>
          <button onClick={() => onSelect("admin")}>Administrator</button>
        </div>
      </div>
    </main>
  );
}

/** ---- Register ---- */
function Register({ users, setUsers, onNavigate, accountType }) {
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    setErr(""); setOk("");
    if (!isEmail(email)) return setErr("Enter a valid email.");
    if (!required(pw)) return setErr("Password is required.");
    if (getUser(users, email)) return setErr("Account already exists. Try logging in.");

    const userRecord = { email: email.toLowerCase(), password: pw, role: accountType, profile: null };
    const updated = setUser(users, email, userRecord);
    setUsers(updated);
    setOk("Account created. You can now log in and complete your profile.");
  }

  return (
    <main className="container">
      <div className="grid">
        <div className="col-12">
          <div className="card">
            <h2>Register</h2>
            <p className="muted">Create an account with email and password.</p>
            <form onSubmit={handleSubmit}>
              <label>Email</label>
              <input type="email" value={email} placeholder="you@example.org"
                     onChange={(e) => setEmail(e.target.value)} required />
              <label>Password</label>
              <input type="password" value={pw} onChange={(e) => setPw(e.target.value)} required />
              {err ? <p className="muted" style={{ color: "crimson" }}>{err}</p> : null}
              {ok ? <p className="muted" style={{ color: "green" }}>{ok}</p> : null}
              <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
                <button type="submit">Create Account</button>
                <button type="button" onClick={() => onNavigate("login")}>Go to Login</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}

/** ---- Profile ---- */
function Profile({ users, setUsers, authedEmail }) {
  const existing = useMemo(() => {
    if (!authedEmail) return null;
    const u = getUser(users, authedEmail);
    return u?.profile || null;
  }, [users, authedEmail]);

  const [form, setForm] = useState(() => ({
    fullName: existing?.fullName || "",
    address1: existing?.address1 || "",
    address2: existing?.address2 || "",
    city: existing?.city || "",
    state: existing?.state || "",
    zip: existing?.zip || "",
    skills: existing?.skills || [],
    preferences: existing?.preferences || "",
    availability: existing?.availability || [],
  }));

  const [errors, setErrors] = useState({});
  const [msg, setMsg] = useState("");

  if (!authedEmail) {
    return (
      <main className="container">
        <div className="card">
          <h2>Profile</h2>
          <p className="muted">You must log in to complete your profile.</p>
        </div>
      </main>
    );
  }

  function updateField(k, v) { setForm((f) => ({ ...f, [k]: v })); }
  function addDate(d) {
    const v = (d || "").trim();
    if (!v) return;
    setForm((f) => f.availability.includes(v) ? f : { ...f, availability: [...f.availability, v] });
  }
  function removeDate(idx) {
    setForm((f) => ({ ...f, availability: f.availability.filter((_, i) => i !== idx) }));
  }

  function validate() {
    const e = {};
    if (!required(form.fullName)) e.fullName = "Full name is required.";
    if (!withinLen(form.fullName, 50)) e.fullName = "Max 50 characters.";
    if (!required(form.address1)) e.address1 = "Address 1 is required.";
    if (!withinLen(form.address1, 100)) e.address1 = "Max 100 characters.";
    if (!withinLen(form.address2, 100)) e.address2 = "Max 100 characters.";
    if (!required(form.city)) e.city = "City is required.";
    if (!withinLen(form.city, 100)) e.city = "Max 100 characters.";
    if (!required(form.state)) e.state = "State is required.";
    if (!required(form.zip)) e.zip = "ZIP is required.";
    else if (!zipOk(form.zip)) e.zip = "Use 5 or 9 digits (e.g., 77005 or 770051234).";
    if (!Array.isArray(form.skills) || form.skills.length === 0) e.skills = "Select at least one skill.";
    if (!Array.isArray(form.availability) || form.availability.length === 0) e.availability = "Add at least one available date.";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit(e) {
    e.preventDefault();
    setMsg("");
    if (!validate()) return;

    const user = getUser(users, authedEmail);
    const nextRecord = { ...user, profile: { ...form } };
    const updated = setUser(users, authedEmail, nextRecord);
    setUsers(updated);
    setMsg("Profile saved.");
  }

  return (
    <main className="container">
      <div className="card">
        <h2>Profile</h2>
        <p className="muted">Complete or edit your profile, then Save.</p>
        <form onSubmit={handleSubmit}>
          <label>Full Name (max 50) *</label>
          <input value={form.fullName} onChange={(e) => updateField("fullName", e.target.value)} maxLength={50} required />
          {errors.fullName ? <p className="muted" style={{ color: "crimson" }}>{errors.fullName}</p> : null}

          <label>Address 1 (max 100) *</label>
          <input value={form.address1} onChange={(e) => updateField("address1", e.target.value)} maxLength={100} required />
          {errors.address1 ? <p className="muted" style={{ color: "crimson" }}>{errors.address1}</p> : null}

          <label>Address 2 (max 100, optional)</label>
          <input value={form.address2} onChange={(e) => updateField("address2", e.target.value)} maxLength={100} />
          {errors.address2 ? <p className="muted" style={{ color: "crimson" }}>{errors.address2}</p> : null}

          <div className="grid" style={{ marginTop: 8 }}>
            <div className="col-6">
              <label>City (max 100) *</label>
              <input value={form.city} onChange={(e) => updateField("city", e.target.value)} maxLength={100} required />
              {errors.city ? <p className="muted" style={{ color: "crimson" }}>{errors.city}</p> : null}
            </div>
            <div className="col-3">
              <label>State *</label>
              <select value={form.state} onChange={(e) => updateField("state", e.target.value)} required>
                <option value="">Select state</option>
                {STATES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              {errors.state ? <p className="muted" style={{ color: "crimson" }}>{errors.state}</p> : null}
            </div>
            <div className="col-3">
              <label>ZIP (5 or 9 digits) *</label>
              <input inputMode="numeric" value={form.zip}
                     onChange={(e) => updateField("zip", e.target.value.replace(/[^\d]/g, ""))}
                     placeholder="77005 or 770051234" maxLength={9} required />
              {errors.zip ? <p className="muted" style={{ color: "crimson" }}>{errors.zip}</p> : null}
            </div>
          </div>

          <label>Skills (hold Ctrl/Cmd to select multiple) *</label>
          <select multiple value={form.skills}
                  onChange={(e) => updateField("skills", Array.from(e.target.selectedOptions, (o) => o.value))}
                  required>
            {SKILLS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          {errors.skills ? <p className="muted" style={{ color: "crimson" }}>{errors.skills}</p> : null}

          <label>Preferences (optional)</label>
          <textarea rows={3} value={form.preferences}
                    onChange={(e) => updateField("preferences", e.target.value)}
                    placeholder="Any preferences we should know about..." />

          <div className="card" style={{ marginTop: 12 }}>
            <h3 style={{ marginTop: 0, fontSize: "0.95rem" }}>Availability (multiple dates) *</h3>
            <AvailabilityPicker dates={form.availability} onAdd={addDate} onRemove={removeDate} />
            {errors.availability ? <p className="muted" style={{ color: "crimson" }}>{errors.availability}</p> : null}
          </div>

          {msg ? <p className="muted" style={{ color: "green", marginTop: 8 }}>{msg}</p> : null}
          <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
            <button type="submit">Save Profile</button>
          </div>
        </form>
      </div>
    </main>
  );
}

/* --- Event Management (admin only) ---- */
function EventManager({ events, setEvents, authedUser }) {
  const { add } = useNotifications(); // ✅ NEW
  const [form, setForm] = useState({ name: "", description: "", location: "", skills: [], urgency: "", date: "" });
  const [errors, setErrors] = useState({});
  const [msg, setMsg] = useState("");

  if (!authedUser || authedUser.role !== "admin") {
    return (
      <main className="container">
        <div className="card">
          <h2>Events</h2>
          <p className="muted">Only administrators can create or manage events.</p>
        </div>
      </main>
    );
  }

  function updateField(k, v) { setForm((f) => ({ ...f, [k]: v })); }

  function validate() {
    const e = {};
    if (!form.name || form.name.length > 100) e.name = "Event name required (max 100).";
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

    const newEvent = { ...form, id: Date.now() };
    const updated = [...events, newEvent];
    setEvents(updated);
    saveEvents(updated);

    setMsg("Event created successfully.");
    setForm({ name: "", description: "", location: "", skills: [], urgency: "", date: "" });

    // ✅ NEW: toast + inbox item for event creation
    add({
      title: "Event Created",
      body: `“${newEvent.name}” on ${newEvent.date} was created.`,
      type: "info",
      related: { eventId: newEvent.id },
    });
  }

  return (
    <main className="container">
      <div className="card">
        <h2>Create Event</h2>
        <form onSubmit={handleSubmit}>
          <label>Event Name *</label>
          <input value={form.name} onChange={(e) => updateField("name", e.target.value)} maxLength={100} required />

          <label>Description *</label>
          <textarea rows={3} value={form.description} onChange={(e) => updateField("description", e.target.value)} required />

          <label>Location *</label>
          <textarea rows={2} value={form.location} onChange={(e) => updateField("location", e.target.value)} required />

          <label>Required Skills *</label>
          <select multiple value={form.skills}
                  onChange={(e) => updateField("skills", Array.from(e.target.selectedOptions, (o) => o.value))}
                  required>
            {SKILLS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>

          <label>Urgency *</label>
          <select value={form.urgency} onChange={(e) => updateField("urgency", e.target.value)} required>
            <option value="">Select urgency</option>
            <option>Low</option><option>Medium</option><option>High</option>
          </select>

          <label>Event Date *</label>
          <input type="date" value={form.date} onChange={(e) => updateField("date", e.target.value)} required />

          {msg && <p style={{ color: "green" }}>{msg}</p>}
          <button type="submit">Create Event</button>
        </form>
      </div>
    </main>
  );
}

function EventList({ events, authedUser, setEvents }) {
  function handleDelete(id) {
    const updated = events.filter(e => e.id !== id);
    setEvents(updated);
    localStorage.setItem("volunthero_events", JSON.stringify(updated));
  }

  if (!events?.length) {
    return (
      <main className="container">
        <p className="muted">No events available yet.</p>
      </main>
    );
  }

  return (
    <main className="container">
      <div className="events-grid">
        {events.map(evt => (
          <article key={evt.id} className={`event-card urgency-${(evt.urgency || 'low').toLowerCase()}`}>
            <div className="event-bubble" aria-hidden="true">
              <span className="bubble-emoji">
                {evt.urgency === "High" ? "⭐" : evt.urgency === "Medium" ? "📅" : "🫶"}
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
                <span className={`event-urgency-tag urgency-${(evt.urgency || 'low').toLowerCase()}`}>
                  {evt.urgency || "Low"}
                </span>
              </div>
              {evt.skills?.length ? (
                <ul className="skill-chips">
                  {evt.skills.map(s => <li key={s} className="chip">{s}</li>)}
                </ul>
              ) : null}

              {authedUser?.role === "admin" && (
                <div className="event-actions">
                  <button className="btn-ghost" onClick={() => handleDelete(evt.id)}>Delete</button>
                </div>
              )}
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}

/** ---- Availability Picker ---- */
function AvailabilityPicker({ dates, onAdd, onRemove }) {
  const [tmp, setTmp] = useState("");
  return (
    <>
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <input type="date" value={tmp} onChange={(e) => setTmp(e.target.value)} />
        <button type="button" onClick={() => { onAdd(tmp); setTmp(""); }}>
          Add Date
        </button>
      </div>
      {dates?.length ? (
        <ul style={{ marginTop: 8 }}>
          {dates.map((d, idx) => (
            <li key={d + idx} style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <span>{d}</span>
              <button type="button" onClick={() => onRemove(idx)}>Remove</button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="muted" style={{ marginTop: 8 }}>No dates added yet.</p>
      )}
    </>
  );
}

/** ---- App (view switcher + session) ---- */
export default function App() {
  const [users, setUsers] = useState(loadUsers);
  const [view, setView] = useState("home");
  const [accountType, setAccountType] = useState(""); // "volunteer" or "admin"
  const [events, setEvents] = useState(loadEvents);
  const [authedEmail, setAuthedEmail] = useState(
    () => localStorage.getItem("volunthero_session") || ""
  );
  const authedUser = authedEmail ? getUser(users, authedEmail) : null;

  useEffect(() => { saveUsers(users); }, [users]);

  function handleLogin(email) {
    setAuthedEmail(email);
    localStorage.setItem("volunthero_session", email);
  }
  function handleLogout() {
    setAuthedEmail("");
    localStorage.removeItem("volunthero_session");
    setView("home");
  }

  return (
    <>
      <Header
        onNavigate={setView}
        current={view}
        authedEmail={authedEmail}
        authedUser={authedUser}
        onLogout={handleLogout}
      />

      {view === "home" && <Home onNavigate={setView} authedEmail={authedEmail} />}
      {view === "login" && <Login users={users} onLogin={handleLogin} onNavigate={setView} />}
      {view === "register" && !accountType && <SelectAccountType onSelect={(type) => setAccountType(type)} />}
      {view === "register" && accountType && (
        <Register users={users} setUsers={setUsers} onNavigate={setView} accountType={accountType} />
      )}
      {/* {view === "profile" && <Profile users={users} setUsers={setUsers} authedEmail={authedEmail} />} */}
      {view === "profile" && <ProfilePage authedEmail={authedEmail} />}
      {view === "events" && <EventList events={events} authedUser={authedUser} setEvents={setEvents} />}
      {view === "manage-events" && <EventManager events={events} setEvents={setEvents} authedUser={authedUser} />}

      {view === "matching" && <MatchingPage />} {/* NEW */}

      {/* Inbox view */}
      {view === "inbox" && <Inbox onNavigate={setView} />}
      {/* Add a route for Volunteer History */}
      {view === "volunteer-history" && <VolunteerHistory authedEmail={authedEmail} />}
    </>
  );
}
